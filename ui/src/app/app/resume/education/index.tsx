"use client";

import { useSession } from "@/app/context/session-context";
import { Education as IEducation } from "@/client";

import { Button } from "@/components/ui/button";
import { Input, inputClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

function EducationItem({
  education,
  onSave,
  onDelete,
}: {
  education: Partial<IEducation>;
  onSave: (education: IEducation) => void;
  onDelete: () => void;
}) {
  const [school, setSchool] = useState(education.school);
  const [major, setMajor] = useState(education.major);
  const [degree, setDegree] = useState(education.degree);
  const [startDate, setStartDate] = useState(education.startDate);
  const [endDate, setEndDate] = useState(education.endDate);
  const [gpa, setGpa] = useState(education.gpa);

  const isChanged =
    school !== education.school ||
    major !== education.major ||
    degree !== education.degree ||
    startDate !== education.startDate ||
    endDate !== education.endDate ||
    gpa !== education.gpa;

  const isValidForm = school;

  return (
    <div className="flex flex-col space-y-4 border w-fit p-4 rounded-lg hover:bg-gray-50">
      <div className="max-w-96 flex flex-col space-y-2">
        <Label htmlFor="school">School</Label>
        <Input
          id="school"
          placeholder="School"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
        />
        {!school && <span className="text-red-500">School is required</span>}
      </div>
      <div className="flex space-x-4">
        <div className="max-w-96 flex flex-col space-y-2">
          <Label htmlFor="school">Major</Label>
          <Input
            id="major"
            placeholder="Major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
          />
        </div>
        <div className="max-w-96 flex flex-col space-y-2">
          <Label htmlFor="degree">Degree</Label>
          <Input
            id="degree"
            placeholder="Degree"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
          />
        </div>
        <div className="max-w-96 flex flex-col space-y-2">
          <Label htmlFor="gpa">GPA</Label>
          <Input
            id="gpa"
            placeholder="gpa"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="max-w-96 flex flex-col space-y-2">
          <Label htmlFor="startDate">From</Label>
          <DatePicker
            id="startDate"
            className={inputClassName}
            showMonthYearPicker
            dateFormat="MM/yyyy"
            selected={
              !startDate || startDate === "N/A" ? null : new Date(startDate)
            }
            onChange={(date) => setStartDate(date)}
          />
        </div>
        <div className="max-w-96 flex flex-col space-y-2">
          <Label htmlFor="endDate">To</Label>
          <DatePicker
            id="endDate"
            className={inputClassName}
            showMonthYearPicker
            dateFormat="MM/yyyy"
            selected={!endDate || endDate === "N/A" ? null : new Date(endDate)}
            onChange={(date) => setEndDate(date)}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          className="w-fit"
          onClick={() =>
            onSave({
              school: school || "",
              major,
              degree,
              startDate,
              endDate,
              gpa,
            })
          }
          disabled={!isChanged || !isValidForm}
        >
          Save
        </Button>
        <Button variant="destructive" className="w-fit" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

const testEducations: IEducation[] = [
  {
    school: "University of California, Berkeley",
    major: "Computer Science",
    degree: "Bachelor of Science",
    startDate: new Date("2015-08-01"),
    endDate: new Date("2019-05-01"),
    gpa: "3.8",
    awards: ["Dean's List", "Graduated with Honors"],
  },
];

export function Education() {
  const { session } = useSession();

  const [addingEducations, setAddingEducations] = useState<
    Partial<IEducation>[]
  >([]);

  return (
    <div className="flex flex-col space-y-4 py-2">
      <Button
        variant="default"
        className="w-fit"
        onClick={() => {
          setAddingEducations([...addingEducations, {}]);
        }}
      >
        Add Education
      </Button>
      <div className="flex flex-col space-y-2">
        {addingEducations.map((edu, index) => {
          return (
            <EducationItem
              key={`adding-edu-${index}`}
              education={edu}
              onSave={() => {}}
              onDelete={() => {
                const newEdu = [...addingEducations];
                newEdu.splice(index, 1);
                setAddingEducations(newEdu);
              }}
            />
          );
        })}
        {session?.user?.userResume?.educations?.map((edu, index) => {
          return (
            <EducationItem
              key={`edu-${index}`}
              education={edu}
              onSave={() => {}}
              onDelete={() => {}}
            />
          );
        })}
      </div>
    </div>
  );
}
