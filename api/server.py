import datetime
from job_analyst.match_agent import JobMatchAgent
from job_analyst.sort_agent import JobSortAgent
from job_crawl.params_agent.agent import CrawlingParamsAgent
from job_crawl.indeed import CrawlParams, CrawlResult, IndeedCrawler
import logging
from fastapi import FastAPI, HTTPException
import uvicorn
from pydantic import BaseModel
from db.models import (
    User,
    JobCrawlEntry,
    DreamJob,
    JobCrawlResult,
    DreamJobCrawlEntry,
    JobMatchResult,
)
import hashlib

logging.basicConfig(level=logging.DEBUG)


class GenerateCrawlingParamsRequest(BaseModel):
    job_description: str


class CrawlingDreamJobsParams(BaseModel):
    dream_job_id: int


class CreateUserRequest(BaseModel):
    email: str
    password: str


class CreateDreamJobRequest(BaseModel):
    user_id: int
    description: str


class MatchDreamJobRequest(BaseModel):
    dream_job_id: int
    new_jobs_only: bool = True


app = FastAPI()


@app.get("/ping")
def ping():
    return "pong"


@app.post("/generate_crawling_params/")
def generate_crawling_params(req: GenerateCrawlingParamsRequest):
    print(req)
    agent = CrawlingParamsAgent()
    return agent.generate_crawling_params(req.job_description)


@app.post("/user")
def create_user(req: CreateUserRequest):
    exising = User.select().where(User.email == req.email)
    if exising:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_password = hashlib.sha256(req.password.encode()).hexdigest()
    user: User = User.create(email=req.email, password=hashed_password)
    return user.to_dict()


@app.post("/dream_job")
def create_dream_job(req: CreateDreamJobRequest):
    dream_job: DreamJob = DreamJob.create(
        user_id=req.user_id,
        raw_description=req.description,
    )

    CRAWL_PLATFORMS = ["indeed"]
    crawl_params = CrawlingParamsAgent().generate_crawling_params(req.description)
    crawl_entries = []
    for location in crawl_params.locations:
        for keywords in crawl_params.keywords:
            for platform in CRAWL_PLATFORMS:
                existing = JobCrawlEntry.select().where(
                    JobCrawlEntry.location == location,
                    JobCrawlEntry.keywords == keywords,
                    JobCrawlEntry.job_type == crawl_params.job_type,
                    JobCrawlEntry.remote_ok == crawl_params.remote_ok,
                    JobCrawlEntry.platform == platform,
                )
                if existing:
                    crawl_entries.append(existing)
                    continue
                entry = JobCrawlEntry.create(
                    platform=platform,
                    location=location,
                    keywords=keywords,
                    trace_back_days=1,
                    job_type=crawl_params.job_type,
                    remote_ok=crawl_params.remote_ok,
                )
                crawl_entries.append(entry)
                DreamJobCrawlEntry.create(dream_job=dream_job, job_crawl_entry=entry)

    return dream_job.get_id()


@app.post("/crawl_dream_jobs")
def crawl_jobs(params: CrawlingDreamJobsParams):
    crawl_entries: list[JobCrawlEntry] = (
        JobCrawlEntry.select()
        .join(DreamJobCrawlEntry)
        .where(DreamJobCrawlEntry.dream_job == params.dream_job_id)
    )
    crawler = IndeedCrawler({"browser_type": "chromium", "headless": True})
    job_sort_agent = JobSortAgent()

    def get_crawl_params(entry: JobCrawlEntry) -> CrawlParams:
        return CrawlParams(
            keywords=str(entry.keywords),
            location=str(entry.location),
            trace_back_days=1,
        )

    for entry in crawl_entries:
        if entry.last_run_at:
            if datetime.datetime.now().strftime("%Y%m%d") == entry.last_run_at.strftime( # type: ignore
                "%Y%m%d"
            ):
                logging.debug(f"Skip crawling job for entry: {entry.get_id()}")
                continue
        logging.debug(f"Start crawling job for entry: {entry.get_id()}")

        def agent_callback(res: CrawlResult):
            sort_result = job_sort_agent.sort(res.job_content)
            if not sort_result:
                logging.error(f"Failed to sort job for entry: {entry.get_id()}")
                return
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
            ).on_conflict(
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
            ).execute()

        crawler.crawl(get_crawl_params(entry), agent_callback, {"max_num": 1})
        entry.last_run_at = datetime.datetime.now()  # type: ignore
        entry.last_run_interval_days = 1  # type: ignore
        entry.save()


@app.post("/match_jobs")
def match_dream_jobs(req: MatchDreamJobRequest):
    dream_job: DreamJob | None = DreamJob.get_by_id(req.dream_job_id)
    if not dream_job:
        raise HTTPException(status_code=400, detail="Dream job not found")
    last_matched_at = dream_job.last_matched_at or 0

    crawl_entries = (
        JobCrawlEntry.select()
        .join(DreamJobCrawlEntry)
        .where(DreamJobCrawlEntry.dream_job == req.dream_job_id)
    )
    
    logging.debug(f"Start matching dream job: {dream_job.get_id()} with {len(crawl_entries)} crawl entries")
    
    if not crawl_entries:
        raise HTTPException(status_code=400, detail="No job found for dream job")
    for crawl_entry in crawl_entries:
        crawl_results = JobCrawlResult.select().where(
            JobCrawlResult.job_crawl_entry == crawl_entry and JobCrawlResult.updated_at > last_matched_at
        )
        for crawl_result in crawl_results:
            match_job(dream_job, crawl_result)
            
    dream_job.last_matched_at = datetime.datetime.now() # type: ignore
    dream_job.save()

def match_job(dream_job: DreamJob, job: JobCrawlResult):
    match_agent = JobMatchAgent()
    match_res = match_agent.match(str(dream_job.raw_description), str(job.raw_content))
    if not match_res:
        logging.error(f"Failed to match job: {job.get_id()}")
        return
    JobMatchResult.insert(
        dream_job=dream_job,
        job_crawl_result=job,
        matching_points=match_res.matching_points,
        warning_points=match_res.warning_points,
    ).on_conflict(
        conflict_target=(JobMatchResult.dream_job, JobMatchResult.job_crawl_result),
        update={  # Specify the fields to update on conflict.
            JobMatchResult.updated_at: datetime.datetime.now(),
            JobMatchResult.matching_points: match_res.matching_points,
            JobMatchResult.warning_points: match_res.warning_points,
        },
    ).execute()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
