"use client";

import { HomeIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

export type LinkType = "home" | "linkedin" | "twitter" | "facebook";

export interface JobLinkProps {
  type: LinkType;
  url: string;
}

export const JobLink = ({ type, url }: JobLinkProps) => {
  return (
    <a href={url} target="_blank" className="rounded-sm overflow-hidden mx-0.5">
      {type === "home" && (
        <div className="flex items-center justify-center bg-gray-400 p-px">
          <HomeIcon className="w-4 h-4 fill-white" />
        </div>
      )}
      {type === "linkedin" && (
        <Image src="/linkedin-icon.png" alt="linkedin" width={18} height={18} />
      )}
      {type === "twitter" && (
        <Image src="/x-icon.png" alt="x" width={18} height={18} />
      )}
      {type === "facebook" && (
        <Image src="/facebook-icon.png" alt="facebook" width={18} height={18} />
      )}
    </a>
  );
};
