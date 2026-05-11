"use client";

import { useEffect, useRef, useState } from "react";
import type { Issue, Newsletter } from "@/context/WorkspaceContext";
import { renderMarkdown } from "@/lib/markdown";
import { Download } from "./Icons";
import { downloadIssueAsDoc } from "@/lib/exportDoc";
import { NewsletterEditModal } from "./NewsletterEditModal";
import { HistoryModal } from "./HistoryModal";
import { RewritePopover } from "./RewritePopover";

interface IssueDocumentProps {
  newsletter: Newsletter;
  issue: Issue;
  content: string;
  onContentChange: (next: string) => void;
  onRestoreVersion: (entryId: string) => void;
  readOnly?: boolean;
}

interface PopupState {
  text: string;
  rect: DOMRect;
}

export function IssueDocument({
  newsletter,
  issue,
  content,
  onContentChange,
  onRestoreVersion,
  readOnly,
}: IssueDocumentProps) {
  const [editing, setEditing] = useState(false);
  const [showingHistory, setShowingHistory] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<PopupState | null>(null);
  popupRef.current = popup;

  const isEmpty = !content || !content.trim();
  const editedAtLabel = formatEditedAt(issue.contentEditedAt);
  const historyCount = issue.contentHistory?.length ?? 0;

  // Capture text selection on mouseup. If a popup is already open, ignore
  // further selection events — the popup snapshots its selection at open
  // time so it survives the user clicking into the popover's input.
  useEffect(() => {
    if (readOnly) return;
    function onUp() {
      // Defer so the browser settles the selection range first.
      setTimeout(() => {
        if (popupRef.current) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        const node = range.commonAncestorContainer;
        if (!articleRef.current || !articleRef.current.contains(node)) return;
        const text = sel.toString().trim();
        if (!text) return;
        const rect = range.getBoundingClientRect();
        setPopup({ text, rect });
      }, 0);
    }
    document.addEventListener("mouseup", onUp);
    document.addEventListener("keyup", onUp);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("keyup", onUp);
    };
  }, [readOnly]);

  function applyRewrite(rewritten: string) {
    if (!popup) return;
    const before = content;
    const idx = before.indexOf(popup.text);
    const updated =
      idx < 0
        ? `${before}\n\n${rewritten}`
        : before.slice(0, idx) + rewritten + before.slice(idx + popup.text.length);
    onContentChange(updated);
    setPopup(null);
    window.getSelection()?.removeAllRanges();
  }

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-paper">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-6">
        <div className="flex items-baseline gap-3">
          <span className="text-[14px] font-medium text-ink">{issue.name}</span>
          <span className="text-[12px] text-ink-3">·</span>
          <span className="text-[12px] text-ink-2">
            sends {issue.date ?? "—"} &middot;{" "}
            {newsletter.schedule.timezone.replace(/_/g, " ")}
          </span>
          {editedAtLabel && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-sm bg-amber-tint px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber">
              <span className="h-1 w-1 rounded-full bg-amber" />
              Edited · {editedAtLabel}
            </span>
          )}
          {!readOnly && (
            <span className="ml-2 text-[11px] text-ink-3">
              select any text to ask Marabel for a rewrite
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowingHistory(true)}
            className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-2 transition-colors hover:bg-veil hover:text-ink"
            title={
              historyCount === 0
                ? "No previous versions yet"
                : `${historyCount} previous version${historyCount === 1 ? "" : "s"}`
            }
          >
            History
            {historyCount > 0 && (
              <span className="tabular text-[10px] text-ink-3">{historyCount}</span>
            )}
          </button>
          {!readOnly && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-2 transition-colors hover:bg-veil hover:text-ink"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => downloadIssueAsDoc(newsletter, issue, content)}
            disabled={isEmpty}
            className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-2 transition-colors hover:bg-veil hover:text-ink disabled:opacity-40 disabled:hover:bg-paper disabled:hover:text-ink-2"
            title={isEmpty ? "Nothing to download yet" : "Download as Word document"}
          >
            <Download width={12} height={12} />
            Download
          </button>
          <StatusPill status={issue.status} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyDocumentState
            newsletter={newsletter}
            issue={issue}
            readOnly={readOnly}
            onEdit={() => setEditing(true)}
          />
        ) : (
          <article className="mx-auto max-w-[680px] px-8 py-12">
            <header className="mb-10">
              <div className="text-[11px] uppercase tracking-[0.16em] text-ink-3">
                {newsletter.name}
              </div>
              <h1 className="mt-2 text-[36px] font-medium leading-[1.1] tracking-tight text-ink">
                {issue.name}
              </h1>
              <div className="mt-3 text-[13px] text-ink-2">
                {readOnly ? `Published ${issue.date}` : "Drafted by Marabel"}
              </div>
            </header>

            <div ref={articleRef} className="doc-body">
              {renderMarkdown(content)}
            </div>
          </article>
        )}
      </div>

      {!readOnly && popup && (
        <RewritePopover
          rect={popup.rect}
          selection={popup.text}
          onApply={applyRewrite}
          onClose={() => setPopup(null)}
        />
      )}

      {editing && (
        <NewsletterEditModal
          newsletter={newsletter}
          issue={issue}
          initialContent={content}
          onSave={(next) => {
            onContentChange(next);
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}

      {showingHistory && (
        <HistoryModal
          newsletter={newsletter}
          issue={issue}
          currentContent={content}
          history={issue.contentHistory ?? []}
          onRestore={(entryId) => onRestoreVersion(entryId)}
          onClose={() => setShowingHistory(false)}
        />
      )}
    </main>
  );
}

function EmptyDocumentState({
  newsletter,
  issue,
  readOnly,
  onEdit,
}: {
  newsletter: Newsletter;
  issue: Issue;
  readOnly?: boolean;
  onEdit: () => void;
}) {
  if (readOnly) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 py-16">
        <div className="max-w-[440px] text-center">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-3">
            {issue.name}
          </div>
          <h2 className="mt-4 text-[28px] font-medium leading-[1.1] tracking-tight text-ink">
            Published {issue.date}.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-2">
            This issue&apos;s body content isn&apos;t preserved in this prototype.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-16">
      <div className="max-w-[440px] text-center">
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-3">
          {issue.name}
        </div>
        <h2 className="mt-4 text-[28px] font-medium leading-[1.1] tracking-tight text-ink">
          Blank canvas.
        </h2>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-2">
          Click <strong>Edit</strong> to write {newsletter.name} in one
          continuous markdown editor.
        </p>
        <button
          onClick={onEdit}
          className="mt-8 inline-flex items-center gap-2 bg-accent px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Edit newsletter
        </button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Issue["status"] }) {
  const map = {
    draft: { label: "Draft", color: "bg-ink-4 text-ink-2" },
    in_progress: { label: "In progress", color: "bg-amber-tint text-amber" },
    published: { label: "Published", color: "bg-emerald-tint text-emerald" },
    archived: { label: "Archived", color: "bg-veil text-ink-3" },
  } as const;
  const v = map[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium ${v.color}`}
    >
      {v.label}
    </span>
  );
}

function formatEditedAt(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}
