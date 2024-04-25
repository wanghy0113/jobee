import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Job } from "../../../types/job";
import { useEffect, useMemo, useState } from "react";
import classNames from "classnames";

export const JobCard = ({ job }: { job: Job }) => {
  const [title, setTitle] = useState<string>("");
  const [company, setCompany] = useState<string>("");

  useEffect(() => {
    setTitle(job.details.job_title?.value || "");
    setCompany(job.details.company_name?.value || "");
  }, [job]);

  const sortedSkills = useMemo(() => {
    return job.details.skills?.sort((a, b) => {
      if (a.result === "match") {
        return -1;
      } else if (b.result === "match") {
        return 1;
      } else if (a.result === "likely-match") {
        return -1;
      } else if (b.result === "likely-match") {
        return 1;
      } else {
        return 0;
      }
    });
  }, [job]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{company}</CardDescription>
      </CardHeader>
      <CardContent>
        <CardDescription>Required Skills:</CardDescription>
        <ul>
          {sortedSkills?.map((skill, index) => (
            <li key={index}>
              <p
                className={classNames({
                  "text-green-700": skill.result === "match",
                  "text-yellow-700": skill.result === "likely-match",
                  "text-red-700": skill.result === "mismatch",
                })}
              >
                {skill.value}
              </p>
              {
                skill.matchingPoints && (
                  <p className="italic">
                    {`> ${skill.result === "match" ? "Maching" : "Likely matching"} your skills: ${skill.matchingPoints.join(", ")}`}
                  </p>
                )
              }
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
