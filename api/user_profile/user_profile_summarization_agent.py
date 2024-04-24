import logging
from typing import List, Optional
from langchain_anthropic import ChatAnthropic
from pydantic import BaseModel
from user_profile.prompt.summarize_user_profile import prompt
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


class UserProfileSummarizationResult(BaseModel):
	job_title: Optional[str]
	locations: Optional[List[str]]
	skills: Optional[List[str]]
	experience: Optional[List[str]]
	education: Optional[List[str]]
	job_contents: Optional[List[str]]

class UserProfileSummarizationAgent:
	def __init__(self, model):
		self._model = model
		self._prompt = ChatPromptTemplate.from_messages([
			("system", prompt["system"]),
			("user", "{user_profile}")
		])
		self._chain = self._prompt | self._model | StrOutputParser()

	def run(self, user_profile: str, retries=3):
		logging.debug("Start summarizing user profile...")
		retry = 0
		while retry < retries:
			try:
				output: str = self._chain.invoke({
					"user_profile": user_profile
				})
				print(">>>>", output)
				starting_index = output.find("{")
				output = output[starting_index:]
				res = UserProfileSummarizationResult.model_validate_json(output)
				if res:
					return res
			except Exception as e:
				logging.debug(f"Output: {output}")
				logging.error(f"Failed to summarize user profile: {e}, retrying...")
			retry += 1

		logging.error(f"Failed to summarize user profile job after {retry} retries.")
		return None