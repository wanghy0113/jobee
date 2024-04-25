
export type JobDetailsItem = {
  value: string;
  result: "match" | "likely-match" | "mismatch" | "unknown";
  matchingPoints?: string[];
}

export interface JobDetails {
  job_title?: JobDetailsItem;
  locations?: JobDetailsItem[];
  salary?: JobDetailsItem;
  education?: JobDetailsItem;
  experience?: JobDetailsItem;
  company_name?: JobDetailsItem;
  company_culture?: JobDetailsItem;
  skills?: JobDetailsItem[];
}

export interface Job {
  id: number;
  job_crawl_result_id: number;
  details: JobDetails;
  created_at: string;
  updated_at: string;
}

export interface JobCrawlResult {
  id: number;
  job_crawl_entry_id: number;
  indeed_job_id?: string;
  indeed_job_url?: string;
  google_job_id?: string;
  google_job_url?: string;
  title: string;
  company: string;
  skills?: string[];
  salary?: number[];
  experience?: string;
  remote_ok?: boolean;
  job_types?: string[];
  benefits?: string[];
  job_content?: string[];
  created_at: string;
  updated_at: string;
}
