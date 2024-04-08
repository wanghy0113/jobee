from abc import ABC, abstractmethod
from typing import Callable, Optional

from pydantic import BaseModel

class CrawlResult(BaseModel):
	job_key: str
	job_link: str
	job_content: str

CrawlCallback = Callable[[CrawlResult], None]

class CrawlParams(BaseModel):
	keywords: str
	location: str
	trace_back_days: Optional[int]

class Crawler(ABC):
	def __init__(self, options):
		self._browser_type = options.get('browser_type', 'chromium')
		self._headless = options.get('headless', True)


	@abstractmethod
	def crawl(self, params: CrawlParams, callback: CrawlCallback, options = {}):
		pass
