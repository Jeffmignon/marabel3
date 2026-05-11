import { Fragment, type ReactNode } from "react";

/**
 * Minimal markdown renderer for newsletter content.
 * Supports: # / ## / ### headings, paragraphs, bullet and numbered lists,
 * **bold**, [N] citation superscripts, [text](url) links, and horizontal rules.
 * Deliberately small — not a full CommonMark implementation.
 */
export function renderMarkdown(text: string): ReactNode {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, i) => (
        <Fragment key={i}>{renderBlock(block.trim(), i)}</Fragment>
      ))}
    </>
  );
}

function renderBlock(block: string, key: number): ReactNode {
  if (!block) return null;

  if (block === "---" || block === "***") {
    return <hr className="my-8 border-t border-line" />;
  }

  if (block.startsWith("### ")) {
    return (
      <h3 className="mt-8 mb-3 text-[18px] font-medium tracking-tight text-ink">
        {renderInline(block.slice(4))}
      </h3>
    );
  }
  if (block.startsWith("## ")) {
    return (
      <h2 className="mt-10 mb-4 text-[24px] font-medium leading-[1.2] tracking-tight text-ink">
        {renderInline(block.slice(3))}
      </h2>
    );
  }
  if (block.startsWith("# ")) {
    return (
      <h1 className="mt-10 mb-4 text-[32px] font-medium leading-[1.1] tracking-tight text-ink">
        {renderInline(block.slice(2))}
      </h1>
    );
  }

  const lines = block.split("\n");

  if (lines.every((l) => l.startsWith("- ") || l.startsWith("* "))) {
    return (
      <ul className="my-3 list-disc pl-6 space-y-1 text-ink">
        {lines.map((l, i) => (
          <li key={i}>{renderInline(l.slice(2))}</li>
        ))}
      </ul>
    );
  }

  if (lines.every((l) => /^\d+\.\s/.test(l))) {
    return (
      <ol className="my-3 list-decimal pl-6 space-y-1 text-ink">
        {lines.map((l, i) => (
          <li key={i}>{renderInline(l.replace(/^\d+\.\s/, ""))}</li>
        ))}
      </ol>
    );
  }

  if (lines.every((l) => l.startsWith("> "))) {
    return (
      <blockquote className="my-4 border-l-2 border-line-2 pl-4 text-ink-2 italic">
        {lines.map((l, i) => (
          <Fragment key={i}>
            {renderInline(l.slice(2))}
            {i < lines.length - 1 && <br />}
          </Fragment>
        ))}
      </blockquote>
    );
  }

  return <p className="my-3 text-ink leading-[1.65]">{renderInline(block)}</p>;
}

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let cursor = 0;
  // Bold | Citation [N] | Link [text](url)
  const regex = /\*\*([^*]+?)\*\*|\[(\d+)\](?!\()|\[([^\]]+?)\]\(([^)]+?)\)/g;

  let match;
  let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > cursor) {
      parts.push(<Fragment key={`t-${idx++}`}>{text.slice(cursor, match.index)}</Fragment>);
    }
    if (match[1]) {
      parts.push(
        <strong key={`b-${idx++}`} className="font-semibold">
          {match[1]}
        </strong>,
      );
    } else if (match[2]) {
      parts.push(
        <sup key={`c-${idx++}`} className="cite">
          {match[2]}
        </sup>,
      );
    } else if (match[3] && match[4]) {
      parts.push(
        <a
          key={`l-${idx++}`}
          href={match[4]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline-offset-2 hover:underline"
        >
          {match[3]}
        </a>,
      );
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    parts.push(<Fragment key={`t-${idx++}`}>{text.slice(cursor)}</Fragment>);
  }
  return parts.length === 0 ? text : parts;
}

/**
 * Convert markdown to HTML for export to Word.
 * Mirrors renderMarkdown's coverage; emits plain HTML strings.
 */
export function markdownToHtml(text: string): string {
  const blocks = text.trim().split(/\n{2,}/);
  return blocks
    .map((block) => htmlBlock(block.trim()))
    .filter(Boolean)
    .join("\n\n");
}

function htmlBlock(block: string): string {
  if (!block) return "";
  if (block === "---" || block === "***") return "<hr />";

  if (block.startsWith("### ")) return `<h3>${htmlInline(block.slice(4))}</h3>`;
  if (block.startsWith("## ")) return `<h2>${htmlInline(block.slice(3))}</h2>`;
  if (block.startsWith("# ")) return `<h1>${htmlInline(block.slice(2))}</h1>`;

  const lines = block.split("\n");

  if (lines.every((l) => l.startsWith("- ") || l.startsWith("* "))) {
    return `<ul>\n${lines.map((l) => `  <li>${htmlInline(l.slice(2))}</li>`).join("\n")}\n</ul>`;
  }
  if (lines.every((l) => /^\d+\.\s/.test(l))) {
    return `<ol>\n${lines
      .map((l) => `  <li>${htmlInline(l.replace(/^\d+\.\s/, ""))}</li>`)
      .join("\n")}\n</ol>`;
  }
  if (lines.every((l) => l.startsWith("> "))) {
    return `<blockquote>${lines
      .map((l) => htmlInline(l.slice(2)))
      .join("<br>")}</blockquote>`;
  }

  return `<p>${htmlInline(block)}</p>`;
}

function htmlInline(text: string): string {
  // Escape first, then re-introduce markup.
  let out = escapeHtml(text);
  // Bold
  out = out.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  // Links
  out = out.replace(
    /\[([^\]]+?)\]\(([^)]+?)\)/g,
    '<a href="$2">$1</a>',
  );
  // Citations (must run after links so [text](url) was already consumed)
  out = out.replace(/\[(\d+)\](?!\()/g, "<sup>[$1]</sup>");
  return out;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
