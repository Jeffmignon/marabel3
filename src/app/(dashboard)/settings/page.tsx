"use client";

import { useState, type ReactNode } from "react";
import { AppShell } from "@/components/chrome/AppShell";
import { useWorkspace, type TeamMember } from "@/context/WorkspaceContext";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[760px] overflow-y-auto px-8 py-12">
        <header className="mb-12">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-3">Settings</div>
          <h1 className="mt-2 text-[36px] font-medium leading-[1.05] tracking-tight text-ink">
            Account &amp; team
          </h1>
        </header>

        <AccountSection />
        <SecuritySection />
        <TeamSection />
      </div>
    </AppShell>
  );
}

function AccountSection() {
  const { user, updateUserEmail } = useWorkspace();
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  const dirty = email !== user.email;

  function save() {
    if (!email.trim()) return;
    updateUserEmail(email.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Section title="Account">
      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full border border-line bg-paper px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none"
        />
      </Field>
      <div className="mt-4 flex items-center justify-end gap-3">
        {saved && <span className="text-[12px] text-emerald">Email updated</span>}
        <button
          onClick={save}
          disabled={!dirty || !email.trim()}
          className="bg-accent px-4 py-2 text-[12px] font-medium text-white transition-opacity disabled:opacity-30"
        >
          Save changes
        </button>
      </div>
    </Section>
  );
}

function SecuritySection() {
  const { updatePassword } = useWorkspace();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!current || !next || !confirm) {
      setError("Fill all three fields.");
      return;
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New password and confirmation don't match.");
      return;
    }
    if (next === current) {
      setError("New password must differ from the current one.");
      return;
    }
    updatePassword(current, next);
    setSaved(true);
    setCurrent("");
    setNext("");
    setConfirm("");
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Section title="Security">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Current password">
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            className="block w-full border border-line bg-paper px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none"
          />
        </Field>
        <Field label="New password">
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            className="block w-full border border-line bg-paper px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none"
          />
        </Field>
        <Field label="Confirm new password">
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className="block w-full border border-line bg-paper px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none"
          />
        </Field>

        <div className="flex items-center justify-end gap-3 pt-2">
          {error && <span className="text-[12px] text-rose">{error}</span>}
          {saved && <span className="text-[12px] text-emerald">Password updated</span>}
          <button
            type="submit"
            className="bg-accent px-4 py-2 text-[12px] font-medium text-white"
          >
            Update password
          </button>
        </div>
      </form>
    </Section>
  );
}

function TeamSection() {
  const { team, updateTeamMemberRole, toggleTeamMemberAdmin } = useWorkspace();

  return (
    <Section title="Team" right={<span className="tabular text-[11px] text-ink-3">{team.length}</span>}>
      <div className="border border-line bg-paper">
        {team.map((m, i) => (
          <TeamRow
            key={m.id}
            member={m}
            isLast={i === team.length - 1}
            onRoleChange={(role) => updateTeamMemberRole(m.id, role)}
            onAdminToggle={() => toggleTeamMemberAdmin(m.id)}
          />
        ))}
      </div>
      <p className="mt-3 text-[12px] text-ink-3">
        Role decides whether a member is a Reviewer or the Editor on the approval pipeline.
        Admin grants workspace-management access on top of either role.
      </p>
    </Section>
  );
}

function TeamRow({
  member,
  isLast,
  onRoleChange,
  onAdminToggle,
}: {
  member: TeamMember;
  isLast: boolean;
  onRoleChange: (role: TeamMember["role"]) => void;
  onAdminToggle: () => void;
}) {
  const initials = member.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 ${isLast ? "" : "border-b border-line"}`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-tint text-[11px] font-medium text-accent">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-ink">{member.name}</div>
        <div className="truncate text-[12px] text-ink-2">{member.email}</div>
      </div>
      <RoleToggle role={member.role} onChange={onRoleChange} />
      <AdminToggle isAdmin={member.isAdmin} onToggle={onAdminToggle} />
    </div>
  );
}

function RoleToggle({
  role,
  onChange,
}: {
  role: TeamMember["role"];
  onChange: (role: TeamMember["role"]) => void;
}) {
  return (
    <div className="flex shrink-0 border border-line bg-paper">
      {(["Reviewer", "Editor"] as const).map((r) => {
        const active = role === r;
        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`px-2.5 py-1 text-[11px] transition-colors ${
              active ? "bg-accent text-white" : "text-ink-2 hover:bg-veil hover:text-ink"
            }`}
          >
            {r}
          </button>
        );
      })}
    </div>
  );
}

function AdminToggle({
  isAdmin,
  onToggle,
}: {
  isAdmin: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      title={isAdmin ? "Remove admin access" : "Grant admin access"}
      className={`shrink-0 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors ${
        isAdmin
          ? "bg-emerald-tint text-emerald hover:bg-emerald hover:text-white"
          : "border border-line text-ink-3 hover:bg-veil hover:text-ink-2"
      }`}
    >
      Admin
    </button>
  );
}

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-12 border-t border-line pt-8">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-ink-3">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.12em] text-ink-3">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
