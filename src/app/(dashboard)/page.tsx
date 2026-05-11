"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/chrome/AppShell";
import { useWorkspace, type Issue, type Newsletter } from "@/context/WorkspaceContext";

type StatusFilter = "all" | "in_progress" | "published";

interface Row {
  newsletter: Newsletter;
  issue: Issue;
  /** Numeric value for sorting (descending = most recent / soonest first). */
  sortKey: number;
}

export default function Home() {
  const { brand, newsletters, addIssue } = useWorkspace();
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [creating, setCreating] = useState(false);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    for (const nl of newsletters) {
      for (const issue of nl.issues) {
        if (issue.status === "archived") continue;
        const d = issue.date ? Date.parse(issue.date) : 0;
        // Push in-progress issues to the top regardless of date.
        const sortKey = (issue.status === "in_progress" ? 1e15 : 0) + (isNaN(d) ? 0 : d);
        out.push({ newsletter: nl, issue, sortKey });
      }
    }
    out.sort((a, b) => b.sortKey - a.sortKey);
    return out;
  }, [newsletters]);

  const counts = useMemo(() => {
    let inProg = 0;
    let pub = 0;
    for (const r of rows) {
      if (r.issue.status === "in_progress") inProg++;
      else if (r.issue.status === "published") pub++;
    }
    return { total: rows.length, inProg, pub };
  }, [rows]);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.issue.status === filter);
  }, [rows, filter]);

  function handleCreate(newsletterId: string, name: string) {
    const id = `iss-${Date.now()}`;
    addIssue(newsletterId, {
      id,
      name: name.trim(),
      status: "in_progress",
      date: "TBD",
      approvalStep: 0,
    });
    setCreating(false);
    router.push(`/workspace/${newsletterId}?issue=${id}`);
  }

  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1100px] overflow-y-auto px-8 py-12">
        <header className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-3">
            {brand.name}
          </div>
          <h1 className="mt-2 text-[40px] font-medium leading-[1.05] tracking-tight text-ink">
            What's shipping this week?
          </h1>
          <p className="mt-3 text-[14px] text-ink-2">
            {counts.total} {counts.total === 1 ? "issue" : "issues"}
            {newsletters.length === 1
              ? ` for ${newsletters[0].name}`
              : ` across ${newsletters.length} newsletters`}
            {" "}&middot; {counts.inProg} in progress &middot; {counts.pub} published
          </p>
        </header>

        <section className="mb-6 flex items-center justify-between border-t border-line pt-6">
          <div className="flex gap-2">
            <FilterChip
              label="All"
              count={counts.total}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterChip
              label="In progress"
              count={counts.inProg}
              active={filter === "in_progress"}
              onClick={() => setFilter("in_progress")}
              tone="amber"
            />
            <FilterChip
              label="Published"
              count={counts.pub}
              active={filter === "published"}
              onClick={() => setFilter("published")}
              tone="emerald"
            />
          </div>
          <button
            onClick={() => setCreating(true)}
            className="bg-accent px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90"
          >
            + New issue
          </button>
        </section>

        <section className="pb-16">
          {filtered.length === 0 ? (
            <div className="border border-dashed border-line-2 bg-paper p-8 text-center text-[13px] text-ink-2">
              No {filter === "in_progress" ? "in-progress" : filter === "published" ? "published" : ""} issues match.
            </div>
          ) : (
            <ul className="border-y border-line">
              {filtered.map(({ newsletter, issue }) => (
                <IssueRow
                  key={`${newsletter.id}-${issue.id}`}
                  newsletter={newsletter}
                  issue={issue}
                  onClick={() =>
                    router.push(`/workspace/${newsletter.id}?issue=${issue.id}`)
                  }
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {creating && (
        <NewIssueModal
          newsletters={newsletters}
          onClose={() => setCreating(false)}
          onCreate={handleCreate}
        />
      )}
    </AppShell>
  );
}

function IssueRow({
  newsletter,
  issue,
  onClick,
}: {
  newsletter: Newsletter;
  issue: Issue;
  onClick: () => void;
}) {
  const isInProgress = issue.status === "in_progress";
  const isPublished = issue.status === "published";

  return (
    <li>
      <button
        onClick={onClick}
        className="flex w-full items-center gap-4 border-b border-line bg-paper px-4 py-4 text-left transition-colors hover:bg-veil"
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            isInProgress ? "bg-amber" : isPublished ? "bg-emerald" : "bg-ink-3"
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-3">
            {newsletter.name}
          </div>
          <div className="mt-0.5 truncate text-[15px] font-medium text-ink">
            {issue.name}
            {issue.content && (
              <span className="ml-3 text-[12px] font-normal text-ink-3">
                {previewLine(issue.content)}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-[11px]">
          <span
            className={`uppercase tracking-wider ${
              isInProgress ? "text-amber" : isPublished ? "text-emerald" : "text-ink-3"
            }`}
          >
            {isInProgress ? "In progress" : isPublished ? "Published" : issue.status}
          </span>
          <span className="text-ink-3">
            {isInProgress ? `sends ${issue.date}` : issue.date}
          </span>
          <span className="text-ink-4">→</span>
        </div>
      </button>
    </li>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  tone,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: "amber" | "emerald";
}) {
  const baseClass = active
    ? "border-accent bg-accent text-white"
    : "border-line bg-paper text-ink-2 hover:border-line-2 hover:text-ink";
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[12px] transition-colors ${baseClass}`}
    >
      {tone && !active && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            tone === "amber" ? "bg-amber" : "bg-emerald"
          }`}
        />
      )}
      <span>{label}</span>
      <span
        className={`tabular text-[11px] ${
          active ? "text-white/70" : "text-ink-3"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function NewIssueModal({
  newsletters,
  onClose,
  onCreate,
}: {
  newsletters: Newsletter[];
  onClose: () => void;
  onCreate: (newsletterId: string, name: string) => void;
}) {
  const [newsletterId, setNewsletterId] = useState(newsletters[0]?.id ?? "");
  const selected = newsletters.find((n) => n.id === newsletterId);
  const suggested = selected ? suggestNextIssueName(selected) : "Issue #1";
  const [name, setName] = useState(suggested);

  // Keep the issue-name input synced with the suggestion when the newsletter changes.
  useEffect(() => {
    if (selected) setName(suggestNextIssueName(selected));
  }, [newsletterId, selected]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterId || !name.trim()) return;
    onCreate(newsletterId, name);
  }

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6"
      role="dialog"
      aria-modal="true"
      aria-label="New issue"
    >
      <div className="flex w-full max-w-[480px] flex-col border border-line bg-paper">
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
              New
            </div>
            <div className="mt-0.5 text-[18px] font-medium tracking-tight text-ink">
              Start a new issue
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-[20px] leading-none text-ink-3 hover:bg-veil hover:text-ink"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.12em] text-ink-3">
              Newsletter
            </span>
            <select
              value={newsletterId}
              onChange={(e) => setNewsletterId(e.target.value)}
              className="mt-1 block w-full border border-line bg-paper px-2 py-1.5 text-[14px] text-ink focus:border-accent focus:outline-none"
            >
              {newsletters.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.12em] text-ink-3">
              Issue name
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-line bg-paper px-2 py-1.5 text-[14px] text-ink focus:border-accent focus:outline-none"
            />
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-line bg-paper px-3 py-1.5 text-[12px] text-ink-2 hover:bg-veil hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newsletterId || !name.trim()}
              className="bg-accent px-3 py-1.5 text-[12px] font-medium text-white transition-opacity disabled:opacity-30"
            >
              Create &amp; open
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function previewLine(content: string): string {
  // Strip markdown leading syntax and grab the first non-empty heading or paragraph.
  const stripped = content
    .replace(/^---+$/gm, "")
    .replace(/^\*\*([^*]+)\*\*$/gm, "$1")
    .replace(/\[(\d+)\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  for (const line of stripped.split("\n")) {
    const t = line.replace(/^#{1,6}\s+/, "").trim();
    if (t && !/^sources$/i.test(t)) return t.length > 70 ? t.slice(0, 69).trimEnd() + "…" : t;
  }
  return "";
}

function suggestNextIssueName(nl: Newsletter): string {
  // Find the highest #N across this newsletter's issues and bump it.
  let max = 0;
  for (const i of nl.issues) {
    const m = i.name.match(/#(\d+)/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `Issue #${max + 1}`;
}
