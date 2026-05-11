"use client";

import { useEffect, useState } from "react";
import type { EditEntry, Issue, Newsletter } from "@/context/WorkspaceContext";
import { renderMarkdown } from "@/lib/markdown";

interface HistoryModalProps {
  newsletter: Newsletter;
  issue: Issue;
  currentContent: string;
  history: EditEntry[];
  onRestore: (entryId: string) => void;
  onClose: () => void;
}

export function HistoryModal({
  newsletter,
  issue,
  currentContent,
  history,
  onRestore,
  onClose,
}: HistoryModalProps) {
  // Newest first; include a synthetic "current" head pointer.
  const sortedHistory = [...history].reverse();
  const [selectedId, setSelectedId] = useState<string>(
    sortedHistory[0]?.id ?? "__current",
  );

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

  const selectedEntry = sortedHistory.find((e) => e.id === selectedId);
  const previewContent =
    selectedId === "__current" ? currentContent : selectedEntry?.content ?? "";

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit history"
    >
      <div className="flex h-[calc(100vh-2rem)] w-full max-w-[1080px] flex-col border border-line bg-paper">
        <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
              {newsletter.name} &middot; {issue.name}
            </div>
            <div className="mt-0.5 text-[18px] font-medium tracking-tight text-ink">
              Edit history
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

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-[280px] shrink-0 flex-col border-r border-line bg-chrome">
            <div className="flex shrink-0 items-baseline justify-between px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-3">
              <span>Versions</span>
              <span className="tabular">{sortedHistory.length + 1}</span>
            </div>
            <ul className="flex-1 overflow-y-auto">
              <HistoryRow
                label="Current version"
                detail="The version in the editor right now"
                editedBy="You"
                active={selectedId === "__current"}
                onClick={() => setSelectedId("__current")}
              />
              {sortedHistory.map((entry) => (
                <HistoryRow
                  key={entry.id}
                  label={formatTimestamp(entry.timestamp)}
                  detail={previewSnippet(entry.content)}
                  editedBy={entry.editedBy}
                  active={selectedId === entry.id}
                  onClick={() => setSelectedId(entry.id)}
                />
              ))}
              {sortedHistory.length === 0 && (
                <li className="px-4 py-6 text-[12px] text-ink-3">
                  No previous versions yet. Edits will appear here.
                </li>
              )}
            </ul>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-6">
              <div className="text-[12px] text-ink-2">
                {selectedId === "__current"
                  ? "Preview · Current version"
                  : `Preview · ${formatTimestamp(selectedEntry?.timestamp ?? "")} by ${selectedEntry?.editedBy ?? ""}`}
              </div>
              {selectedId !== "__current" && selectedEntry && (
                <button
                  onClick={() => {
                    onRestore(selectedEntry.id);
                    onClose();
                  }}
                  className="bg-accent px-3 py-1 text-[12px] font-medium text-white"
                >
                  Restore this version
                </button>
              )}
            </div>
            <article className="flex-1 overflow-y-auto px-10 py-8 doc-body">
              {previewContent.trim() === "" ? (
                <p className="text-ink-3">This version was empty.</p>
              ) : (
                renderMarkdown(previewContent)
              )}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryRow({
  label,
  detail,
  editedBy,
  active,
  onClick,
}: {
  label: string;
  detail: string;
  editedBy: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`block w-full border-b border-line px-4 py-3 text-left transition-colors ${
          active ? "bg-paper" : "hover:bg-paper"
        }`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className={`truncate text-[13px] ${active ? "font-medium text-ink" : "text-ink"}`}>
            {label}
          </span>
          <span className="shrink-0 text-[10px] uppercase tracking-wider text-ink-3">
            {editedBy}
          </span>
        </div>
        <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-2">
          {detail}
        </div>
      </button>
    </li>
  );
}

function formatTimestamp(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function previewSnippet(content: string): string {
  return content
    .replace(/\*\*/g, "")
    .replace(/^#{1,6}\s/gm, "")
    .replace(/\[(\d+)\]/g, "")
    .replace(/---+/g, "")
    .trim()
    .slice(0, 80) || "(empty)";
}
