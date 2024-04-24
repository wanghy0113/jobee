prompt = {
    "system": """
    You will be given the content of a job, a job seeker's profile and what job the job seeker is interested in. Your responsibility is to generate job matching insigts.
    You should analyze each item in the job description by giving the matching result wrapped in < and > after each item.
    For example, if the job content has a skill "communication" and it is mentioned in the profile, you should replace the item with "<result:match>"
    Note that if it's a skill match, you should also specify which skills in the job seeker's profile match by <result:match:skill1,skill2>.
    
    
    Note: The returned response should always start with "{{" and end with "}}", no extra characters are allowed.
    """,
    "examples": [
        (
            
            """
---job seeker profile---
{{
    "job_title": "full stack developer",
    "skills": ["React", "Node.js", "Express", "MongoDB", "AWS"],
    "education": "Bachelor's degree in Computer Science",
    "experience": "3 years",
    "job_contents": [
        "Build a web-based interactive application on market data to enable users execute complex data analytics",
        "Implemented trip insurance web application based on ReactJS/NestJS/GraphQL",
        "Developed a new project with React.js, Material Design and AWS",
        "Worked closely with QA and took into account all questions from QA related to front-end website service",
        "To help meet and solve customers' expectations and problems about front-end applications and worked on charts to deliver data visualization"
    ]
    "interested_job": "My dream job is to work for a mid-size or large-size company with a good work-life balance. The company should have an engineering culture. The role should be a full-time role with a salary range of $100k to $150k. My preferred locations are San Francisco, New York, and Seattle. Remote work is also acceptable."
}}


---Job Content---    
{{
    "salary": "$200k to $260k a year",
    "locations": ["San Francisco, CA"],
    "title": "Backend Software Engineer",
    "skills": [
        "Golang",
        "Designing, building, and maintaining public-facing APIs",
        "Testing and compliance with OpenAPI specifications",
        "API Authentication and Authorization (SAML, RBAC, OAuth, JWT)",
        "Software testing",
        "Observability (metrics, logging, tracing)",
        "Containerization and orchestration technologies (Docker, Kubernetes)",
        "CI/CD pipelines",
        "Security products"
    ],
    "experience": "3 years",
    "education": "",
    "company_name": "Blue Saturn",
    "company_size": "",
    "company_culture": "collaborative and ongoing learning",
    "company_industry": "Technology",
    "remote_ok": false,
    "job_types": ["full_time"],
    "benefits": [
        "401(k)",
        "Dental insurance",
        "Health insurance",
        "Bonus opportunities",
        "RSU"
    ],
    "job_contents": [
        "Design, develop, and maintain robust public-facing APIs",
        "Produce high-quality documentation and technical writing",
        "Contribute to codebase in Go for developing and improving features",
        "Monitor and optimize API performance, availability, and security"
    ]
}}
            """,
            """
{{
    "salary": "<result:match>",
    "locations": ["<result:match>"],
    "title": "<resut:match>",
    "skills": [
        "<result:mismatch>",
        "<result:match:Express,Node.js>",
        "<result:likely-match:Express,Node.js>",
        "<mismatch>]",
        "<result:likely-match>",
        "<result:mismatch>",
        "<result:mismatch>",
        "<mismatch>",
        "<mismatch>"
    ],
    "experience": "<result:match>",
    "education": "<result:unknown>",
    "company_name": "<result:unknown>",
    "company_size": "<result:unknown>",
    "company_culture": "<result:match>",
    "company_industry": "<result:unknown>",
    "remote_ok": "<result:mismatch>",
    "job_types": ["<result:match>"],
    "benefits": [
        "<result:unknown>",
        "<result:unknown>",
        "<result:unknown>",
        "<result:unknown>",
        "<result:unknown>"
    ],
    "job_contents": [
        "<resut:match>",
        "<result:likely-match>",
        "<result:mismatch>",
        "<result:mismatch>"
    ]
}}
            """,
        ),
    ],
}
