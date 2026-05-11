"use client";

import Link from "next/link";
import { type ReactNode } from "react";

interface AppShellProps {
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}

export function AppShell({ left, right, children }: AppShellProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-paper px-5">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-ink">
            <Wordmark />
          </Link>
          {left}
        </div>
        <div className="flex items-center gap-3 text-[13px] text-ink-2">
          {right}
          <Link
            href="/settings"
            className="rounded px-2 py-1 hover:bg-veil hover:text-ink"
          >
            Settings
          </Link>
          <div
            aria-label="Account"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-white"
          >
            J
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

function Wordmark() {
  return (
    <span className="text-[15px] font-medium tracking-tight">
      marabel<span className="text-ink-3">.</span>
    </span>
  );
}
