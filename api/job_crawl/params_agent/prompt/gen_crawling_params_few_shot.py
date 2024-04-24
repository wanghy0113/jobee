prompt = {
  "system": """
    You will be given the profile of a job seeker. Your responsibility is to generate a dictionary of parameters that will be used to crawl jobs for the job seeker.
    The returned value should be a JSON with the following structure:
    {{
      "locations": // List of locations used for job serach, return empty list if no location is found. Each location should follow "city, state/province" strictly. Don't use adjective words like "beautiful" or "greater" in the location. For example, "San Francisco, CA" is correct, but "Beautiful San Francisco, CA" is incorrect. 
      "keywords": // List of keywords used for job search. Maximum 3 keywords. Keywords should be job titles related to the seeker's profile.
      "remote_ok": // Optional boolean value indicating if remote work is acceptable, should be "true" or "false"
      "salary_range": // Optional salary range extracted from the job description, should be a list of two integers
      "job_types": // Optional job type extracted from the job description, should be a list of values which can be "full_time", "part_time", "contract", "internship", or "temporary".
    }}
  """,
  "examples": [
    (
      """
{{
  "job_title": "Sales Executive",
  "skills": ["Negotiation,CRM Software,Lead Generation,"Customer Relationship Management","Market Analysis",Presentation,Communication,"Sales Strategy","Product Knowledge","Team Leadership"],
  "job_contents": ["Developed and implemented sales strategies to penetrate new markets and increase market share","Managed a portfolio of accounts and oversaw customer satisfaction and service delivery","Utilized CRM software to track sales opportunities and customer interactions","Conducted market analysis to identify trends and opportunities for growth","Led sales presentations to high-profile clients and negotiated contracts to close deals","Trained and led a team of junior sales associates, focusing on skill development and performance improvement"],
  "education": ["Bachelor's Degree in Business Administration", "Professional Sales Management Certification"],
  "experience": ['5+ years of experience in B2B and B2C sales environments'],
  "interested_job": "Seeking a Sales Manager or Senior Sales Executive position in a dynamic company where I can contribute to business growth and strategy development. Preferably in the technology or consumer goods sector, with opportunities for career advancement. The job should be based on San Fracisco, CA or remotely from the US."
}}
      """,
      """{{
        "locations": ["San Francisco, CA"],
        "keywords": ["sales manager", "sales executive", "senior sales executive"],
        "remote_ok": null,
        "salary_range": null,
        "job_types": null
      }}"""
    ),
  ]
}
