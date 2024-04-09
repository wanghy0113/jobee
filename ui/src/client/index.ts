import axios, { AxiosResponse } from 'axios';
import Cookie from 'js-cookie';

axios.defaults.baseURL = 'http://localhost:8000';
axios.interceptors.request.use(async (config) => {
  const token = Cookie.get('next-auth.session-token');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface CreateDreamJobRequest {
  user_id: number;
  description: string;
}

interface CrawlDreamJobsRequest {
  dream_job_id: number;
  enable_job_matching: boolean;
}

export async function createDreamJob(req: CreateDreamJobRequest): Promise<AxiosResponse> {
  try {
    const response = await axios.post('/dream_job', req);
    return response;
  } catch (error) {
    throw new Error(`Error creating user: ${error}`);
  }
}

export async function crawlDreamJobs(req: CrawlDreamJobsRequest): Promise<AxiosResponse> {
  try {
    const response = await axios.post('/crawl_dream_jobs', req);
    return response;
  } catch (error) {
    throw new Error(`Error creating user: ${error}`);
  }
}

export async function getDreamJobs(): Promise<AxiosResponse> {
  try {
    const response = await axios.get('/dream_job');
    return response;
  } catch (error) {
    throw new Error(`Error creating user: ${error}`);
  }
}
