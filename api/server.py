from job_analyst.match_agent import JobMatchAgent
from job_analyst.sort_agent import JobSortAgent
from job_crawl.params_agent.agent import CrawlingParamsAgent
from job_crawl.indeed import IndeedCrawler
import logging
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from job_service import JobService
import uvicorn
from pydantic import BaseModel
from db.models import (
    DreamJob,
    JobCrawlResult,
    User,
)
import hashlib
from typing import Annotated
from jose import JWTError, jwt
from tasks import crawl_and_match
from starlette.responses import StreamingResponse
import asyncio
from fastapi.middleware.cors import CORSMiddleware
import json

SECRET_KEY = "secret"

logging.basicConfig(level=logging.DEBUG)


class CreateUserRequest(BaseModel):
    email: str
    password: str


class CreateDreamJobRequest(BaseModel):
    user_id: int
    description: str
    enable_job_crawl_and_match: bool = True


class MatchDreamJobRequest(BaseModel):
    new_jobs_only: bool = True


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()
origins = [
    "*",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specified origins
    allow_credentials=True,  # Allows credentials (cookies, authorization headers, etc.) to be included
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
job_service = JobService(
    {
        "indeed": IndeedCrawler({"browser_type": "chromium", "headless": True}),
    },
    CrawlingParamsAgent(),
    JobSortAgent(),
    JobMatchAgent(),
)


def get_user(email: str):
    user = User.select().where(User.email == email).first()
    return user.to_dict() if user else None


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("email")  # type: ignore
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(email)
    if user is None:
        raise credentials_exception
    return user


@app.get("/ping")
def ping():
    return "pong"


@app.get("/users/me/")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user


@app.post("/user")
def create_user(req: CreateUserRequest):
    exising = User.select().where(User.email == req.email)
    if exising:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_password = hashlib.sha256(req.password.encode()).hexdigest()
    user: User = User.create(email=req.email, password=hashed_password)
    return user.to_dict()


async def crawl_and_match_dream_job_generator(dream_job: DreamJob):
    match_res_queue = asyncio.Queue()

    def on_result(result: JobCrawlResult):
        match_res = job_service.match_job(dream_job, result)

        if match_res:
            match_res_queue.put_nowait(match_res)


    crawl_task = asyncio.create_task(job_service.crawl_for_dream_job(dream_job.get_id(), on_result=on_result))
    logging.debug("Crawl task created")
    yield "stage: crawling dream job"

    while not crawl_task.done() or not match_res_queue.empty():
        try:
            match_res = await asyncio.wait_for(match_res_queue.get(), timeout=2.0)
            yield f"job match result: {json.dumps(match_res.to_dict(populate_job_crawl_result=True))}"
        except asyncio.TimeoutError:
            continue

    yield "stage: crawling done"


async def create_and_process_dream_job_generator(
    user_id: int, description: str, enable_job_crawl_and_match: bool
):
    yield "stage: creating dream job"
    dream_job = job_service.create_dream_job(user_id, description)
    yield "stage: creating dream job crawl entries"
    job_service.create_dream_job_crawl_entries(dream_job)
    if enable_job_crawl_and_match:
        async for res in crawl_and_match_dream_job_generator(dream_job):
            yield res


@app.post("/dream_job")
def create_dream_job(req: CreateDreamJobRequest):
    logging.debug(f"Create dream job for user: {req}")
    return StreamingResponse(
        create_and_process_dream_job_generator(
            req.user_id, req.description, req.enable_job_crawl_and_match
        ),
        media_type="text/event-stream",
    )


@app.post("/dream_job/{dream_job_id}/crawl_jobs")
def crawl_jobs(dream_job_id: int):
    dream_job = job_service.get_dream_job(dream_job_id)
    if not dream_job:
        raise HTTPException(status_code=404, detail="Dream job not found")
    return StreamingResponse(
        crawl_and_match_dream_job_generator(dream_job), media_type="text/event-stream"
    )


@app.post("/dream_job/{dream_job_id}/lro/crawl_jobs")
def crawl_jobs_async(dream_job_id: int):
    res = crawl_and_match.delay(dream_job_id)
    return {"task_id": res.id}


@app.post("/dream_job/{dream_job_id}/match_jobs")
def match_dream_jobs(dream_job_id: int, req: MatchDreamJobRequest):
    job_service.match_for_dream_job(dream_job_id)


@app.get("/dream_job/{dream_job_id}/match_results")
def get_job_match_results(dream_job_id: int):
    return job_service.get_match_results(dream_job_id)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
