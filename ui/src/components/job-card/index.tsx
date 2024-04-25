import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Job } from "../../../types/job";

export const JobCard = ({ job }: { job: Job }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{job.job_crawl_result.company}</CardTitle>
        <CardDescription>{job.job_crawl_result.title}</CardDescription>
      </CardHeader>
      <CardContent>
        {
          job.matching_points.map((point, index) => (
            <p key={`m-${index}`} className="text-green-700">{point}</p>
          ))
        }
        {
          job.warning_points.map((point, index) => (
            <p key={`w-${index}`} className="text-red-700">{point}</p>
          ))
        }
      </CardContent>
    </Card>
  );
};
