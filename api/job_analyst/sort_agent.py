from enum import StrEnum
import logging
from typing import List, Optional
from pydantic import BaseModel
from job_analyst.prompt.job_sort_few_shot import prompt
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


class JobSortResult(BaseModel):
	salary: Optional[List[int]]
	locations: Optional[List[str]]
	title: Optional[str]
	skills: Optional[List[str]]
	experience: Optional[str]
	company: Optional[str]
	remote_ok: Optional[bool]
	job_types: Optional[List[str]]
	benefits:Optional[List[str]]
	job_contents: Optional[List[str]]

class JobSortAgent:
	def __init__(self, model = "gpt-3.5-turbo"):
		self._model = ChatOpenAI(model=model)
		self._prompt = ChatPromptTemplate.from_messages([
			("system", prompt["system"]),
			("user", prompt["examples"][0][0]),
			("ai", prompt["examples"][0][1]),
			("user", "{job_description}")
		])
		self._chain = self._prompt | self._model | StrOutputParser()

	def sort(self, job_description, retries=3):
		logging.debug("Start sorting job...")
		retry = 0
		while retry < retries:
			try:
				output = self._chain.invoke({
					"job_description": job_description
				})
				res = JobSortResult.model_validate_json(output)
				if res:
					return res
			except Exception as e:
				logging.error(f"Failed to sort job: {e}, retrying...")
			retry += 1

		logging.error(f"Failed to sort job after {retry} retries.")
		return None
