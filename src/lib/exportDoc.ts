import type { Issue, Newsletter } from "@/context/WorkspaceContext";
import { markdownToHtml } from "./markdown";

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

function buildDocHtml(newsletter: Newsletter, issue: Issue, content: string): string {
  const body = markdownToHtml(content);

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
    h2 { font-size: 16pt; margin: 18pt 0 6pt 0; }
    h3 { font-size: 13pt; margin: 14pt 0 4pt 0; }
    p { margin: 6pt 0; }
    sup { font-size: 8pt; color: #555; }
    blockquote { margin: 8pt 0 8pt 16pt; color: #555; border-left: 2pt solid #ccc; padding-left: 8pt; }
    hr { border: 0; border-top: 1pt solid #ccc; margin: 18pt 0; }
    a { color: #0F1A3D; text-decoration: underline; }
    .meta { color: #666; font-size: 10pt; margin-bottom: 24pt; }
  </style>
</head>
<body>
  <h1>${escapeHtml(newsletter.name)} &mdash; ${escapeHtml(issue.name)}</h1>
  <p class="meta">Sent ${escapeHtml(issue.date ?? "—")}${
    issue.status === "published" ? " &middot; Published" : ""
  }</p>
${body}
</body>
</html>`;
}

export function downloadIssueAsDoc(newsletter: Newsletter, issue: Issue, content: string) {
  if (!content || !content.trim()) return;
  const html = buildDocHtml(newsletter, issue, content);
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
