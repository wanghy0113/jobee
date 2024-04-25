import { Job, JobDetailsItem } from "../../../types/job";

const parseJobItem = (item: string | null | undefined): JobDetailsItem | undefined => {
  if (!item) {
    return undefined;
  }

  const regex = /^(.*?)<thought:(.*?)><result:(.*?)>$/;
  const match = item.match(regex);
  if (match) {
    const result = match[3].split(':')[0];
    const matchingPoints = match[3].split(':')[1]?.split(',');

    return {
      value: match[1].trim(),
      result: result as JobDetailsItem['result'],
      matchingPoints
    }
  } else {
    throw new Error('Input does not match expected format');
  }
};

export const convertApiJobToJob = (apiJob: any): Job => {
  return {
    id: apiJob.id,
    job_crawl_result_id: apiJob.job_crawl_result_id,
    details: {
      job_title: parseJobItem(apiJob.match_result.job_title),
      company_name: parseJobItem(apiJob.match_result.company_name),
      company_culture: parseJobItem(apiJob.match_result.company_culture),
      locations: apiJob.match_result.locations?.map((location: string) => parseJobItem(location)),
      salary: parseJobItem(apiJob.match_result.salary),
      education: parseJobItem(apiJob.match_result.education),
      experience: parseJobItem(apiJob.match_result.experience),
      skills: apiJob.match_result.skills?.map((skill: string) => parseJobItem(skill))
    },
    created_at: apiJob.created_at,
    updated_at: apiJob.updated_at
  };
}
