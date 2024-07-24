"use client";

import { useEffect, useMemo, useState } from "react";
import { JobSearchFilterComponent } from "@/components/job-search-filter";

import React from "react";
import { JobItem } from "@/components/job-item";
import { useJob } from "@/app/context/job-context";

export default function SearchPage() {
  const { saveJob, savedJobs, unsaveJob, isJobSearchRunning } = useJob();

  const [jobBoards, setJobBoards] = useState<{ [location: string]: number }>(
    {}
  );
  const [skills, setSkills] = useState<{ [skill: string]: number }>({});
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [filteredJobBoards, setFilteredJobBoards] = useState<string[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!savedJobs) {
      setJobBoards({});
      setSkills({});
      return;
    }

    const jobBoards = savedJobs.reduce((acc, job) => {
      job.applyEntries.forEach((entry) => {
        acc[entry.platform] = (acc[entry.platform] || 0) + 1;
      });
      return acc;
    }, {} as { [location: string]: number });
    setJobBoards(jobBoards);
    setFilteredJobBoards(Object.keys(jobBoards));

    const skills = savedJobs.reduce((acc, job) => {
      job.skills?.forEach((skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {} as { [skill: string]: number });
    setSkills(skills);
    setFilteredSkills(Object.keys(skills));
  }, [savedJobs]);

  const filteredJobs = useMemo(() => {
    if (!savedJobs) {
      return [];
    }

    return savedJobs.filter(
      (job) =>
        job.applyEntries.some((entry) =>
          filteredJobBoards.includes(entry.platform)
        ) && job.skills?.some((skill) => filteredSkills.includes(skill))
    );
  }, [savedJobs, filteredJobBoards, filteredSkills]);

  return (
    <main className="flex min-h-screen flex-col py-2">
      <JobSearchFilterComponent
        jobBoards={jobBoards}
        skills={skills}
        selectedJobBoards={filteredJobBoards}
        selectedLocations={filteredLocations}
        selectedSkills={filteredSkills}
        onJobBoardClick={(jobBoard) => {
          setFilteredJobBoards((prev) =>
            prev.includes(jobBoard)
              ? prev.filter((jb) => jb !== jobBoard)
              : [...prev, jobBoard]
          );
        }}
        onAllJobBoardsSelect={(selected) => {
          setFilteredJobBoards(selected ? Object.keys(jobBoards) : []);
        }}
        onAllSkillsSelect={(selected) => {
          setFilteredSkills(selected ? Object.keys(skills) : []);
        }}
        onLocationClick={(location) => {
          setFilteredLocations((prev) =>
            prev.includes(location)
              ? prev.filter((loc) => loc !== location)
              : [...prev, location]
          );
        }}
        onSkillClick={(skill) => {
          setFilteredSkills((prev) =>
            prev.includes(skill)
              ? prev.filter((sk) => sk !== skill)
              : [...prev, skill]
          );
        }}
      />
      <div>
        {filteredJobs.map((job, index) => (
          <JobItem
            highlightedJobBoards={filteredJobBoards}
            highlightedSkills={filteredSkills}
            key={index}
            isSaved={
              !!savedJobs.find(
                (savedJob) => savedJob.googleJobId === job.googleJobId
              )
            }
            onStarIconClick={() => {
              if (
                savedJobs.find(
                  (savedJob) => savedJob.googleJobId === job.googleJobId
                )
              ) {
                unsaveJob(job);
              } else {
                saveJob(job);
              }
            }}
            onClickSkill={(skill) => {
              setFilteredSkills((prev) =>
                prev.includes(skill)
                  ? prev.filter((sk) => sk !== skill)
                  : [...prev, skill]
              );
            }}
            job={job}
          />
        ))}
      </div>
    </main>
  );
}
