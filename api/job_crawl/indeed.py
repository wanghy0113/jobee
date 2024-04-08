from job_crawl.crawler import CrawlCallback, CrawlParams, CrawlResult, Crawler
from playwright.sync_api import sync_playwright
import logging

INDEED_URL = 'https://www.indeed.com/'

class IndeedCrawler(Crawler):

	def __init__(self, options):
		super().__init__(options)

	def crawl(self, params: CrawlParams, callback: CrawlCallback, options = {}):
		with sync_playwright() as p:
			browser = p[self._browser_type].launch(headless=self._headless)
			context = browser.new_context(
				# Set the user agent
				user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'
			)
			page = context.new_page()
			query_params = {}
			query_params['q'] = params.keywords.replace(' ', '+')
			query_params['l'] = params.location.replace(' ', '+')
			query_params['fromage'] = params.trace_back_days or 1
			url = INDEED_URL + 'jobs?' + '&'.join([f'{k}={v}' for k, v in query_params.items()])
			page.goto(url)
			logging.debug(f'Start crawling job on Indeed with params: {params}')
			logging.debug(f'Navigating to {url}')
			try:
				page.wait_for_selector('div[id*="jobResults"] ul')
			except Exception as e:
				logging.warn("No job items found")
				browser.close()
				return
			job_items_container = page.query_selector('div[id*="jobResults"] ul')
			if not job_items_container:
				logging.debug('No job items found')
				browser.close()
				return

			job_items = job_items_container.query_selector_all('> li > div[class*="result"]')

			logging.debug(f'Found {len(job_items)} job items')
			index = 0
			max_num = options.get('max_num', None)
			for job_item in job_items:
				logging.debug(f'Processing job item {index}')
				job_item.click()
				page.wait_for_load_state('networkidle')
				page.wait_for_timeout(3000)
				job_info_container = page.query_selector('div[class*="InfoHeaderContainer"]')
				if not job_info_container:
					logging.debug(f'Job item {index} does not contain job info')
					continue
				job_info = job_info_container.text_content()
				job_desp_container = page.query_selector('div[id*="jobDescriptionText"]')
				if not job_desp_container:
					logging.debug(f'Job item {index} does not contain job description')
					continue
				job_desp = job_desp_container.text_content()
				job_content = f"Job info:\n{job_info}\n\nDescription:\n{job_desp}"
	
				link_ele = job_item.query_selector('a[id*="job_"]')
				if not link_ele:
					logging.debug(f'Job item {index} does not contain job link')
					continue
				job_key = link_ele.get_attribute('data-jk')
				if not job_key:
					logging.debug(f'Job item {index} does not contain job key')
					continue
				job_link = f"https://www.indeed.com/viewjob?jk={job_key}"

				callback(CrawlResult(job_key=job_key, job_link=job_link, job_content=job_content))
				logging.debug(f'Job item {index} processed')
				index += 1
				if max_num and index >= max_num:
					break

			browser.close()
