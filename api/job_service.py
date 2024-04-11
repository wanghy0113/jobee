import logging
from job_analyst.match_agent import JobMatchAgent
from job_analyst.sort_agent import JobSortAgent
from job_crawl.crawler import Crawler, CrawlParams, CrawlResult
from db.models import (
    db,
    JobCrawlEntry,
    DreamJob,
    JobCrawlResult,
    DreamJobCrawlEntry,
    JobMatchResult,
)
import datetime
from typing import Callable, Any

from job_crawl.indeed import IndeedCrawler
from job_crawl.params_agent.agent import CrawlingParamsAgent, ParamsAgentResult
import time

logging.basicConfig(level=logging.DEBUG)


class JobService:
    def __init__(
        self,
        job_crawlers: dict[str, Crawler],
        job_params_agent: CrawlingParamsAgent,
        job_sort_agent: JobSortAgent,
        job_match_agent: JobMatchAgent,
    ):
        self._job_crawlers = job_crawlers
        self._job_params_agent = job_params_agent
        self._job_sort_agent = job_sort_agent
        self._job_match_agent = job_match_agent

    def get_dream_job(self, dream_job_id: int) -> DreamJob | None:
        return DreamJob.get_by_id(dream_job_id)

    def create_dream_job(self, user_id: int, description: str) -> DreamJob:
        dream_job: DreamJob = DreamJob.create(
            user_id=user_id, raw_description=description
        )
        return dream_job
    
    def create_job_crawl_entries_from_agent_result(self, agent_result: ParamsAgentResult):
        if agent_result.locations is None or len(agent_result.locations) == 0:
            raise Exception("No locations found")
        if agent_result.keywords is None or len(agent_result.keywords) == 0:
            raise Exception("No keywords found")
        job_types = [None] if agent_result.job_types is None or len(agent_result.job_types) == 0 else agent_result.job_types

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
        

    def create_dream_job_crawl_entries(self, dream_job: DreamJob):
        crawl_params = CrawlingParamsAgent().generate_crawling_params(
            dream_job.raw_description
        )
        entries = self.create_job_crawl_entries_from_agent_result(crawl_params)
        for entry in entries:
            DreamJobCrawlEntry.create(dream_job=dream_job, job_crawl_entry=entry)

    def match_job(
        self, dream_job: DreamJob, job: JobCrawlResult
    ) -> JobMatchResult | None:
        match_res = self._job_match_agent.match(
            str(dream_job.raw_description), str(job.raw_content)
        )
        if not match_res:
            logging.error(f"Failed to match job: {job.get_id()}")
            return
        job_match_result_id = (
            JobMatchResult.insert(
                dream_job=dream_job,
                job_crawl_result=job,
                matching_points=match_res.matching_points,
                warning_points=match_res.warning_points,
            )
            .on_conflict(
                conflict_target=(
                    JobMatchResult.dream_job,
                    JobMatchResult.job_crawl_result,
                ),
                update={  # Specify the fields to update on conflict.
                    JobMatchResult.updated_at: datetime.datetime.now(),
                    JobMatchResult.matching_points: match_res.matching_points,
                    JobMatchResult.warning_points: match_res.warning_points,
                },
            )
            .execute()
        )
        job_match_result = JobMatchResult.get_by_id(job_match_result_id)
        return job_match_result

    @staticmethod
    def get_crawl_params(entry: JobCrawlEntry) -> CrawlParams:
        return CrawlParams(
            keywords=str(entry.keywords),
            location=str(entry.location),
            trace_back_days=1,
        )

    async def crawl_for_entry(
        self,
        entry: JobCrawlEntry,
        max_num: int | None = None,
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
                        indeed_job_url=res.job_link,
                        indeed_job_id=res.job_key,
                        raw_content=res.job_content,
                        salary=sort_result.salary,
                        title=sort_result.title,
                        skills=sort_result.skills,
                        experience=sort_result.experience,
                        company=sort_result.company,
                        remote_ok=sort_result.remote_ok,
                        job_types=sort_result.job_types,
                        benefits=sort_result.benefits,
                        job_contents=sort_result.job_contents,
                    )
                    .on_conflict(
                        conflict_target=(JobCrawlResult.indeed_job_id),
                        update={  # Specify the fields to update on conflict.
                            JobCrawlResult.job_crawl_entry: entry,
                            JobCrawlResult.updated_at: datetime.datetime.now(),
                            JobCrawlResult.indeed_job_url: res.job_link,
                            JobCrawlResult.raw_content: res.job_content,
                            JobCrawlResult.salary: sort_result.salary,
                            JobCrawlResult.title: sort_result.title,
                            JobCrawlResult.skills: sort_result.skills,
                            JobCrawlResult.experience: sort_result.experience,
                            JobCrawlResult.company: sort_result.company,
                            JobCrawlResult.remote_ok: sort_result.remote_ok,
                            JobCrawlResult.job_types: sort_result.job_types,
                            JobCrawlResult.benefits: sort_result.benefits,
                            JobCrawlResult.job_contents: sort_result.job_contents,
                        },
                    )
                    .execute()
                )
                job_crawl_result: JobCrawlResult = JobCrawlResult.get_by_id(
                    job_crawl_result_id
                )
                if on_result is not None:
                    on_result(job_crawl_result)

            options = {} if max_num is None else {"max_num": max_num}
            await crawler.crawl(self.get_crawl_params(entry), agent_callback, options)
            entry.last_run_at = datetime.datetime.now()  # type: ignore
            entry.last_run_interval_days = 1  # type: ignore
            entry.save()
            txn.commit()

    async def crawl_for_dream_job(
        self,
        dream_job_id: int,
        on_result: Callable[[JobCrawlResult], Any] | None = None,
    ):
        crawl_entries: list[JobCrawlEntry] = (
            JobCrawlEntry.select()
            .join(DreamJobCrawlEntry)
            .where(DreamJobCrawlEntry.dream_job == dream_job_id)
        )

        for entry in crawl_entries[:1]:
            await self.crawl_for_entry(entry, on_result=on_result, max_num=1)

    def match_for_dream_job(self, dream_job_id: int):
        dream_job: DreamJob | None = DreamJob.get_by_id(dream_job_id)
        if not dream_job:
            logging.error(f"Dream job not found: {dream_job_id}")
            return
        last_matched_at = dream_job.last_matched_at or 0

        crawl_entries = (
            JobCrawlEntry.select()
            .join(DreamJobCrawlEntry)
            .where(DreamJobCrawlEntry.dream_job == dream_job_id)
        )

        logging.debug(
            f"Start matching dream job: {dream_job.get_id()} with {len(crawl_entries)} crawl entries"
        )

        if not crawl_entries:
            logging.error(f"No job found for dream job: {dream_job.get_id()}")
            return
        for crawl_entry in crawl_entries:
            crawl_results = JobCrawlResult.select().where(
                JobCrawlResult.job_crawl_entry == crawl_entry
                and JobCrawlResult.updated_at > last_matched_at
            )
            for crawl_result in crawl_results:
                self.match_job(dream_job, crawl_result)

        dream_job.last_matched_at = datetime.datetime.now()  # type: ignore
        dream_job.save()

    def get_match_results(self, dream_job_id: int):
        results = JobMatchResult.select().where(
            JobMatchResult.dream_job == dream_job_id
        )
        return [result.to_dict() for result in results]
