from peewee import (
    Model,
    CharField,
    TextField,
    DateTimeField,
    ForeignKeyField,
    BooleanField,
    IntegerField,
    SQL,
)
from playhouse.postgres_ext import PostgresqlExtDatabase, ArrayField, JSONField
import datetime
import logging


logger = logging.getLogger("peewee")
logger.setLevel(logging.WARNING)
# Connect to a Postgres database.
db = PostgresqlExtDatabase(
    "jobee_dev", user="jobee_dev", password="319298", host="localhost", port=5432
)

# The following defines the database schema, all tables have an implicit id
# field generated by Peewee as incrementing integer.1


class BaseModel(Model):
    class Meta:
        database = db


class User(BaseModel):
    email = CharField(unique=True)
    password = CharField()
    created_at = DateTimeField(default=datetime.datetime.now)

    def to_dict(self):
        return {"id": self.get_id(), "email": self.email, "created_at": self.created_at}

    class Meta:
        db_table = "user"


class JobCrawlEntry(BaseModel):
    created_at = DateTimeField(default=datetime.datetime.now)
    last_run_at = DateTimeField(null=True)
    last_run_interval_days = IntegerField(null=True)

    platform = CharField()
    location = CharField()
    keywords = CharField()
    job_type = CharField(null=True)
    remote_ok = BooleanField(null=True)
    degree_required = CharField(null=True)
    experience_level = CharField(null=True)

    class Meta:
        db_table = "job_crawl_entry"


class UserProfile(BaseModel):
    # DreamJob is a table that stores the user's profile.
    user = ForeignKeyField(User, backref="user_profile")
    raw_content = TextField()

    job_title = CharField(null=True)
    skills = ArrayField(TextField, null=True)  # type: ignore
    job_contents = ArrayField(TextField, null=True)  # type: ignore
    education = CharField(null=True)
    experience = CharField(null=True)
    interested_job = TextField(null=True)

    created_at = DateTimeField(default=datetime.datetime.now)

    def to_profile_dict(self):
        return {
            "job_title": self.job_title,
            "skills": self.skills,
            "job_contents": self.job_contents,
            "education": self.education,
            "experience": self.experience,
            "interested_job": self.interested_job,
        }

    def get_match_results(self):
        results = JobMatchResult.select().where(JobMatchResult.user_profile == self)
        return [result.to_dict() for result in results]

    class Meta:
        db_table = "user_profile"


class UserProfileJobCrawlEntry(BaseModel):
    # UserProfileJobCrawlEntry is a table that stores the relationship between UserProfile and JobCrawlEntry.
    # The design is that multiple user profiles can share the same crawl entry given that the crawl params
    # are the same. This is to avoid duplicate crawl entries.
    user_profile = ForeignKeyField(UserProfile)
    job_crawl_entry = ForeignKeyField(JobCrawlEntry)

    class Meta:
        db_table = "user_profile_crawl_entry"


class JobCrawlResult(BaseModel):
    create_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)
    job_crawl_entry = ForeignKeyField(JobCrawlEntry, backref="crawl_results")

    indeed_job_id = CharField(null=True, unique=True)
    indeed_job_url = TextField(null=True)
    google_job_id = CharField(null=True, unique=True)
    google_job_url = TextField(null=True)

    raw_content = TextField()
    title = CharField()
    locations = ArrayField(TextField, null=True)  # type: ignore
    skills = ArrayField(TextField, null=True)  # type: ignore
    salary = CharField(null=True)
    experience = CharField(null=True)
    education = CharField(null=True)
    salary = CharField(null=True)
    company_name = CharField()
    company_size = CharField(null=True)
    company_culture = CharField(null=True)
    company_industry = CharField(null=True)
    remote_ok = BooleanField(null=True)
    job_types = ArrayField(TextField, null=True)  # type: ignore
    benefits = ArrayField(TextField, null=True)  # type: ignore
    job_contents = ArrayField(TextField, null=True)  # type: ignore

    def to_job_dict(self):
        return {
            "title": self.title,
            "skills": self.skills,
            "salary": self.salary,
            "locations": self.locations,
            "experience": self.experience,
            "education": self.education,
            "company_name": self.company_name,
            "company_size": self.company_size,
            "company_culture": self.company_culture,
            "company_industry": self.company_industry,
            "remote_ok": self.remote_ok,
            "job_types": self.job_types,
            "benefits": self.benefits,
            "job_contents": self.job_contents,
        }

    def to_dict(self, ignore_raw_content=False):
        res = {
            "id": self.get_id(),
            "job_crawl_entry_id": self.job_crawl_entry.get_id(),
            "indeed_job_id": self.indeed_job_id,
            "indeed_job_url": self.indeed_job_url,
            "google_job_id": self.google_job_id,
            "google_job_url": self.google_job_url,
            "title": self.title,
            "skills": self.skills,
            "salary": self.salary,
            "experience": self.experience,
            "education": self.education,
            "company_name": self.company_name,
            "company_size": self.company_size,
            "company_culture": self.company_culture,
            "company_industry": self.company_industry,
            "remote_ok": self.remote_ok,
            "job_types": self.job_types,
            "benefits": self.benefits,
            "job_contents": self.job_contents,
            "created_at": self.create_at,
            "updated_at": self.updated_at,
        }
        if not ignore_raw_content:
            res["raw_content"] = self.raw_content

        return res

    class Meta:
        db_table = "job_crawl_result"


class JobMatchResult(BaseModel):
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)
    user_profile = ForeignKeyField(UserProfile, backref="job_match_results")
    job_crawl_result = ForeignKeyField(JobCrawlResult, backref="job_match_results")

    match_result = JSONField()

    def to_dict(self, populate_job_crawl_result=False):
        res = {
            "id": self.get_id(),
            "job_crawl_result_id": self.job_crawl_result.get_id(),
            "user_profile_id": self.user_profile.get_id(),
            "match_result": self.match_result,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
        if populate_job_crawl_result:
            res["job_crawl_result"] = self.job_crawl_result.to_dict(
                ignore_raw_content=True
            )
        return res

    class Meta:
        db_table = "job_match_result"
        constraints = [SQL("UNIQUE(user_profile_id, job_crawl_result_id)")]


def create_tables():
    with db:
        db.create_tables(
            [
                User,
                JobCrawlEntry,
                UserProfile,
                JobCrawlResult,
                JobMatchResult,
                UserProfileJobCrawlEntry,
            ]
        )
