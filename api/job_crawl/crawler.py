from abc import ABC, abstractmethod
import logging
from typing import Callable, Optional

from pydantic import BaseModel


class CrawlResult(BaseModel):
    google_job_id: Optional[str]
    google_job_link: Optional[str]
    indeed_job_id: Optional[str]
    indeed_job_link: Optional[str]
    job_content: str


CrawlCallback = Callable[[CrawlResult], None]


class CrawlParams(BaseModel):
    keywords: str
    location: str
    trace_back_days: Optional[int]


class Crawler(ABC):
    def __init__(self, options):
        self._browser_type = options.get("browser_type", "chromium")
        self._headless = options.get("headless", True)

    async def crawl(self, params: CrawlParams, callback: CrawlCallback, options={}):
        max_retry = options.get("max_retry", 3)
        retry = 0
        while retry < max_retry:
            try:
                await self.crawl_jobs(params, callback, options)
                break
            except Exception as e:
                logging.warning(f"Error crawling jobs {params}", e)
                retry += 1

    @abstractmethod
    async def crawl_jobs(
        self, params: CrawlParams, callback: CrawlCallback, options={}
    ):
        pass
