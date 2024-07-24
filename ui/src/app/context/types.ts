import { JobSearch } from "@/client";
import { Job } from "@/types/job";

export type LocalJobSearch = JobSearch & {
  lastRunAt?: Date;
  jobs?: Job[];
};
