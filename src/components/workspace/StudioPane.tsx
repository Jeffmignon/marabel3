"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { Issue, Newsletter } from "@/context/WorkspaceContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ChevronRight } from "./Icons";
import { StudioSchedule } from "./StudioSchedule";
import { StudioIdentity } from "./StudioIdentity";

interface StudioPaneProps {
  newsletter: Newsletter;
  issue: Issue;
  onCollapse?: () => void;
}

export function StudioPane({ newsletter, issue, onCollapse }: StudioPaneProps) {
  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-line bg-chrome">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4">
        <div className="flex items-center gap-2">
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="flex h-7 w-7 items-center justify-center text-ink-3 hover:bg-veil hover:text-ink"
              title="Collapse Studio"
              aria-label="Collapse Studio"
            >
              <ChevronRight />
            </button>
          )}
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
            Studio · {newsletter.name}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section title="Schedule" defaultOpen>
          <StudioSchedule newsletter={newsletter} />
        </Section>

        <Section title="Connector" defaultOpen>
          <StudioConnector />
        </Section>

        <Section title="Identity">
          <StudioIdentity />
        </Section>
      </div>
    </aside>
  );
}

function StudioConnector() {
  const { brand } = useWorkspace();
  const c = brand.connector;
  const dotClass =
    c.status === "connected"
      ? "bg-emerald"
      : c.status === "error"
      ? "bg-rose"
      : "bg-ink-3";
  const label =
    c.status === "connected" ? "Connected" : c.status === "error" ? "Error" : "Not connected";

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
          <span className="text-[13px] font-medium text-ink">HubSpot</span>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider ${
            c.status === "connected"
              ? "text-emerald"
              : c.status === "error"
              ? "text-rose"
              : "text-ink-3"
          }`}
        >
          {label}
        </span>
      </div>
      {c.status === "connected" && c.apiKey && (
        <div className="mt-2 font-mono text-[11px] text-ink-3">{c.apiKey}</div>
      )}
      {c.status === "error" && c.lastError && (
        <div className="mt-2 border border-rose/30 bg-rose-tint/60 px-2 py-1.5 text-[11px] text-rose">
          {c.lastError}
        </div>
      )}
      {c.status === "disconnected" && (
        <div className="mt-2 text-[11px] text-ink-3">
          Approved newsletters can't be pushed until you connect HubSpot.
        </div>
      )}
      <Link
        href="/settings"
        className="mt-3 inline-block text-[12px] text-accent hover:underline"
      >
        {c.status === "connected" ? "Manage connector" : "Fix it in Settings"} →
      </Link>
    </div>
  );
}

function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-line">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between px-4 text-left transition-colors hover:bg-veil"
      >
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-2">
          {title}
        </span>
        <span
          className={`text-[10px] text-ink-3 transition-transform ${open ? "rotate-90" : ""}`}
        >
          ▸
        </span>
      </button>
      {open && children}
    </div>
  );
}
