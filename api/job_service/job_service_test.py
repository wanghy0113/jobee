from db.models import JobCrawlResult, UserProfile
from job_analyst.match_agent import JobMatchAgent
from job_analyst.sort_agent import JobSortAgent
from job_crawl.google import GoogleCrawler
from job_crawl.params_agent.agent import CrawlingParamsAgent
from job_service.job_service import JobService
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from user_profile.user_profile_summarization_agent import UserProfileSummarizationAgent


model = ChatAnthropic(
    model_name="claude-3-haiku-20240307",
    api_key="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",  # type: ignore
    timeout=60,
    temperature=0,
)
chatgpt = ChatOpenAI(model="gpt-3.5-turbo-0125")
job_service1 = JobService(
    {
        "google": GoogleCrawler({"browser_type": "chromium", "headless": True}),
    },
    CrawlingParamsAgent(),
    JobSortAgent(model),
    JobMatchAgent(model),
    UserProfileSummarizationAgent(model),
)
job_service2 = JobService(
    {
        "google": GoogleCrawler({"browser_type": "chromium", "headless": True}),
    },
    CrawlingParamsAgent(),
    JobSortAgent(chatgpt),
    JobMatchAgent(chatgpt),
    UserProfileSummarizationAgent(chatgpt),
)

# job_service1.create_job_crawl_entries_for_user_profile(UserProfile.get_by_id(2))
# asyncio.run(job_service1.crawl_for_user_profile(2, 3))

user_profile = UserProfile.get_by_id(2)
job = JobCrawlResult.get_by_id(7)
res = job_service2.match_job(user_profile, job)
print(">>>>><<<<<", res)