"use client";

import Link from "next/link";
import type { Newsletter } from "@/context/WorkspaceContext";
import { ChevronLeft } from "./Icons";

const RAIL_LIMIT = 5;

interface SourcesPaneProps {
  newsletter: Newsletter;
  onCollapse?: () => void;
}

export function SourcesPane({ newsletter, onCollapse }: SourcesPaneProps) {
  const sources = newsletter.sources;
  const visible = sources.slice(0, RAIL_LIMIT);
  const hidden = Math.max(0, sources.length - RAIL_LIMIT);

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-line bg-paper">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-3">Sources</span>
          <span className="tabular text-[11px] text-ink-3">{sources.length}</span>
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="flex h-7 w-7 items-center justify-center text-ink-3 hover:bg-veil hover:text-ink"
            title="Collapse Sources"
            aria-label="Collapse Sources"
          >
            <ChevronLeft />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {sources.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-[13px] text-ink-2">No sources yet</div>
            <Link
              href="/sources"
              className="mt-2 inline-block text-[12px] text-accent hover:underline"
            >
              Add your first URL →
            </Link>
          </div>
        ) : (
          <ul>
            {visible.map((s) => (
              <li
                key={s.id}
                className="flex items-start gap-3 border-b border-line px-4 py-3"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dot-url" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink">{s.name}</div>
                  <div className="mt-0.5 truncate text-[11px] text-ink-2">{s.detail}</div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-ink-3">
                    {s.itemCount > 0 && <span className="tabular">{s.itemCount} new</span>}
                    {s.itemCount > 0 && <span>·</span>}
                    <span>{s.syncedAgo}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="px-4 py-4">
          <Link
            href="/sources"
            className="flex items-center justify-between border border-line bg-paper px-3 py-2 text-[12px] text-ink-2 transition-colors hover:bg-veil hover:text-ink"
          >
            <span className="font-medium">
              {sources.length === 0 ? "Manage sources" : "See all sources"}
            </span>
            <span className="text-ink-3">
              {hidden > 0 ? `+${hidden} more →` : "→"}
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
