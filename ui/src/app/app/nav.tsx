"use client";

import Link from "next/link";
import { LucideIcon, PanelLeftOpenIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { twMerge } from "tailwind-merge";

interface NavProps {
  isCollapsed: boolean;
  items: {
    href?: string;
    onClick?: () => void;
    title: string;
    label?: string;
    icon: LucideIcon;
    variant: "default" | "ghost";
  }[];
}

export function Nav({ items, isCollapsed }: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col grow gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {items.map((item, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href || "#"}
                  onClick={item.onClick}
                  className={cn(
                    buttonVariants({ variant: item.variant, size: "icon" }),
                    "h-9 w-9",
                    item.variant === "default" &&
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="sr-only">{item.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {item.title}
                {item.label && (
                  <span className="ml-auto text-muted-foreground">
                    {item.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              href={item.href || "#"}
              onClick={item.onClick}
              className={twMerge(
                buttonVariants({ variant: item.variant, size: "sm" }),
                item.variant === "default" &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-start"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
              {item.label && (
                <span
                  className={cn(
                    "ml-auto",
                    item.variant === "default" &&
                      "text-background dark:text-white"
                  )}
                >
                  {item.label}
                </span>
              )}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
