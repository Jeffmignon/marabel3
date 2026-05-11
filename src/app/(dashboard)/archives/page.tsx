"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppShell } from "@/components/chrome/AppShell";
import { ChevronLeft } from "@/components/workspace/Icons";
import { useWorkspace, type Issue, type Newsletter } from "@/context/WorkspaceContext";

interface Row {
  newsletter: Newsletter;
  issue: Issue;
  ts: number;
}

export default function ArchivesPage() {
  const { newsletters } = useWorkspace();

  const rows = useMemo(() => {
    const out: Row[] = [];
    for (const nl of newsletters) {
      for (const issue of nl.issues) {
        if (issue.status !== "published" && issue.status !== "archived") continue;
        const d = issue.date ? Date.parse(issue.date) : 0;
        out.push({ newsletter: nl, issue, ts: isNaN(d) ? 0 : d });
      }
    }
    out.sort((a, b) => b.ts - a.ts);
    return out;
  }, [newsletters]);

  const publishedCount = rows.filter((r) => r.issue.status === "published").length;
  const archivedCount = rows.filter((r) => r.issue.status === "archived").length;

  return (
    <AppShell
      left={
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-2 transition-colors hover:bg-veil hover:text-ink"
        >
          <ChevronLeft width={12} height={12} />
          All issues
        </Link>
      }
    >
      <div className="mx-auto h-full max-w-[1100px] overflow-y-auto px-8 py-12">
        <header className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-3">
            Archives
          </div>
          <h1 className="mt-2 text-[36px] font-medium leading-[1.05] tracking-tight text-ink">
            Every issue you've sent
          </h1>
          <p className="mt-3 text-[14px] text-ink-2">
            {rows.length} {rows.length === 1 ? "issue" : "issues"} in the archive
            {archivedCount > 0
              ? ` · ${publishedCount} published · ${archivedCount} archived`
              : ""}
          </p>
        </header>

        {rows.length === 0 ? (
          <div className="border border-dashed border-line-2 bg-paper p-8 text-center text-[13px] text-ink-2">
            No past issues yet. Once you push, they'll show up here.
          </div>
        ) : (
          <ul className="border-y border-line">
            {rows.map(({ newsletter, issue }) => (
              <ArchiveRow
                key={`${newsletter.id}-${issue.id}`}
                newsletter={newsletter}
                issue={issue}
              />
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

function ArchiveRow({
  newsletter,
  issue,
}: {
  newsletter: Newsletter;
  issue: Issue;
}) {
  const archived = issue.status === "archived";
  return (
    <li>
      <Link
        href={`/workspace/${newsletter.id}?issue=${issue.id}`}
        className="flex w-full items-center gap-4 border-b border-line bg-paper px-4 py-4 transition-colors hover:bg-veil"
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            archived ? "bg-ink-3" : "bg-emerald"
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-3">
            {newsletter.name}
          </div>
          <div className="mt-0.5 truncate text-[15px] font-medium text-ink">
            {issue.name}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-[11px]">
          <span
            className={`uppercase tracking-wider ${
              archived ? "text-ink-3" : "text-emerald"
            }`}
          >
            {archived ? "Archived" : "Published"}
          </span>
          <span className="text-ink-3">{issue.date}</span>
          <span className="text-ink-4">→</span>
        </div>
      </Link>
    </li>
  );
}
