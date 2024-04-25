import asyncio
import logging
from job_analyst.match_agent import JobMatchAgent
from job_analyst.sort_agent import JobSortAgent
from job_crawl.crawler import Crawler, CrawlParams, CrawlResult
from db.models import (
    db,
    JobCrawlEntry,
    JobCrawlResult,
    JobMatchResult,
    UserProfile,
    UserProfileJobCrawlEntry,
)
from peewee import (
    DoesNotExist,
)
import datetime
from typing import Callable, Any


from job_crawl.params_agent.agent import CrawlingParamsAgent, ParamsAgentResult
from user_profile.user_profile_summarization_agent import UserProfileSummarizationAgent

logging.basicConfig(level=logging.DEBUG)
logging.getLogger("anthropic._base_client").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)


class JobService:
    def __init__(
        self,
        job_crawlers: dict[str, Crawler],
        job_params_agent: CrawlingParamsAgent,
        job_sort_agent: JobSortAgent,
        job_match_agent: JobMatchAgent,
        user_profile_summarization_agent: UserProfileSummarizationAgent,
    ):
        self._job_crawlers = job_crawlers
        self._job_params_agent = job_params_agent
        self._job_sort_agent = job_sort_agent
        self._job_match_agent = job_match_agent
        self._user_profile_summarization_agent = user_profile_summarization_agent

    def get_user_profile(self, user_profile_id: int) -> UserProfile | None:
        try:
            dj = UserProfile.get_by_id(user_profile_id)
            return dj
        except DoesNotExist:
            return None

    def create_user_profile(
        self, user_id: int, raw_content: str, interested_job: str | None = None
    ) -> UserProfile:
        user_profile_sum = self._user_profile_summarization_agent.run(raw_content)
        if not user_profile_sum:
            raise Exception("Failed to create user profile")

        user_profile: UserProfile = UserProfile.create(
            user_id=user_id,
            raw_content=raw_content,
            job_title=user_profile_sum.job_title,
            skills=user_profile_sum.skills,
            job_contents=user_profile_sum.job_contents,
            education=user_profile_sum.education,
            experience=user_profile_sum.experience,
            interested_job=interested_job,
        )
        return user_profile

    def create_job_crawl_entries_from_agent_result(
        self, agent_result: ParamsAgentResult
    ):
        if agent_result.locations is None or len(agent_result.locations) == 0:
            raise Exception("No locations found")
        if agent_result.keywords is None or len(agent_result.keywords) == 0:
            raise Exception("No keywords found")
        job_types = (
            [None]
            if agent_result.job_types is None or len(agent_result.job_types) == 0
            else agent_result.job_types
        )

        entries = []
        for location in agent_result.locations:
            for keywords in agent_result.keywords:
                for job_type in job_types:
                    for platform in self._job_crawlers.keys():
                        existing = JobCrawlEntry.select().where(
                            JobCrawlEntry.location == location,
                            JobCrawlEntry.keywords == keywords,
                            JobCrawlEntry.job_type == job_type,
                            JobCrawlEntry.remote_ok == agent_result.remote_ok,
                            JobCrawlEntry.platform == platform,
                        )
                        if existing:
                            continue
                        entry = JobCrawlEntry.create(
                            platform=platform,
                            location=location,
                            keywords=keywords,
                            trace_back_days=1,
                            job_type=job_type,
                            remote_ok=agent_result.remote_ok,
                        )
                        entries.append(entry)
        return entries

    def create_job_crawl_entries_for_user_profile(self, user_profile: UserProfile):
        crawl_params = CrawlingParamsAgent().generate_crawling_params(
            user_profile.to_profile_dict()
        )
        entries = self.create_job_crawl_entries_from_agent_result(crawl_params)
        for entry in entries:
            UserProfileJobCrawlEntry.create(
                user_profile=user_profile, job_crawl_entry=entry
            )

    def match_job(
        self, user_profile: UserProfile, job: JobCrawlResult
    ) -> JobMatchResult | None:
        job_content = job.to_job_dict()
        match_res = self._job_match_agent.match_with_3_steps(
            job_content, str(user_profile.to_profile_dict())
        )
        if not match_res:
            logging.error(f"Failed to match job: {job.get_id()}")
            return
        job_match_result_id = (
            JobMatchResult.insert(
                user_profile=user_profile, job_crawl_result=job, match_result=match_res
            )
            .on_conflict(
                conflict_target=(
                    JobMatchResult.user_profile,
                    JobMatchResult.job_crawl_result,
                ),
                update={  # Specify the fields to update on conflict.
                    JobMatchResult.updated_at: datetime.datetime.now(),
                    JobMatchResult.match_result: match_res,
                },
            )
            .execute()
        )
        job_match_result = JobMatchResult.get_by_id(job_match_result_id)
        return job_match_result

    @staticmethod
    def get_crawl_params(entry: JobCrawlEntry, trace_bacl_days: int) -> CrawlParams:
        return CrawlParams(
            keywords=str(entry.keywords),
            location=str(entry.location),
            trace_back_days=trace_bacl_days,
        )

    async def crawl_for_entry(
        self,
        entry: JobCrawlEntry,
        trace_back_days: int,
        max_num: int = 1,
        on_result: Callable[[JobCrawlResult], None] | None = None,
    ):
        platform = entry.platform
        if platform not in self._job_crawlers:
            logging.error(f"Unknown platform: {platform}")
            return
        crawler = self._job_crawlers.get(platform)
        if not crawler:
            logging.error(f"Failed to get crawler for platform: {platform}")
            return

        if entry.last_run_at:
            if datetime.datetime.now().strftime("%Y%m%d") == entry.last_run_at.strftime(  # type: ignore
                "%Y%m%d"
            ):
                logging.debug(f"Skip crawling job for entry: {entry.get_id()}")
                return
        logging.debug(f"Start crawling job for entry: {entry.get_id()}")

        with db.atomic() as txn:

            def agent_callback(res: CrawlResult):
                sort_result = self._job_sort_agent.sort(res.job_content)
                if not sort_result:
                    logging.error(f"Failed to sort job for entry: {entry.get_id()}")
                    return

                job_crawl_result_id = (
                    JobCrawlResult.insert(
                        job_crawl_entry=entry,
                        updated_at=datetime.datetime.now(),
                        google_job_url=res.google_job_link,
                        google_job_id=res.google_job_id,
                        indeed_job_url=res.indeed_job_link,
                        indeed_job_id=res.indeed_job_id,
                        raw_content=res.job_content,
                        salary=sort_result.salary,
                        title=sort_result.title,
                        skills=sort_result.skills,
                        locations=sort_result.locations,
                        experience=sort_result.experience,
                        education=sort_result.education,
                        company_name=sort_result.company_name,
                        company_size=sort_result.company_size,
                        company_culture=sort_result.company_culture,
                        company_industry=sort_result.company_industry,
                        remote_ok=sort_result.remote_ok,
                        job_types=sort_result.job_types,
                        benefits=sort_result.benefits,
                        job_contents=sort_result.job_contents,
                    )
                    .on_conflict(
                        conflict_target=(JobCrawlResult.google_job_id),
                        update={  # Specify the fields to update on conflict.
                            JobCrawlResult.job_crawl_entry: entry,
                            JobCrawlResult.updated_at: datetime.datetime.now(),
                            JobCrawlResult.google_job_url: res.google_job_link,
                            JobCrawlResult.google_job_id: res.google_job_id,
                            JobCrawlResult.indeed_job_url: res.indeed_job_link,
                            JobCrawlResult.indeed_job_id: res.indeed_job_id,
                            JobCrawlResult.raw_content: res.job_content,
                            JobCrawlResult.salary: sort_result.salary,
                            JobCrawlResult.title: sort_result.title,
                            JobCrawlResult.skills: sort_result.skills,
                            JobCrawlResult.locations: sort_result.locations,
                            JobCrawlResult.experience: sort_result.experience,
                            JobCrawlResult.education: sort_result.education,
                            JobCrawlResult.company_name: sort_result.company_name,
                            JobCrawlResult.company_size: sort_result.company_size,
                            JobCrawlResult.company_culture: sort_result.company_culture,
                            JobCrawlResult.company_industry: sort_result.company_industry,
                            JobCrawlResult.remote_ok: sort_result.remote_ok,
                            JobCrawlResult.job_types: sort_result.job_types,
                            JobCrawlResult.benefits: sort_result.benefits,
                            JobCrawlResult.job_contents: sort_result.job_contents,
                        },
                    )
                    .execute()
                )
                logging.debug(
                    f"Inserted job crawl resul using id: {job_crawl_result_id}"
                )
                job_crawl_result: JobCrawlResult = JobCrawlResult.get_by_id(
                    job_crawl_result_id
                )
                if on_result is not None:
                    on_result(job_crawl_result)

            options = {} if max_num is None else {"max_num": max_num}
            await crawler.crawl(
                self.get_crawl_params(entry, trace_back_days), agent_callback, options
            )
            entry.last_run_at = datetime.datetime.now()  # type: ignore
            entry.last_run_interval_days = trace_back_days  # type: ignore
            entry.save()
            txn.commit()

    async def crawl_for_user_profile(
        self,
        user_profile_id: int,
        trace_back_days: int,
        on_result: Callable[[JobCrawlResult], Any] | None = None,
    ):
        crawl_entries: list[JobCrawlEntry] = (
            JobCrawlEntry.select()
            .join(UserProfileJobCrawlEntry)
            .where(UserProfileJobCrawlEntry.user_profile == user_profile_id)
        )

        for entry in crawl_entries[:1]:
            await self.crawl_for_entry(entry, trace_back_days, on_result=on_result)

    def match_for_user_profile(self, user_profile_id: int):
        user_profile: UserProfile | None = UserProfile.get_by_id(user_profile_id)
        if not user_profile:
            logging.error(f"User profile not found: {user_profile_id}")
            return

        crawl_entries = (
            JobCrawlEntry.select()
            .join(UserProfileJobCrawlEntry)
            .where(UserProfileJobCrawlEntry.user_profile == user_profile_id)
        )

        logging.debug(
            f"Start matching user profile: {user_profile.get_id()} with {len(crawl_entries)} crawl entries"
        )

        if not crawl_entries:
            logging.error(f"No job found for user profile: {user_profile.get_id()}")
            return
        for crawl_entry in crawl_entries:
            crawl_results = JobCrawlResult.select().where(
                JobCrawlResult.job_crawl_entry == crawl_entry
            )
            for crawl_result in crawl_results:
                self.match_job(user_profile, crawl_result)

    def get_match_results(self, user_profile_id: int):
        results = JobMatchResult.select().where(
            JobMatchResult.user_profile == user_profile_id
        )
        return [result.to_dict() for result in results]

    async def crawl_jobs_for_user_profile_generator(
        self, user_profile: UserProfile, trace_back_days: int
    ):
        res_queue = asyncio.Queue()

        def on_result(result: JobCrawlResult):
            res_queue.put_nowait(result)

        crawl_task = asyncio.create_task(
            self.crawl_for_user_profile(
                user_profile.get_id(), trace_back_days, on_result=on_result
            )
        )
        while not crawl_task.done() or not res_queue.empty():
            try:
                res: JobCrawlResult = await asyncio.wait_for(
                    res_queue.get(), timeout=2.0
                )
                yield f"job crawl result: {res.to_job_dict()}"
            except asyncio.TimeoutError:
                continue

    async def crawl_and_match_user_profile_generator(
        self, user_profile: UserProfile, trace_back_days: int
    ):
        match_res_queue = asyncio.Queue()

        def on_result(result: JobCrawlResult):
            match_res = self.match_job(user_profile, result)
            if match_res:
                print(
                    f"job match result: {match_res.to_dict(populate_job_crawl_result=True)}"
                )
                match_res_queue.put_nowait(match_res)

        crawl_task = asyncio.create_task(
            self.crawl_for_user_profile(
                user_profile.get_id(), trace_back_days, on_result=on_result
            )
        )
        logging.debug("Crawl task created")
        yield "stage: crawling user profile"

        while not crawl_task.done() or not match_res_queue.empty():
            print("waiting for match result")
            try:
                match_res = await asyncio.wait_for(match_res_queue.get(), timeout=2.0)
                print(f"job match result: {match_res}")
                yield f"job match result: {match_res.to_dict(populate_job_crawl_result=True)}"
            except asyncio.TimeoutError:
                continue

        yield "stage: crawling done"

    async def create_and_process_user_profile_generator(
        self,
        user_id: int,
        description: str,
        enable_job_crawl_and_match: bool,
        trace_back_days: int | None = None,
    ):
        yield "stage: creating user profile"
        user_profile = self.create_user_profile(user_id, description)
        yield "stage: creating user profile crawl entries"
        self.create_job_crawl_entries_for_user_profile(user_profile)
        if enable_job_crawl_and_match:
            async for res in self.crawl_and_match_user_profile_generator(
                user_profile, trace_back_days or 1
            ):
                yield res
