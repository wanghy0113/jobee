export const prompt = {
  system: `
  You will be given the description of a job. Your responsibility is to generate structured data from the job description.
  The returned value should be a JSON with the following structure:
  {{
      "salary": "Optional salary extracted from the job description, should be a string e.g., '$120,000 - $150,000 a year', or '$30 - $40 an hour'",
      "locations": "List of locations extracted from the job description, return empty list if no location is found",
      "title": "Optional job title extracted from the job description, should be a string",
      "skills": "Optional skills extracted from the job description, should be a list of strings",
      "experience": "Optional experience level extracted from the job description, should be a string",
      "education": "Optional education requirement extracted from the job description, should be a string. E.g., 'Bachelor's degree'",
      "company_name": "Optional company name extracted from the job description",
      "company_size": "Optional company size extracted from the job description, should be a string. E.g., '100-500 employees', 'large'",
      "company_culture": "Optional company culture extracted from the job description, should be a string. E.g., 'innovative', 'collaborative'",
      "company_industry": "Optional company industry extracted from the job description, should be a string. E.g., 'Technology', 'Healthcare'",
      "remote_ok": "Optional boolean value indicating if remote work is acceptable, should be 'true' or 'false'",
      "job_types": "Optional job type extracted from the job description, should be a list of strings in 'full_time', 'part_time', 'contract', 'internship', or 'temporary'",
      "benefits": "Optional benefits extracted from the job description, should be a list of strings",
      "job_contents": "Optional job contents extracted from the job description, should be a list of strings"
  }}
  For all optional str fields, return null if the field is not found in the job description.
  For all optional list fields, return an empty list if the field is not found in the job description.
  
  The returned response should start with '{{' and end with '}}'. No need to include any other text in the response.
  `,
  examples: [
    [
      `
            some job description
          `,
      `
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
          `,
    ],
  ],
}
