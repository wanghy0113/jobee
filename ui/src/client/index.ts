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

export function createDreamJob(req: CreateDreamJobRequest, onMessage: (message: string) => void) {
  // const response = await axios.post('/dream_job', req, { responseType: 'stream' });
  fetch('http://localhost:8000/dream_job', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  }).then((response) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get reader');
    }
    return reader;
  }).then((reader) => {
    const decoder = new TextDecoder();
    const read = () => {
      reader.read().then(({ done, value }) => {
        if (done) {
          return;
        }
        const message = decoder.decode(value);
        onMessage(message);
        read();
      });
    };
    read();
  })
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
