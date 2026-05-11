"use client";

import { use, useState } from "react";
import { notFound, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/chrome/AppShell";
import { SourcesPane } from "@/components/workspace/SourcesPane";
import { IssueDocument } from "@/components/workspace/IssueDocument";
import { StudioPane } from "@/components/workspace/StudioPane";
import { PaneRail } from "@/components/workspace/PaneRail";
import { EditableText } from "@/components/workspace/EditableText";
import { useWorkspace } from "@/context/WorkspaceContext";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WorkspacePage({ params }: PageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const issueParam = searchParams.get("issue");

  const { newsletters, updateIssueSections, renameNewsletter } = useWorkspace();
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [studioOpen, setStudioOpen] = useState(true);

  const newsletter = newsletters.find((nl) => nl.id === id);
  if (!newsletter) return notFound();

  const inProgress =
    newsletter.issues.find((i) => i.status === "in_progress") ?? newsletter.issues[0];
  const requested = issueParam
    ? newsletter.issues.find((i) => i.id === issueParam)
    : null;
  const currentIssue = requested ?? inProgress;
  const isViewingPast = !!requested && requested.id !== inProgress.id;
  const readOnly =
    isViewingPast ||
    currentIssue.status === "published" ||
    currentIssue.status === "archived";

  return (
    <AppShell
      left={
        <nav className="flex items-center gap-3">
          <EditableText
            value={newsletter.name}
            onChange={(name) => renameNewsletter(newsletter.id, name)}
            className="text-[13px] font-medium text-ink"
            ariaLabel="Newsletter name"
          />
          {isViewingPast && (
            <>
              <span className="text-ink-4">·</span>
              <span className="text-[13px] text-ink-2">{currentIssue.name}</span>
            </>
          )}
        </nav>
      }
      right={
        <span className="hidden text-[12px] text-ink-3 md:inline">
          {readOnly ? `published ${currentIssue.date}` : `next send ${newsletter.nextSend}`}
        </span>
      }
    >
      <div className="flex h-full flex-col">
        {isViewingPast && (
          <div className="flex shrink-0 items-center justify-between border-b border-line bg-amber-tint/40 px-4 py-2 text-[12px]">
            <span className="text-ink">Viewing a past issue — read only.</span>
            <Link
              href={`/workspace/${newsletter.id}`}
              className="font-medium text-accent hover:underline"
            >
              ← Back to current issue
            </Link>
          </div>
        )}
        <div className="flex flex-1 overflow-hidden">
          {sourcesOpen ? (
            <SourcesPane
              newsletter={newsletter}
              onCollapse={() => setSourcesOpen(false)}
            />
          ) : (
            <PaneRail
              side="left"
              label="Sources"
              onExpand={() => setSourcesOpen(true)}
            />
          )}
          <IssueDocument
            newsletter={newsletter}
            issue={currentIssue}
            sections={currentIssue.sections ?? []}
            onSectionsChange={(next) =>
              updateIssueSections(newsletter.id, currentIssue.id, next)
            }
            readOnly={readOnly}
          />
          {studioOpen ? (
            <StudioPane
              newsletter={newsletter}
              issue={currentIssue}
              onCollapse={() => setStudioOpen(false)}
            />
          ) : (
            <PaneRail
              side="right"
              label="Studio"
              onExpand={() => setStudioOpen(true)}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
