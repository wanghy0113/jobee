from enum import StrEnum
from typing import List, Optional
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from job_crawl.params_agent.prompt.gen_crawling_params_few_shot import prompt
from langchain_core.output_parsers import StrOutputParser

class JobType(StrEnum):
	full_time = "full_time"
	part_time = "part_time"
	contract = "contract"
	internship = "internship"
	temporary = "temporary"

class CrawlingParams(BaseModel):
	locations: List[str]
	keywords: List[str]
	remote_ok: Optional[bool]
	distance_within_kms: Optional[int]
	salary_range: Optional[List[int]]
	job_type: Optional[JobType]

class CrawlingParamsAgent:
	def __init__(self, model = "gpt-3.5-turbo"):
		self._model = ChatOpenAI(model=model)
		self._prompt = ChatPromptTemplate.from_messages([
			("system", prompt["system"]),
			("user", prompt["examples"][0][0]),
			("ai", prompt["examples"][0][1]),
			("user", "{job_description}")
		])
		self._chain = self._prompt | self._model | StrOutputParser()

	def generate_crawling_params(self, job_description):
		output = self._chain.invoke({
			"job_description": job_description
		})
		params = CrawlingParams.model_validate_json(output)
		return params
