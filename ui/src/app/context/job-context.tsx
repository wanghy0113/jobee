import { Job } from "@/types/job";
import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "./session-context";
import { LocalJobSearch } from "./types";
import * as apiClient from "@/client";
import { JobSearch } from "@/client";

// Define the shape of the context value
interface JobContextValue {
  jobSearch: LocalJobSearch | null;
  savedJobs: Job[];
  runJobSearch: (jobSearch: JobSearch) => void;
  isJobSearchRunning: boolean;
  createJobSearch: (jobSearch: JobSearch) => void;
  saveJob: (job: Job) => void;
  unsaveJob: (job: Job) => void;
}

// Create the context with a default value
const JobContext = createContext<JobContextValue | undefined>(undefined);

// Create a provider component
interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobSearch, setJobSearch] = useState<JobSearch | null>(null);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isJobSearchRunning, setIsJobSearchRunning] = useState(false);
  const { session } = useSession();

  const saveJob = useCallback(
    async (job: Job) => {
      if (
        savedJobs.find((savedJob) => savedJob.googleJobId === job.googleJobId)
      ) {
        return;
      }
      const newSavedJobs = [...savedJobs, job];
      setSavedJobs(newSavedJobs);
      localStorage.setItem("savedJobs", JSON.stringify(newSavedJobs));
      if (session?.user) {
        await apiClient.saveJob({
          googleJobId: job.googleJobId,
          jobTitle: job.title,
          jobLocation: job.location,
          jobDescription: job.jobDescription || "",
          jobData: job,
        });
      }
    },
    [savedJobs, session?.user]
  );

  const unsaveJob = useCallback(
    async (job: Job) => {
      if (
        !savedJobs.find((savedJob) => savedJob.googleJobId === job.googleJobId)
      ) {
        return;
      }
      const newSavedJobs = savedJobs.filter(
        (savedJob) => savedJob.googleJobId !== job.googleJobId
      );
      setSavedJobs(newSavedJobs);
      localStorage.setItem(
        "savedJobsGoogleJobIds",
        JSON.stringify(newSavedJobs)
      );
      if (session?.user) {
        await apiClient.deleteSavedJob(job.googleJobId);
      }
    },
    [savedJobs, session?.user]
  );

  const createJobSearch = useCallback(
    async (jobSearch: JobSearch) => {
      setJobSearch(jobSearch);
      localStorage.setItem("jobSearch", JSON.stringify(jobSearch));
      if (session?.user) {
        await apiClient.createJobSearch({
          jobTitle: jobSearch.jobTitle,
          jobLocation: jobSearch.jobLocation,
        });
      }
    },
    [session?.user]
  );

  const runJobSearch = useCallback(
    async (jobSearch: JobSearch) => {
      setIsJobSearchRunning(true);
      const localJobSearch = {
        ...jobSearch,
        lastRunAt: new Date(),
        jobs: [],
      };
      await createJobSearch(jobSearch);
      let offset = 0;
      const searchedJobs: Job[] = [];

      try {
        while (offset < 100) {
          const data: any = await apiClient.searchJobsByQuery({
            query: `${jobSearch.jobTitle} ${jobSearch.jobLocation}`,
            limit: 10,
            offset,
          });
          if (data.errors && data.errors.length > 0) {
            console.error(data.errors);
            throw new Error("Error running job search");
          }
          if (data.jobs?.length > 0) {
            searchedJobs.push(...data.jobs);
            const newLocalJobSearch: LocalJobSearch = {
              ...localJobSearch,
              jobs: searchedJobs,
            };
            offset += data.jobs.length;
            setJobSearch(newLocalJobSearch);
            localStorage.setItem(
              "jobSearch",
              JSON.stringify(newLocalJobSearch)
            );
          } else {
            break;
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsJobSearchRunning(false);
      }
    },
    [createJobSearch]
  );

  // Restore user data from local storage on component mount
  useEffect(() => {
    const localJobSearchStr = localStorage.getItem("jobSearch");
    const localJobSearch = localJobSearchStr
      ? JSON.parse(localJobSearchStr)
      : null;
    const localSavedJobsStr = localStorage.getItem("savedJobs");
    const localSavedJobs = localSavedJobsStr
      ? JSON.parse(localSavedJobsStr)
      : null;

    if (!session?.user) {
      if (localJobSearch) {
        setJobSearch(localJobSearch);
      }
      if (localSavedJobs) {
        setSavedJobs(localSavedJobs);
      }
      return;
    }

    if (session.jobSearch) {
      if (
        !localJobSearch ||
        localJobSearch.jobTitle !== session.jobSearch.jobTitle ||
        localJobSearch.jobLocation !== session.jobSearch.jobLocation
      ) {
        setJobSearch(session.jobSearch);
        localStorage.setItem("jobSearch", JSON.stringify(session.jobSearch));
      }
    } else if (localJobSearch) {
      setJobSearch(localJobSearch);
      apiClient.createJobSearch({
        jobTitle: localJobSearch.jobTitle,
        jobLocation: localJobSearch.jobLocation,
      });
    }

    console.log("session.savedJobs", session.savedJobs);
    const mergedSavedJobs = [
      ...(localSavedJobs || []),
      ...(session.savedJobs || []),
    ].filter(
      (job: Job, index: number, self: Job[]) =>
        index === self.findIndex((t) => t.googleJobId === job.googleJobId)
    );

    setSavedJobs(mergedSavedJobs);
    localStorage.setItem("savedJobs", JSON.stringify(mergedSavedJobs));
    const jobsToSave = mergedSavedJobs.filter(
      (job: Job) =>
        !session.savedJobs?.find(
          (savedJob: Job) => savedJob.googleJobId === job.googleJobId
        )
    );
    jobsToSave.forEach((job: Job) => {
      apiClient.saveJob({
        googleJobId: job.googleJobId,
        jobTitle: job.title,
        jobLocation: job.location,
        jobDescription: job.jobDescription || "",
        jobData: job,
      });
    });
  }, [session?.user, session?.jobSearch, session?.savedJobs]);

  return (
    <JobContext.Provider
      value={{
        jobSearch,
        savedJobs,
        runJobSearch,
        isJobSearchRunning,
        createJobSearch,
        saveJob,
        unsaveJob,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJob = (): JobContextValue => {
  const context = React.useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJob must be used within a JobProvider");
  }
  return context;
};
