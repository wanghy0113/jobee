export interface Job {
  id: number;
  job_crawl_result_id: number;
  dream_job_id: number;
  matching_points: string[];
  warning_points: string[];
  job_crawl_result: JobCrawlResult;
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
