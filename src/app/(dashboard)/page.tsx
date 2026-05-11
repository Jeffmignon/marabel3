"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/chrome/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function Home() {
  const router = useRouter();
  const { newsletters } = useWorkspace();

  useEffect(() => {
    const only = newsletters[0];
    if (only) router.replace(`/workspace/${only.id}`);
  }, [newsletters, router]);

  return (
    <AppShell>
      <div className="flex h-full items-center justify-center">
        <div className="text-[13px] text-ink-3">Opening your newsletter…</div>
      </div>
    </AppShell>
  );
}
