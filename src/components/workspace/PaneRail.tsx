"use client";

import { ChevronLeft, ChevronRight, PanelLeft, PanelRight } from "./Icons";

interface PaneRailProps {
  side: "left" | "right";
  label: string;
  onExpand: () => void;
}

export function PaneRail({ side, label, onExpand }: PaneRailProps) {
  const isLeft = side === "left";
  const Panel = isLeft ? PanelLeft : PanelRight;
  const Chevron = isLeft ? ChevronRight : ChevronLeft;

  return (
    <button
      onClick={onExpand}
      className={`group flex h-full w-12 shrink-0 flex-col items-center bg-paper transition-colors hover:bg-veil ${
        isLeft ? "border-r border-line" : "border-l border-line"
      }`}
      title={`Expand ${label}`}
      aria-label={`Expand ${label}`}
    >
      <span className="flex h-11 w-full items-center justify-center border-b border-line text-ink-3 group-hover:text-ink">
        <Chevron width={16} height={16} />
      </span>
      <span className="mt-3 flex flex-col items-center gap-2 text-ink-3 group-hover:text-ink-2">
        <Panel width={16} height={16} />
        <span
          className="text-[10px] uppercase tracking-[0.16em]"
          style={{ writingMode: "vertical-rl" }}
        >
          {label}
        </span>
      </span>
    </button>
  );
}
