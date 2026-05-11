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
        <ConnectorSection />
        <SecuritySection />
        <TeamSection />
      </div>
    </AppShell>
  );
}

function ConnectorSection() {
  const { brand, updateConnector } = useWorkspace();
  const c = brand.connector;
  const [apiKey, setApiKey] = useState("");

  const dotClass =
    c.status === "connected"
      ? "bg-emerald"
      : c.status === "error"
      ? "bg-rose"
      : "bg-ink-3";
  const statusLabel =
    c.status === "connected" ? "Connected" : c.status === "error" ? "Error" : "Not connected";

  function connect(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;
    updateConnector({
      status: "connected",
      apiKey: maskKey(apiKey.trim()),
      connectedAt: new Date().toISOString(),
      lastError: undefined,
      lastErrorAt: undefined,
    });
    setApiKey("");
  }

  function disconnect() {
    updateConnector({
      status: "disconnected",
      apiKey: undefined,
      lastError: undefined,
      lastErrorAt: undefined,
    });
  }

  function simulateError() {
    updateConnector({
      status: "error",
      lastError: "HubSpot returned 401 Unauthorized on last sync.",
      lastErrorAt: new Date().toISOString(),
    });
  }

  function reconnect() {
    updateConnector({
      status: "connected",
      connectedAt: new Date().toISOString(),
      lastError: undefined,
      lastErrorAt: undefined,
    });
  }

  return (
    <Section
      title="Connector"
      right={
        <span className="inline-flex items-center gap-1.5 text-[11px]">
          <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
          <span className="uppercase tracking-wider text-ink-2">{statusLabel}</span>
        </span>
      }
    >
      <div className="border border-line bg-paper p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[14px] font-medium text-ink">HubSpot</div>
            <div className="mt-0.5 text-[12px] text-ink-2">
              Where Marabel publishes approved newsletters.
            </div>
          </div>
        </div>

        {c.status === "connected" && (
          <>
            <div className="mt-4 space-y-1 border-t border-line pt-4 text-[12px]">
              <div className="flex justify-between text-ink-2">
                <span>API key</span>
                <span className="font-mono text-ink">{c.apiKey ?? "—"}</span>
              </div>
              <div className="flex justify-between text-ink-2">
                <span>Connected</span>
                <span className="text-ink">
                  {c.connectedAt ? formatDate(c.connectedAt) : "—"}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-between gap-2">
              <button
                onClick={simulateError}
                className="text-[11px] text-ink-3 hover:text-rose"
                title="Triggers the error banner — for testing the alert UI"
              >
                Simulate error
              </button>
              <button
                onClick={disconnect}
                className="border border-line bg-paper px-3 py-1.5 text-[12px] text-ink-2 hover:bg-veil hover:text-ink"
              >
                Disconnect
              </button>
            </div>
          </>
        )}

        {c.status === "error" && (
          <>
            <div className="mt-4 border-t border-line pt-4">
              <div className="border border-rose/40 bg-rose-tint p-3 text-[12px] text-rose">
                <div className="font-medium">Sync failed</div>
                <div className="mt-0.5">
                  {c.lastError ?? "Marabel couldn't reach HubSpot."}
                  {c.lastErrorAt && (
                    <span className="ml-1 text-rose/80">
                      ({formatDate(c.lastErrorAt)})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={disconnect}
                className="border border-line bg-paper px-3 py-1.5 text-[12px] text-ink-2 hover:bg-veil hover:text-ink"
              >
                Disconnect
              </button>
              <button
                onClick={reconnect}
                className="bg-accent px-3 py-1.5 text-[12px] font-medium text-white"
              >
                Reconnect
              </button>
            </div>
          </>
        )}

        {c.status === "disconnected" && (
          <form onSubmit={connect} className="mt-4 space-y-3 border-t border-line pt-4">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.12em] text-ink-3">
                HubSpot API key
              </span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="pat-na1-xxxx-xxxx-xxxx"
                autoComplete="off"
                className="mt-1 block w-full border border-line bg-paper px-2 py-1.5 text-[14px] text-ink focus:border-accent focus:outline-none"
              />
            </label>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!apiKey.trim()}
                className="bg-accent px-3 py-1.5 text-[12px] font-medium text-white transition-opacity disabled:opacity-30"
              >
                Connect
              </button>
            </div>
          </form>
        )}
      </div>
    </Section>
  );
}

function maskKey(k: string): string {
  if (k.length <= 8) return "••••••••";
  return k.slice(0, 4) + "••••••••" + k.slice(-4);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
