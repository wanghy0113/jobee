from celery import Celery
from job_analyst.match_agent import JobMatchAgent
from job_analyst.sort_agent import JobSortAgent
from job_crawl.indeed import IndeedCrawler
from job_crawl.params_agent.agent import CrawlingParamsAgent
from job_service import JobService

celery_app = Celery('tasks', broker='redis://localhost:6379/0')


job_service = JobService(
    {
        "indeed": IndeedCrawler({"browser_type": "chromium", "headless": True}),
    },
    CrawlingParamsAgent(),
    JobSortAgent(),
    JobMatchAgent(),
)

@celery_app.task
async def crawl_and_match(dream_job_id: int):
    dream_job = job_service.get_dream_job(dream_job_id)
    if not dream_job:
        return
    
    def on_result(result):
        print(result)
            
    await job_service.crawl_for_dream_job(dream_job_id, on_result=on_result)
