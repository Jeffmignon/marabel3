"use client";

import { AppShell } from "@/components/chrome/AppShell";
import { NewsletterCard } from "@/components/home/NewsletterCard";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function Home() {
  const { brand, newsletters } = useWorkspace();

  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1200px] overflow-y-auto px-8 py-16">
        <section className="mb-12">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-3">
            {brand.name}
          </div>
          <h1 className="mt-3 text-[40px] font-medium leading-[1.05] tracking-tight text-ink">
            What are you working on?
          </h1>
          <p className="mt-3 text-[14px] text-ink-2">
            {newsletters.length} {newsletters.length === 1 ? "newsletter" : "newsletters"}.
            Pick one to open the workspace.
          </p>
        </section>

        <section className="pb-16">
          <div className="mb-4 flex items-baseline gap-3 border-t border-line pt-8">
            <h2 className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
              All newsletters
            </h2>
            <span className="tabular text-[11px] text-ink-3">{newsletters.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {newsletters.map((nl) => (
              <NewsletterCard key={nl.id} newsletter={nl} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
