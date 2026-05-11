"use client";

import { useEffect, useRef, useState } from "react";

interface CommentPopoverProps {
  rect: DOMRect;
  anchor: string;
  onSubmit: (body: string) => void;
  onClose: () => void;
}

export function CommentPopover({ rect, anchor, onSubmit, onClose }: CommentPopoverProps) {
  const [body, setBody] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    function onMouse(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouse);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouse);
    };
  }, [onClose]);

  const top = Math.min(window.innerHeight - 200, rect.bottom + 12);
  const left = Math.min(window.innerWidth - 360, Math.max(8, rect.left));

  return (
    <div
      ref={ref}
      style={{ position: "fixed", top, left, zIndex: 60, width: 340 }}
      className="border border-line bg-paper shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
    >
      <div className="border-b border-line px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ink-3">
        Comment
      </div>
      <div className="border-b border-line bg-amber-tint/40 px-3 py-2 text-[12px] italic text-ink-2">
        “{truncate(anchor, 120)}”
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = body.trim();
          if (!trimmed) return;
          onSubmit(trimmed);
        }}
        className="p-3"
      >
        <textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && body.trim()) {
              e.preventDefault();
              onSubmit(body.trim());
            }
          }}
          rows={3}
          placeholder="Leave a comment…"
          className="block w-full resize-none border border-line bg-paper px-2 py-1.5 text-[13px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-ink-3">⌘↵ to post</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-2 hover:bg-veil hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!body.trim()}
              className="bg-accent px-2.5 py-1 text-[12px] font-medium text-white transition-opacity disabled:opacity-30"
            >
              Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}
