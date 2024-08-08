"use client";

import { useSession } from "@/app/context/session-context";
import {
  Education as IEducation,
  updateEducation,
  createEducation,
  deleteEducation,
} from "@/client";

import { Button } from "@/components/ui/button";
import { Input, inputClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

function EducationItem({
  education,
  onSave,
  onDelete,
}: {
  education: Partial<IEducation>;
  onSave: (education: Omit<IEducation, "id">) => void;
  onDelete: () => void;
}) {
  const [school, setSchool] = useState(education.school);
  const [major, setMajor] = useState(education.major);
  const [degree, setDegree] = useState(education.degree);
  const [startDate, setStartDate] = useState(education.startDate);
  const [endDate, setEndDate] = useState(education.endDate);
  const [gpa, setGpa] = useState(education.gpa);

  useEffect(() => {
    setSchool(education.school);
    setMajor(education.major);
    setDegree(education.degree);
    setStartDate(education.startDate);
    setEndDate(education.endDate);
    setGpa(education.gpa);
  }, [education]);

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
            onChange={(date) => setStartDate(date?.toLocaleDateString())}
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
            onChange={(date) => setEndDate(date?.toLocaleDateString())}
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
              major: major || "",
              degree: degree || "",
              startDate: startDate,
              endDate: endDate,
              gpa: gpa || "",
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

export function Education() {
  const { session, setResume } = useSession();

  const [addingEducations, setAddingEducations] = useState<
    Partial<IEducation>[]
  >([]);

  const onSave = (educationId: string, updated: Omit<IEducation, "id">) => {
    if (!session?.user?.userResume) {
      return;
    }

    updateEducation({
      resumeId: session.user.userResume.id,
      educationId,
      data: {
        ...updated,
      },
    }).then((resume) => {
      setResume(resume);
    });
  };

  const onSaveNew = (education: Omit<IEducation, "id">) => {
    if (!session?.user?.userResume) {
      return;
    }

    createEducation({
      resumeId: session.user.userResume.id,
      data: {
        ...education,
      },
    }).then((resume) => {
      setResume(resume);
    });
  };

  const deleteAddingEducation = (index: number) => {
    const newEdu = [...addingEducations];
    newEdu.splice(index, 1);
    setAddingEducations(newEdu);
  };

  const sortedEducations = useMemo(
    () =>
      session?.user?.userResume?.educations?.sort((a, b) => {
        if (!a.startDate && !b.startDate) {
          return a.school?.localeCompare(b.school || "") || 0;
        }
        if (!a.startDate) {
          return 1;
        }
        if (!b.startDate) {
          return -1;
        }
        return (
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
      }),
    [session?.user?.userResume?.educations]
  );

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
              onSave={(create) => {
                onSaveNew(create);
                deleteAddingEducation(index);
              }}
              onDelete={() => {
                deleteAddingEducation(index);
              }}
            />
          );
        })}
        {sortedEducations?.map((edu, index) => {
          return (
            <EducationItem
              key={`edu-${index}`}
              education={edu}
              onSave={(updated) => {
                onSave(edu.id, updated);
              }}
              onDelete={() => {
                if (!session?.user?.userResume) {
                  return;
                }

                deleteEducation({
                  resumeId: session.user.userResume.id,
                  educationId: edu.id,
                }).then((resume) => {
                  setResume(resume);
                });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
