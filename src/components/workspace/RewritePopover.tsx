"use client";

import { useEffect, useRef, useState } from "react";

interface RewritePopoverProps {
  rect: DOMRect;
  selection: string;
  onAccept: (next: string) => void;
  onClose: () => void;
}

type Phase = "instruct" | "thinking" | "result";

export function RewritePopover({
  rect,
  selection,
  onAccept,
  onClose,
}: RewritePopoverProps) {
  const [instruction, setInstruction] = useState("");
  const [phase, setPhase] = useState<Phase>("instruct");
  const [candidate, setCandidate] = useState("");
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

  function generate() {
    setPhase("thinking");
    setTimeout(() => {
      setCandidate(fakeRewrite(selection, instruction));
      setPhase("result");
    }, 600);
  }

  const top = Math.min(window.innerHeight - 240, rect.bottom + 12);
  const left = Math.min(window.innerWidth - 420, Math.max(8, rect.left));

  return (
    <div
      ref={ref}
      style={{ position: "fixed", top, left, zIndex: 60, width: 400 }}
      className="border border-line bg-paper shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-3">
          {phase === "result" ? "Marabel rewrote it" : "Ask Marabel to rewrite"}
        </span>
        <button
          onClick={onClose}
          className="text-[16px] leading-none text-ink-3 hover:text-ink"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {phase === "instruct" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
          className="p-3"
        >
          <input
            autoFocus
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="How should it be rewritten?"
            className="block w-full border border-line bg-paper px-2 py-1.5 text-[13px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
        </form>
      )}

      {phase === "thinking" && (
        <div className="flex items-center justify-center gap-2 p-6 text-[12px] text-ink-3">
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </div>
      )}

      {phase === "result" && (
        <div className="p-3">
          <div className="border border-accent bg-accent-tint/40 p-3 text-[13px] leading-relaxed text-ink">
            {candidate}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => onAccept(candidate)}
              className="bg-accent px-3 py-1.5 text-[12px] font-medium text-white"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
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

function fakeRewrite(text: string, instruction: string): string {
  const t = instruction.toLowerCase();

  if (/shorter|tighter|trim/.test(t)) {
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
  if (/casual|conversational|relax/.test(t)) {
    return text
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bwill not\b/gi, "won't")
      .replace(/\bcannot\b/gi, "can't");
  }

  return `${text.trim()} — that's the part most teams underestimate.`;
}
