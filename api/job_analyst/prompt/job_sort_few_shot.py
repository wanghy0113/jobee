prompt = {
    "system": """
    You will be given the description of a job. Your responsibility is to generate structed data from the job description.
    The returned value should be a JSON with the following structure:
    {{
        "salary": // Optional salary extracted from the job description, should be a string e.g., "$120,000 - $150,000 a year", or "$30 - $40 an hour"
        "locations": // List of locations extracted from the job description, return empty list if no location is found
        "title": // Optional job title extracted from the job description, should be a string
        "skills": // Optional skills extracted from the job description, should be a list of strings
        "experience": // Optional experience level extracted from the job description, should be a string
        "education": // Optional education requirement extracted from the job description, should be a string. E.g., "Bachelor's degree"
        "company_name": // Optional company name extracted from the job description
        "company_size": // Optional company size extracted from the job description, should be a string. E.g., "100-500 employees", "large"
        "company_culture": // Optional company culture extracted from the job description, should be a string. E.g., "innovative", "collaborative"
        "company_industry": // Optional company industry extracted from the job description, should be a string. E.g., "Technology", "Healthcare"
        "remote_ok": // Optional boolean value indicating if remote work is acceptable, should be "true" or "false"
        "job_types": // Optional job type extracted from the job description, should be a list of strings in "full_time", "part_time", "contract", "internship", or "temporary"
        "benefits": // Optional benefits extracted from the job description, should be a list of strings
        "job_contents": // Optional job contents extracted from the job description, should be a list of strings
    }}
    For all optional str fields, return null if the field is not found in the job description.
    For all optional list fields, return an empty list if the field is not found in the job description.
    
    The returned response should start with "{{" and end with "}}". No need to include any other text in the response.
    """,
    "examples": [
        (
            """
            Backend Software Engineer - job postBlue SaturnSan Francisco, CA 94107•Hybrid work$120,112.10 - $166,694.14 a year -  Full-timeApply nowsave-iconProfile insightsFind out how your skills align with the job descriptionSkillsDo you have experience in Software testing?YesNo&nbsp;.css-kyg8or{{box-sizing:border-box;margin:0;min-width:0}}ob detailsHere’s how the job details align with your profile.Pay$120,112.10 - $166,694.14 a yearJob typeFull-timeShift and schedule8 hour shift&nbsp;BenefitsPulled from the full job description401(k)Dental insuranceHealth insuranceRSU&nbsp;Full job descriptionWe are working closely to bring the right matches to our customers quicker than ever before, while also ensuring your application doesn't get overlooked.\nWe created a filtering tool that integrates with a customer's hiring platforms- it analyzes 1000s of applicants in seconds, ensures that every profile (regardless of match or not) isn't ghosted, and allows for a more equitable way for your entire profile to be seen.\nOur goal is to give feedback loops in up to 7 days. Please apply and you will receive a contact email to reach out to for any questions!\nBackend Software Engineer, Security Products\nJoin this fast growing company inside their Security Products group, where innovation meets purpose. As part of this dynamic team, you'll be diving into our Signal Sciences technology, the cornerstone of our security offerings. We're on a mission to build cutting-edge API Authentication and Authorization mechanisms like SAML, RBAC, OAuth, and JWT. Your work won't just be technical; it will be instrumental in safeguarding data and online experiences for countless users. The organization values each individual’s unique contributions and encourage a culture of collaboration and ongoing learning. If you’re a passionate developer with a knack for security and problem-solving, this is the perfect place to put your skills to use and make a significant impact.\nWhat You'll Do:\n\n You will design, develop, and maintain robust public-facing APIs, ensuring they meet OpenAPI specifications and are well-tested\n Produce high-quality documentation and technical writing to clearly explain the architecture, codebase, and workflows, catering to both technical and non-technical audiences\n Actively contribute to the codebase, particularly in Go, to develop and improve features in large-scale projects\n Monitor and optimize API performance, availability, and security, taking proactive steps to address issues as they arise\n\nWhat We're Looking For: \n\n You absolutely in coding with (Golang)\n In order to be successful in this role, you must have at least 3 years of production experience designing, building, and maintaining public-facing APIs, including testing and compliance with OpenAPI specifications.\n You have hands-on experience with API Authentication and Authorization aspects, including but not limited to SAML, RBAC, OAuth, and JWT.\n Strong skills in software testing to ensure high-quality code\n Understanding of what makes valuable observability with metrics, logging and tracing\n\nWe’ll be super impressed if you have experience in any of these: \n\n Familiarity with containerization and orchestration technologies like Docker and Kubernetes, to facilitate development and deployment processes.\n Experience with continuous integration/continuous deployment (CI/CD) pipelines, to accelerate development and release cycles\n Familiarity with security products\n\nWork Hours: This position will require you to be available during core business hours.\nWork Location(s) & Travel Requirements:\nThis position is open to the following preferred office locations, flexible hybrid structure:\n\n San Francisco, CA\n Los Angeles, CA\n\nJob Type: Full-time\nPay: $120,112.10 - $166,694.14 per year\nBenefits:\n\n 401(k)\n Dental insurance\n Health insurance\n\nCompensation package:\n\n Bonus opportunities\n RSU\n\nExperience level:\n\n 3 years\n 4 years\n 5 years\n 6 years\n\nSchedule:\n\n 8 hour shift\n\nAbility to Relocate:\n\n San Francisco, CA 94107: Relocate before starting work (Required)\n\nWork Location: Hybrid remote in San Francisco, CA 94107&nbsp;If you require alternative methods of application or screening, you must approach the employer directly to request this as Indeed is not responsible for the employer's application process..css-16q8vs{{ox-sizing:border-box;background:none;-webkit-appearance:none;-moz-appearance:none;-ms-appearance:none;appearance:none;text-align:left;-webkit-text-decoration:none;text-decoration:none;border:none;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-align-items:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;-webkit-justify-content:center;justify-content:center;position:relative;margin:0;padding-left:1rem;padding-right:1rem;line-height:1.5;font-family:\"Noto Sans\",\"Helvetica Neue\",\"Helvetica\",\"Arial\",\"Liberation Sans\",\"Roboto\",\"Noto\",sans-serif;font-size:1rem;font-weight:700;border-radius:0.5rem;border-width:1px;border-style:solid;-webkit-transition:border-color 200ms cubic-bezier(0.645, 0.045, 0.355, 1),background-color 200ms cubic-bezier(0.645, 0.045, 0.355, 1),opacity 200ms cubic-bezier(0.645, 0.045, 0.355, 1),box-shadow 200ms cubic-bezier(0.645, 0.045, 0.355, 1),color 200ms cubic-bezier(0.645, 0.045, 0.355, 1);transition:border-color 200ms cubic-bezier(0.645, 0.045, 0.355, 1),background-color 200ms cubic-bezier(0.645, 0.045, 0.355, 1),opacity 200ms cubic-bezier(0.645, 0.045, 0.355, 1),box-shadow 200ms cubic-bezier(0.645, 0.045, 0.355, 1),color 200ms cubic-bezier(0.645, 0.045, 0.355, 1);display:-webkit-inline-box;display:-webkit-inline-flex;display:-ms-inline-flexbox;display:inline-flex;width:auto;padding-top:0.5625rem;padding-bottom:0.5625rem;color:#2d2d2d;border-color:#e4e2e0;background-color:#e4e2e0}}css-16q8vsx::-moz-focus-inne{{order:0}}media (prefers-reduced-motion: reduce{{css-16q8vs{{webkit-transition:none;transition:none;}}.css-16q8vsx:disable{{pacity:0.4;pointer-events:none}}css-16q8vsx:focu{{utline:none;box-shadow:0 0 0 0.125rem #ffffff,0 0 0 0.1875rem #2557a7}}css-16q8vsx:focus:not([data-focus-visible-added]{{ox-shadow:none}}css-16q8vsx[aria-disabled='true'{{ursor:default}}css-16q8vsx:visite{{olor:#2d2d2d}}css-16q8vsx:hover:not([aria-disabled='true']{{order-color:#d4d2d0;background-color:#d4d2d0}}css-16q8vsx:active:not([aria-disabled='true']{{ox-shadow:inset 0 0.125rem 0.25rem rgba(45, 45, 45, 0.2),inset 0 0.0625rem 0.1875rem rgba(45, 45, 45, 0.12),inset 0 0 0.125rem rgba(45, 45, 45, 0.2);border-color:#b4b2b1;background-color:#b4b2b1}}css-16q8vsx[aria-disabled='true'{{order:transparent;background-color:rgba(228,226,224,0.4);color:rgba(45,45,45,0.4)}}eport job
            """,
            """
{{
    "salary": "$120,112.10 - $166,694.14 a year",
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
        ),
    ],
}
