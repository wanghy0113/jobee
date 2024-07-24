export const all_in_one_prompt = {
  system: `
  You will be given the content of a job, a job seeker's profile and what job the job seeker is interested in. Your responsibility is to generate job matching insigts.
  You should analyze each item in the job description by giving thought and a result wrapped in < and > after each item.
  For example, if the job content has a skill "communication", your thought can be "communication is mentioned in the job seeker's profile" and the matching result can be "match". So you should replace the item with "<thought:mentioned in the job seeker's profile><result:match>"
  Note that if it's a skill match, you should also specify which skills in the job seeker's profile match by <result:match:skill1,skill2>.
  Please include your reasoning for each item!!! This is important.
  
  
  Note: The returned response should always start with "{{" and end with "}}", no extra characters are allowed.
  `,
  examples: [
    [
      `
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
  ],
  "interested_job": "My dream job is to work for a mid-size or large-size company with a good work-life balance. The company should have an engineering culture. The role should be a full-time role with a salary range of $100k to $150k. My preferred locations are San Francisco, New York, and Seattle. Remote work is also acceptable."
}}


---job description---    
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
          `,
      `
{{
  "salary": "$200k to $260k a year<thought:higher than the job seeker's expectation><result:match>",
  "locations": ["San Francisco, CA<thought:one of the preferred locations><result:match>"],
  "title": "Backend Software Engineer<thought:full stack developer is close enought><resut:match>",
  "skills": [
      "Golang<thought:profile does not have Golang in its skill set><result:mismatch>",
      "Designing, building, and maintaining public-facing APIs<thought:skills include express and node.js which can be used for API development><result:match:Express,Node.js>",
      "Testing and compliance with OpenAPI specifications<thought:no OpenAPI is mentioned in the profile but skills include API related techniques><result:likely-match:Express,Node.js>",
      "API Authentication and Authorization (SAML, RBAC, OAuth, JWT)<thought:No authentication and authorization is mentioned in the profile><mismatch>]",
      "Software testing<thought:no testing is mentioned in the profile but testing is essential for any developer job><result:likely-match>",
      "Observability (metrics, logging, tracing)<thought:not mentioned in the profile><result:mismatch>",
      "Containerization and orchestration technologies (Docker, Kubernetes)<thought:not mentioned in the profile><result:mismatch>",
      "CI/CD pipelines<thought:not mentioned in the profile><mismatch>",
      "Security products<thought:not mentioned in the profile><mismatch>"
  ],
  "experience": "3 years<thought:the profile has 3 years of experience><result:match>",
  "education": "<thought:no education requirement is specified by this job><result:unknown>",
  "company_name": "Blue Saturn<thought:no company name is mentioned in the profile><result:unknown>",
  "company_size": "<thought:no company size is specified by this job><result:unknown>",
  "company_culture": "collaborative and ongoing learning<thought:collaborative and ongoing learning is key of engineering culture which is mentioned in the profile><result:match>",
  "company_industry": "Technology<thought:no preferred industry is mentioned in the profile><result:unknown>",
  "remote_ok": "false<thought:the profile specifies that remote work is acceptable><result:mismatch>",
  "job_types": ["full_time<thought:by default, the job is full-time><result:match>"],
  "benefits": [
      "401(k)<thought:not mentioned in the profile><result:unknown>",
      "Dental insurance<thought:not mentioned in the profile><result:unknown>",
      "Health insurance<thought:not mentioned in the profile><result:unknown>",
      "Bonus opportunities<thought:not mentioned in the profile><result:unknown>",
      "RSU<thought:not mentioned in the profile><result:unknown>"
  ],
  "job_contents": [
      "Design, develop, and maintain robust public-facing APIs<thought:the profile has experience in developing web-based applications><resut:match>",
      "Produce high-quality documentation and technical writing<thought:every developer should have experience in documentation><result:likely-match>",
      "Contribute to codebase in Go for developing and improving features<thought:Go is not mentioned in the profile's skill set><result:mismatch>",
      "Monitor and optimize API performance, availability, and security<thought:not mentioned in the profile><result:mismatch>"
  ]
}}
          `,
    ],
  ],
}

const prompt_part_1 =
  "You will be given the content of a job and a job seeker's profile. Your responsibility is to generate job matching insigts."
const prompt_part_2 = `You should analyze each skills item in the job description by giving thought and a result wrapped in < and > after each item. So an item becomes "item content<thought:your thought><result:match|mismatch|likely-match|unknown>"`
const prompt_format_clarification = `Note: The returned response should be VALID JSON with all values as string. It should start with "{{" and end with "}}", no extra characters are allowed.`

export const meta_only_prompt = {
  system: `
  ${prompt_part_1}
  ${prompt_part_2}
  Please strickly follow "item<thought:your thought><result:match|mismatch|likely-match|unknown>" format, don't skip any part.
  For benefits, don't assume any match unless you can prove the match by looking at "interested_job" in the job seeker's profile.
  
  The returned value should only contain items from the job description.
  Do not add any thing for an empty array.

  ${prompt_format_clarification}
  `,
  examples: [
    [
      `
Example 1:

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
  ],
  "interested_job": "My dream job is to work for a mid-size or large-size company with a good work-life balance. The company should have an engineering culture. The role should be a full-time role with a salary range of $100k to $150k with insurance. My preferred locations are San Francisco, New York, and Seattle. Remote work is also acceptable."
}}


---job description---    
{{
  "job_title": "Backend Software Engineer",
  "salary": "$200k to $260k a year",
  "locations": ["San Francisco, CA"],
  "experience": "3 years",
  "education": null,
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
  ]
}}
          `,
      `
{{
  "job_title": "Backend Software Engineer<thought:the profile's title is full stack developer which is close enought><resut:match>",
  "salary": "$200k to $260k a year<thought:higher than expectation><result:match>",
  "locations": ["San Francisco, CA<thought:one of the preferred locations><result:match>"],
  "experience": "3 years<thought:the profile has 3 years of experience><result:match>",
  "education": "null<thought:no education requirement is specified by this job><result:unknown>",
  "company_name": "Blue Saturn<thought:no company name is mentioned in the profile><result:unknown>",
  "company_size": "<thought:no company size is specified by this job><result:unknown>",
  "company_culture": "collaborative and ongoing learning<thought:collaborative and ongoing learning is key of engineering culture which is mentioned in the profile><result:match>",
  "company_industry": "Technology<thought:no preferred industry is mentioned in the profile><result:unknown>",
  "remote_ok": "false<thought:the profile specifies that remote work is acceptable><result:mismatch>",
  "job_types": ["full_time<thought:by default, the job is full-time><result:match>"],
  "benefits": [
      "401(k)<thought:not mentioned in the profile><result:unknown>",
      "Dental insurance<thought:insurance mentioned in the profile's interested_job><result:match>",
      "Health insurance<thought:insurance mentioned in the profile's interested_job><result:match>",
      "Bonus opportunities<thought:not mentioned in the profile><result:unknown>",
      "RSU<thought:not mentioned in the profile><result:unknown>"
  ]
}}
          `,
    ],
  ],
}

export const skills_prompt = {
  system: `
  ${prompt_part_1}
  ${prompt_part_2}
  To dictate a match, you must find corresponding skills in the job seeker's profile and include the skills in the result as <result:match:skill1,skill2,skill3...>
  To dictate a likely-match, you should find strong evidence by matching job seeker's skills, job title or job contents and give result as <result:likely-match:skill1,skill2,skill3...> or <result:likely-match>
  Please include your reasoning for each item!!! This is important.
      
  ${prompt_format_clarification}
  `,
  examples: [
    [
      `
Example 1:
---job seeker profile---
{{
  "job_title": "full stack developer",
  "skills": ["React", "Node.js", "Express", "MongoDB", "AWS", "Docker"],
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


---job description---    
{{
  "skills": [
      "Golang",
      "React.js",
      "Designing, building, and maintaining public-facing APIs",
      "Testing and compliance with OpenAPI specifications",
      "API Authentication and Authorization (SAML, RBAC, OAuth, JWT)",
      "Software testing",
      "Observability (metrics, logging, tracing)",
      "Containerization and orchestration technologies",
      "CI/CD pipelines",
      "Security products"
  ]
}}
          `,
      `
{{
  "skills": [
      "Golang<thought:profile does not have Golang in its skill set><result:mismatch>",
      "React.js<thought:React is mentioned in the profile's skill set><result:match:React>",
      "Designing, building, and maintaining public-facing APIs<thought:skills include Express and Node.js which can be used for API development><result:match:Express,Node.js>",
      "Testing and compliance with OpenAPI specifications<thought:no OpenAPI is mentioned in the profile but skills include Express and Node.js which can be related to OpenAPI><result:likely-match:Express,Node.js>",
      "API Authentication and Authorization (SAML, RBAC, OAuth, JWT)<thought:No authentication and authorization is mentioned in the profile><mismatch>",
      "Software testing<thought:no testing is mentioned in the profile but testing is essential for any developer job><result:likely-match>",
      "Observability (metrics, logging, tracing)<thought:not mentioned in the profile><result:mismatch>",
      "Containerization and orchestration technologies"<thought:skills include Docker which is related toContainerization ><result:likely-match:Docker>",
      "CI/CD pipelines<thought:not mentioned in the profile><mismatch>",
      "Security products<thought:not mentioned in the profile><mismatch>"
  ]
}}
          `,
    ],
  ],
}

export const job_contents_prompt = {
  system: `
  ${prompt_part_1}
  ${prompt_part_2}
  The result should be based on whether any of the job seeker's skill or its job contents match the job content item.
  Please include your reasoning for each item!!! This is important.
  
  
  ${prompt_format_clarification}
  `,
  examples: [
    [
      `
Example 1:
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
  ],
  "interested_job": "My dream job is to work for a mid-size or large-size company with a good work-life balance. The company should have an engineering culture. The role should be a full-time role with a salary range of $100k to $150k. My preferred locations are San Francisco, New York, and Seattle. Remote work is also acceptable."
}}


---job description---    
{{
  "job_contents": [
      "Design, develop, and maintain robust public-facing APIs",
      "Produce high-quality documentation and technical writing",
      "Contribute to codebase in Go for developing and improving features",
      "Monitor and optimize API performance, availability, and security"
  ]
}}
          `,
      `
{{
  "job_contents": [
      "Design, develop, and maintain robust public-facing APIs<thought:the profile has mathcing skills><resut:match:Express,Node.js>",
      "Produce high-quality documentation and technical writing<thought:not mentioned in the profile but likelt match since a full stack developer's job contents most likely include this><result:likely-match>",
      "Contribute to codebase in Go for developing and improving features<thought:Go is a core skill but not mentioned in the profile's skill set><result:mismatch>",
      "Monitor and optimize API performance, availability, and security<thought:not mentioned in the profile><result:unknown>"
  ]
}}
          `,
    ],
  ],
}
