"use client";

import { Job } from "../../types/job";
import Image from "next/image";
import cn from "classnames";
import { JobBoardLabel } from "./job-board-label";
import { ActionLabel } from "../ui/action-label";
import { JobLink } from "../job-link";
import { Button } from "../ui/button";
import { useMemo, useRef, useState } from "react";
import StarIcon from "@heroicons/react/16/solid/StarIcon";

export interface JobCardProps {
  job: Job;
  isFirst?: boolean;
  isSaved?: boolean;
  isNew?: boolean;
  highlightedSkills?: string[];
  highlightedJobBoards?: string[];
  onClickSkill: (skill: string) => void;
  onStarIconClick?: (job: Job) => void;
}

const JOB_BOARDS = [
  "ladders",
  "jooble",
  "dice",
  "simplyhired",
  "careerbuilder",
  "monster",
  "ziprecruiter",
  "salary.com",
  "salary",
  "built in san francisco",
  "wellfound",
  "levels.fyi",
  "levelsfyi",
  "glassdoor",
  "indeed",
  "linkedin",
];

const isPlatformCompanyWebsite = (platform: string, companyName: string) =>
  platform.toLowerCase().includes("directly") ||
  platform.toLowerCase().includes(companyName.toLowerCase());

export const JobItem = ({
  job,
  isFirst,
  isNew,
  isSaved,
  highlightedJobBoards,
  highlightedSkills,
  onClickSkill,
  onStarIconClick,
}: JobCardProps) => {
  // const ref = useRef<HTMLDivElement>(null);
  // const isHovering = useMemo(() => {
  //   if (!ref.current) return false;
  //   return ref.current.matches(":hover");
  // }

  const sortedApplyEntries = job.applyEntries.sort((a, b) => {
    if (isPlatformCompanyWebsite(a.platform, job.company.name)) {
      return -1;
    } else if (isPlatformCompanyWebsite(b.platform, job.company.name)) {
      return 1;
    } else {
      return (
        JOB_BOARDS.indexOf(b.platform.toLowerCase()) -
        JOB_BOARDS.indexOf(a.platform.toLowerCase())
      );
    }
  });

  return (
    <div
      className={cn(
        "flex flex-row px-4 py-2 border-y border-gray-200 min-w-full w-fit group",
        {
          "border-t-0": !isFirst,
        }
      )}
    >
      {/* Company info */}
      <div className="flex flex-row items-center w-96 shrink-0 space-x-4">
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
          {job.company.ggCompanyLogoUrl ? (
            <Image
              className="rounded-full w-full h-full"
              src={
                job.company.ggCompanyLogoUrl ||
                "/images/company-logo-placeholder.png"
              }
              alt={job.company.name}
              width={32}
              height={32}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-500">
              <p className="text-sm">{job.company.name[0]}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h2 className="font-semibold text-sm">{job.company.name}</h2>
          <p className="text-xs text-gray-600">
            {job.company.shortDescription ?? "Company information not found"}
          </p>
          <div className="flex flex-wrap mt-1">
            {(job.company.ggCompanyUrl || job.company.cbCompanyUrl) && (
              <JobLink
                type="home"
                url={job.company.ggCompanyUrl || job.company.cbCompanyUrl || ""}
              />
            )}
            {job.company.linkedinUrl && (
              <JobLink type="linkedin" url={job.company.linkedinUrl} />
            )}
            {job.company.facebookUrl && (
              <JobLink type="facebook" url={job.company.facebookUrl} />
            )}
            {job.company.twitterUrl && (
              <JobLink type="twitter" url={job.company.twitterUrl} />
            )}
          </div>
        </div>
      </div>

      {/* Job title/location */}
      <div className="flex flex-row items-center w-96 shrink-0 space-x-4">
        <div className="flex flex-col">
          <div
            className="font-semibold text-sm flex items-center cursor-pointer group w-96 pr-2"
            onClick={() => onStarIconClick?.(job)}
          >
            <span className="mr-2">{job.title}</span>
            {isSaved ? (
              <StarIcon className="h-4 w-4 fill-yellow-400 shrink-0" />
            ) : (
              <StarIcon className="hidden group-hover:inline-block h-4 w-4 fill-none stroke-black stroke-1 shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-600">{job.location}</p>
          <div className="flex flex-wrap h-fit shrink-0">
            {job.labels.type && (
              <ActionLabel size="xs">{job.labels.type}</ActionLabel>
            )}
            {job.labels.qualification && (
              <ActionLabel size="xs">{job.labels.qualification}</ActionLabel>
            )}
            {job.labels.salary && (
              <ActionLabel size="xs">
                {job.labels.salary.replace("k", "000").replace("a year", "")}
              </ActionLabel>
            )}
            {job.labels.otherLabels?.map((label, index) => (
              <ActionLabel size="xs" key={index}>
                {label}
              </ActionLabel>
            ))}
          </div>
          <p className="text-xs text-gray-600">{job.labels.posted}</p>
        </div>
      </div>

      <div className="flex flex-wrap grow min-w-72 h-fit">
        {job.skills?.map((skill, index) => (
          <ActionLabel
            highlighted={highlightedSkills?.includes(skill)}
            key={index}
            onClick={() => onClickSkill(skill)}
          >
            {skill}
          </ActionLabel>
        ))}
      </div>

      <div className="flex flex-wrap w-96 h-fit shrink-0">
        {sortedApplyEntries.map((entry) => (
          <JobBoardLabel
            key={entry.platform}
            highlighted={highlightedJobBoards?.includes(entry.platform)}
            companyName={job.company.name}
            jobBoard={
              isPlatformCompanyWebsite(entry.platform, job.company.name)
                ? undefined
                : entry.platform
            }
            link={entry.url}
            companyLogoUrl={
              job.company.ggCompanyLogoUrl ?? job.company.cbCompanyLogoUrl
            }
            isCompanyWebsite={isPlatformCompanyWebsite(
              entry.platform,
              job.company.name
            )}
          />
        ))}
      </div>
    </div>
  );
};
