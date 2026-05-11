"use client";

import Link from "next/link";
import type { Newsletter } from "@/context/WorkspaceContext";

interface NewsletterCardProps {
  newsletter: Newsletter;
}

type Tone = "neutral" | "amber" | "emerald";

function reviewStatus(newsletter: Newsletter): { label: string; tone: Tone } {
  const inProg = newsletter.issues.find((i) => i.status === "in_progress");
  if (!inProg) return { label: "No active issue", tone: "neutral" };

  const step = inProg.approvalStep ?? 0;
  const total = newsletter.reviewers.length;

  if (total === 0) return { label: "Drafting · no reviewers yet", tone: "neutral" };
  if (step === 0) return { label: "Drafting", tone: "neutral" };
  if (step <= total) {
    const reviewer = newsletter.reviewers.find((r) => r.step === step);
    const name = reviewer?.name.split(" ")[0] ?? `Step ${step}`;
    const role = reviewer?.role === "Editor" ? "Final review" : "In review";
    return { label: `${role} · ${name}`, tone: "amber" };
  }
  return { label: "Approved · ready to push", tone: "emerald" };
}

const dotClass: Record<Tone, string> = {
  neutral: "bg-ink-3",
  amber: "bg-amber",
  emerald: "bg-emerald",
};

export function NewsletterCard({ newsletter }: NewsletterCardProps) {
  const inProg = newsletter.issues.find((i) => i.status === "in_progress");
  const status = reviewStatus(newsletter);

  return (
    <Link
      href={`/workspace/${newsletter.id}`}
      className="group flex flex-col justify-between border border-line bg-paper p-6 transition-colors hover:bg-veil"
      style={{ minHeight: 220 }}
    >
      <div>
        <div className="text-[20px] font-medium leading-tight tracking-tight text-ink">
          {newsletter.name}
        </div>
        {inProg ? (
          <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            {inProg.name} · sends {inProg.date}
          </div>
        ) : (
          <div className="mt-3 text-[12px] text-ink-3">No issue in progress</div>
        )}
      </div>

      <div className="mt-6 border-t border-line pt-4">
        <div className="text-[10px] uppercase tracking-[0.1em] text-ink-3">
          Review status
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dotClass[status.tone]}`} />
          <span className="text-[13px] text-ink">{status.label}</span>
        </div>
      </div>
    </Link>
  );
}
