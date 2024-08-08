"use client";

import { useSession } from "@/app/context/session-context";
import {
  WorkExperience as IWorkExperience,
  updateWorkExperience,
  createWorkExperience,
  deleteWorkExperience,
} from "@/client";

import { Button } from "@/components/ui/button";
import { Input, inputClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { TextArrayItem } from "../common/text-array-editor";
import { arraysEqual } from "@/lib/utils";

function WorkItem({
  work,
  onSave,
  onDelete,
}: {
  work: Partial<IWorkExperience>;
  onSave: (work: Omit<IWorkExperience, "id">) => void;
  onDelete: () => void;
}) {
  const [company, setCompany] = useState(work.company);
  const [title, setTitle] = useState(work.title);
  const [location, setLocation] = useState(work.location);
  const [contents, setContents] = useState(work.contents || []);
  const [skills, setSkills] = useState(work.skills);
  const [startDate, setStartDate] = useState(work.startDate);
  const [endDate, setEndDate] = useState(work.endDate);

  const [isAddingSkill, setIsAddingSkill] = useState(false);

  useEffect(() => {
    setCompany(work.company);
    setTitle(work.title);
    setLocation(work.location);
    setContents(work.contents || []);
    setSkills(work.skills);
    setStartDate(work.startDate);
    setEndDate(work.endDate);
  }, [work]);

  const isChanged =
    company !== work.company ||
    title !== work.title ||
    location !== work.location ||
    contents !== work.contents ||
    !arraysEqual(work.skills || [], skills || []) ||
    startDate !== work.startDate ||
    endDate !== work.endDate;

  const isValidForm = company && title && location;

  return (
    <div className="flex flex-col space-y-4 border max-w-xl p-4 rounded-lg">
      <div className="max-w-96 flex flex-col space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        {!company && <span className="text-red-500">Company is required</span>}
      </div>
      <div className="flex space-x-4">
        <div className="max-w-96 flex flex-col space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {!title && <span className="text-red-500">Title is required</span>}
        </div>
        <div className="max-w-96 flex flex-col space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          {!location && (
            <span className="text-red-500">Location is required</span>
          )}
        </div>
      </div>

      <div className="flex space-x-3">
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

      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <Label>Job Contents</Label>
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => {
              setContents([...(contents || []), ""]);
            }}
          >
            <PlusCircleIcon className="h-4 w-4" />
          </Button>
        </div>
        {contents.map((content, index) => {
          return (
            <div key={`content-${index}`} className="w-full flex space-x-2">
              <Input
                id="content"
                value={content}
                onChange={(e) => {
                  const newContents = [...contents];
                  newContents[index] = e.target.value;
                  setContents(newContents);
                }}
              />
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => {
                  const newContents = [...contents];
                  newContents.splice(index, 1);
                  setContents(newContents);
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <Label>Job Skills</Label>
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => {
              setSkills([...(skills || []), ""]);
              setIsAddingSkill(true);
            }}
          >
            <PlusCircleIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap w-full gap-1">
          {skills?.map((skill, index) => (
            <TextArrayItem
              key={`skill-${index}`}
              shouldFocus={isAddingSkill && index === skills.length - 1}
              onChange={(text) => {
                const newSkills = [...skills];
                newSkills[index] = text;
                setSkills(newSkills);
              }}
              onBlur={() => {
                if (isAddingSkill) {
                  setIsAddingSkill(false);
                }
              }}
              text={skill}
              onDelete={() => {
                const newSkills = [...skills];
                newSkills.splice(index, 1);
                setSkills(newSkills);
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          className="w-fit"
          onClick={() =>
            onSave({
              company: company!,
              title: title!,
              location,
              contents,
              skills,
              startDate,
              endDate,
            })
          }
          disabled={!isChanged || !isValidForm}
        >
          Save
        </Button>
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => {
            setCompany(work.company);
            setTitle(work.title);
            setLocation(work.location);
            setContents(work.contents || []);
            setSkills(work.skills);
            setStartDate(work.startDate);
            setEndDate(work.endDate);
          }}
        >
          Reset
        </Button>
        <Button variant="destructive" className="w-fit" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export function Work() {
  const { session, setResume } = useSession();

  const [addingWork, setAddingWork] = useState<Partial<IWorkExperience>[]>([]);

  const onSave = (
    workExperienceId: string,
    updated: Omit<IWorkExperience, "id">
  ) => {
    if (!session?.user?.userResume) {
      return;
    }

    updateWorkExperience({
      resumeId: session.user.userResume.id,
      workExperienceId,
      data: {
        ...updated,
      },
    }).then((resume) => {
      setResume(resume);
    });
  };

  const onSaveNew = (workExperience: Omit<IWorkExperience, "id">) => {
    if (!session?.user?.userResume) {
      return;
    }

    createWorkExperience({
      resumeId: session.user.userResume.id,
      data: {
        ...workExperience,
      },
    }).then((resume) => {
      setResume(resume);
    });
  };

  const deleteAddingWork = (index: number) => {
    const newWork = [...addingWork];
    newWork.splice(index, 1);
    setAddingWork(newWork);
  };

  const sortedWork = useMemo(
    () =>
      session?.user?.userResume?.workExperiences?.sort((a, b) => {
        if (!a.startDate && !b.startDate) {
          return a.company?.localeCompare(b.company || "") || 0;
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
    [session?.user?.userResume?.workExperiences]
  );

  return (
    <div className="flex flex-col space-y-4 py-2">
      <Button
        variant="default"
        className="w-fit"
        onClick={() => {
          setAddingWork([...addingWork, {}]);
        }}
      >
        Add work experience
      </Button>
      <div className="flex flex-col space-y-2">
        {addingWork.map((work, index) => {
          return (
            <WorkItem
              key={`adding-work-${index}`}
              work={work}
              onSave={(create) => {
                onSaveNew(create);
                deleteAddingWork(index);
              }}
              onDelete={() => {
                deleteAddingWork(index);
              }}
            />
          );
        })}
        {sortedWork?.map((work, index) => {
          return (
            <WorkItem
              key={`work-${index}`}
              work={work}
              onSave={(update) => onSave(work.id!, update)}
              onDelete={() => {
                if (!session?.user?.userResume) {
                  return;
                }

                deleteWorkExperience({
                  resumeId: session.user.userResume.id,
                  workExperienceId: work.id!,
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
