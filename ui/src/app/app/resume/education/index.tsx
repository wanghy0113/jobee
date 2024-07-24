"use client";

import { useSession } from "@/app/context/session-context";
import { Education } from "@/client";

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
}: Education) {
  return (
    <div className="flex items-center bg-gray-100 pl-2 h-5 rounded-md overflow-hidden">
      <Label>{school}</Label>
      <Input placeholder="" value={school} />
    </div>
  );
}

export function EducationForm({ educations }: { educations: Education[] }) {
  const { session } = useSession();

  return (
    <div>
      {educations.map((edu, index) => {
        return <EducationItem key={`edu-${index}`} {...edu} />;
      })}
    </div>
  );
}
