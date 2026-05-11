"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";

type Field = "audience" | "voice" | "values";

const FIELD_LABEL: Record<Field, string> = {
  audience: "Audience",
  voice: "Voice",
  values: "Values",
};

const FIELD_HINT: Record<Field, string> = {
  audience: "Who reads this? Roles, seniority, what they care about.",
  voice: "How should it sound? Tone, register, words to avoid.",
  values: "What does the brand stand for? Editorial principles.",
};

const FIELD_PLACEHOLDER: Record<Field, string> = {
  audience: `# Audience

Describe the people this newsletter is written for.

## Roles
- ...

## What they care about
- ...

## What we never assume about them
- ...`,
  voice: `# Voice

Describe how this newsletter sounds.

## Tone
...

## Register
...

## Words to avoid
- ...`,
  values: `# Values

What this newsletter stands for.

## Editorial principles
- ...

## What we'd rather lose readers than do
- ...`,
};

export function StudioIdentity() {
  const { brand, updateBrand } = useWorkspace();
  const [openField, setOpenField] = useState<Field | null>(null);

  return (
    <>
      <div className="space-y-2 px-4 pb-4">
        {(["audience", "voice", "values"] as const).map((field) => (
          <IdentityCard
            key={field}
            field={field}
            value={brand[field] ?? ""}
            onClick={() => setOpenField(field)}
          />
        ))}
      </div>

      {openField && (
        <IdentityModal
          field={openField}
          value={brand[openField] ?? ""}
          onSave={(v) => {
            updateBrand({ [openField]: v });
            setOpenField(null);
          }}
          onClose={() => setOpenField(null)}
        />
      )}
    </>
  );
}

function IdentityCard({
  field,
  value,
  onClick,
}: {
  field: Field;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="block w-full border border-line bg-paper p-3 text-left transition-colors hover:bg-veil"
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-ink">{FIELD_LABEL[field]}</span>
        <span className="text-[10px] text-ink-3">▸</span>
      </div>
      {value ? (
        <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-2">
          {value}
        </div>
      ) : (
        <div className="mt-1 text-[11px] text-ink-3">{FIELD_HINT[field]}</div>
      )}
    </button>
  );
}

function IdentityModal({
  field,
  value,
  onSave,
  onClose,
}: {
  field: Field;
  value: string;
  onSave: (v: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const dirty = draft !== value;

  // Esc closes the modal.
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

  // Lock body scroll while modal is open.
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
      aria-label={`Edit ${FIELD_LABEL[field]}`}
    >
      <div className="flex h-[calc(100vh-2rem)] w-full max-w-[960px] flex-col border border-line bg-paper">
        <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
              Identity
            </div>
            <div className="mt-0.5 text-[18px] font-medium tracking-tight text-ink">
              {FIELD_LABEL[field]}
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
          placeholder={FIELD_PLACEHOLDER[field]}
          autoFocus
          spellCheck
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && dirty) {
              e.preventDefault();
              onSave(draft);
            }
          }}
          className="min-h-0 w-full flex-1 resize-none border-0 bg-paper px-8 py-6 font-mono text-[14px] leading-[1.7] text-ink placeholder:text-ink-3 focus:outline-none"
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
