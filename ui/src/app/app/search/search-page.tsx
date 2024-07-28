"use client";

import { useEffect, useMemo, useState } from "react";
import { JobSearchFilterComponent } from "@/components/job-search-filter";

import React from "react";
import { JobItem } from "@/components/job-item";
import { useJob } from "@/app/context/job-context";
import { ThreeDots } from "react-loader-spinner";
import { ActionLabel } from "@/components/ui/action-label";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

export default function SearchPage() {
  console.log("SearchPage");

  const {
    jobSearch,
    runJobSearch,
    saveJob,
    savedJobs,
    unsaveJob,
    createJobSearch,
    isJobSearchRunning,
  } = useJob();

  const [jobLocations, setJobLocations] = useState<{
    [location: string]: number;
  }>({});
  const [jobBoards, setJobBoards] = useState<{ [location: string]: number }>(
    {}
  );
  const [skills, setSkills] = useState<{ [skill: string]: number }>({});
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [filteredJobBoards, setFilteredJobBoards] = useState<string[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);

  const [jobTitleInputValue, setJobTitleInputValue] = useState(
    jobSearch?.jobTitle
  );
  const [jobLocationInputValue, setJobLocationInputValue] = useState(
    jobSearch?.jobLocation
  );

  useEffect(() => {
    if (!jobSearch) {
      return;
    }

    if (!jobSearch?.lastRunAt && !isJobSearchRunning) {
      // runJobSearch(jobSearch);
    }
  }, [jobSearch, isJobSearchRunning, runJobSearch]);

  useEffect(() => {
    if (!jobSearch?.jobs) {
      setJobLocations({});
      setJobBoards({});
      setSkills({});
      return;
    }

    setJobLocationInputValue(jobSearch.jobLocation);
    setJobTitleInputValue(jobSearch.jobTitle);

    const jobLocations = jobSearch.jobs.reduce((acc, job) => {
      acc[job.location] = (acc[job.location] || 0) + 1;
      return acc;
    }, {} as { [location: string]: number });
    setJobLocations(jobLocations);
    setFilteredLocations(Object.keys(jobLocations));

    const jobBoards = jobSearch.jobs.reduce((acc, job) => {
      job.applyEntries.forEach((entry) => {
        acc[entry.platform] = (acc[entry.platform] || 0) + 1;
      });
      return acc;
    }, {} as { [location: string]: number });
    setJobBoards(jobBoards);
    setFilteredJobBoards(Object.keys(jobBoards));

    const skills = jobSearch.jobs.reduce((acc, job) => {
      job.skills?.forEach((skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {} as { [skill: string]: number });
    setSkills(skills);
    setFilteredSkills(Object.keys(skills));
  }, [jobSearch]);

  const filteredJobs = useMemo(() => {
    if (!jobSearch?.jobs) {
      return [];
    }

    return jobSearch.jobs.filter(
      (job) =>
        filteredLocations.includes(job.location) &&
        job.applyEntries.some((entry) =>
          filteredJobBoards.includes(entry.platform)
        ) &&
        job.skills?.some((skill) => filteredSkills.includes(skill))
    );
  }, [jobSearch?.jobs, filteredLocations, filteredJobBoards, filteredSkills]);

  console.log("filteredJobs", filteredJobs, jobSearch?.jobs);

  return (
    <main className="flex min-h-screen flex-col py-2">
      <div className="flex px-4 items-center border-b w-full justify-center pb-2">
        <div className="flex ml-3 items-center">
          <ActionLabel className="bg-white border border-gray-900 text-gray-900 max-w-none">
            {/* <PencilIcon className="h-4 w-4 mr-1" /> */}
            <span className="font-bold">Title:</span>
            <input
              className="outline-none w-32"
              value={jobTitleInputValue}
              onChange={(e) => setJobTitleInputValue(e.target.value)}
            />
          </ActionLabel>
          <ActionLabel className="bg-white border border-gray-900 text-gray-900 max-w-none">
            {/* <PencilIcon className="h-4 w-4 mr-1" /> */}
            <span className="font-bold">Location:</span>
            <input
              className="outline-none w-32"
              value={jobLocationInputValue}
              onChange={(e) => setJobLocationInputValue(e.target.value)}
            />
          </ActionLabel>
          <ActionLabel
            className="bg-gray-800 border text-white hover:bg-black"
            onClick={() =>
              jobLocationInputValue &&
              jobTitleInputValue &&
              runJobSearch({
                jobLocation: jobLocationInputValue,
                jobTitle: jobTitleInputValue,
              })
            }
            disabled={
              isJobSearchRunning ||
              !jobLocationInputValue ||
              !jobTitleInputValue
            }
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
            {isJobSearchRunning ? "Searching" : "Run search"}
          </ActionLabel>
          {isJobSearchRunning && (
            <ThreeDots color="gray" width={32} height={16} />
          )}
        </div>

        <span className="text-sm ml-4">
          Found{" "}
          <span className="font-semibold text-green-700">
            {jobSearch?.jobs?.length || 0}
          </span>{" "}
          jobs
        </span>
        <span className="text-sm ml-4">
          Last run at{" "}
          <span className="font-semibold text-green-700">
            {jobSearch?.lastRunAt
              ? timeAgo.format(new Date(jobSearch.lastRunAt))
              : "never"}
          </span>
        </span>
      </div>
      <JobSearchFilterComponent
        jobBoards={jobBoards}
        locations={jobLocations}
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
