"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Personal } from "./personal";
import { SkillsAndOther } from "./skills";
import { Education } from "./education";
import { Work } from "./work";
import { useSession } from "@/app/context/session-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useState } from "react";
import { createResume, createResumeFromFile, deleteResume } from "@/client";

export default function Page() {
  const { session, setResume } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      // Perform the file upload or any other logic with the file
      setIsUploading(true);
      try {
        const resume = await createResumeFromFile({ file });
        setResume(resume);
      } finally {
        setIsUploading(false);
      }
    } else {
      console.log("No file selected");
    }
  };

  return (
    <Tabs defaultValue="personal">
      <TabsList>
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="work">Work</TabsTrigger>
        <TabsTrigger value="skills & others">Skills & Others</TabsTrigger>
      </TabsList>
      {session?.user?.userResume && (
        <Button
          variant={"destructive"}
          size={"sm"}
          className="ml-4"
          onClick={() => {
            if (session.user?.userResume) {
              deleteResume(session.user.userResume.id).then(() => {
                setResume(null);
              });
            }
          }}
        >
          Delete resume
        </Button>
      )}

      {session?.user?.userResume && (
        <>
          <TabsContent value="personal">
            <Personal />
          </TabsContent>
          <TabsContent value="education">
            <Education />
          </TabsContent>
          <TabsContent value="work">
            <Work />
          </TabsContent>
          <TabsContent value="skills & others">
            <SkillsAndOther />
          </TabsContent>
        </>
      )}
      {!session?.user?.userResume && (
        <div className="flex flex-col justify-center items-center h-96">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="resume">Upload resume</Label>
            <Input id="resume" type="file" onChange={handleFileChange} />
            <Button onClick={handleUpload} disabled={!file}>
              {isUploading ? "Uploading..." : "Upload resume"}
            </Button>
          </div>
          <p className="text-gray-500 mt-2">or</p>
          <Button
            onClick={() => {
              createResume({ data: {} }).then((resume) => {
                setResume(resume);
              });
            }}
          >
            Create resume manually
          </Button>
        </div>
      )}
    </Tabs>
  );
}
