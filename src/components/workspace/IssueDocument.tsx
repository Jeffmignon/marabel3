"use client";

import { useState } from "react";
import type {
  DocParagraph,
  DocSection,
  Issue,
  Newsletter,
} from "@/context/WorkspaceContext";
import { EditableText } from "./EditableText";
import { ChevronDown, ChevronUp, Download, Plus, Trash } from "./Icons";
import { downloadIssueAsDoc } from "@/lib/exportDoc";

interface IssueDocumentProps {
  newsletter: Newsletter;
  issue: Issue;
  sections: DocSection[];
  onSectionsChange: (next: DocSection[]) => void;
  readOnly?: boolean;
}

export function IssueDocument({
  newsletter,
  issue,
  sections,
  onSectionsChange,
  readOnly,
}: IssueDocumentProps) {
  const isEmpty = sections.length === 0;

  function updateSection(id: string, patch: Partial<DocSection>) {
    onSectionsChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function updateParagraph(sectionId: string, paragraphId: string, body: string) {
    onSectionsChange(
      sections.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              paragraphs: s.paragraphs.map((p) =>
                p.id === paragraphId ? { ...p, body } : p,
              ),
            },
      ),
    );
  }

  function moveSection(id: string, direction: -1 | 1) {
    const idx = sections.findIndex((s) => s.id === id);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    onSectionsChange(next);
  }

  function deleteSection(id: string) {
    onSectionsChange(sections.filter((s) => s.id !== id));
  }

  function addSection() {
    const next: DocSection = {
      id: `s-${Date.now()}`,
      label: "New section",
      headline: "Section headline",
      paragraphs: [
        {
          id: `p-${Date.now()}`,
          body: "Write your content here, or let Marabel draft from your sources.",
          cites: [],
        },
      ],
      sources: [],
    };
    onSectionsChange([...sections, next]);
  }

  function addParagraph(sectionId: string) {
    onSectionsChange(
      sections.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              paragraphs: [
                ...s.paragraphs,
                {
                  id: `p-${Date.now()}`,
                  body: "Write your paragraph here.",
                  cites: [],
                },
              ],
            },
      ),
    );
  }

  function deleteParagraph(sectionId: string, paragraphId: string) {
    onSectionsChange(
      sections.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, paragraphs: s.paragraphs.filter((p) => p.id !== paragraphId) },
      ),
    );
  }

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-paper">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-6">
        <div className="flex items-baseline gap-3">
          <span className="text-[14px] font-medium text-ink">{issue.name}</span>
          <span className="text-[12px] text-ink-3">·</span>
          <span className="text-[12px] text-ink-2">
            sends {issue.date ?? "—"} &middot;{" "}
            {newsletter.schedule.timezone.replace(/_/g, " ")}
          </span>
          {!isEmpty && !readOnly && (
            <span className="ml-2 text-[11px] text-ink-3">click any text to edit</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadIssueAsDoc(newsletter, issue, sections)}
            disabled={isEmpty}
            className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-2 transition-colors hover:bg-veil hover:text-ink disabled:opacity-40 disabled:hover:bg-paper disabled:hover:text-ink-2"
            title={isEmpty ? "Nothing to download yet" : "Download as Word document"}
          >
            <Download width={12} height={12} />
            Download
          </button>
          <StatusPill status={issue.status} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyDocumentState
            newsletter={newsletter}
            issue={issue}
            readOnly={readOnly}
            onAddSection={addSection}
          />
        ) : (
          <article className="mx-auto max-w-[680px] px-8 py-12">
            <header className="mb-12">
              <div className="text-[11px] uppercase tracking-[0.16em] text-ink-3">
                {newsletter.name}
              </div>
              <h1 className="mt-2 text-[36px] font-medium leading-[1.1] tracking-tight text-ink">
                {issue.name}
              </h1>
              <div className="mt-3 text-[13px] text-ink-2">
                {readOnly
                  ? `Published ${issue.date}`
                  : "Drafted by Marabel · last updated 2 minutes ago"}
              </div>
            </header>

            {sections.map((s, idx) => (
              <SectionBlock
                key={s.id}
                section={s}
                index={idx}
                total={sections.length}
                readOnly={!!readOnly}
                onLabelChange={(label) => updateSection(s.id, { label })}
                onHeadlineChange={(headline) => updateSection(s.id, { headline })}
                onParagraphChange={(pid, body) => updateParagraph(s.id, pid, body)}
                onMoveUp={() => moveSection(s.id, -1)}
                onMoveDown={() => moveSection(s.id, 1)}
                onDelete={() => deleteSection(s.id)}
                onAddParagraph={() => addParagraph(s.id)}
                onDeleteParagraph={(pid) => deleteParagraph(s.id, pid)}
              />
            ))}

            {!readOnly && (
              <div className="mt-6 mb-12 flex justify-center">
                <button
                  onClick={addSection}
                  className="inline-flex items-center gap-2 border border-line bg-paper px-4 py-2 text-[13px] text-ink-2 transition-colors hover:bg-veil hover:text-ink"
                >
                  <Plus width={14} height={14} />
                  Add section
                </button>
              </div>
            )}
          </article>
        )}
      </div>
    </main>
  );
}

function SectionBlock({
  section,
  index,
  total,
  readOnly,
  onLabelChange,
  onHeadlineChange,
  onParagraphChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAddParagraph,
  onDeleteParagraph,
}: {
  section: DocSection;
  index: number;
  total: number;
  readOnly: boolean;
  onLabelChange: (label: string) => void;
  onHeadlineChange: (headline: string) => void;
  onParagraphChange: (paragraphId: string, body: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onAddParagraph: () => void;
  onDeleteParagraph: (paragraphId: string) => void;
}) {
  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;

  return (
    <section className="mb-14">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-px w-6 shrink-0 bg-ink-3" />
          {readOnly ? (
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-3">
              {section.label}
            </span>
          ) : (
            <EditableText
              value={section.label}
              onChange={onLabelChange}
              className="text-[10px] uppercase tracking-[0.18em] text-ink-3"
              ariaLabel="Section label"
            />
          )}
        </div>
        {!readOnly && (
          <SectionControls
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDelete={onDelete}
          />
        )}
      </div>

      {readOnly ? (
        <h2 className="mb-5 text-[24px] font-medium leading-[1.2] tracking-tight text-ink">
          {section.headline}
        </h2>
      ) : (
        <EditableText
          value={section.headline}
          onChange={onHeadlineChange}
          className="mb-5 text-[24px] font-medium leading-[1.2] tracking-tight text-ink"
          ariaLabel="Section headline"
        />
      )}

      <div className="doc-body">
        {section.paragraphs.map((p) => (
          <ParagraphRow
            key={p.id}
            paragraph={p}
            sources={section.sources}
            readOnly={readOnly}
            onChange={(body) => onParagraphChange(p.id, body)}
            onDelete={
              section.paragraphs.length > 1
                ? () => onDeleteParagraph(p.id)
                : undefined
            }
          />
        ))}
      </div>

      {!readOnly && (
        <button
          onClick={onAddParagraph}
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-ink-3 transition-colors hover:text-accent"
        >
          <Plus width={12} height={12} />
          Add paragraph
        </button>
      )}

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3">
        {section.sources.map((src) => (
          <a
            key={src.id}
            href="#"
            className="text-[11px] text-ink-3 hover:text-accent"
            title={src.url}
          >
            <span className="cite mr-1.5">{src.id}</span>
            {src.name}
          </a>
        ))}
        {section.sources.length === 0 && (
          <span className="text-[11px] text-ink-3">No sources cited</span>
        )}
      </div>
    </section>
  );
}

function SectionControls({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-px">
      <CtrlBtn label="Move section up" onClick={onMoveUp} disabled={!canMoveUp}>
        <ChevronUp width={12} height={12} />
      </CtrlBtn>
      <CtrlBtn label="Move section down" onClick={onMoveDown} disabled={!canMoveDown}>
        <ChevronDown width={12} height={12} />
      </CtrlBtn>
      <CtrlBtn label="Delete section" onClick={onDelete} danger>
        <Trash width={12} height={12} />
      </CtrlBtn>
    </div>
  );
}

function CtrlBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-6 w-6 items-center justify-center border border-transparent transition-colors disabled:opacity-25 ${
        danger
          ? "text-ink-3 hover:border-rose hover:bg-rose-tint hover:text-rose"
          : "text-ink-3 hover:border-line hover:bg-veil hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function ParagraphRow({
  paragraph,
  sources,
  readOnly,
  onChange,
  onDelete,
}: {
  paragraph: DocParagraph;
  sources: { id: number; name: string; url: string }[];
  readOnly: boolean;
  onChange: (next: string) => void;
  onDelete?: () => void;
}) {
  const [hover, setHover] = useState(false);

  if (readOnly) {
    return (
      <p>
        {paragraph.body}
        {paragraph.cites.map((c) => (
          <span
            key={c}
            className="cite"
            title={sources.find((src) => src.id === c)?.name}
          >
            {c}
          </span>
        ))}
      </p>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <p>
        <EditableText
          value={paragraph.body}
          onChange={onChange}
          multiline
          className="inline"
          ariaLabel="Paragraph body"
        />
        {paragraph.cites.map((c) => (
          <span
            key={c}
            className="cite"
            title={sources.find((src) => src.id === c)?.name}
          >
            {c}
          </span>
        ))}
      </p>
      {onDelete && hover && (
        <button
          onClick={onDelete}
          className="absolute -right-7 top-1 flex h-6 w-6 items-center justify-center border border-line bg-paper text-ink-3 transition-colors hover:border-rose hover:bg-rose-tint hover:text-rose"
          title="Delete paragraph"
          aria-label="Delete paragraph"
        >
          <Trash width={11} height={11} />
        </button>
      )}
    </div>
  );
}

function EmptyDocumentState({
  newsletter,
  issue,
  readOnly,
  onAddSection,
}: {
  newsletter: Newsletter;
  issue: Issue;
  readOnly?: boolean;
  onAddSection: () => void;
}) {
  if (readOnly) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 py-16">
        <div className="max-w-[440px] text-center">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-3">
            {issue.name}
          </div>
          <h2 className="mt-4 text-[28px] font-medium leading-[1.1] tracking-tight text-ink">
            Published {issue.date}.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-2">
            This issue&apos;s body content isn&apos;t preserved in this prototype.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-16">
      <div className="max-w-[440px] text-center">
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-3">
          {issue.name}
        </div>
        <h2 className="mt-4 text-[28px] font-medium leading-[1.1] tracking-tight text-ink">
          Blank canvas.
        </h2>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-2">
          Add your first section to start drafting {newsletter.name}. Each
          section becomes a block in the published newsletter.
        </p>
        <button
          onClick={onAddSection}
          className="mt-8 inline-flex items-center gap-2 bg-accent px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus width={14} height={14} />
          Add section
        </button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Issue["status"] }) {
  const map = {
    draft: { label: "Draft", color: "bg-ink-4 text-ink-2" },
    in_progress: { label: "In progress", color: "bg-amber-tint text-amber" },
    published: { label: "Published", color: "bg-emerald-tint text-emerald" },
    archived: { label: "Archived", color: "bg-veil text-ink-3" },
  } as const;
  const v = map[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium ${v.color}`}
    >
      {v.label}
    </span>
  );
}
