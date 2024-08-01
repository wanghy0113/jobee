"use client";

import { useSession } from "@/app/context/session-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { arraysEqual } from "@/lib/utils";
import { PlusCircleIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";
import ContentEditable from "react-contenteditable";

export function SkillItem({
  text,
  shouldFocus,
  onBlur,
  onChange,
  onDelete,
}: {
  text: string;
  shouldFocus?: boolean;
  onBlur?: () => void;
  onChange: (text: string) => void;
  onDelete: () => void;
}) {
  const editRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (shouldFocus && editRef.current) {
      editRef.current.focus();
    }
  }, [shouldFocus]);

  return (
    <div className="flex items-center bg-blue-100 pl-2 h-6 rounded-md overflow-hidden">
      <ContentEditable
        innerRef={editRef}
        className="text-sm min-w-2 text-gray-900 bg-blue-100 focus:outline-none"
        contentEditable
        onBlur={onBlur}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        html={text}
      />
      <button
        className="flex items-center justify-center px-1 ml-1 cursor-pointer hover:bg-blue-300 h-full"
        onClick={onDelete}
      >
        <XMarkIcon className="h-4 w-4 fill-gray-400" />
      </button>
    </div>
  );
}

const testSkills = [
  "JavaScript",
  "React",
  "TypeScript",
  "Node.js",
  "GraphQL",
  "REST",
  "Tailwind CSS",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
];

export function SkillsAndOther() {
  const { session } = useSession();

  const [skills, setSkills] = useState(session?.resume?.skills || []);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [certifications, setCertifications] = useState(
    session?.resume?.certifications || []
  );
  const [isAddingCertification, setIsAddingCertification] = useState(false);
  const [achievements, setAchievements] = useState(
    session?.resume?.achievements || []
  );
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);

  const areSkillsChanged = !arraysEqual(session?.resume?.skills ?? [], skills);
  const areCertificationsChanged = !arraysEqual(
    session?.resume?.certifications ?? [],
    certifications
  );
  const areAchievementsChanged = !arraysEqual(
    session?.resume?.achievements ?? [],
    achievements
  );

  console.log("Skills", skills);

  return (
    <div className="flex flex-col py-2 space-y-3">
      <div className="max-w-lg border rounded-lg p-4 flex flex-col space-y-3">
        <div className="flex items-center">
          <Label>Skills</Label>
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => {
              console.log("Adding skill");
              setSkills([...skills, ""]);
              setIsAddingSkill(true);
            }}
          >
            <PlusCircleIcon className="h-4 w-4" />
          </Button>
        </div>
        {!skills.length && <div className="text-gray-500">No skills added</div>}
        {skills.length > 0 && (
          <div className="flex flex-wrap   gap-2">
            {skills.map((skill, index) => (
              <SkillItem
                key={`skill-${index}`}
                text={skill}
                shouldFocus={isAddingSkill && index === skills.length - 1}
                onDelete={() => {
                  const newSkills = [...skills];
                  newSkills.splice(index, 1);
                  console.log("New skills", newSkills);
                  setSkills(newSkills);
                }}
                onBlur={() => {
                  if (isAddingSkill) {
                    setIsAddingSkill(false);
                  }
                }}
                onChange={(text) => {
                  const newSkills = [...skills];
                  newSkills[index] = text;
                  setSkills(newSkills);
                }}
              />
            ))}
          </div>
        )}
        <div className="flex space-x-2">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              setSkills(session?.resume?.skills || []);
            }}
          >
            Reset
          </Button>
          <Button variant={"outline"} size={"sm"} disabled={!areSkillsChanged}>
            Save
          </Button>
        </div>
      </div>

      <div className="max-w-lg border rounded-lg p-4 flex flex-col space-y-3">
        <div className="flex items-center">
          <Label>Certifications</Label>
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => {
              setCertifications([...certifications, ""]);
              setIsAddingCertification(true);
            }}
          >
            <PlusCircleIcon className="h-4 w-4" />
          </Button>
        </div>
        {!certifications.length && (
          <div className="text-gray-500">No certifications added</div>
        )}
        {certifications.length > 0 && (
          <div className="flex flex-wrap   gap-2">
            {certifications.map((cer, index) => (
              <SkillItem
                key={`cer-${index}`}
                text={cer}
                shouldFocus={
                  isAddingCertification && index === certifications.length - 1
                }
                onDelete={() => {
                  const newCerts = [...certifications];
                  newCerts.splice(index, 1);
                  setCertifications(newCerts);
                }}
                onBlur={() => {
                  if (isAddingCertification) {
                    setIsAddingCertification(false);
                  }
                }}
                onChange={(text) => {
                  const newCerts = [...certifications];
                  newCerts[index] = text;
                  setCertifications(newCerts);
                }}
              />
            ))}
          </div>
        )}
        <div className="flex space-x-2">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              setCertifications(session?.resume?.certifications || []);
            }}
          >
            Reset
          </Button>
          <Button
            variant={"outline"}
            size={"sm"}
            disabled={!areCertificationsChanged}
          >
            Save
          </Button>
        </div>
      </div>

      <div className="max-w-lg border rounded-lg p-4 flex flex-col space-y-3">
        <div className="flex items-center">
          <Label>Achievements</Label>
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => {
              setAchievements([...achievements, ""]);
              setIsAddingAchievement(true);
            }}
          >
            <PlusCircleIcon className="h-4 w-4" />
          </Button>
        </div>
        {!achievements.length && (
          <div className="text-gray-500">No achievements added</div>
        )}
        {achievements.length > 0 && (
          <div className="flex flex-wrap   gap-2">
            {achievements.map((ach, index) => (
              <SkillItem
                key={`ach-${index}`}
                text={ach}
                shouldFocus={
                  isAddingAchievement && index === achievements.length - 1
                }
                onDelete={() => {
                  const newAchs = [...achievements];
                  newAchs.splice(index, 1);
                  setAchievements(newAchs);
                }}
                onBlur={() => {
                  if (isAddingAchievement) {
                    setIsAddingAchievement(false);
                  }
                }}
                onChange={(text) => {
                  const newAchs = [...achievements];
                  newAchs[index] = text;
                  setAchievements(newAchs);
                }}
              />
            ))}
          </div>
        )}
        <div className="flex space-x-2">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              setAchievements(session?.resume?.achievements || []);
            }}
          >
            Reset
          </Button>
          <Button
            variant={"outline"}
            size={"sm"}
            disabled={!areAchievementsChanged}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
