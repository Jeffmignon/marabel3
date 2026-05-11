"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/chrome/AppShell";
import { SourcesPane } from "@/components/workspace/SourcesPane";
import { IssueDocument } from "@/components/workspace/IssueDocument";
import { StudioPane } from "@/components/workspace/StudioPane";
import { PaneRail } from "@/components/workspace/PaneRail";
import { ChevronLeft } from "@/components/workspace/Icons";
import { EditableText } from "@/components/workspace/EditableText";
import { useWorkspace } from "@/context/WorkspaceContext";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WorkspacePage({ params }: PageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const issueParam = searchParams.get("issue");

  const {
    newsletters,
    updateIssueContent,
    restoreIssueContent,
    renameNewsletter,
  } = useWorkspace();
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [studioOpen, setStudioOpen] = useState(true);

  const router = useRouter();
  const newsletter = newsletters.find((nl) => nl.id === id);

  // Graceful fallback: stale links to deleted newsletters get bounced back
  // to the home aggregation rather than a hard 404.
  useEffect(() => {
    if (!newsletter) router.replace("/");
  }, [newsletter, router]);

  if (!newsletter) {
    return (
      <div className="flex h-full items-center justify-center text-[13px] text-ink-3">
        Returning to your newsletters…
      </div>
    );
  }

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
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-2 transition-colors hover:bg-veil hover:text-ink"
          >
            <ChevronLeft width={12} height={12} />
            All issues
          </Link>
          <span className="text-ink-4">·</span>
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
            content={currentIssue.content ?? ""}
            onContentChange={(next) =>
              updateIssueContent(newsletter.id, currentIssue.id, next)
            }
            onRestoreVersion={(entryId) =>
              restoreIssueContent(newsletter.id, currentIssue.id, entryId)
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
