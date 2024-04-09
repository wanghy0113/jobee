'use client';

import "@/app/globals.css";
import { Poppins as FontSans } from "next/font/google";
import classNames from 'classnames';
import { ReactNode } from "react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

interface RootLayoutProps {
  children: ReactNode;
  session: undefined | null | Session;
}

const fontSans = FontSans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export default function RootLayout({ children, session }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <SessionProvider session={session}>
        <head />
        <body
          className={classNames(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          {children}
        </body>
      </SessionProvider>
    </html>
  );
}
