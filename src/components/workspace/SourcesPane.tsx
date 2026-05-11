"use client";

import { useState } from "react";
import type { Newsletter } from "@/context/WorkspaceContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ChevronLeft, Trash } from "./Icons";

interface SourcesPaneProps {
  newsletter: Newsletter;
  onCollapse?: () => void;
}

export function SourcesPane({ newsletter, onCollapse }: SourcesPaneProps) {
  const { addSource, removeSource, acceptSuggestedSource, dismissSuggestedSource } =
    useWorkspace();
  const [adding, setAdding] = useState(false);

  const sources = newsletter.sources;

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-line bg-paper">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-3">Sources</span>
          <span className="tabular text-[11px] text-ink-3">{sources.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdding((v) => !v)}
            className={`text-[12px] transition-colors ${
              adding ? "text-ink" : "text-ink-2 hover:text-ink"
            }`}
          >
            {adding ? "Close" : "+ Add URL"}
          </button>
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
      </div>

      {adding && (
        <AddSourceForm
          onCancel={() => setAdding(false)}
          onSubmit={(input) => {
            addSource(newsletter.id, input);
            setAdding(false);
          }}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {sources.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-[13px] text-ink-2">No sources yet</div>
            <button
              onClick={() => setAdding(true)}
              className="mt-2 text-[12px] text-accent hover:underline"
            >
              Add your first URL
            </button>
          </div>
        ) : (
          <ul>
            {sources.map((s) => (
              <li
                key={s.id}
                className="group relative flex items-start gap-3 border-b border-line px-4 py-3 hover:bg-veil"
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
                <button
                  onClick={() => removeSource(newsletter.id, s.id)}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center text-ink-3 opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                  title="Remove source"
                  aria-label={`Remove ${s.name}`}
                >
                  <Trash width={13} height={13} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {newsletter.suggestedSources.length > 0 && (
          <>
            <div className="px-4 pt-6 pb-3">
              <div className="text-[10px] uppercase tracking-[0.12em] text-ink-3">
                Suggested by Marabel
              </div>
              <div className="mt-1 text-[11px] text-ink-3">Based on your audience</div>
            </div>
            <ul className="px-4 pb-6">
              {newsletter.suggestedSources.map((s) => (
                <li
                  key={s.id}
                  className="mb-2 border border-dashed border-line-2 bg-paper p-3 last:mb-0"
                >
                  <div className="text-[13px] font-medium text-ink">{s.name}</div>
                  <div className="mt-0.5 truncate text-[11px] text-ink-2">{s.detail}</div>
                  <div className="mt-0.5 text-[11px] text-ink-3">{s.reason}</div>
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => acceptSuggestedSource(newsletter.id, s.id)}
                      className="text-[11px] text-accent hover:underline"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => dismissSuggestedSource(newsletter.id, s.id)}
                      className="text-[11px] text-ink-3 hover:text-ink-2"
                    >
                      Dismiss
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}

function AddSourceForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (input: { name: string; url: string }) => void;
}) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    const auto = trimmed.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    onSubmit({ name: name.trim() || auto, url: trimmed });
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-line bg-chrome p-4">
      <div className="space-y-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-3">URL</span>
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/feed"
            className="mt-1 block w-full border border-line bg-paper px-2 py-1.5 text-[13px] text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-3">
            Display name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Auto-detected"
            className="mt-1 block w-full border border-line bg-paper px-2 py-1.5 text-[13px] text-ink focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="border border-line bg-paper px-3 py-1 text-[12px] text-ink-2 hover:bg-veil hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!url.trim()}
          className="bg-accent px-3 py-1 text-[12px] font-medium text-white transition-opacity disabled:opacity-30"
        >
          Add source
        </button>
      </div>
    </form>
  );
}
