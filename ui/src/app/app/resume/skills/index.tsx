"use client";

import { useSession } from "@/app/context/session-context";
import { Button } from "@/components/ui/button";
import { XMarkIcon } from "@heroicons/react/16/solid";

function Item({ text }: { text: string }) {
  return (
    <div className="flex items-center bg-gray-100 pl-2 h-5 rounded-md overflow-hidden">
      <div className="text-sm text-gray-900">{text}</div>
      <div className="flex items-center justify-center px-1 ml-1 cursor-pointer hover:bg-gray-300 h-full">
        <XMarkIcon className="h-4 w-4 fill-gray-400" />
      </div>
    </div>
  );
}

const textSkills = [
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

  return (
    <div className="flex flex-col">
      <div className="max-w-lg">
        <h2 className="text-lg font-bold">Skills</h2>
        {!session?.resume?.skills.length && (
          <div className="text-gray-500">No skills added</div>
        )}
        {session?.resume?.skills.length && (
          <div className="flex flex-wrap gap-2 px-2 py-4 border rounded-lg">
            {session?.resume?.skills?.map((skill, index) => (
              <Item key={`skill-${index}`} text={skill.name} />
            ))}
          </div>
        )}
        <Button size={"sm"}>Add Skill</Button>
      </div>

      <div className="max-w-lg mt-6">
        <h2 className="text-lg font-bold">Certificates</h2>
        {!session?.resume?.certifications?.length && (
          <div className="text-gray-500">No certificates added</div>
        )}
        {session?.resume?.certifications?.length && (
          <div className="flex flex-wrap gap-2 px-2 py-4 border rounded-lg">
            {session?.resume?.certifications?.map((cer, index) => (
              <Item key={`cer-${index}`} text={cer.name} />
            ))}
          </div>
        )}
        <Button size={"sm"}>Add Certificate</Button>
      </div>

      <div className="max-w-lg mt-6">
        <h2 className="text-lg font-bold">Achievement</h2>
        {!session?.resume?.achievements?.length && (
          <div className="text-gray-500">No achievements added</div>
        )}
        {session?.resume?.achievements?.length && (
          <div className="flex flex-wrap gap-2 px-2 py-4 border rounded-lg">
            {session?.resume?.achievements?.map((ach, index) => (
              <Item key={`ach-${index}`} text={ach.name} />
            ))}
          </div>
        )}
        <Button size={"sm"}>Add Achievement</Button>
      </div>
    </div>
  );
}
