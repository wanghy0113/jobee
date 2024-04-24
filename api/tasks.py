from celery import Celery
from job_analyst.match_agent import JobMatchAgent
from job_analyst.sort_agent import JobSortAgent
from job_crawl.indeed import IndeedCrawler
from job_crawl.params_agent.agent import CrawlingParamsAgent
from job_service.job_service import JobService
from langchain_anthropic import ChatAnthropic
from user_profile.user_profile_summarization_agent import UserProfileSummarizationAgent

celery_app = Celery("tasks", broker="redis://localhost:6379/0")

model = ChatAnthropic(
    model_name="claude-3-haiku-20240307",
    api_key="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",  # type: ignore
    timeout=60,
    temperature=0,
)

job_service = JobService(
    {
        "indeed": IndeedCrawler({"browser_type": "chromium", "headless": True}),
    },
    CrawlingParamsAgent(),
    JobSortAgent(model),
    JobMatchAgent(model),
    UserProfileSummarizationAgent(model),
)


@celery_app.task
async def crawl_and_match(dream_job_id: int):
    dream_job = job_service.get_dream_job(dream_job_id)
    if not dream_job:
        return

    def on_result(result):
        print(result)

    await job_service.crawl_for_dream_job(dream_job_id, 7, on_result=on_result)
