import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="h-[49px] border-b flex items-center px-6">
        <h1 className="text-lg font-semibold">Resume</h1>
      </div>
      <div className="px-4 py-4">{children}</div>
    </main>
  );
}
