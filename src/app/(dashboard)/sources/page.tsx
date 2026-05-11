"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/chrome/AppShell";
import { ChevronLeft, Trash } from "@/components/workspace/Icons";
import { useWorkspace, type Source } from "@/context/WorkspaceContext";

export default function SourcesPage() {
  const {
    newsletters,
    addSource,
    removeSource,
    updateSource,
    acceptSuggestedSource,
    dismissSuggestedSource,
  } = useWorkspace();
  const newsletter = newsletters[0];
  if (!newsletter) return null;

  return (
    <AppShell
      left={
        <Link
          href={`/workspace/${newsletter.id}`}
          className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-2 transition-colors hover:bg-veil hover:text-ink"
        >
          <ChevronLeft width={12} height={12} />
          Back to {newsletter.name}
        </Link>
      }
    >
      <div className="mx-auto h-full max-w-[760px] overflow-y-auto px-8 py-12">
        <header className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-3">
            Sources
          </div>
          <h1 className="mt-2 text-[36px] font-medium leading-[1.05] tracking-tight text-ink">
            What Marabel reads to draft {newsletter.name}
          </h1>
          <p className="mt-3 max-w-[52ch] text-[14px] text-ink-2">
            Add URLs to anything Marabel should monitor — blogs, RSS feeds,
            company posts. Marabel pulls new content from these into the
            drafting pipeline.
          </p>
        </header>

        <Section title="Add a source">
          <AddSourceForm
            onSubmit={(input) => addSource(newsletter.id, input)}
          />
        </Section>

        <Section
          title="Your sources"
          right={
            <span className="tabular text-[11px] text-ink-3">
              {newsletter.sources.length}
            </span>
          }
        >
          {newsletter.sources.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="border border-line bg-paper">
              {newsletter.sources.map((s, i) => (
                <SourceRow
                  key={s.id}
                  source={s}
                  isLast={i === newsletter.sources.length - 1}
                  onUpdate={(patch) => updateSource(newsletter.id, s.id, patch)}
                  onRemove={() => removeSource(newsletter.id, s.id)}
                />
              ))}
            </ul>
          )}
        </Section>

        {newsletter.suggestedSources.length > 0 && (
          <Section
            title="Suggested by Marabel"
            right={
              <span className="tabular text-[11px] text-ink-3">
                {newsletter.suggestedSources.length}
              </span>
            }
          >
            <p className="mb-3 text-[12px] text-ink-3">
              Based on your brand audience.
            </p>
            <ul className="space-y-2">
              {newsletter.suggestedSources.map((s) => (
                <li
                  key={s.id}
                  className="border border-dashed border-line-2 bg-paper p-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium text-ink">
                        {s.name}
                      </div>
                      <div className="mt-0.5 truncate text-[12px] text-ink-2">
                        {s.detail}
                      </div>
                      <div className="mt-1 text-[12px] text-ink-3">{s.reason}</div>
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <button
                        onClick={() => acceptSuggestedSource(newsletter.id, s.id)}
                        className="text-[12px] text-accent hover:underline"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => dismissSuggestedSource(newsletter.id, s.id)}
                        className="text-[12px] text-ink-3 hover:text-ink-2"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </AppShell>
  );
}

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 border-t border-line pt-8">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function AddSourceForm({
  onSubmit,
}: {
  onSubmit: (input: { name: string; url: string }) => void;
}) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    const auto = trimmed.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    onSubmit({ name: name.trim() || auto, url: trimmed });
    setUrl("");
    setName("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-paper p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px]">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-3">
            URL
          </span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/feed"
            className="mt-1 block w-full border border-line bg-paper px-2 py-1.5 text-[13px] text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-3">
            Display name (optional)
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Auto-detected"
            className="mt-1 block w-full border border-line bg-paper px-2 py-1.5 text-[13px] text-ink focus:border-accent focus:outline-none"
          />
        </label>
      </div>
      <div className="mt-3 flex items-center justify-end gap-3">
        {saved && <span className="text-[12px] text-emerald">Source added</span>}
        <button
          type="submit"
          disabled={!url.trim()}
          className="bg-accent px-3 py-1.5 text-[12px] font-medium text-white transition-opacity disabled:opacity-30"
        >
          Add source
        </button>
      </div>
    </form>
  );
}

function SourceRow({
  source,
  isLast,
  onUpdate,
  onRemove,
}: {
  source: Source;
  isLast: boolean;
  onUpdate: (patch: { name?: string; url?: string }) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(source.name);
  const [url, setUrl] = useState(source.url ?? "");

  function startEdit() {
    setName(source.name);
    setUrl(source.url ?? "");
    setEditing(true);
  }

  function save() {
    onUpdate({ name: name.trim() || source.name, url: url.trim() || source.url });
    setEditing(false);
  }

  if (editing) {
    return (
      <li
        className={`bg-chrome p-4 ${isLast ? "" : "border-b border-line"}`}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px]">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.12em] text-ink-3">
              URL
            </span>
            <input
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
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
              className="mt-1 block w-full border border-line bg-paper px-2 py-1.5 text-[13px] text-ink focus:border-accent focus:outline-none"
            />
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => setEditing(false)}
            className="border border-line bg-paper px-3 py-1 text-[12px] text-ink-2 hover:bg-veil hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="bg-accent px-3 py-1 text-[12px] font-medium text-white"
          >
            Save
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      className={`group flex items-start gap-3 px-4 py-3 ${
        isLast ? "" : "border-b border-line"
      }`}
    >
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dot-url" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-ink">
          {source.name}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-ink-2">
          {source.detail}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-3">
          {source.itemCount > 0 && (
            <span className="tabular">{source.itemCount} new</span>
          )}
          {source.itemCount > 0 && <span>·</span>}
          <span>{source.syncedAgo}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={startEdit}
          className="text-[12px] text-ink-2 hover:text-accent"
        >
          Edit
        </button>
        <button
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center text-ink-3 hover:text-rose"
          title={`Remove ${source.name}`}
          aria-label={`Remove ${source.name}`}
        >
          <Trash width={13} height={13} />
        </button>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-line-2 bg-paper p-8 text-center">
      <div className="text-[14px] text-ink-2">No sources yet.</div>
      <div className="mt-1 text-[12px] text-ink-3">
        Add your first URL above and Marabel will start monitoring it.
      </div>
    </div>
  );
}
