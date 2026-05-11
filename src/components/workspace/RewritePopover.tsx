"use client";

import { useEffect, useState } from "react";

interface RewritePopoverProps {
  /** Where the selection was when the popover opened (viewport-relative). */
  rect: DOMRect;
  /** A snapshot of the highlighted text — frozen at open time so it survives
   *  the user clicking into the popover (which collapses the live selection). */
  selection: string;
  onApply: (rewritten: string) => void;
  onClose: () => void;
}

export function RewritePopover({
  rect,
  selection,
  onApply,
  onClose,
}: RewritePopoverProps) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);

  // Esc closes — but no document mousedown listener (the prior version
  // closed the popover the moment the user clicked into the input).
  // Clicks outside are handled by the transparent backdrop below.
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

  function submit() {
    setLoading(true);
    setTimeout(() => {
      const rewritten = fakeRewrite(selection, instruction);
      onApply(rewritten);
    }, 600);
  }

  const top = Math.min(window.innerHeight - 240, rect.bottom + 12);
  const left = Math.min(window.innerWidth - 420, Math.max(8, rect.left));

  return (
    <>
      {/* Transparent backdrop — clicking it (anywhere outside the popover)
          closes. Clicks inside the popover do not propagate here. */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50"
        aria-hidden="true"
      />
      <div
        style={{ position: "fixed", top, left, zIndex: 60, width: 400 }}
        className="border border-line bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
      >
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-3">
          Tell Marabel what to change
        </span>
        <button
          onClick={onClose}
          className="text-[16px] leading-none text-ink-3 hover:text-ink"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="border-b border-line bg-amber-tint/40 px-3 py-2 text-[12px] italic text-ink-2">
        “{truncate(selection, 160)}”
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-6 text-[12px] text-ink-3">
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="p-3"
        >
          <input
            autoFocus
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="What should change? (e.g. shorter, punchier, more formal)"
            className="block w-full border border-line bg-paper px-2 py-1.5 text-[13px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="bg-accent px-3 py-1.5 text-[12px] font-medium text-white"
            >
              ✨ AI rewrite
            </button>
          </div>
        </form>
      )}
      </div>
    </>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-3"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

function fakeRewrite(text: string, instruction: string): string {
  const t = instruction.toLowerCase().trim();

  if (!t) {
    return `${text.trim()} — that's the part most teams underestimate.`;
  }
  if (/shorter|tighter|trim|concise/.test(t)) {
    const first = text.split(/(?<=[.!?])\s+/)[0] ?? text;
    return first.trim();
  }
  if (/punch|sharp|stronger|crisp/.test(t)) {
    return text
      .replace(/\b(very|really|quite|just|kind of|sort of|fairly|somewhat)\s+/gi, "")
      .replace(/\bin order to\b/gi, "to")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (/longer|expand|more depth|elaborate/.test(t)) {
    return (
      text.trim() +
      " The second-order effects are what most teams miss — and they're where the actual moat gets built."
    );
  }
  if (/formal|professional|polish/.test(t)) {
    return text
      .replace(/\bdon't\b/gi, "do not")
      .replace(/\bwon't\b/gi, "will not")
      .replace(/\bcan't\b/gi, "cannot")
      .replace(/\bisn't\b/gi, "is not")
      .replace(/\baren't\b/gi, "are not")
      .replace(/\bwe're\b/gi, "we are");
  }
  if (/casual|conversational|relax|loosen/.test(t)) {
    return text
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bwill not\b/gi, "won't")
      .replace(/\bcannot\b/gi, "can't");
  }

  return `${text.trim()} — rewritten for "${t}".`;
}
