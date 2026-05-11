"use client";

import { useEffect, useState } from "react";
import type { Issue, Newsletter } from "@/context/WorkspaceContext";

interface NewsletterEditModalProps {
  newsletter: Newsletter;
  issue: Issue;
  initialContent: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

const PLACEHOLDER = `**THE BRIEF**

## Your headline goes here

Write your first paragraph here. Use **bold** for emphasis. Add citations as [1] [2] and list the sources at the bottom.

**FIELD NOTES**

## Second section headline

Another paragraph.

---

## Sources

1. [Source name](https://example.com)`;

export function NewsletterEditModal({
  newsletter,
  issue,
  initialContent,
  onSave,
  onClose,
}: NewsletterEditModalProps) {
  const [draft, setDraft] = useState(initialContent);
  const dirty = draft !== initialContent;

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

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${newsletter.name} — ${issue.name}`}
    >
      <div className="flex h-[calc(100vh-2rem)] w-full max-w-[1080px] flex-col border border-line bg-paper">
        <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
              {newsletter.name}
            </div>
            <div className="mt-0.5 text-[18px] font-medium tracking-tight text-ink">
              Editing {issue.name}
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

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={PLACEHOLDER}
          autoFocus
          spellCheck
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && dirty) {
              e.preventDefault();
              onSave(draft);
            }
          }}
          className="min-h-0 w-full flex-1 resize-none border-0 bg-paper px-10 py-6 font-mono text-[14px] leading-[1.7] text-ink placeholder:text-ink-3 focus:outline-none"
        />

        <footer className="flex shrink-0 items-center justify-between border-t border-line px-6 py-3">
          <span className="text-[11px] text-ink-3">
            {dirty ? "Unsaved changes" : "Markdown · ⌘↵ to save · esc to close"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="border border-line bg-paper px-3 py-1.5 text-[12px] text-ink-2 hover:bg-veil hover:text-ink"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(draft)}
              disabled={!dirty}
              className="bg-accent px-3 py-1.5 text-[12px] font-medium text-white transition-opacity disabled:opacity-30"
            >
              Save
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
