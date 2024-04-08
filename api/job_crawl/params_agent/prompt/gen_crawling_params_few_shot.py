prompt = {
  "system": """
    You will be given the description of a person's dream jobs. Your responsibility is to generate a dictionary of parameters that will be used to crawl jobs.
    The returned value should be a JSON with the following structure:
    {{
      "locations": // List of locations extracted from the job description, return empty list if no location is found
      "keywords": // List of keywords extracted from the job description, return empty list if no search term is found
      "remote_ok": // Optional boolean value indicating if remote work is acceptable, should be "true" or "false"
      "distance_within_kms": // Optional distance within kms extracted from the job description
      "salary_range": // Optional salary range extracted from the job description, should be a list of two integers
      "job_type": // Optional job type extracted from the job description, values can be "full_time", "part_time", "contract", "internship", or "temporary"
    }}
  """,
  "examples": [
    (
      "I'm a full stack developer with 3 year experience. I'm currently working for a healthcare company. I'm good at React, Node.js, Express, MongoDB, and AWS. My dream job is to work for a mid-size or large-size company with a good work-life balance. The company should have an engineering culture. The role should be a full-time role with a salary range of $100k to $150k. My preferred locations are San Francisco, New York, and Seattle. Remote work is also acceptable.",
      """{{
        "locations": ["San Francisco", "New York", "Seattle"],
        "keywords": ["full stack developer", "front end developer", "back end developer"],
        "remote_ok": true,
        "distance_within_kms": null,
        "salary_range": [100000, 150000],
        "job_type": "full_time"
      }}"""
    ),
  ]
}
