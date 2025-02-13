"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import dynamic from "next/dynamic";
import React from "react";
import ComposeButton from "./compose-button";
import { UserButton } from "@clerk/nextjs";

const Mail = dynamic(() => import("./mail"), { ssr: false });

const MailDashboard = () => {
  return (
    <>
      <div className="overlay absolute bottom-4 left-4 z-10">
        <div className="flex items-center gap-2">
          <UserButton />
          <ThemeToggle />
          <ComposeButton />
        </div>
      </div>
      <Mail
        defaultLayout={[20, 32, 48]}
        defaultCollapse={false}
        navCollapsedSize={4}
      />
    </>
  );
};

export default MailDashboard;
