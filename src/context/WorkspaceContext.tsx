"use client";

import { createContext, useContext, useState, useMemo, type ReactNode } from "react";

export interface Skill {
  id: string;
  name: string;
  description: string;
  fileName?: string;
  level: "brand" | "newsletter";
  createdAt: string;
  active: boolean;
}

export interface Schedule {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  dayOfWeek?: string;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  active: boolean;
}

export interface EditEntry {
  id: string;
  timestamp: string; // ISO
  content: string;   // snapshot of the content as it was BEFORE this edit
  editedBy: string;  // "You" / "Marabel" — display label only
}

export interface Issue {
  id: string;
  name: string;
  status: "draft" | "in_progress" | "published" | "archived";
  date?: string;
  /** Newsletter body, as one markdown string. */
  content?: string;
  /** Previous versions, oldest first. The current `content` is not in this array. */
  contentHistory?: EditEntry[];
  /** ISO timestamp of the last edit (by a human); undefined if never edited. */
  contentEditedAt?: string;
  // 0 = drafting (not yet submitted)
  // 1..reviewers.length = at that reviewer's step
  // reviewers.length + 1 = past final approver, ready to push
  approvalStep?: number;
}

export interface Reviewer {
  id: string;
  name: string;
  email: string;
  role: "Reviewer" | "Editor";
  isAdmin: boolean;
  step: number;
}

export interface ContentSuggestion {
  id: number;
  title: string;
  source: string;
  confidence: number;
  status: "ready" | "draft";
  type: string;
}

export interface SourceActivity {
  source: string;
  articles: number;
  time: string;
  topic: string;
}

export type SourceType = "url";

export interface Source {
  id: string;
  type: SourceType;
  name: string;
  detail: string;
  url?: string;
  itemCount: number;
  syncedAgo: string;
}

export interface SuggestedSource {
  id: string;
  type: SourceType;
  name: string;
  detail: string;
  reason: string;
}

export interface ApprovalItem {
  name: string;
  assignedTo: string;
  time: string;
}

export interface Newsletter {
  id: string;
  name: string;
  nextSend: string;
  nextSendDays: number;
  openRate: number;
  openRateDelta: number;
  clickRate: number;
  clickRateDelta: number;
  suggestions: ContentSuggestion[];
  sourceActivity: SourceActivity[];
  sources: Source[];
  suggestedSources: SuggestedSource[];
  approvalQueue: ApprovalItem[];
  reviewers: Reviewer[];
  skills: Skill[];
  issues: Issue[];
  schedule: Schedule;
}

export type ConnectorType = "hubspot";

export type ConnectorStatus = "connected" | "disconnected" | "error";

export interface Connector {
  type: ConnectorType;
  status: ConnectorStatus;
  apiKey?: string;          // masked / placeholder in this prototype
  connectedAt?: string;     // ISO when last successfully connected
  lastError?: string;       // present when status === "error"
  lastErrorAt?: string;     // ISO of the failure
}

export interface Brand {
  id: string;
  name: string;
  audience?: string;
  voice?: string;
  values?: string;
  skills: Skill[];
  connector: Connector;
}

export interface User {
  email: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Reviewer" | "Editor";
  isAdmin: boolean;
}

const initialUser: User = {
  email: "mignonjeff@gmail.com",
};

const initialTeam: TeamMember[] = [
  { id: "tm-1", name: "Alex Morgan", email: "alex@acmecorp.com", role: "Reviewer", isAdmin: false },
  { id: "tm-2", name: "Chris Park", email: "chris@acmecorp.com", role: "Reviewer", isAdmin: false },
  { id: "tm-3", name: "Sam Lee", email: "sam@acmecorp.com", role: "Editor", isAdmin: true },
  { id: "tm-4", name: "Taylor Kim", email: "taylor@acmecorp.com", role: "Reviewer", isAdmin: false },
];

const initialBrand: Brand = {
  id: "brand",
  name: "Acme",
  audience: "B2B marketing leaders at Series-B+ SaaS companies. Mostly VPs of marketing and growth — quantitative, time-poor, allergic to fluff.",
  voice: "Confident and data-led. Conversational without being chummy. Never preachy. Short sentences. Strong verbs. No buzzwords we wouldn't say out loud.",
  values: "Insight over reach. Signal over noise. We'd rather be useful to 1,000 people than viral to a million.",
  connector: {
    type: "hubspot",
    status: "connected",
    apiKey: "hs_demo_••••••••",
    connectedAt: "2026-05-08T10:00:00Z",
  },
  skills: [
    {
      id: "bs1",
      name: "B2B Writing Style",
      description: "Guidelines for professional B2B content with data-driven arguments and clear CTAs",
      fileName: "b2b-writing-guide.pdf",
      level: "brand",
      active: true,
      createdAt: "Apr 1, 2026",
    },
    {
      id: "bs2",
      name: "SEO Optimization",
      description: "Keyword placement rules and meta description formatting for newsletter content",
      fileName: "seo-rules.pdf",
      level: "brand",
      active: true,
      createdAt: "Mar 15, 2026",
    },
  ],
};

const initialNewsletters: Newsletter[] = [
  {
    id: "nl-1",
    name: "Marabel Weekly",
    nextSend: "Apr 22",
    nextSendDays: 6,
    openRate: 34.2,
    openRateDelta: 2.1,
    clickRate: 8.7,
    clickRateDelta: 0.4,
    suggestions: [
      { id: 1, title: "5 AI Trends Reshaping B2B Marketing in 2026", source: "Multiple sources", confidence: 94, status: "ready", type: "Structured blocks" },
      { id: 2, title: "The Future of Privacy-First Analytics", source: "TechCrunch, Wired", confidence: 87, status: "ready", type: "Structured blocks" },
      { id: 3, title: "How Leading Brands Are Using Zero-Party Data", source: "HBR, Forrester", confidence: 82, status: "draft", type: "Structured blocks" },
    ],
    sourceActivity: [
      { source: "TechCrunch", articles: 3, time: "12m ago", topic: "AI & Marketing" },
      { source: "Harvard Business Review", articles: 1, time: "1h ago", topic: "Leadership" },
      { source: "Forrester Blog", articles: 2, time: "2h ago", topic: "Data & Analytics" },
    ],
    sources: [
      { id: "src-nl1-1", type: "url", name: "TechCrunch", detail: "AI & Marketing", url: "techcrunch.com", itemCount: 3, syncedAgo: "12m ago" },
      { id: "src-nl1-2", type: "url", name: "Harvard Business Review", detail: "Leadership", url: "hbr.org", itemCount: 1, syncedAgo: "1h ago" },
      { id: "src-nl1-3", type: "url", name: "Forrester Blog", detail: "Data & Analytics", url: "forrester.com/blogs", itemCount: 2, syncedAgo: "2h ago" },
    ],
    suggestedSources: [
      { id: "sug-nl1-1", type: "url", name: "Forrester Research", detail: "forrester.com", reason: "Matches your B2B audience" },
      { id: "sug-nl1-2", type: "url", name: "MIT Technology Review", detail: "technologyreview.com", reason: "Active in AI & Marketing topic" },
    ],
    approvalQueue: [{ name: "Q2 Product Update", assignedTo: "Alex Morgan", time: "2h ago" }],
    reviewers: [
      { id: "r1", name: "Alex Morgan", email: "alex@acmecorp.com", role: "Reviewer", isAdmin: false, step: 1 },
      { id: "r1b", name: "Chris Park", email: "chris@acmecorp.com", role: "Reviewer", isAdmin: false, step: 2 },
      { id: "r2", name: "Sam Lee", email: "sam@acmecorp.com", role: "Editor", isAdmin: true, step: 3 },
    ],
    issues: [
      {
        id: "iss-1",
        name: "Issue #12",
        status: "in_progress",
        date: "Apr 22, 2026",
        approvalStep: 0,
        content: `**THE BRIEF**

## Five AI trends reshaping B2B marketing in 2026

Marketing teams that adopted generative AI in 2024 are now seeing the second-order effects: workflows compress, attribution gets messier, and budget moves from media to model fine-tuning.[1][2]

The teams winning right now are the ones who treated their first-party data like a moat — and the ones who didn't are quietly being lapped.[3]

**FIELD NOTES**

## What we're seeing in the wild

Three customer conversations this week kept circling back to one question: how do you keep a brand voice consistent when half your content is being drafted by a model?[4]

**BEYOND THE STACK**

## Privacy-first analytics is finally getting interesting

A handful of teams have moved off third-party tracking entirely. The reporting is messier, but the conversion lift on cookie-skeptical segments is real.[5]

---

## Sources

1. [TechCrunch — AI Marketing Report](https://techcrunch.com)
2. [HBR — Generative Marketing](https://hbr.org)
3. [Forrester — First-Party Data 2026](https://forrester.com)
4. Internal — Customer Calls W16
5. [Wired — Analytics 2026](https://wired.com)`,
      },
      {
        id: "iss-2",
        name: "Issue #11",
        status: "published",
        date: "Apr 15, 2026",
        content: `**THE BRIEF**

## The agentic stack is here, and your dashboards aren't ready

Agent frameworks moved from research to production this quarter, and the side-effect nobody wired for is observability. If you can't trace what your agent did between the prompt and the answer, you're flying blind on cost, on latency, and on quality drift.[1]

---

## Sources

1. [Anthropic — Engineering Notes](https://anthropic.com)`,
      },
      { id: "iss-3", name: "Issue #10", status: "published", date: "Apr 8, 2026" },
      { id: "iss-100", name: "Issue #9", status: "published", date: "Apr 1, 2026" },
      { id: "iss-101", name: "Issue #8", status: "published", date: "Mar 25, 2026" },
      { id: "iss-102", name: "Issue #7", status: "published", date: "Mar 18, 2026" },
    ],
    skills: [
      {
        id: "ns1",
        name: "AI Industry Jargon",
        description: "Glossary and usage rules for AI-specific terminology in marketing context",
        fileName: "ai-jargon.pdf",
        level: "newsletter",
        active: true,
        createdAt: "Apr 10, 2026",
      },
    ],
    schedule: { frequency: "weekly", dayOfWeek: "Tuesday", time: "09:00", timezone: "America/New_York", active: true },
  },
];

interface WorkspaceContextType {
  brand: Brand;
  newsletters: Newsletter[];
  user: User;
  team: TeamMember[];
  updateUserEmail: (email: string) => void;
  updatePassword: (current: string, next: string) => boolean;
  updateTeamMemberRole: (id: string, role: TeamMember["role"]) => void;
  toggleTeamMemberAdmin: (id: string) => void;
  updateBrand: (patch: Partial<Brand>) => void;
  updateConnector: (patch: Partial<Connector>) => void;
  addNewsletter: (name: string) => Newsletter;
  deleteNewsletter: (newsletterId: string) => void;
  renameNewsletter: (newsletterId: string, name: string) => void;
  submitForReview: (newsletterId: string, issueId: string) => void;
  approveIssue: (newsletterId: string, issueId: string) => void;
  publishIssue: (newsletterId: string, issueId: string) => void;
  addReviewer: (newsletterId: string, reviewer: Reviewer) => void;
  removeReviewer: (newsletterId: string, reviewerId: string) => void;
  updateSchedule: (newsletterId: string, schedule: Schedule) => void;
  addIssue: (newsletterId: string, issue: Issue) => void;
  archiveIssue: (newsletterId: string, issueId: string) => void;
  updateIssueContent: (newsletterId: string, issueId: string, content: string) => void;
  restoreIssueContent: (newsletterId: string, issueId: string, entryId: string) => void;
  addSource: (
    newsletterId: string,
    input: { name: string; url: string; detail?: string },
  ) => void;
  removeSource: (newsletterId: string, sourceId: string) => void;
  updateSource: (
    newsletterId: string,
    sourceId: string,
    patch: { name?: string; url?: string },
  ) => void;
  acceptSuggestedSource: (newsletterId: string, suggestedId: string) => void;
  dismissSuggestedSource: (newsletterId: string, suggestedId: string) => void;
  addBrandSkill: (skill: Skill) => void;
  removeBrandSkill: (skillId: string) => void;
  toggleBrandSkill: (skillId: string) => void;
  addNewsletterSkill: (newsletterId: string, skill: Skill) => void;
  removeNewsletterSkill: (newsletterId: string, skillId: string) => void;
  toggleNewsletterSkill: (newsletterId: string, skillId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

function makeNewNewsletter(id: string, name: string): Newsletter {
  return {
    id,
    name,
    nextSend: "Not scheduled",
    nextSendDays: 0,
    openRate: 0,
    openRateDelta: 0,
    clickRate: 0,
    clickRateDelta: 0,
    suggestions: [],
    sourceActivity: [],
    sources: [],
    suggestedSources: [],
    approvalQueue: [],
    reviewers: [],
    // Seed a first in-progress issue so the workspace has something to render.
    issues: [{ id: `iss-${id}-1`, name: "Issue #1", status: "in_progress", date: "TBD" }],
    skills: [],
    schedule: { frequency: "weekly", dayOfWeek: "Tuesday", time: "09:00", timezone: "America/New_York", active: false },
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<Brand>(initialBrand);
  const [newsletters, setNewsletters] = useState<Newsletter[]>(initialNewsletters);
  const [user, setUser] = useState<User>(initialUser);
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);

  const updateUserEmail = (email: string) => setUser({ email });

  // Mock — in real app this would call backend; prototype always succeeds.
  const updatePassword = (_current: string, _next: string): boolean => true;

  const updateTeamMemberRole = (id: string, role: TeamMember["role"]) =>
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));

  const toggleTeamMemberAdmin = (id: string) =>
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, isAdmin: !m.isAdmin } : m)));

  const updateBrand = (patch: Partial<Brand>) => setBrand((prev) => ({ ...prev, ...patch }));

  const updateConnector = (patch: Partial<Connector>) =>
    setBrand((prev) => ({ ...prev, connector: { ...prev.connector, ...patch } }));

  const addNewsletter = (name: string): Newsletter => {
    const nl = makeNewNewsletter(`nl-${Date.now()}`, name);
    setNewsletters((prev) => [...prev, nl]);
    return nl;
  };

  const deleteNewsletter = (newsletterId: string) => {
    setNewsletters((prev) => (prev.length <= 1 ? prev : prev.filter((nl) => nl.id !== newsletterId)));
  };

  const updateNewsletter = (newsletterId: string, updater: (nl: Newsletter) => Newsletter) => {
    setNewsletters((prev) => prev.map((nl) => (nl.id === newsletterId ? updater(nl) : nl)));
  };

  const renameNewsletter = (newsletterId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateNewsletter(newsletterId, (nl) => ({ ...nl, name: trimmed }));
  };

  const updateIssue = (newsletterId: string, issueId: string, updater: (i: Issue) => Issue) =>
    updateNewsletter(newsletterId, (nl) => ({
      ...nl,
      issues: nl.issues.map((i) => (i.id === issueId ? updater(i) : i)),
    }));

  const submitForReview = (newsletterId: string, issueId: string) =>
    updateIssue(newsletterId, issueId, (i) => ({
      ...i,
      approvalStep: Math.max(1, i.approvalStep ?? 0),
    }));

  const approveIssue = (newsletterId: string, issueId: string) =>
    updateIssue(newsletterId, issueId, (i) => ({
      ...i,
      approvalStep: (i.approvalStep ?? 0) + 1,
    }));

  const publishIssue = (newsletterId: string, issueId: string) =>
    updateIssue(newsletterId, issueId, (i) => ({
      ...i,
      status: "published" as const,
    }));

  const addReviewer = (newsletterId: string, reviewer: Reviewer) =>
    updateNewsletter(newsletterId, (nl) => ({ ...nl, reviewers: [...nl.reviewers, reviewer] }));

  const removeReviewer = (newsletterId: string, reviewerId: string) =>
    updateNewsletter(newsletterId, (nl) => ({
      ...nl,
      reviewers: nl.reviewers.filter((r) => r.id !== reviewerId),
    }));

  const updateSchedule = (newsletterId: string, schedule: Schedule) =>
    updateNewsletter(newsletterId, (nl) => ({ ...nl, schedule }));

  const addIssue = (newsletterId: string, issue: Issue) =>
    updateNewsletter(newsletterId, (nl) => ({ ...nl, issues: [issue, ...nl.issues] }));

  const archiveIssue = (newsletterId: string, issueId: string) =>
    updateNewsletter(newsletterId, (nl) => ({
      ...nl,
      issues: nl.issues.map((i) => (i.id === issueId ? { ...i, status: "archived" as const } : i)),
    }));

  const updateIssueContent = (newsletterId: string, issueId: string, content: string) =>
    updateNewsletter(newsletterId, (nl) => ({
      ...nl,
      issues: nl.issues.map((i) => {
        if (i.id !== issueId) return i;
        const previous = i.content ?? "";
        if (previous === content) return i;
        // Append the PREVIOUS content as a history entry, keep current as the new top.
        const history = previous.trim() === "" && !i.contentEditedAt
          ? (i.contentHistory ?? [])
          : [
              ...(i.contentHistory ?? []),
              {
                id: `e-${Date.now()}`,
                timestamp: new Date().toISOString(),
                content: previous,
                editedBy: "You",
              },
            ];
        return {
          ...i,
          content,
          contentHistory: history,
          contentEditedAt: new Date().toISOString(),
        };
      }),
    }));

  const restoreIssueContent = (newsletterId: string, issueId: string, entryId: string) =>
    updateNewsletter(newsletterId, (nl) => ({
      ...nl,
      issues: nl.issues.map((i) => {
        if (i.id !== issueId) return i;
        const entry = (i.contentHistory ?? []).find((h) => h.id === entryId);
        if (!entry) return i;
        // Save current to history before swapping in the restored snapshot.
        const history = [
          ...(i.contentHistory ?? []),
          {
            id: `e-${Date.now()}`,
            timestamp: new Date().toISOString(),
            content: i.content ?? "",
            editedBy: "You",
          },
        ];
        return {
          ...i,
          content: entry.content,
          contentHistory: history,
          contentEditedAt: new Date().toISOString(),
        };
      }),
    }));

  const addSource: WorkspaceContextType["addSource"] = (newsletterId, input) =>
    updateNewsletter(newsletterId, (nl) => {
      const id = `src-${Date.now()}`;
      const detail =
        input.detail ??
        input.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const next: Source = {
        id,
        type: "url",
        name: input.name,
        detail,
        url: input.url,
        itemCount: 0,
        syncedAgo: "just now",
      };
      return { ...nl, sources: [next, ...nl.sources] };
    });

  const removeSource = (newsletterId: string, sourceId: string) =>
    updateNewsletter(newsletterId, (nl) => ({
      ...nl,
      sources: nl.sources.filter((s) => s.id !== sourceId),
    }));

  const updateSource: WorkspaceContextType["updateSource"] = (
    newsletterId,
    sourceId,
    patch,
  ) =>
    updateNewsletter(newsletterId, (nl) => ({
      ...nl,
      sources: nl.sources.map((s) => {
        if (s.id !== sourceId) return s;
        const nextUrl = patch.url ?? s.url ?? "";
        const nextName = patch.name ?? s.name;
        const nextDetail = nextUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
        return {
          ...s,
          name: nextName,
          url: nextUrl,
          detail: nextDetail || s.detail,
        };
      }),
    }));

  const acceptSuggestedSource = (newsletterId: string, suggestedId: string) =>
    updateNewsletter(newsletterId, (nl) => {
      const sug = nl.suggestedSources.find((s) => s.id === suggestedId);
      if (!sug) return nl;
      const promoted: Source = {
        id: `src-${Date.now()}`,
        type: "url",
        name: sug.name,
        detail: sug.detail,
        url: sug.detail,
        itemCount: 0,
        syncedAgo: "just now",
      };
      return {
        ...nl,
        sources: [promoted, ...nl.sources],
        suggestedSources: nl.suggestedSources.filter((s) => s.id !== suggestedId),
      };
    });

  const dismissSuggestedSource = (newsletterId: string, suggestedId: string) =>
    updateNewsletter(newsletterId, (nl) => ({
      ...nl,
      suggestedSources: nl.suggestedSources.filter((s) => s.id !== suggestedId),
    }));

  const addBrandSkill = (skill: Skill) =>
    setBrand((prev) => ({ ...prev, skills: [...prev.skills, skill] }));

  const removeBrandSkill = (skillId: string) =>
    setBrand((prev) => ({ ...prev, skills: prev.skills.filter((s) => s.id !== skillId) }));

  const toggleBrandSkill = (skillId: string) =>
    setBrand((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === skillId ? { ...s, active: !s.active } : s)),
    }));

  const addNewsletterSkill = (newsletterId: string, skill: Skill) =>
    updateNewsletter(newsletterId, (nl) => ({ ...nl, skills: [...nl.skills, skill] }));

  const removeNewsletterSkill = (newsletterId: string, skillId: string) =>
    updateNewsletter(newsletterId, (nl) => ({ ...nl, skills: nl.skills.filter((s) => s.id !== skillId) }));

  const toggleNewsletterSkill = (newsletterId: string, skillId: string) =>
    updateNewsletter(newsletterId, (nl) => ({
      ...nl,
      skills: nl.skills.map((s) => (s.id === skillId ? { ...s, active: !s.active } : s)),
    }));

  const value = useMemo(
    () => ({
      brand,
      newsletters,
      user,
      team,
      updateUserEmail,
      updatePassword,
      updateTeamMemberRole,
      toggleTeamMemberAdmin,
      updateBrand,
      updateConnector,
      addNewsletter,
      deleteNewsletter,
      renameNewsletter,
      submitForReview,
      approveIssue,
      publishIssue,
      addReviewer,
      removeReviewer,
      updateSchedule,
      addIssue,
      archiveIssue,
      updateIssueContent,
      restoreIssueContent,
      addSource,
      removeSource,
      updateSource,
      acceptSuggestedSource,
      dismissSuggestedSource,
      addBrandSkill,
      removeBrandSkill,
      toggleBrandSkill,
      addNewsletterSkill,
      removeNewsletterSkill,
      toggleNewsletterSkill,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brand, newsletters, user, team],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
