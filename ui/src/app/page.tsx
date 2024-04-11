'use client'

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createDreamJob } from "@/client";
import { useState } from "react";
import { Job } from "../../types/job";
import { JobCard } from "@/components/job-card";

export default function Home() {
  const [dreamJobDesp, setDreamJobDesp] = useState<string>("");
  const [processingInfo, setProcessingInfo] = useState<string[]>([]);
  const [crawledJobs, setCrawledJobs] = useState<Job[]>([]);

  const onSubmit = () => {
    if (!dreamJobDesp) {
      return;
    }
    // setProcessingInfo([]);
    // setCrawledJobs([]);

    const onMessage = (message: string) => {
      console.log("onMessage", message);
      if (message.includes("stage:")) {
        const stage = message.split(":")[1].trim();
        setProcessingInfo((prev) => [...prev, stage]);
      } else if (message.includes("job match result:")) {
        const jobStr = message.substring("job match result:".length).trim();
        const job: Job = JSON.parse(jobStr);
        setCrawledJobs((prev) => [...prev, job]);
      }
    };

    createDreamJob({
      user_id: 1,
      description: dreamJobDesp,
    }, onMessage);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 space-y-4">
      <div className="flex flex-col w-full max-w-96">
        <Textarea
          onChange={(e) => setDreamJobDesp(e.target.value)}
          placeholder="Say something about you and your dream job"
        />
        <Button onClick={onSubmit} className="mt-4">Submit</Button>
      </div>
      <div>
        {/* Task logging */}
        {processingInfo.map((info, index) => (
          <p key={index} className="text-green-700">{info}</p>
        ))}
      </div>
      <div>
        {/* Crawled jobs */}
        {crawledJobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </div>
    </main>
  );
}
