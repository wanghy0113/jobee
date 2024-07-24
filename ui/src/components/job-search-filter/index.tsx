import { useMemo, useState } from "react";
import { CheckableLabel } from "../ui/checkable-label";
import { ActionLabel } from "../ui/action-label";

export interface JobSearchFilterComponentProps {
  locations?: {
    [location: string]: number;
  };
  jobBoards: {
    [jobBoard: string]: number;
  };
  skills: {
    [skill: string]: number;
  };
  selectedLocations: string[];
  selectedJobBoards: string[];
  selectedSkills: string[];
  onLocationClick: (location: string) => void;
  onJobBoardClick: (jobBoard: string) => void;
  onAllJobBoardsSelect: (selected: boolean) => void;
  onSkillClick: (skill: string) => void;
  onAllSkillsSelect: (selected: boolean) => void;
}

export const JobSearchFilterComponent = ({
  locations,
  jobBoards,
  skills,
  selectedJobBoards,
  selectedLocations,
  selectedSkills,
  onLocationClick,
  onJobBoardClick,
  onAllJobBoardsSelect,
  onAllSkillsSelect,
  onSkillClick,
}: JobSearchFilterComponentProps) => {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllJobBoards, setShowAllJobBoards] = useState(false);

  const sortedSkills = useMemo(
    () => Object.keys(skills).sort((a, b) => (skills[a] > skills[b] ? -1 : 1)),
    [skills]
  );

  const sortedJobBoards = useMemo(
    () =>
      Object.keys(jobBoards).sort((a, b) =>
        jobBoards[a] > jobBoards[b] ? -1 : 1
      ),
    [jobBoards]
  );

  const getLocationsLabels = () => {
    if (!locations) {
      return null;
    }

    return Object.keys(locations).map((loc, index) => (
      <CheckableLabel
        key={index}
        text={loc}
        num={locations[loc]}
        isChecked={selectedLocations.includes(loc)}
        onClick={() => onLocationClick(loc)}
      />
    ));
  };

  return (
    <div className="w-full px-4 py-2 flex flex-col space-y-2">
      {/* <div className="w-full flex flex-wrap items-center space-x-2">
        <span className="text-sm font-semibold">Locations:</span>
        {getLocationsLabels()}
      </div> */}
      <div className="w-full flex flex-wrap items-center space-x-1.5">
        <span className="text-sm font-semibold">Job boards:</span>
        {(showAllJobBoards ? sortedJobBoards : sortedJobBoards.slice(0, 6)).map(
          (jb, index) => (
            <CheckableLabel
              key={index}
              text={jb}
              num={jobBoards[jb]}
              isChecked={selectedJobBoards.includes(jb)}
              onClick={() => onJobBoardClick(jb)}
            />
          )
        )}
        {!showAllJobBoards && (
          <ActionLabel onClick={() => setShowAllJobBoards(true)}>
            More...
          </ActionLabel>
        )}
        {showAllJobBoards && (
          <ActionLabel onClick={() => setShowAllJobBoards(false)}>
            Less...
          </ActionLabel>
        )}
        <ActionLabel onClick={() => onAllJobBoardsSelect(true)}>
          Select all
        </ActionLabel>
        <ActionLabel onClick={() => onAllJobBoardsSelect(false)}>
          Deselect all
        </ActionLabel>
      </div>
      <div className="w-full flex flex-wrap items-center space-x-1.5">
        <span className="text-sm font-semibold">Skills:</span>
        {(showAllSkills ? sortedSkills : sortedSkills.slice(0, 6)).map(
          (sk, index) => (
            <CheckableLabel
              key={index}
              text={sk}
              num={skills[sk]}
              isChecked={selectedSkills.includes(sk)}
              onClick={() => onSkillClick(sk)}
            />
          )
        )}
        {!showAllSkills && (
          <ActionLabel onClick={() => setShowAllSkills(true)}>
            More...
          </ActionLabel>
        )}
        {showAllSkills && (
          <ActionLabel onClick={() => setShowAllSkills(false)}>
            Less...
          </ActionLabel>
        )}
        <ActionLabel onClick={() => onAllSkillsSelect(true)}>
          Select all
        </ActionLabel>
        <ActionLabel onClick={() => onAllSkillsSelect(false)}>
          Deselect all
        </ActionLabel>
      </div>
    </div>
  );
};
