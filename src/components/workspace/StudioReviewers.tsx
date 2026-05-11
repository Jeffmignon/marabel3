"use client";

import { useState } from "react";
import type { Issue, Newsletter, Reviewer } from "@/context/WorkspaceContext";
import { useWorkspace } from "@/context/WorkspaceContext";

interface Props {
  newsletter: Newsletter;
  issue: Issue;
}

export function StudioReviewers({ newsletter, issue }: Props) {
  const { addReviewer, submitForReview, approveIssue, publishIssue } = useWorkspace();
  const [adding, setAdding] = useState(false);

  const sorted = [...newsletter.reviewers].sort((a, b) => a.step - b.step);
  const totalSteps = sorted.length;
  const step = issue.approvalStep ?? 0;

  const isPublished = issue.status === "published";
  const isReadyToPush = !isPublished && step > totalSteps && totalSteps > 0;
  const isInReview = !isPublished && step > 0 && step <= totalSteps;
  const isDrafting = !isPublished && step === 0;

  const activeReviewer = isInReview ? sorted.find((r) => r.step === step) : undefined;
  const firstReviewer = sorted[0];

  const stageLabel = computeStageLabel({
    isPublished,
    isReadyToPush,
    isInReview,
    isDrafting,
    step,
    totalSteps,
    activeRole: activeReviewer?.role,
  });

  const firstName = (full?: string) => full?.split(" ")[0] ?? "";

  return (
    <div className="px-4 pb-4">
      {/* Stage label — primary signal */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.12em] text-ink-3">Stage</div>
        <div className="mt-1 text-[14px] font-medium text-ink">{stageLabel}</div>
      </div>

      {/* Pipeline visualization — no names, no emails */}
      {sorted.length > 0 ? (
        <Pipeline reviewers={sorted} step={step} isPublished={isPublished} />
      ) : (
        <div className="border border-dashed border-line-2 bg-paper p-4 text-center text-[12px] text-ink-2">
          No reviewers yet. Add at least one editor to publish.
        </div>
      )}

      {/* Action button changes based on approval state. */}
      <div className="mt-8 border-t border-line pt-4">
        {isPublished && (
          <div className="flex items-center justify-center border border-line bg-emerald-tint py-2 text-[12px] font-medium text-emerald">
            ✓ Published
          </div>
        )}

        {isReadyToPush && (
          <button
            onClick={() => publishIssue(newsletter.id, issue.id)}
            className="w-full bg-accent py-2 text-[12px] font-medium text-white"
          >
            Push to platform
          </button>
        )}

        {isInReview && activeReviewer && (
          <button
            onClick={() => approveIssue(newsletter.id, issue.id)}
            className="w-full bg-accent py-2 text-[12px] font-medium text-white"
          >
            Approve as {firstName(activeReviewer.name)}
          </button>
        )}

        {isDrafting && sorted.length > 0 && firstReviewer && (
          <button
            onClick={() => submitForReview(newsletter.id, issue.id)}
            className="w-full bg-accent py-2 text-[12px] font-medium text-white"
          >
            Submit to {firstName(firstReviewer.name)} for review
          </button>
        )}

        {isDrafting && sorted.length === 0 && (
          <div className="text-center text-[11px] text-ink-3">
            Add a reviewer before submitting.
          </div>
        )}
      </div>

      {/* Adding more reviewers — minimal affordance */}
      <div className="mt-3">
        {adding ? (
          <AddReviewerForm
            nextStep={sorted.length + 1}
            hasEditor={sorted.some((r) => r.role === "Editor")}
            onCancel={() => setAdding(false)}
            onSubmit={(reviewer) => {
              addReviewer(newsletter.id, reviewer);
              setAdding(false);
            }}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="text-[12px] text-ink-3 hover:text-accent"
          >
            + Add a reviewer
          </button>
        )}
      </div>
    </div>
  );
}

function computeStageLabel(s: {
  isPublished: boolean;
  isReadyToPush: boolean;
  isInReview: boolean;
  isDrafting: boolean;
  step: number;
  totalSteps: number;
  activeRole?: Reviewer["role"];
}): string {
  if (s.isPublished) return "Published";
  if (s.isReadyToPush) return "Approved · ready to push";
  if (s.isInReview) {
    const phase = s.activeRole === "Editor" ? "Final review" : "In review";
    return `${phase} · stage ${s.step} of ${s.totalSteps}`;
  }
  if (s.isDrafting && s.totalSteps === 0) return "Drafting · no reviewers";
  if (s.isDrafting) return "Drafting";
  return "—";
}

function AddReviewerForm({
  nextStep,
  hasEditor,
  onCancel,
  onSubmit,
}: {
  nextStep: number;
  hasEditor: boolean;
  onCancel: () => void;
  onSubmit: (r: Reviewer) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Reviewer["role"]>("Reviewer");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({
      id: `r-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      isAdmin: false,
      step: nextStep,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 border border-line bg-chrome p-3"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="block w-full border border-line bg-paper px-2 py-1.5 text-[13px] text-ink focus:border-accent focus:outline-none"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@company.com"
        className="block w-full border border-line bg-paper px-2 py-1.5 text-[13px] text-ink focus:border-accent focus:outline-none"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Reviewer["role"])}
        className="block w-full border border-line bg-paper px-2 py-1.5 text-[13px] text-ink focus:border-accent focus:outline-none"
      >
        <option value="Reviewer">Reviewer</option>
        <option value="Editor" disabled={hasEditor}>
          Editor{hasEditor ? " (already assigned)" : ""}
        </option>
      </select>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="border border-line bg-paper px-3 py-1 text-[12px] text-ink-2 hover:bg-veil hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || !email.trim()}
          className="bg-accent px-3 py-1 text-[12px] font-medium text-white transition-opacity disabled:opacity-30"
        >
          Add
        </button>
      </div>
    </form>
  );
}

function Pipeline({
  reviewers,
  step,
  isPublished,
}: {
  reviewers: Reviewer[];
  step: number;
  isPublished: boolean;
}) {
  return (
    <div>
      <div className="flex items-start justify-between">
        {reviewers.map((r) => {
          const done = isPublished || r.step < step;
          const active = !isPublished && r.step === step;
          return (
            <div
              key={r.id}
              className="flex flex-col items-center gap-2"
              style={{ width: 64 }}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-medium ${
                  done
                    ? "border-emerald bg-emerald text-white"
                    : active
                    ? "border-amber bg-amber-tint text-amber"
                    : "border-line bg-paper text-ink-3"
                }`}
              >
                {done ? "✓" : r.step}
              </div>
              <div className="w-full text-center">
                <div className="text-[9px] uppercase tracking-wider text-ink-3">
                  {r.role}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mx-9 -mt-[36px] h-px bg-line-2" />
    </div>
  );
}
