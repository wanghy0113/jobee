import asyncio
from time import sleep
from job_crawl.crawler import CrawlCallback, CrawlParams, CrawlResult, Crawler
from playwright.async_api import async_playwright
import logging
import bs4 as bs
from urllib.parse import unquote

GOOGLE_URL = "https://www.google.com/search"


class GoogleCrawler(Crawler):
    def __init__(self, options):
        super().__init__(options)

    async def crawl_jobs(
        self, params: CrawlParams, callback: CrawlCallback, options={}
    ):
        logging.debug("Crawling jobs on Google")
        async with async_playwright() as p:
            browser = await p[self._browser_type].launch(headless=self._headless)
            context = await browser.new_context(
                # Set the user agent
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            query_params = {}
            query_params["q"] = (
                params.keywords.replace(" ", "+")
                + "+"
                + params.location.replace(" ", "+")
            )
            if params.trace_back_days:
                query_params["tbs"] = f"qdr:d{params.trace_back_days}"
            query_params["ibp"] = "htl;jobs"
            query_params["fpstate"] = "tl_detail"

            url = (
                GOOGLE_URL
                + "?"
                + "&".join([f"{k}={v}" for k, v in query_params.items()])
            )
            await page.goto(url)
            logging.debug(f"Start crawling job on Google with params: {params}")
            logging.debug(f"Navigating to {url}")
            try:
                await page.wait_for_selector(
                    'div[class*="jobs__tl-lvc"]', timeout=10000
                )
            except Exception as e:
                logging.warning("No job items found", e)
                await browser.close()
                return
            job_list_containers = await page.query_selector_all(
                'div[class*="jobs__tl-lvc"]'
            )
            if not job_list_containers or not job_list_containers[0]:
                logging.debug("No job items found")
                await browser.close()
                return

            current_list_index = 0
            index = -1
            max_num = options.get("max_num", None)
            max_num_reached = False
            while not max_num_reached and current_list_index < len(job_list_containers):
                job_list_container = job_list_containers[current_list_index]
                job_items = await job_list_container.query_selector_all(
                    'li[class*="iFjolb"]'
                )

                for job_item in job_items:
                    index += 1
                    logging.debug(f"Processing job item {index}")

                    await job_item.click()
                    await page.wait_for_load_state("networkidle")
                    await page.wait_for_timeout(3000)
                    job_key = None
                    query_params = page.url.split("?")[1].split("&")
                    for param in query_params:
                        if param.startswith("htidocid="):
                            job_key = unquote(param.split("=")[1])
                            break
                    if not job_key:
                        logging.debug(f"Job item {index} does not contain job key")
                        continue
                    job_pages = await page.query_selector_all(
                        'div[id*="job_details_page"]'
                    )
                    job_page = None
                    for p in job_pages:
                        if await p.get_attribute("data-encoded-doc-id") == job_key:
                            job_page = p
                            break
                    if not job_page:
                        logging.debug(f"Job item {index} does not contain job info")
                        continue

                    job_content = bs.BeautifulSoup(
                        await job_page.inner_html(), "html.parser"
                    ).get_text()
                    if not job_content:
                        logging.debug(f"Job item {index} does not contain job content")
                        continue
                    job_link = await job_page.get_attribute("data-share-url")
                    if not job_link:
                        logging.debug(f"Job item {index} does not contain job link")
                        continue

                    callback(
                        CrawlResult(
                            google_job_id=job_key,
                            google_job_link=job_link,
                            indeed_job_id=None,
                            indeed_job_link=None,
                            job_content=job_content,
                        )
                    )
                    logging.debug(f"Job item {index} processed")
                    max_num_reached = max_num and index >= max_num
                    if max_num_reached:
                        break

                current_list_index += 1
                more_lists = await page.query_selector_all(
                    'div[class*="tl-async-corelist"]'
                )
                job_list_containers = [job_list_containers[0]] + more_lists

            await browser.close()
