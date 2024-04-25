'use client'

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createDreamJob, getJobs } from "@/client";
import { useEffect, useState } from "react";
import { Job } from "../../../types/job";
import { JobCard } from "@/components/job-card";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    getJobs({ user_id: 1, user_profile_id: 2 }).then((job) => {
      setJobs(job);
    });
  }, []);

  console.log(jobs);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 space-y-4">
      <div>
        {/* Crawled jobs */}
        {jobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </div>
    </main>
  );
}
