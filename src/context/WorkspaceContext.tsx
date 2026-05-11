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

export interface DocSource {
  id: number;
  name: string;
  url: string;
}

export interface DocParagraph {
  id: string;
  body: string;
  cites: number[];
}

export interface DocSection {
  id: string;
  label: string;
  headline: string;
  paragraphs: DocParagraph[];
  sources: DocSource[];
}

export interface Issue {
  id: string;
  name: string;
  status: "draft" | "in_progress" | "published" | "archived";
  date?: string;
  sections?: DocSection[];
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

export type SourceType = "url" | "doc";

export interface Source {
  id: string;
  type: SourceType;
  name: string;
  detail: string;
  url?: string;
  fileName?: string;
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

export interface Brand {
  id: string;
  name: string;
  audience?: string;
  voice?: string;
  values?: string;
  skills: Skill[];
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
    name: "Newsletter 1",
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
      { id: "src-nl1-4", type: "doc", name: "Brand voice guide.pdf", detail: "Uploaded Apr 02", fileName: "brand-voice-guide.pdf", itemCount: 1, syncedAgo: "—" },
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
        sections: [
          {
            id: "brief",
            label: "The Brief",
            headline: "Five AI trends reshaping B2B marketing in 2026",
            paragraphs: [
              {
                id: "b1",
                body: "Marketing teams that adopted generative AI in 2024 are now seeing the second-order effects: workflows compress, attribution gets messier, and budget moves from media to model fine-tuning.",
                cites: [1, 2],
              },
              {
                id: "b2",
                body: "The teams winning right now are the ones who treated their first-party data like a moat — and the ones who didn't are quietly being lapped.",
                cites: [3],
              },
            ],
            sources: [
              { id: 1, name: "TechCrunch — AI Marketing Report", url: "techcrunch.com" },
              { id: 2, name: "HBR — Generative Marketing", url: "hbr.org" },
              { id: 3, name: "Forrester — First-Party Data 2026", url: "forrester.com" },
            ],
          },
          {
            id: "field",
            label: "Field Notes",
            headline: "What we're seeing in the wild",
            paragraphs: [
              {
                id: "f1",
                body: "Three customer conversations this week kept circling back to one question: how do you keep a brand voice consistent when half your content is being drafted by a model?",
                cites: [4],
              },
            ],
            sources: [{ id: 4, name: "Internal — Customer Calls W16", url: "drive/notes" }],
          },
          {
            id: "beyond",
            label: "Beyond the Stack",
            headline: "Privacy-first analytics is finally getting interesting",
            paragraphs: [
              {
                id: "p1",
                body: "A handful of teams have moved off third-party tracking entirely. The reporting is messier, but the conversion lift on cookie-skeptical segments is real.",
                cites: [5],
              },
            ],
            sources: [{ id: 5, name: "Wired — Analytics 2026", url: "wired.com" }],
          },
        ],
      },
      {
        id: "iss-2",
        name: "Issue #11",
        status: "published",
        date: "Apr 15, 2026",
        sections: [
          {
            id: "brief",
            label: "The Brief",
            headline: "The agentic stack is here, and your dashboards aren't ready",
            paragraphs: [
              {
                id: "b1",
                body: "Agent frameworks moved from research to production this quarter, and the side-effect nobody wired for is observability. If you can't trace what your agent did between the prompt and the answer, you're flying blind on cost, on latency, and on quality drift.",
                cites: [1],
              },
            ],
            sources: [{ id: 1, name: "Anthropic — Engineering Notes", url: "anthropic.com" }],
          },
        ],
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
  {
    id: "nl-2",
    name: "Newsletter 2",
    nextSend: "Apr 25",
    nextSendDays: 9,
    openRate: 28.5,
    openRateDelta: -1.3,
    clickRate: 5.2,
    clickRateDelta: 0.8,
    suggestions: [
      { id: 1, title: "Cloud Infrastructure Cost Optimization Guide", source: "AWS Blog, InfoQ", confidence: 91, status: "ready", type: "Structured blocks" },
      { id: 2, title: "Developer Productivity Tools Roundup", source: "Dev.to, GitHub Blog", confidence: 85, status: "ready", type: "Structured blocks" },
    ],
    sourceActivity: [
      { source: "InfoQ", articles: 5, time: "30m ago", topic: "Cloud & DevOps" },
      { source: "GitHub Blog", articles: 2, time: "3h ago", topic: "Developer Tools" },
    ],
    sources: [
      { id: "src-nl2-1", type: "url", name: "InfoQ", detail: "Cloud & DevOps", url: "infoq.com", itemCount: 5, syncedAgo: "30m ago" },
      { id: "src-nl2-2", type: "url", name: "GitHub Blog", detail: "Developer Tools", url: "github.blog", itemCount: 2, syncedAgo: "3h ago" },
    ],
    suggestedSources: [
      { id: "sug-nl2-1", type: "url", name: "AWS Blog", detail: "aws.amazon.com/blogs", reason: "Matches your cloud-infra topic" },
      { id: "sug-nl2-2", type: "url", name: "Stack Overflow Blog", detail: "stackoverflow.blog", reason: "Active in developer-productivity topic" },
    ],
    approvalQueue: [
      { name: "DevOps Weekly #12", assignedTo: "Sam Lee", time: "4h ago" },
      { name: "Cloud Migration Tips", assignedTo: "Taylor Kim", time: "1d ago" },
    ],
    reviewers: [
      { id: "r3", name: "Taylor Kim", email: "taylor@acmecorp.com", role: "Reviewer", isAdmin: false, step: 1 },
      { id: "r3b", name: "Alex Morgan", email: "alex@acmecorp.com", role: "Reviewer", isAdmin: false, step: 2 },
      { id: "r4", name: "Jane Doe", email: "jane@acmecorp.com", role: "Editor", isAdmin: true, step: 3 },
    ],
    issues: [
      {
        id: "iss-4",
        name: "Issue #5",
        status: "in_progress",
        date: "Apr 25, 2026",
        approvalStep: 0,
        sections: [
          {
            id: "brief",
            label: "The Brief",
            headline: "Cloud cost is now an architectural problem",
            paragraphs: [
              {
                id: "b1",
                body: "FinOps teams are owning 30%+ of platform decisions in 2026, and the line between SRE and finance is blurring fast. The teams getting it right are treating cost as a first-class architectural concern, not a quarterly review.",
                cites: [1, 2],
              },
              {
                id: "b2",
                body: "Spot pricing volatility is forcing a rethink of stateless workload assumptions — the savings are still there, but the operational tax is higher than the dashboards suggest.",
                cites: [3],
              },
            ],
            sources: [
              { id: 1, name: "AWS re:Invent recap", url: "aws.amazon.com" },
              { id: 2, name: "InfoQ — FinOps Patterns", url: "infoq.com" },
              { id: 3, name: "A Cloud Guru — Spot Reality", url: "acloudguru.com" },
            ],
          },
          {
            id: "field",
            label: "Field Notes",
            headline: "What platform leads are saying this week",
            paragraphs: [
              {
                id: "f1",
                body: "Three engineering directors mentioned the same pattern: AI coding assistants are a measured 12-18% velocity gain on green-field work, but materially less on legacy systems. Pair them with strong review discipline — don't replace it.",
                cites: [4],
              },
            ],
            sources: [
              { id: 4, name: "Internal — Customer interviews W17", url: "drive/notes" },
            ],
          },
          {
            id: "beyond",
            label: "Beyond the Stack",
            headline: "Developer productivity tools, ranked",
            paragraphs: [
              {
                id: "p1",
                body: "The shortlist this quarter: Cursor for editing, Linear for issues, Vercel for deploys. The unifying theme is fewer modes — every tool is folding the next adjacent surface in.",
                cites: [5],
              },
            ],
            sources: [{ id: 5, name: "Dev.to — Tooling 2026", url: "dev.to" }],
          },
        ],
      },
      { id: "iss-5", name: "Issue #4", status: "published", date: "Apr 18, 2026" },
      { id: "iss-103", name: "Issue #3", status: "published", date: "Apr 11, 2026" },
      { id: "iss-104", name: "Issue #2", status: "published", date: "Apr 4, 2026" },
      { id: "iss-105", name: "Issue #1", status: "published", date: "Mar 28, 2026" },
      { id: "iss-106", name: "Pilot Issue", status: "published", date: "Mar 21, 2026" },
    ],
    skills: [],
    schedule: { frequency: "biweekly", dayOfWeek: "Friday", time: "10:00", timezone: "America/New_York", active: true },
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
  updateIssueSections: (newsletterId: string, issueId: string, sections: DocSection[]) => void;
  addSource: (
    newsletterId: string,
    input: { type: SourceType; name: string; url?: string; fileName?: string; detail?: string },
  ) => void;
  removeSource: (newsletterId: string, sourceId: string) => void;
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

  const updateIssueSections = (newsletterId: string, issueId: string, sections: DocSection[]) =>
    updateNewsletter(newsletterId, (nl) => ({
      ...nl,
      issues: nl.issues.map((i) => (i.id === issueId ? { ...i, sections } : i)),
    }));

  const addSource: WorkspaceContextType["addSource"] = (newsletterId, input) =>
    updateNewsletter(newsletterId, (nl) => {
      const id = `src-${Date.now()}`;
      const detail =
        input.detail ??
        (input.type === "url"
          ? input.url?.replace(/^https?:\/\//, "").replace(/\/$/, "") ?? ""
          : "Just uploaded");
      const next: Source = {
        id,
        type: input.type,
        name: input.name,
        detail,
        url: input.url,
        fileName: input.fileName,
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

  const acceptSuggestedSource = (newsletterId: string, suggestedId: string) =>
    updateNewsletter(newsletterId, (nl) => {
      const sug = nl.suggestedSources.find((s) => s.id === suggestedId);
      if (!sug) return nl;
      const promoted: Source = {
        id: `src-${Date.now()}`,
        type: sug.type,
        name: sug.name,
        detail: sug.detail,
        url: sug.type === "url" ? sug.detail : undefined,
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
      updateIssueSections,
      addSource,
      removeSource,
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
