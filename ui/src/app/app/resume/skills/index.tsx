"use client";

import { useSession } from "@/app/context/session-context";
import { updateBasicInfo } from "@/client";
import { TextArrayEditor } from "../common/text-array-editor";

export function SkillsAndOther() {
  const { session, setResume } = useSession();

  const onSaveSkills = (items: string[]) => {
    if (!session?.user?.userResume?.id) {
      return;
    }
    updateBasicInfo({
      data: { skills: items },
      resumeId: session.user.userResume.id,
    }).then((resume) => {
      setResume(resume);
    });
  };

  const onSaveLanguages = (items: string[]) => {
    if (!session?.user?.userResume?.id) {
      return;
    }
    updateBasicInfo({
      data: { languages: items },
      resumeId: session.user.userResume.id,
    }).then((resume) => {
      setResume(resume);
    });
  };

  const onSaveCertifications = (items: string[]) => {
    if (!session?.user?.userResume?.id) {
      return;
    }
    updateBasicInfo({
      data: { certifications: items },
      resumeId: session.user.userResume.id,
    }).then((resume) => {
      setResume(resume);
    });
  };

  const onSaveAchievements = (items: string[]) => {
    if (!session?.user?.userResume?.id) {
      return;
    }
    updateBasicInfo({
      data: { achievements: items },
      resumeId: session.user.userResume.id,
    }).then((resume) => {
      setResume(resume);
    });
  };

  return (
    <div className="flex flex-col py-2 space-y-3">
      <TextArrayEditor
        initialItems={session?.user?.userResume?.skills || []}
        name="Skills"
        onSave={onSaveSkills}
      />
      <TextArrayEditor
        initialItems={session?.user?.userResume?.languages || []}
        name="Languages"
        onSave={onSaveLanguages}
      />
      <TextArrayEditor
        initialItems={session?.user?.userResume?.certifications || []}
        name="Certifications"
        onSave={onSaveCertifications}
      />
      <TextArrayEditor
        initialItems={session?.user?.userResume?.achievements || []}
        name="Achievements"
        onSave={onSaveAchievements}
      />
    </div>
  );
}
