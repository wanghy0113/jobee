"use client";

import { useSession } from "@/app/context/session-context";
import { Education as IEducation } from "@/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function EducationItem({
  school,
  rewards,
  degree,
  gpa,
  startDate,
  endDate,
}: IEducation) {
  return (
    <div className="flex items-center bg-gray-100 pl-2 h-5 rounded-md overflow-hidden">
      <Label>{school}</Label>
      <Input placeholder="" value={school} />
    </div>
  );
}

export function Education() {
  const { session } = useSession();

  return (
    <div>
      {session?.resume?.educations?.map((edu, index) => {
        return <EducationItem key={`edu-${index}`} {...edu} />;
      })}
    </div>
  );
}
