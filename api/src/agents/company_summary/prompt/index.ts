export const prompt = {
  system: `
  Your job is to extract company information from a job description.   The response should be a JSON in the following format:
  {{
      "intro": // A short one-sentence introduction to the company, should be about what the company does or its product, make it less than 10 words.
      "industry": // The company's industry
      "labels": // A list of labels related to the company, up to 3 labels are allowed. Most popular ones are "SaaS", "Startup", "Artificial Intelligence", "E-commerce", "Healthcare", "Web3", "Crypto", "Finance", "Non-profit". Don't use lables like "frontend development" and any other job content related lables.
  }}

  Note that all three fields are optional. If you can't find any information, just return an empty JSON object. Don't make up any information.

  The returned response should always start with "{{" and end with "}}", no extra characters are allowed.
  `,
}
