"use client";

import { WorkspaceProvider } from "@/context/WorkspaceContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
