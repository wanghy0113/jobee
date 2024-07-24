import { Job } from "@/types/job";
import { UserProfile } from "@/types/user-profile";

export const getMatchSkills = (job: Job): Set<string> => {
  const matchSkills = job.details.skills?.reduce((acc, skill) => {
    if (skill.result === "match" || skill.result === "likely-match") {
      skill.matchingPoints?.forEach((point) => acc.add(point));
    }
    return acc;
  }, new Set<string>());

  return matchSkills || new Set<string>();
}
