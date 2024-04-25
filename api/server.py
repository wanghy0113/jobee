from io import BytesIO
from job_analyst.match_agent import JobMatchAgent
from job_analyst.sort_agent import JobSortAgent
from job_crawl.params_agent.agent import CrawlingParamsAgent
import logging
from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
from fastapi.security import OAuth2PasswordBearer
from job_service.job_service import JobService
from user_profile.user_profile_summarization_agent import UserProfileSummarizationAgent
import uvicorn
from pydantic import BaseModel
from db.models import (
    UserProfile,
    User,
)
import hashlib
from typing import Annotated
from jose import JWTError, jwt
from starlette.responses import StreamingResponse
from job_crawl.google import GoogleCrawler
from langchain_anthropic import ChatAnthropic
from pdfminer.high_level import extract_text
from fastapi.middleware.cors import CORSMiddleware

SECRET_KEY = "secret"

logging.basicConfig(level=logging.DEBUG)
for logger_name in logging.root.manager.loggerDict:
    logger = logging.getLogger(logger_name)
    logger.setLevel(logging.WARNING)


class CreateUserRequest(BaseModel):
    email: str
    password: str


class CreateUserProfileRequest(BaseModel):
    raw_content: str | None = None
    interested_job: str | None = None
    enable_job_crawl_and_match: bool = False


class MatchDreamJobRequest(BaseModel):
    new_jobs_only: bool = True


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
model = ChatAnthropic(
    model_name="claude-3-haiku-20240307",
    api_key="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",  # type: ignore
    timeout=60,
    temperature=0,
)
job_service = JobService(
    {
        "google": GoogleCrawler({"browser_type": "chromium", "headless": True}),
    },
    CrawlingParamsAgent(),
    JobSortAgent(model),
    JobMatchAgent(model),
    UserProfileSummarizationAgent(model),
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


@app.post("/user/{user_id}/user_profile")
async def create_user_profile(
    user_id: int,
    profile_file: UploadFile = File(...),
    profile_content=Form(None),
    interested_job: str = Form(None),
):
    if profile_content is None and profile_file is None:
        raise HTTPException(status_code=400, detail="No content provided")

    if profile_file is not None and profile_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File is not a PDF")

    user = User.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if profile_file is not None:
        contents = await profile_file.read()
        bytes_io = BytesIO(contents)

        try:
            raw_content = extract_text(bytes_io)
        except Exception as e:
            raise HTTPException(
                status_code=500, detail="Could not extract text from the PDF"
            )
    else:
        raw_content = profile_content

    if raw_content is None:
        raise HTTPException(status_code=400, detail="No content provided")

    user_profile = job_service.create_user_profile(user, raw_content, interested_job)
    return user_profile.to_profile_dict()


@app.post("/user/{user_id}/user_profile/{user_profile_id}/crawl_jobs")
def crawl_jobs(user_id: int, user_profile_id: int):
    user_profile: UserProfile = UserProfile.get_by_id(user_profile_id)
    if not user_profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    if user_profile.user != user_id:
        raise HTTPException(
            status_code=403, detail="User profile does not belong to the user"
        )

    return StreamingResponse(
        job_service.crawl_jobs_for_user_profile_generator(user_profile, 1),
        media_type="text/event-stream",
    )


@app.get("/user/{user_id}/user_profile/{user_profile_id}/jobs")
def get_jobs_for_user_profile(user_id: int, user_profile_id: int):
    user_profile: UserProfile = UserProfile.get_by_id(user_profile_id)
    if not user_profile:
        raise HTTPException(status_code=404, detail="User profile not found")

    return user_profile.get_match_results()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
