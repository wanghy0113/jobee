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
from playhouse.postgres_ext import PostgresqlExtDatabase, ArrayField
import datetime

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


class DreamJob(BaseModel):
    # DreamJob is a table that stores the user's dream job descriptions.
    user = ForeignKeyField(User, backref="dream_jobs")
    raw_description = TextField()
    created_at = DateTimeField(default=datetime.datetime.now)
    last_matched_at = DateTimeField(null=True)

    class Meta:
        db_table = "dream_job"


class DreamJobCrawlEntry(BaseModel):
    # DreamJobCrawlEntry is a table that stores the relationship between DreamJob and JobCrawlEntry.
    # The design is that multiple dream jobs can share the same crawl entry given that the crawl params
    # are the same. This is to avoid duplicate crawl entries.
    dream_job = ForeignKeyField(DreamJob)
    job_crawl_entry = ForeignKeyField(JobCrawlEntry)

    class Meta:
        db_table = "dream_job_crawl_entry"


class JobCrawlResult(BaseModel):
    create_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)
    job_crawl_entry = ForeignKeyField(JobCrawlEntry, backref="crawl_results")

    indeed_job_id = CharField(null=True, unique=True)
    indeed_job_url = CharField(null=True)
    google_job_id = CharField(null=True, unique=True)
    google_job_url = CharField(null=True)

    raw_content = TextField()
    title = CharField()
    skills = ArrayField(TextField, null=True)  # type: ignore
    salary = ArrayField(null=True)
    experience = CharField(null=True)
    salary = CharField(null=True)
    company = CharField()
    remote_ok = BooleanField(null=True)
    job_types = ArrayField(TextField, null=True)  # type: ignore
    benefits = ArrayField(TextField, null=True)  # type: ignore
    job_contents = ArrayField(TextField, null=True)  # type: ignore

    class Meta:
        db_table = "job_crawl_result"


class JobMatchResult(BaseModel):
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)
    dream_job = ForeignKeyField(DreamJob, backref="job_match_results")
    job_crawl_result = ForeignKeyField(JobCrawlResult, backref="job_match_results")

    matching_points = ArrayField(TextField, null=True)  # type: ignore
    warning_points = ArrayField(TextField, null=True)  # type: ignore

    class Meta:
        db_table = "job_match_result"
        constraints = [SQL("UNIQUE(dream_job_id, job_crawl_result_id)")]


def create_tables():
    with db:
        db.create_tables(
            [
                User,
                JobCrawlEntry,
                DreamJob,
                JobCrawlResult,
                JobMatchResult,
                DreamJobCrawlEntry,
            ]
        )