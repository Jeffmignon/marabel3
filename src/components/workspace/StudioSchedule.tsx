"use client";

import { useState, type ReactNode } from "react";
import type { Newsletter, Schedule } from "@/context/WorkspaceContext";
import { useWorkspace } from "@/context/WorkspaceContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMEZONES = [
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "America/Denver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

interface Props {
  newsletter: Newsletter;
}

export function StudioSchedule({ newsletter }: Props) {
  const { updateSchedule } = useWorkspace();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Schedule>(newsletter.schedule);

  function startEdit() {
    setDraft(newsletter.schedule);
    setEditing(true);
  }

  function save() {
    updateSchedule(newsletter.id, { ...draft, active: true });
    setEditing(false);
  }

  function setFrequency(f: Schedule["frequency"]) {
    setDraft((prev) => ({
      ...prev,
      frequency: f,
      dayOfWeek: f === "weekly" || f === "biweekly" ? prev.dayOfWeek ?? "Tuesday" : undefined,
      dayOfMonth: f === "monthly" ? prev.dayOfMonth ?? 1 : undefined,
    }));
  }

  if (!editing) {
    return (
      <div className="px-4 pb-4 text-[13px]">
        <Row label="Frequency" value={cap(newsletter.schedule.frequency)} />
        <Row label="Day" value={dayLabel(newsletter.schedule)} />
        <Row
          label="Time"
          value={`${newsletter.schedule.time} · ${newsletter.schedule.timezone.replace(/_/g, " ")}`}
        />
        <button
          onClick={startEdit}
          className="mt-3 text-[12px] text-accent hover:underline"
        >
          Edit schedule
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pb-4">
      <FieldGroup label="Frequency">
        <div className="flex flex-wrap gap-1">
          {(["daily", "weekly", "biweekly", "monthly"] as const).map((f) => (
            <Pill
              key={f}
              label={cap(f)}
              active={draft.frequency === f}
              onClick={() => setFrequency(f)}
            />
          ))}
        </div>
      </FieldGroup>

      {(draft.frequency === "weekly" || draft.frequency === "biweekly") && (
        <FieldGroup label="Day of week">
          <div className="flex flex-wrap gap-1">
            {DAYS.map((d) => (
              <Pill
                key={d}
                label={d.slice(0, 3)}
                active={draft.dayOfWeek === d}
                onClick={() => setDraft({ ...draft, dayOfWeek: d })}
                width={36}
              />
            ))}
          </div>
        </FieldGroup>
      )}

      {draft.frequency === "monthly" && (
        <FieldGroup label="Day of month">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <Pill
                key={d}
                label={String(d)}
                active={draft.dayOfMonth === d}
                onClick={() => setDraft({ ...draft, dayOfMonth: d })}
              />
            ))}
          </div>
        </FieldGroup>
      )}

      <FieldGroup label="Time">
        <input
          type="time"
          value={draft.time}
          onChange={(e) => setDraft({ ...draft, time: e.target.value })}
          className="w-32 border border-line bg-paper px-2 py-1 text-[13px] text-ink focus:border-accent focus:outline-none"
        />
      </FieldGroup>

      <FieldGroup label="Timezone">
        <select
          value={draft.timezone}
          onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
          className="block w-full border border-line bg-paper px-2 py-1 text-[13px] text-ink focus:border-accent focus:outline-none"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
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
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-2 last:border-0">
      <span className="text-[12px] text-ink-3">{label}</span>
      <span className="text-[13px] text-ink">{value}</span>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] uppercase tracking-[0.12em] text-ink-3">
        {label}
      </div>
      {children}
    </div>
  );
}

function Pill({
  label,
  active,
  onClick,
  width,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  width?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={width ? { width } : undefined}
      className={`px-2 py-1 text-[11px] transition-colors ${
        active
          ? "border border-accent bg-accent text-white"
          : "border border-line bg-paper text-ink-2 hover:bg-veil hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function dayLabel(s: Schedule) {
  if (s.frequency === "daily") return "Every day";
  if (s.frequency === "monthly") return s.dayOfMonth ? `Day ${s.dayOfMonth}` : "—";
  return s.dayOfWeek ?? "—";
}
