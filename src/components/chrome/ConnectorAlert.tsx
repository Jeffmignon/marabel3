"use client";

import Link from "next/link";
import { useWorkspace } from "@/context/WorkspaceContext";

const TYPE_LABEL = {
  hubspot: "HubSpot",
} as const;

export function ConnectorAlert() {
  const { brand } = useWorkspace();
  const c = brand.connector;
  if (c.status === "connected") return null;

  const isError = c.status === "error";
  const label = TYPE_LABEL[c.type];

  return (
    <div
      role="alert"
      className={`flex shrink-0 items-center justify-between border-b px-5 py-2 text-[12px] ${
        isError
          ? "border-rose/40 bg-rose-tint text-rose"
          : "border-amber/40 bg-amber-tint text-amber"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            isError ? "bg-rose" : "bg-amber"
          }`}
        />
        <span className="truncate">
          {isError ? (
            <>
              <strong className="font-medium">{label} connection error.</strong>{" "}
              {c.lastError ?? "Marabel can't reach your account."}{" "}
              Newsletters won't push until you reconnect.
            </>
          ) : (
            <>
              <strong className="font-medium">No connector.</strong> Connect {label} to
              publish newsletters.
            </>
          )}
        </span>
      </div>
      <Link
        href="/settings"
        className={`ml-4 shrink-0 font-medium underline-offset-2 hover:underline ${
          isError ? "text-rose" : "text-amber"
        }`}
      >
        {isError ? "Reconnect" : "Connect"} →
      </Link>
    </div>
  );
}
