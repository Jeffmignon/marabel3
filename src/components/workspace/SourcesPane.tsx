"use client";

import { useRef, useState } from "react";
import type { Newsletter, SourceType } from "@/context/WorkspaceContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ChevronLeft, Trash } from "./Icons";

const dotClass: Record<SourceType, string> = {
  url: "bg-dot-url",
  doc: "bg-dot-doc",
};

const typeLabel: Record<SourceType, string> = {
  url: "URL",
  doc: "Doc",
};

interface SourcesPaneProps {
  newsletter: Newsletter;
  onCollapse?: () => void;
}

export function SourcesPane({ newsletter, onCollapse }: SourcesPaneProps) {
  const { addSource, removeSource, acceptSuggestedSource, dismissSuggestedSource } =
    useWorkspace();
  const [filter, setFilter] = useState<SourceType | "all">("all");
  const [adding, setAdding] = useState(false);

  const sources = newsletter.sources;
  const filtered = filter === "all" ? sources : sources.filter((s) => s.type === filter);

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
            {adding ? "Close" : "+ Add"}
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

      <div className="flex gap-1 border-b border-line px-4 py-2">
        <FilterPill label="All" active={filter === "all"} onClick={() => setFilter("all")} />
        <FilterPill label="URLs" active={filter === "url"} onClick={() => setFilter("url")} dot="url" />
        <FilterPill label="Docs" active={filter === "doc"} onClick={() => setFilter("doc")} dot="doc" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-[13px] text-ink-2">
              {sources.length === 0 ? "No sources yet" : "No sources match this filter"}
            </div>
            {sources.length === 0 && (
              <button
                onClick={() => setAdding(true)}
                className="mt-2 text-[12px] text-accent hover:underline"
              >
                Add your first source
              </button>
            )}
          </div>
        ) : (
          <ul>
            {filtered.map((s) => (
              <li
                key={s.id}
                className="group relative flex items-start gap-3 border-b border-line px-4 py-3 hover:bg-veil"
              >
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${dotClass[s.type]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[13px] font-medium text-ink">{s.name}</span>
                    <span className="shrink-0 text-[10px] uppercase tracking-wider text-ink-3">
                      {typeLabel[s.type]}
                    </span>
                  </div>
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
  onSubmit: (input: { type: SourceType; name: string; url?: string; fileName?: string }) => void;
}) {
  const [tab, setTab] = useState<SourceType>("url");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (!name) setName(file.name);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "url") {
      const trimmed = url.trim();
      if (!trimmed) return;
      const auto = trimmed.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      onSubmit({ type: "url", name: name.trim() || auto, url: trimmed });
    } else {
      if (!fileName) return;
      onSubmit({ type: "doc", name: name.trim() || fileName, fileName });
    }
  }

  const canSubmit = tab === "url" ? !!url.trim() : !!fileName;

  return (
    <form onSubmit={handleSubmit} className="border-b border-line bg-chrome p-4">
      <div className="mb-3 flex border border-line bg-paper">
        <TabButton label="URL" active={tab === "url"} onClick={() => setTab("url")} />
        <TabButton label="Document" active={tab === "doc"} onClick={() => setTab("doc")} />
      </div>

      {tab === "url" ? (
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
      ) : (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            onChange={handleFile}
            accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="block w-full border border-dashed border-line-2 bg-paper px-3 py-4 text-center text-[12px] text-ink-2 hover:border-accent hover:bg-veil"
          >
            {fileName ? (
              <span className="text-ink">{fileName}</span>
            ) : (
              <>
                <span className="text-ink-2">Choose a file</span>
                <span className="mt-1 block text-[10px] text-ink-3">
                  PDF, DOCX, TXT, CSV — up to 25MB
                </span>
              </>
            )}
          </button>
          {fileName && (
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.12em] text-ink-3">
                Display name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={fileName}
                className="mt-1 block w-full border border-line bg-paper px-2 py-1.5 text-[13px] text-ink focus:border-accent focus:outline-none"
              />
            </label>
          )}
        </div>
      )}

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
          disabled={!canSubmit}
          className="bg-accent px-3 py-1 text-[12px] font-medium text-white transition-opacity disabled:opacity-30"
        >
          Add source
        </button>
      </div>
    </form>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-1.5 text-[12px] transition-colors ${
        active ? "bg-accent text-white" : "text-ink-2 hover:bg-veil hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  dot,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dot?: SourceType;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] transition-colors ${
        active ? "bg-accent text-white" : "text-ink-2 hover:bg-veil hover:text-ink"
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClass[dot]}`} />}
      {label}
    </button>
  );
}
