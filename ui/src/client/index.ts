import axios from "axios";
import Cookie from "js-cookie";
import { UserProfile } from "@/types/user-profile";
import { setupCache } from "axios-cache-interceptor";
import { Job } from "@/types/job";

axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
axios.interceptors.request.use(async (config) => {
  const token = Cookie.get("next-auth.session-token");
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
setupCache(axios, {
  modifiedSince: true,
});

export interface User {
  name: string;
  email: string;
  id: string;
}

export interface JobSearch {
  jobTitle: string;
  jobLocation: string;
}

export interface Education {
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  rewards?: string[];
}

export interface Resume {
  firstName: string;
  lastName: string;
  email?: string;
  website?: string;
  phone?: string;
  address?: string;
  summary?: string;
  educations?: Education[];
  work?: {
    company: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    contents?: string[];
    skills?: string[];
  }[];
  skills: {
    name: string;
  }[];
  certifications?: {
    name: string;
  }[];
  languages?: {
    name: string;
  }[];
  achievements?: {
    name: string;
  }[];
}

export interface Session {
  user: User | null;
  resume?: Resume | null;
  jobSearch?: JobSearch | null;
  savedJobs?: Job[] | null;
}

interface SearchJobsByParamsRequest {
  params: {
    location: string;
    keywords: string[];
    traceBackDays?: number;
  };
}

interface SearchJobsByQueryRequest {
  query: string;
  limit?: number;
  offset?: number;
}

interface SaveJobRequest {
  googleJobId: string;
  jobTitle: string;
  jobLocation: string;
  jobDescription: string;
  jobData: any;
}

interface CreateJobSearchRequest {
  jobTitle: string;
  jobLocation: string;
}

export async function searchJobsByParams(
  req: SearchJobsByParamsRequest
): Promise<any[]> {
  try {
    const response = await axios.post(`/search-with-params`, req);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating user: ${error}`);
  }
}

export async function searchJobsByQuery(
  req: SearchJobsByQueryRequest
): Promise<any[]> {
  try {
    const response = await axios.post(`/search-with-query`, req);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating user: ${error}`);
  }
}

export async function saveJob({
  googleJobId,
  jobTitle,
  jobLocation,
  jobDescription,
  jobData,
}: SaveJobRequest): Promise<UserProfile> {
  try {
    const response = await axios.post(
      `/job/saved`,
      {
        googleJobId,
        jobTitle,
        jobLocation,
        jobDescription,
        jobData,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error save job: ${error}`);
  }
}

export async function deleteSavedJob(
  googleJobId: string
): Promise<UserProfile> {
  try {
    const response = await axios.delete(`/job/saved/${googleJobId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error delete saved job: ${error}`);
  }
}

export async function createJobSearch({
  jobTitle,
  jobLocation,
}: CreateJobSearchRequest): Promise<UserProfile> {
  try {
    const response = await axios.post(
      `/job/create-search`,
      {
        jobTitle,
        jobLocation,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error create job search: ${error}`);
  }
}

export async function getSession(): Promise<Session> {
  try {
    const response = await axios.get(`/auth/session`, {
      withCredentials: true,
    });
    const { data } = response;

    if (data.savedJobs) {
      data.savedJobs = data.savedJobs.map((job: any) =>
        JSON.parse(job.jobData)
      );
    }

    return data;
  } catch (error) {
    throw new Error(`Error getting session: ${error}`);
  }
}
