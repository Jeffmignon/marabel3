import type { DocSection, Issue, Newsletter } from "@/context/WorkspaceContext";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildDocHtml(
  newsletter: Newsletter,
  issue: Issue,
  sections: DocSection[],
): string {
  const sectionsHtml = sections
    .map((s) => {
      const paragraphs = s.paragraphs
        .map((p) => {
          const cites = p.cites.map((c) => `<sup>[${c}]</sup>`).join("");
          return `<p>${escapeHtml(p.body)}${cites}</p>`;
        })
        .join("\n");

      const sourcesList =
        s.sources.length > 0
          ? `<p style="font-size:9pt;color:#666;margin-top:8pt;"><em>Sources</em></p>
<ol style="font-size:9pt;color:#666;">
${s.sources
  .map(
    (src) =>
      `<li>${escapeHtml(src.name)}${src.url ? ` &mdash; ${escapeHtml(src.url)}` : ""}</li>`,
  )
  .join("\n")}
</ol>`
          : "";

      return `<div class="section-label">${escapeHtml(s.label)}</div>
<h2>${escapeHtml(s.headline)}</h2>
${paragraphs}
${sourcesList}`;
    })
    .join("\n\n");

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(newsletter.name)} &mdash; ${escapeHtml(issue.name)}</title>
  <style>
    body { font-family: Calibri, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111; }
    h1 { font-size: 22pt; margin: 0 0 6pt 0; }
    h2 { font-size: 14pt; margin: 18pt 0 6pt 0; }
    p { margin: 6pt 0; }
    sup { font-size: 8pt; color: #555; }
    .meta { color: #666; font-size: 10pt; margin-bottom: 24pt; }
    .section-label { text-transform: uppercase; letter-spacing: 1.5px; font-size: 9pt; color: #888; margin-top: 28pt; }
  </style>
</head>
<body>
  <h1>${escapeHtml(newsletter.name)} &mdash; ${escapeHtml(issue.name)}</h1>
  <p class="meta">Sent ${escapeHtml(issue.date ?? "—")}${
    issue.status === "published" ? " &middot; Published" : ""
  }</p>
${sectionsHtml}
</body>
</html>`;
}

export function downloadIssueAsDoc(
  newsletter: Newsletter,
  issue: Issue,
  sections: DocSection[],
) {
  if (sections.length === 0) return;
  const html = buildDocHtml(newsletter, issue, sections);
  const blob = new Blob(["﻿", html], {
    type: "application/msword;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug(newsletter.name)}-${slug(issue.name)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
