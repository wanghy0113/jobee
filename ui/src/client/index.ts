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
  userResume?: Resume | null;
}

export interface JobSearch {
  jobTitle: string;
  jobLocation: string;
}

export interface Education {
  id: string;
  school?: string;
  major?: string;
  degree?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  gpa?: string;
  awards?: string[];
}

export interface WorkExperience {
  id: string;
  company?: string;
  title?: string;
  location?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  contents?: string[];
  skills?: string[];
}

export interface Resume {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  phone?: string;
  address?: string;
  summary?: string;
  educations?: Education[];
  workExperiences?: WorkExperience[];
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  achievements?: string[];
}

export interface Session {
  user: User | null;
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

export async function createResume({
  data,
}: {
  data: Partial<Resume>;
}): Promise<Resume> {
  try {
    const response = await axios.post(`/resume`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error creating resume: ${error}`);
  }
}

export async function createResumeFromFile({
  file,
}: {
  file: File;
}): Promise<Resume> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`/resume/create-from-file`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error creating resume: ${error}`);
  }
}

export async function createEducation({
  resumeId,
  data,
}: {
  resumeId: string;
  data: Partial<Education>;
}): Promise<Resume> {
  try {
    const response = await axios.post(`/resume/${resumeId}/education`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error creating education: ${error}`);
  }
}

export async function createWorkExperience({
  resumeId,
  data,
}: {
  resumeId: string;
  data: Partial<WorkExperience>;
}): Promise<Resume> {
  try {
    const response = await axios.post(
      `/resume/${resumeId}/workExperience`,
      data,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error creating work experience: ${error}`);
  }
}

export async function deleteEducation({
  resumeId,
  educationId,
}: {
  resumeId: string;
  educationId: string;
}): Promise<Resume> {
  try {
    const response = await axios.delete(
      `/resume/${resumeId}/education/${educationId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error deleting education: ${error}`);
  }
}

export async function deleteWorkExperience({
  resumeId,
  workExperienceId,
}: {
  resumeId: string;
  workExperienceId: string;
}): Promise<Resume> {
  try {
    const response = await axios.delete(
      `/resume/${resumeId}/workExperience/${workExperienceId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error deleting work experience: ${error}`);
  }
}

export async function updateBasicInfo({
  resumeId,
  data,
}: {
  resumeId: string;
  data: Partial<Resume>;
}): Promise<Resume> {
  try {
    const response = await axios.patch(`/resume/${resumeId}/basic-info`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error updating basic info: ${error}`);
  }
}

export async function updateWorkExperience({
  resumeId,
  workExperienceId,
  data,
}: {
  resumeId: string;
  workExperienceId: string;
  data: Partial<WorkExperience>;
}): Promise<Resume> {
  try {
    const response = await axios.patch(
      `/resume/${resumeId}/workExperience/${workExperienceId}`,
      data,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error updating basic info: ${error}`);
  }
}

export async function updateEducation({
  resumeId,
  educationId,
  data,
}: {
  resumeId: string;
  educationId: string;
  data: Partial<Education>;
}): Promise<Resume> {
  try {
    const response = await axios.patch(
      `/resume/${resumeId}/education/${educationId}`,
      data,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error updating basic info: ${error}`);
  }
}

export async function deleteResume(resumeId: string): Promise<void> {
  try {
    await axios.delete(`/resume/${resumeId}`, {
      withCredentials: true,
    });
  } catch (error) {
    throw new Error(`Error deleting resume: ${error}`);
  }
}
