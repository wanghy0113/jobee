import logging
import re
from typing import List
from langchain_anthropic import ChatAnthropic
from pydantic import BaseModel
from job_analyst.prompt.job_match_few_shot_cot import (
    all_in_one_prompt,
    skills_prompt,
    job_contents_prompt,
    meta_only_prompt,
)
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json


class JobMatchAgent:
    def __init__(self, model):
        self._all_in_one_chain = self.build_all_in_one_chain(model)
        self._match_meta_chain = self.build_match_meta_chain(model)
        self._match_skills_chain = self.build_match_skills_chain(model)
        self._match_job_contents_chain = self.build_match_job_contents_chain(model)

    def build_all_in_one_chain(self, model):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", all_in_one_prompt["system"]),
                ("user", all_in_one_prompt["examples"][0][0]),
                ("ai", all_in_one_prompt["examples"][0][1]),
                (
                    "user",
                    """
Please perform matching for the following information - forget the previous example:

---job seeker profile---
{user_profile}

---Job Content--- 
{job_content}
	""",
                ),
            ]
        )
        return prompt | model | StrOutputParser()

    def build_match_meta_chain(self, model):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", meta_only_prompt["system"]),
                ("user", meta_only_prompt["examples"][0][0]),
                ("ai", meta_only_prompt["examples"][0][1]),
                (
                    "user",
                    """
Please perform matching for the following information - forget the previous example:                
    
---job seeker profile---
{user_profile}

---Job Content---
{job_content}
    """,
                ),
            ]
        )
        return prompt | model | StrOutputParser()

    def build_match_skills_chain(self, model):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", skills_prompt["system"]),
                ("user", skills_prompt["examples"][0][0]),
                ("ai", skills_prompt["examples"][0][1]),
                (
                    "user",
                    """
Please perform matching for the following information - forget the previous example:

---job seeker profile---
{user_profile}

---Job Content---
{job_content}
    """,
                ),
            ]
        )
        return prompt | model | StrOutputParser()

    def build_match_job_contents_chain(self, model):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", job_contents_prompt["system"]),
                ("user", job_contents_prompt["examples"][0][0]),
                ("ai", job_contents_prompt["examples"][0][1]),
                (
                    "user",
                    """
Please perform matching for the following information - forget the previous example:

---job seeker profile---
{user_profile}

---Job Content---
{job_content}
    """,
                ),
            ]
        )
        return prompt | model | StrOutputParser()

    def match_meta(self, job_content: dict, user_profile: str, max_retries=3):
        logging.debug("Start matching job meta...")
        job_content = {
            "job_title": job_content.get("job_title", ""),
            "locations": job_content.get("locations", []),
            "salary": job_content.get("salary", ""),
            "experience": job_content.get("experience", ""),
            "education": job_content.get("education", ""),
            "company_name": job_content.get("company_name", ""),
            "company_size": job_content.get("company_size", ""),
            "company_culture": job_content.get("company_culture", ""),
            "company_industry": job_content.get("company_industry", ""),
            "remote_ok": job_content.get("remote_ok", False),
            "job_types": job_content.get("job_types", []),
            "benefits": job_content.get("benefits", []),
        }
        retry = 0
        while retry < max_retries:
            try:
                output = self._match_meta_chain.invoke(
                    {"job_content": job_content, "user_profile": user_profile}
                )
                print(">>>>", output)
                starting_index = output.find("{")
                output = output[starting_index:]
                print(">>>>len", len(output))
                res = json.loads(output)
                if not res:
                    raise ValueError("Result not found")

                logging.debug(f"Job meta matched: {res}")
                return res
            except Exception as e:
                logging.error(f"Failed to match job meta: {e}, retrying...")
                retry += 1

        logging.error(f"Failed to match job meta after {retry} retries.")

    def match_skills(self, job_content: dict, user_profile: str, max_retries=3):
        logging.debug("Start matching job skills and contents...")
        job_content = {
            "skills": job_content.get("skills", []),
        }
        retry = 0
        while retry < max_retries:
            try:
                output = self._match_skills_chain.invoke(
                    {"job_content": job_content, "user_profile": user_profile}
                )
                print(">>>>", output)
                starting_index = output.find("{")
                output = output[starting_index:]
                print(">>>>len", len(output))
                res = json.loads(output)
                if not res:
                    raise ValueError("Result not found")

                logging.debug(f"Job skills matched: {res}")
                return res
            except Exception as e:
                logging.error(f"Failed to match job skills: {e}, retrying...")
                retry += 1

        logging.error(f"Failed to match job skills after {retry} retries.")
        
    
    def match_job_contents(self, job_content: dict, user_profile: str, max_retries=3):
        logging.debug("Start matching job contents...")
        job_content = {
            "job_contents": job_content.get("job_contents", []),
        }
        retry = 0
        while retry < max_retries:
            try:
                output = self._match_job_contents_chain.invoke(
                    {"job_content": job_content, "user_profile": user_profile}
                )
                print(">>>>", output)
                starting_index = output.find("{")
                output = output[starting_index:]
                print(">>>>len", len(output))
                res = json.loads(output)
                if not res:
                    raise ValueError("Result not found")

                logging.debug(f"Job contents matched: {res}")
                return res
            except Exception as e:
                logging.error(f"Failed to match job contents: {e}, retrying...")
                retry += 1

        logging.error(f"Failed to match job contents after {retry} retries.")

    def match_all_in_one(self, job_content: dict, user_profile: str, max_retries=3):
        logging.debug("Start matching job all in one...")
        job_content = {
            "job_title": job_content.get("job_title", ""),
            "locations": job_content.get("locations", []),
            "salary": job_content.get("salary", ""),
            "experience": job_content.get("experience", ""),
            "education": job_content.get("education", ""),
            "company_name": job_content.get("company_name", ""),
            "company_size": job_content.get("company_size", ""),
            "company_culture": job_content.get("company_culture", ""),
            "company_industry": job_content.get("company_industry", ""),
            "remote_ok": job_content.get("remote_ok", False),
            "job_types": job_content.get("job_types", []),
            "benefits": job_content.get("benefits", []),
            "skills": job_content.get("skills", []),
            "job_contents": job_content.get("job_contents", []),
        }
        retry = 0
        while retry < max_retries:
            try:
                output = self._all_in_one_chain.invoke(
                    {"job_content": job_content, "user_profile": user_profile}
                )
                print(">>>>", output)
                starting_index = output.find("{")
                output = output[starting_index:]
                print(">>>>len", len(output))
                res = json.loads(output)
                if not res:
                    raise ValueError("Result not found")

                logging.debug(f"Job matched: {res}")
                return res
            except Exception as e:
                logging.error(f"Failed to match job: {e}, retrying...")
                retry += 1

        logging.error(f"Failed to match job after {retry} retries.")

    def match_with_3_steps(self, job_content: dict, user_profile: str, max_retries=3):
        logging.debug("Start matching job with 2 steps...")
        meta_match_res = self.match_meta(job_content, user_profile, max_retries)
        skills_match_res = self.match_skills(
            job_content, user_profile, max_retries
        )
        job_contents_match_res = self.match_job_contents(
            job_content, user_profile, max_retries
        )
        if not meta_match_res or not skills_match_res or not job_contents_match_res:
            return None

        return {**meta_match_res, **skills_match_res, **job_contents_match_res}

    # def match(self, job_content: str, user_profile: str, max_retries=3):
    #     logging.debug("Start matching job...")
    #     retry = 0
    #     while retry < max_retries:
    #         try:
    #             output = self._chain.invoke(
    #                 {"job_content": job_content, "user_profile": user_profile}
    #             )
    #             print(">>>>", output)
    #             result_regex = r"```([\s\S]+)```"
    #             raw_result = re.findall(result_regex, output)[-1]

    #             if not raw_result:
    #                 raise ValueError("Result not found")

    #             res = JobMatchResult.model_validate_json(raw_result)
    #             logging.debug(f"Job matched: {res}")
    #             return res
    #         except Exception as e:
    #             logging.error(f"Failed to match job: {e}, retrying...")
    #             retry += 1

    #     logging.error(f"Failed to match job after {retry} retries.")
