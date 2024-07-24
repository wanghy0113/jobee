"use client";

import * as React from "react";
import {
  Star,
  Search,
  Send,
  User,
  LogOut,
  PanelLeftCloseIcon,
  PanelLeftOpen,
  PanelLeftOpenIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Nav } from "./nav";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSession } from "../context/session-context";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(true);
  const pathname = usePathname();
  const page = pathname.split("/")?.[2] || "search";
  const { logout } = useSession();

  return (
    <section className="h-screen">
      <TooltipProvider delayDuration={0}>
        <div className="flex h-full w-screen">
          <div className="flex flex-col">
            <div
              className={cn(
                "flex h-[48px] items-center justify-center",
                isCollapsed ? "h-[48px]" : "px-2"
              )}
            >
              <Image
                className={cn(isCollapsed ? "block" : "hidden")}
                src="/bee-icon.svg"
                alt="logo"
                width={20}
                height={20}
              />
              <Image
                className={cn(isCollapsed ? "hidden" : "block")}
                src="/logo-with-icon.png"
                alt="logo"
                width={64}
                height={32}
              />
            </div>
            <Separator />
            <Nav
              isCollapsed={isCollapsed}
              items={[
                {
                  title: "Job Search",
                  href: "/app",
                  icon: Search,
                  variant: page === "search" ? "default" : "ghost",
                },
                {
                  title: "Saved Jobs",
                  href: "/app/saved",
                  icon: Star,
                  variant: page === "saved" ? "default" : "ghost",
                },
                {
                  title: "My Resume",
                  href: "/app/resume",
                  icon: Send,
                  variant: page === "resume" ? "default" : "ghost",
                },
              ]}
            />

            <Nav
              isCollapsed={isCollapsed}
              items={[
                {
                  title: "Account",
                  href: "/app/account",
                  icon: User,
                  variant: page === "account" ? "default" : "ghost",
                },
                {
                  title: "Logout",
                  onClick: () => {
                    logout();
                  },
                  icon: LogOut,
                  variant: "ghost",
                },
              ]}
            />
          </div>
          <div className="h-full w-px bg-slate-200 flex items-center justify-center overflow-visible">
            <Button
              variant="ghost"
              className="z-30"
              onClick={() => {
                setIsCollapsed(!isCollapsed);
              }}
            >
              {isCollapsed ? (
                <PanelLeftOpenIcon className="w-4 h-4" />
              ) : (
                <PanelLeftCloseIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="grow overflow-auto">{children}</div>
        </div>
      </TooltipProvider>
    </section>
  );
}
