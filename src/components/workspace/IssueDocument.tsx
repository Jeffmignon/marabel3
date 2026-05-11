"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Issue, IssueComment, Newsletter } from "@/context/WorkspaceContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { renderMarkdown } from "@/lib/markdown";
import { Download, Trash } from "./Icons";
import { downloadIssueAsDoc } from "@/lib/exportDoc";
import { NewsletterEditModal } from "./NewsletterEditModal";
import { HistoryModal } from "./HistoryModal";
import { SelectionMenu } from "./SelectionMenu";
import { CommentPopover } from "./CommentPopover";
import { RewritePopover } from "./RewritePopover";

interface IssueDocumentProps {
  newsletter: Newsletter;
  issue: Issue;
  content: string;
  onContentChange: (next: string) => void;
  onRestoreVersion: (entryId: string) => void;
  readOnly?: boolean;
}

interface SelectionState {
  text: string;
  rect: DOMRect;
}

type PopoverMode = "menu" | "comment" | "rewrite" | null;

export function IssueDocument({
  newsletter,
  issue,
  content,
  onContentChange,
  onRestoreVersion,
  readOnly,
}: IssueDocumentProps) {
  const { addComment, resolveComment, deleteComment } = useWorkspace();
  const [editing, setEditing] = useState(false);
  const [showingHistory, setShowingHistory] = useState(false);

  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [popover, setPopover] = useState<PopoverMode>(null);
  const articleRef = useRef<HTMLDivElement>(null);

  const isEmpty = !content || !content.trim();
  const editedAtLabel = formatEditedAt(issue.contentEditedAt);
  const historyCount = issue.contentHistory?.length ?? 0;
  const comments = issue.comments ?? [];
  const activeComments = comments.filter((c) => !c.resolved);

  // Listen for text selection inside the article area.
  const refreshSelection = useCallback(() => {
    if (readOnly) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setSelection(null);
      setPopover((p) => (p === "menu" ? null : p));
      return;
    }
    const range = sel.getRangeAt(0);
    const node = range.commonAncestorContainer;
    if (!articleRef.current || !articleRef.current.contains(node)) {
      setSelection(null);
      setPopover((p) => (p === "menu" ? null : p));
      return;
    }
    const text = sel.toString().trim();
    if (!text) {
      setSelection(null);
      setPopover((p) => (p === "menu" ? null : p));
      return;
    }
    const rect = range.getBoundingClientRect();
    setSelection({ text, rect });
    setPopover((p) => (p === null ? "menu" : p));
  }, [readOnly]);

  useEffect(() => {
    if (readOnly) return;
    function onUp() {
      // Defer so the browser settles the selection state.
      setTimeout(refreshSelection, 0);
    }
    document.addEventListener("mouseup", onUp);
    document.addEventListener("keyup", onUp);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("keyup", onUp);
    };
  }, [refreshSelection, readOnly]);

  function closePopover() {
    setPopover(null);
    // Don't clear `selection` here so the popover can still anchor on a
    // collapsing selection (e.g., when the user clicks Comment).
  }

  function submitComment(body: string) {
    if (!selection) return;
    addComment(newsletter.id, issue.id, {
      anchor: selection.text,
      body,
      author: "You",
    });
    setPopover(null);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }

  function applyRewrite(next: string) {
    if (!selection) return;
    const before = content;
    const idx = before.indexOf(selection.text);
    if (idx < 0) {
      // Fallback: append a note rather than silently no-op
      const updated = `${before}\n\n${next}`;
      onContentChange(updated);
    } else {
      const updated =
        before.slice(0, idx) + next + before.slice(idx + selection.text.length);
      onContentChange(updated);
    }
    setPopover(null);
    setSelection(null);
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
              select text to comment or rewrite
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

            <CommentsList
              comments={comments}
              onResolve={(id) => resolveComment(newsletter.id, issue.id, id)}
              onDelete={(id) => deleteComment(newsletter.id, issue.id, id)}
              readOnly={!!readOnly}
            />
          </article>
        )}
      </div>

      {/* Floating selection + popovers */}
      {!readOnly && selection && popover === "menu" && (
        <SelectionMenu
          rect={selection.rect}
          onComment={() => setPopover("comment")}
          onRewrite={() => setPopover("rewrite")}
        />
      )}
      {!readOnly && selection && popover === "comment" && (
        <CommentPopover
          rect={selection.rect}
          anchor={selection.text}
          onSubmit={submitComment}
          onClose={closePopover}
        />
      )}
      {!readOnly && selection && popover === "rewrite" && (
        <RewritePopover
          rect={selection.rect}
          selection={selection.text}
          onAccept={applyRewrite}
          onClose={closePopover}
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

      {/* Footer floating comment-count chip, when there's at least one open comment */}
      {!readOnly && activeComments.length > 0 && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 select-none">
          <span className="rounded-full border border-line bg-paper px-3 py-1 text-[11px] text-ink-2 shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
            {activeComments.length} open comment
            {activeComments.length === 1 ? "" : "s"} below
          </span>
        </div>
      )}
    </main>
  );
}

function CommentsList({
  comments,
  onResolve,
  onDelete,
  readOnly,
}: {
  comments: IssueComment[];
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  readOnly: boolean;
}) {
  if (comments.length === 0) return null;

  const open = comments.filter((c) => !c.resolved);
  const resolved = comments.filter((c) => c.resolved);

  return (
    <section className="mt-16 border-t border-line pt-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
          Comments
        </h3>
        <span className="tabular text-[11px] text-ink-3">
          {open.length} open · {resolved.length} resolved
        </span>
      </div>

      <ul className="space-y-3">
        {open.map((c) => (
          <CommentRow
            key={c.id}
            comment={c}
            onResolve={() => onResolve(c.id)}
            onDelete={() => onDelete(c.id)}
            readOnly={readOnly}
          />
        ))}
      </ul>

      {resolved.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-[11px] text-ink-3 hover:text-ink-2">
            Show {resolved.length} resolved
          </summary>
          <ul className="mt-3 space-y-3 opacity-60">
            {resolved.map((c) => (
              <CommentRow
                key={c.id}
                comment={c}
                onResolve={() => onResolve(c.id)}
                onDelete={() => onDelete(c.id)}
                readOnly={readOnly}
              />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function CommentRow({
  comment,
  onResolve,
  onDelete,
  readOnly,
}: {
  comment: IssueComment;
  onResolve: () => void;
  onDelete: () => void;
  readOnly: boolean;
}) {
  return (
    <li className="border border-line bg-paper p-3">
      <div className="border-l-2 border-amber bg-amber-tint/40 px-3 py-1.5 text-[12px] italic text-ink-2">
        “{comment.anchor}”
      </div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="flex-1 text-[13px] leading-relaxed text-ink">
          {comment.body}
        </p>
        {!readOnly && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onResolve}
              className="text-[11px] text-ink-3 hover:text-emerald"
              title={comment.resolved ? "Reopen comment" : "Resolve comment"}
            >
              {comment.resolved ? "Reopen" : "Resolve"}
            </button>
            <button
              onClick={onDelete}
              className="flex h-5 w-5 items-center justify-center text-ink-3 hover:text-rose"
              title="Delete comment"
              aria-label="Delete comment"
            >
              <Trash width={11} height={11} />
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 text-[10px] text-ink-3">
        {comment.author} · {formatTimestamp(comment.timestamp)}
      </div>
    </li>
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
  return formatTimestamp(iso);
}

function formatTimestamp(iso: string): string {
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
