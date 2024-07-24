import Image from "next/image";
import { cn } from "@/lib/utils";
import { ActionLabel } from "../ui/action-label";

const getJobBoardIcon = (jobBoard: string) => {
  jobBoard = jobBoard.toLowerCase();
  switch (jobBoard) {
    case "linkedin":
      return "/job-boards/linkedin.png";
    case "indeed":
      return "/job-boards/indeed.png";
    case "glassdoor":
      return "/job-boards/glassdoor.png";
    case "monster":
      return "/job-boards/monster.png";
    case "careerbuilder":
      return "/job-boards/careerbuilder.png";
    case "simplyhired":
      return "/job-boards/simplyhired.png";
    case "ziprecruiter":
      return "/job-boards/ziprecruiter.png";
    case "dice":
      return "/job-boards/dice.png";
    case "jooble":
      return "/job-boards/jooble.png";
    case "levelsfyi":
    case "levels.fyi":
      return "/job-boards/levelsfyi.png";
    case "ladders":
      return "/job-boards/ladders.png";
    case "salary":
    case "salary.com":
      return "/job-boards/salary.com.png";
    case "wellfound":
      return "/job-boards/wellfound.png";
    case "built in san francisco":
      return "/job-boards/builtinsf.png";
  }
};

export const JobBoardLabel = ({
  isCompanyWebsite,
  jobBoard,
  companyLogoUrl,
  link,
  companyName,
  highlighted,
}: {
  isCompanyWebsite?: boolean;
  jobBoard?: string;
  link: string;
  companyName: string;
  companyLogoUrl?: string;
  highlighted?: boolean;
}) => {
  if (!isCompanyWebsite && !jobBoard) {
    return null;
  }

  const applyIconSrc = jobBoard ? getJobBoardIcon(jobBoard) : companyLogoUrl;
  return (
    <a href={link} target="_blank" rel="noreferrer">
      <ActionLabel
        className="hover:bg-gray-300 transition-colors"
        highlighted={highlighted}
      >
        <>
          {applyIconSrc && (
            <Image src={applyIconSrc} alt="apply" width={18} height={18} />
          )}
          <p className="truncate">
            {isCompanyWebsite ? companyName : jobBoard}
          </p>
        </>
      </ActionLabel>
    </a>
  );
};
