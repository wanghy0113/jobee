"use client";

import "@/app/globals.css";
import { Poppins as FontSans } from "next/font/google";
import classNames from "classnames";
import { ReactNode } from "react";
import { JobProvider } from "./context/job-context";
import { SessionProvider } from "./context/session-context";

interface RootLayoutProps {
  children: ReactNode;
}

const fontSans = FontSans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={classNames(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <SessionProvider>
          <JobProvider>{children}</JobProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
