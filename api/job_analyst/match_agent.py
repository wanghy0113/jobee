from enum import StrEnum
import logging
import re
from typing import List, Optional
from pydantic import BaseModel
from job_analyst.prompt.job_match_few_shot import prompt
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


class JobMatchResult(BaseModel):
    matching_points: Optional[List[str]]
    warning_points: Optional[List[str]]


class JobMatchAgent:
    def __init__(self, model="gpt-3.5-turbo"):
        self._model = ChatOpenAI(model=model)
        self._prompt = ChatPromptTemplate.from_messages(
            [
                ("system", prompt["system"]),
                ("user", prompt["examples"][0][0]),
                ("ai", prompt["examples"][0][1]),
                (
                    "user",
                    """
Job content:
{job_content}

User profile:
{user_profile}
	""",
                ),
            ]
        )
        self._chain = self._prompt | self._model | StrOutputParser()

    def match(self, job_content: str, user_profile: str, max_retries=3):
        logging.debug("Start matching job...")
        retry = 0
        while retry < max_retries:
            try:
                output = self._chain.invoke(
                    {"job_content": job_content, "user_profile": user_profile}
                )
                result_regex = r"```([\s\S]+)```"
                raw_result = re.findall(result_regex, output)[-1]

                if not raw_result:
                    raise ValueError("Result not found")

                res = JobMatchResult.model_validate_json(raw_result)
                logging.debug(f"Job sorted: {res}")
                return res
            except Exception as e:
                logging.error(f"Failed to match job: {e}, retrying...")
                retry += 1

        logging.error(f"Failed to match job after {retry} retries.")
