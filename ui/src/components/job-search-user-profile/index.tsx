import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { UserProfile } from "@/types/user-profile";
import classNames from "classnames";

export interface UserProfileComponentProps {
  userProfile: UserProfile;
  matchingSkills?: Set<string>;
}

export const UserProfileComponent = ({ userProfile, matchingSkills }: UserProfileComponentProps) => {  
  return (
    <Card className="w-72">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {
          userProfile.skills?.length && (
            <div>
              <p>Skills:</p>
              {
                userProfile.skills.map((skill, index) => (
                  <p key={index} className={
                    classNames({
                      "text-green-700": matchingSkills?.has(skill),
                      "text-gray-700": !matchingSkills?.has(skill),
                    })
                  }>{skill}</p>
                ))
              }
            </div>
          )
        }
      </CardContent>
    </Card>
  );
};
