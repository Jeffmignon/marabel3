"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/chrome/AppShell";
import { ChevronLeft, Trash } from "@/components/workspace/Icons";
import { useWorkspace, type Source } from "@/context/WorkspaceContext";

type ViewMode = "all" | "by_newsletter";

interface SourceWithOwner {
  newsletterId: string;
  newsletterName: string;
  source: Source;
}

export default function SourcesPage() {
  const { newsletters, removeSource, updateSource } = useWorkspace();
  const [view, setView] = useState<ViewMode>("all");

  const all: SourceWithOwner[] = useMemo(() => {
    const out: SourceWithOwner[] = [];
    for (const nl of newsletters) {
      for (const s of nl.sources) {
        out.push({ newsletterId: nl.id, newsletterName: nl.name, source: s });
      }
    }
    return out;
  }, [newsletters]);

  return (
    <AppShell
      left={
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-2 transition-colors hover:bg-veil hover:text-ink"
        >
          <ChevronLeft width={12} height={12} />
          All issues
        </Link>
      }
    >
      <div className="mx-auto h-full max-w-[820px] overflow-y-auto px-8 py-8">
        <div className="mb-4 flex items-center gap-2">
          <ViewChip
            label="All"
            count={all.length}
            active={view === "all"}
            onClick={() => setView("all")}
          />
          <ViewChip
            label="By newsletter"
            count={newsletters.length}
            active={view === "by_newsletter"}
            onClick={() => setView("by_newsletter")}
          />
        </div>

        {view === "all" ? (
          all.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="border-y border-line">
              {all.map(({ newsletterId, newsletterName, source }) => (
                <SourceRow
                  key={`${newsletterId}-${source.id}`}
                  source={source}
                  newsletterName={newsletterName}
                  onUpdate={(patch) => updateSource(newsletterId, source.id, patch)}
                  onRemove={() => removeSource(newsletterId, source.id)}
                />
              ))}
            </ul>
          )
        ) : (
          <div className="space-y-8">
            {newsletters.map((nl) => (
              <NewsletterGroup
                key={nl.id}
                newsletterId={nl.id}
                newsletterName={nl.name}
                sources={nl.sources}
                onUpdate={(sourceId, patch) => updateSource(nl.id, sourceId, patch)}
                onRemove={(sourceId) => removeSource(nl.id, sourceId)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ViewChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[12px] transition-colors ${
        active
          ? "border-accent bg-accent text-white"
          : "border-line bg-paper text-ink-2 hover:border-line-2 hover:text-ink"
      }`}
    >
      <span>{label}</span>
      <span
        className={`tabular text-[11px] ${
          active ? "text-white/70" : "text-ink-3"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function NewsletterGroup({
  newsletterId,
  newsletterName,
  sources,
  onUpdate,
  onRemove,
}: {
  newsletterId: string;
  newsletterName: string;
  sources: Source[];
  onUpdate: (sourceId: string, patch: { name?: string; url?: string }) => void;
  onRemove: (sourceId: string) => void;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
          {newsletterName}
        </h2>
        <span className="tabular text-[11px] text-ink-3">{sources.length}</span>
      </div>
      {sources.length === 0 ? (
        <div className="border border-dashed border-line-2 bg-paper p-4 text-[12px] text-ink-3">
          No sources for {newsletterName} yet.
        </div>
      ) : (
        <ul className="border-y border-line">
          {sources.map((s) => (
            <SourceRow
              key={`${newsletterId}-${s.id}`}
              source={s}
              onUpdate={(patch) => onUpdate(s.id, patch)}
              onRemove={() => onRemove(s.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function SourceRow({
  source,
  newsletterName,
  onUpdate,
  onRemove,
}: {
  source: Source;
  /** Only shown in the All view; omitted in the By-newsletter view. */
  newsletterName?: string;
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
      <li className="border-b border-line bg-chrome p-4 last:border-0">
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
    <li className="group flex items-start gap-3 border-b border-line bg-paper px-4 py-3 last:border-0">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dot-url" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-ink">
          {source.name}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-ink-2">
          {source.detail}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-3">
          {newsletterName && (
            <>
              <span className="uppercase tracking-wider">{newsletterName}</span>
              <span>·</span>
            </>
          )}
          {source.itemCount > 0 && (
            <>
              <span className="tabular">{source.itemCount} new</span>
              <span>·</span>
            </>
          )}
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
      <div className="text-[14px] text-ink-2">No sources yet across any newsletter.</div>
    </div>
  );
}
