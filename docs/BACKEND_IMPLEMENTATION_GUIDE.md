# Marabel — Backend Implementation Guide

## Overview

Marabel is a content intelligence layer that sits on top of email marketing platforms (HubSpot, Mailchimp, Brevo). It generates newsletter content using AI, manages multi-brand/multi-newsletter workspaces, and provides a structured review/approval workflow before pushing content to the connected platform.

The frontend is built in Next.js 16 + TypeScript + Tailwind CSS. All state is currently client-side (React Context). This document describes what the backend needs to support.

---

## 1. Data Models

### 1.1 User
```
User {
  id: uuid (PK)
  email: string (unique, indexed)
  name: string
  passwordHash: string (nullable — SSO users may not have one)
  avatarUrl?: string
  authProvider: "email" | "google" | "microsoft"
  emailVerified: boolean
  lastLoginAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 1.2 Workspace (Brand)
```
Workspace {
  id: uuid (PK)
  name: string
  industry?: string
  initial: string (computed)
  color: string
  ownerId: uuid (FK → User)    // creator, cannot be removed
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 1.3 WorkspaceMembership
```
WorkspaceMembership {
  id: uuid (PK)
  userId: uuid (FK → User, nullable — null when pending invite)
  workspaceId: uuid (FK → Workspace)
  email: string                 // for pending invites before user exists
  role: "Admin" | "Editor" | "Reviewer"
  isAdmin: boolean              // combined: Admin+Editor, Admin+Reviewer
  status: "active" | "pending" | "deactivated"
  invitedBy: uuid (FK → User)
  inviteToken?: string (indexed) // for pending invitations
  inviteExpiresAt?: DateTime
  invitedAt: DateTime
  acceptedAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime

  UNIQUE(workspaceId, email)
}
```

### 1.4 Brand Identity
```
BrandIdentity {
  id: uuid (PK)
  workspaceId: uuid (FK → Workspace, unique)
  audience: text
  voice: text
  values: text
  createdAt: DateTime
  updatedAt: DateTime
}

BrandIdentityFile {
  id: uuid (PK)
  brandIdentityId: uuid (FK → BrandIdentity)
  fileKey: string              // S3 key
  fileName: string
  fileSize: number
  mimeType: string
  type: "brand_guide" | "reference"
  uploadedAt: DateTime
}

BrandIdentityReference {
  id: uuid (PK)
  brandIdentityId: uuid (FK → BrandIdentity)
  url: string
  notes?: text
  createdAt: DateTime
}
```

### 1.5 Newsletter
```
Newsletter {
  id: uuid (PK)
  workspaceId: uuid (FK → Workspace)
  name: string
  createdAt: DateTime
  updatedAt: DateTime

  INDEX(workspaceId)
}
```

### 1.6 Newsletter Identity
```
NewsletterIdentity {
  id: uuid (PK)
  newsletterId: uuid (FK → Newsletter, unique)
  persona: text
  voice: text
  voiceTones: string[]          // ["Professional", "Witty"]
  values: text
  copiedFromBrand: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 1.7 Schedule
```
Schedule {
  id: uuid (PK)
  newsletterId: uuid (FK → Newsletter, unique)
  frequency: "daily" | "weekly" | "biweekly" | "monthly"
  dayOfWeek?: string            // "Monday" through "Sunday"
  dayOfMonth?: number           // 1-28
  time: string                  // "09:00" HH:mm
  timezone: string              // IANA e.g. "America/New_York"
  syncSource: "marabel" | "platform"
  lastSyncedAt?: DateTime
  nextSendAt: DateTime (computed, indexed)  // precomputed next send time in UTC
  createdAt: DateTime
  updatedAt: DateTime
}
```
**Note**: `nextSendAt` must be recomputed on every schedule change. Store in UTC for cron job matching. The background job queries `WHERE nextSendAt <= NOW()` to find due newsletters.

### 1.8 Structure (Newsletter Template)
```
NewsletterStructure {
  id: uuid (PK)
  newsletterId: uuid (FK → Newsletter, unique)
  version: number               // for tracking structure changes
  createdAt: DateTime
  updatedAt: DateTime
}

StructureSection {
  id: uuid (PK)
  structureId: uuid (FK → NewsletterStructure)
  name: string
  order: number
  contentCount: number
  hasHeadline: boolean
  showDate: boolean
  showSources: boolean
  createdAt: DateTime
  updatedAt: DateTime

  INDEX(structureId, order)
}

ParagraphConfig {
  id: uuid (PK)
  sectionId: uuid (FK → StructureSection)
  order: number
  hasTitle: boolean
  title?: string
  maxLines: number              // 1-10
}
```
**Note**: Increment `version` on every structure update. Content generated against a previous version should be flagged for regeneration.

### 1.9 Source
```
Source {
  id: uuid (PK)
  newsletterId: uuid (FK → Newsletter)
  type: "url" | "document" | "api"
  name: string
  url?: string
  fileKey?: string              // S3 key for documents
  fileName?: string
  fileSize?: number
  apiEndpoint?: string
  apiKeyEncrypted?: string      // encrypted with per-workspace key
  status: "active" | "syncing" | "processed" | "error"
  lastError?: text              // last error message for debugging
  lastSyncAt?: DateTime
  nextSyncAt?: DateTime         // when to poll next
  syncIntervalMinutes: number   // default 60
  itemCount: number (default 0)
  createdAt: DateTime
  updatedAt: DateTime

  INDEX(newsletterId, status)
  INDEX(nextSyncAt)             // for source sync cron
}
```

### 1.10 SourceItem (indexed content from sources)
```
SourceItem {
  id: uuid (PK)
  sourceId: uuid (FK → Source)
  externalUrl?: string
  title: string
  summary: text
  content: text
  publishedAt?: DateTime
  embedding: vector(1536)       // for semantic search
  createdAt: DateTime

  INDEX(sourceId, publishedAt DESC)
}
```
**Note**: This table stores crawled/parsed content from sources. The `embedding` column enables semantic matching against newsletter identity for confidence scoring.

### 1.11 Skill
```
Skill {
  id: uuid (PK)
  ownerId: uuid                 // workspaceId or newsletterId
  ownerType: "workspace" | "newsletter"
  name: string
  description: text
  fileKey?: string
  fileName?: string
  active: boolean (default true)
  parsedContent?: text          // extracted text from uploaded file
  createdAt: DateTime
  updatedAt: DateTime

  INDEX(ownerId, ownerType)
}
```

### 1.12 Issue
```
Issue {
  id: uuid (PK)
  newsletterId: uuid (FK → Newsletter)
  name: string
  issueNumber: number           // auto-incrementing per newsletter
  status: "in_progress" | "published" | "archived"
  scheduledDate?: DateTime
  publishedAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime

  INDEX(newsletterId, status)
  INDEX(newsletterId, issueNumber DESC)
  UNIQUE(newsletterId, issueNumber)
}
```

### 1.13 Content
```
Content {
  id: uuid (PK)
  newsletterId: uuid (FK → Newsletter)
  issueId: uuid (FK → Issue)
  title: string
  description: text
  confidence: number            // 0-100
  topics: string[]
  sourceItemIds: uuid[]         // FK → SourceItem, which sources contributed
  status: "suggestion" | "saved" | "in_review" | "approved" | "published"
  sectionId?: uuid (FK → StructureSection)
  sectionOrder?: number
  currentReviewStep: number (default 0)
  structureVersion: number      // which structure version this was generated against
  generatedAt: DateTime
  lastRegeneratedAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime

  INDEX(issueId, status)
  INDEX(issueId, sectionId, sectionOrder)
}
```

### 1.14 Content Block (structured content body)
```
ContentBlock {
  id: uuid (PK)
  contentId: uuid (FK → Content)
  sectionConfigId: uuid (FK → StructureSection)  // which section format was used
  headline?: string
  createdAt: DateTime
  updatedAt: DateTime
}

ContentField {
  id: uuid (PK)
  contentBlockId: uuid (FK → ContentBlock)
  label: string
  value: text
  order: number
}

ContentSource {
  id: uuid (PK)
  contentBlockId: uuid (FK → ContentBlock)
  name: string
  url: string
}
```

### 1.15 Review Activity (audit trail)
```
ReviewActivity {
  id: uuid (PK)
  contentId: uuid (FK → Content)
  userId: uuid (FK → User)
  action: "submitted" | "approved" | "section_changed" | "edited" | "published"
  fromStep?: number
  toStep?: number
  fromSectionId?: uuid
  toSectionId?: uuid
  comment?: text
  createdAt: DateTime

  INDEX(contentId, createdAt DESC)
}
```
**Note**: Critical for audit compliance. Every state transition on content is logged.

### 1.16 Reviewer Assignment
```
ReviewerAssignment {
  id: uuid (PK)
  newsletterId: uuid (FK → Newsletter)
  userId: uuid (FK → User)
  role: "Reviewer" | "Editor"
  step: number
  isAdmin: boolean
  createdAt: DateTime
  updatedAt: DateTime

  UNIQUE(newsletterId, userId)
  UNIQUE(newsletterId, step)
  // Enforce: only one Editor per newsletter at application level
}
```

### 1.17 Platform Connection
```
PlatformConnection {
  id: uuid (PK)
  newsletterId: uuid (FK → Newsletter, unique)
  platform: "hubspot" | "mailchimp" | "brevo"
  status: "connected" | "disconnected" | "error"
  accessToken: encrypted
  refreshToken: encrypted
  tokenExpiresAt?: DateTime
  externalAccountId?: string    // platform-side account identifier
  lastSyncAt?: DateTime
  lastError?: text
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 1.18 Onboarding Conversation
```
OnboardingConversation {
  id: uuid (PK)
  userId: uuid (FK → User)
  mode: "full" | "newsletter"
  status: "in_progress" | "completed" | "abandoned"
  extractedConfig: jsonb        // accumulated configuration from chat
  createdAt: DateTime
  updatedAt: DateTime
}

OnboardingMessage {
  id: uuid (PK)
  conversationId: uuid (FK → OnboardingConversation)
  role: "user" | "ai"
  content: text
  fileKeys?: string[]           // S3 keys for uploaded files
  createdAt: DateTime
}
```

---

## 2. API Endpoints

All endpoints return JSON. Authentication via Bearer token (JWT) in Authorization header. All mutating endpoints validate authorization (workspace membership + role).

### 2.1 Authentication
```
POST   /api/auth/signup              { email, name, password }
                                     → { user, token }
POST   /api/auth/login               { email, password }
                                     → { user, token }
POST   /api/auth/sso/google          { idToken }
                                     → { user, token }
POST   /api/auth/sso/microsoft       { idToken }
                                     → { user, token }
POST   /api/auth/logout              (invalidate token)
POST   /api/auth/forgot-password     { email }
                                     → { message } (sends email)
POST   /api/auth/reset-password      { token, newPassword }
                                     → { message }
POST   /api/auth/refresh             { refreshToken }
                                     → { token, refreshToken }
GET    /api/auth/me                  → { user }
PUT    /api/auth/me                  { name, avatarUrl }
PUT    /api/auth/me/password         { currentPassword, newPassword }
```

### 2.2 Workspaces (Brands)
```
GET    /api/workspaces                              → { workspaces[] }
POST   /api/workspaces                              { name, industry }
                                                    → { workspace }
GET    /api/workspaces/:id                          → { workspace, members[], newsletters[] }
PUT    /api/workspaces/:id                          { name, industry }
DELETE /api/workspaces/:id                          (cascade: newsletters, content, issues)
                                                    Auth: Admin only
```

### 2.3 Brand Identity
```
GET    /api/workspaces/:id/identity                 → { identity, files[], references[] }
PUT    /api/workspaces/:id/identity                 { audience, voice, values }
POST   /api/workspaces/:id/identity/files           Multipart upload
                                                    → { file }
DELETE /api/workspaces/:id/identity/files/:fileId
POST   /api/workspaces/:id/identity/references      { url, notes }
DELETE /api/workspaces/:id/identity/references/:refId
```

### 2.4 Workspace Members
```
GET    /api/workspaces/:id/members                  → { members[] }
POST   /api/workspaces/:id/members/invite           { email, name, role, isAdmin, newsletterIds[] }
                                                    → { membership } (sends invitation email)
                                                    Auth: Admin only
PUT    /api/workspaces/:id/members/:memberId        { role, isAdmin }
                                                    Auth: Admin only
DELETE /api/workspaces/:id/members/:memberId        Auth: Admin only, cannot remove owner
POST   /api/invitations/:token/accept               { name?, password? }
                                                    → { user, token }
```

### 2.5 Newsletters
```
GET    /api/workspaces/:wsId/newsletters             → { newsletters[] }
POST   /api/workspaces/:wsId/newsletters             { name }
                                                     → { newsletter } (auto-creates empty identity, structure, schedule)
GET    /api/newsletters/:id                          → { newsletter, identity, structure, schedule, stats }
PUT    /api/newsletters/:id                          { name }
DELETE /api/newsletters/:id                          Auth: Admin only, cannot delete last in workspace
GET    /api/newsletters/:id/stats                    → { openRate, clickRate, deltas, issueCount, subscriberCount }
GET    /api/newsletters/:id/completion               → { sections: { platform, identity, structure, schedule, sources, skills, reviewers: "complete"|"incomplete" } }
```
**Note**: The `/completion` endpoint powers the green/red status dots in the sidebar.

### 2.6 Newsletter Identity
```
GET    /api/newsletters/:id/identity                → { identity }
PUT    /api/newsletters/:id/identity                { persona, voice, voiceTones[], values }
POST   /api/newsletters/:id/identity/copy-from-brand
                                                    → { identity } (copies workspace identity values)
```

### 2.7 Structure
```
GET    /api/newsletters/:id/structure               → { structure, sections[] }
PUT    /api/newsletters/:id/structure               { sections: [{ name, order, contentCount, hasHeadline, showDate, showSources, paragraphs: [{ order, hasTitle, title, maxLines }] }] }
                                                    → { structure } (increments version)
POST   /api/newsletters/:id/structure/import        → { structure } (reads from connected platform)
```

### 2.8 Schedule
```
GET    /api/newsletters/:id/schedule                → { schedule }
PUT    /api/newsletters/:id/schedule                { frequency, dayOfWeek?, dayOfMonth?, time, timezone }
                                                    → { schedule } (recomputes nextSendAt)
POST   /api/newsletters/:id/schedule/import         → { schedule } (reads from connected platform)
POST   /api/newsletters/:id/schedule/push           → { schedule } (writes to connected platform)
```

### 2.9 Sources
```
GET    /api/newsletters/:id/sources                 → { sources[] }
POST   /api/newsletters/:id/sources                 { type, name, url?, apiEndpoint?, apiKey? }
                                                    → { source } (triggers initial sync job)
POST   /api/newsletters/:id/sources/upload          Multipart (document type)
                                                    → { source } (triggers document processing job)
PUT    /api/newsletters/:id/sources/:sourceId       { name, syncIntervalMinutes }
DELETE /api/newsletters/:id/sources/:sourceId
POST   /api/newsletters/:id/sources/:sourceId/sync  (manual trigger)
                                                    → { source }
GET    /api/newsletters/:id/sources/suggestions     → { suggestions: [{ name, type, relevance, reason }] }
```

### 2.10 Skills
```
// Brand-level
GET    /api/workspaces/:id/skills                   → { skills[] }
POST   /api/workspaces/:id/skills                   Multipart { name, description, file? }
                                                    → { skill }
PUT    /api/workspaces/:id/skills/:skillId          { name?, description?, active? }
DELETE /api/workspaces/:id/skills/:skillId

// Newsletter-level
GET    /api/newsletters/:id/skills                  → { skills[], inheritedSkills[] }
POST   /api/newsletters/:id/skills                  Multipart { name, description, file? }
PUT    /api/newsletters/:id/skills/:skillId         { name?, description?, active? }
DELETE /api/newsletters/:id/skills/:skillId
```
**Note**: The newsletter GET endpoint returns both newsletter-level and inherited brand-level skills with their active state.

### 2.11 Reviewers
```
GET    /api/newsletters/:id/reviewers               → { reviewers[], editor?, availableFromBrand[] }
POST   /api/newsletters/:id/reviewers               { userId?, email?, name?, role, isAdmin }
                                                    → { reviewer }
                                                    Auth: Admin only
PUT    /api/newsletters/:id/reviewers/:revId        { step }
                                                    Auth: Admin only
PUT    /api/newsletters/:id/reviewers/reorder       { orderedIds: uuid[] }
                                                    → { reviewers[] }
                                                    Auth: Admin only
DELETE /api/newsletters/:id/reviewers/:revId        Auth: Admin only
```
**Note**: The GET endpoint also returns `availableFromBrand` — members assigned to other newsletters in the same workspace who are not yet assigned to this one.

### 2.12 Issues
```
GET    /api/newsletters/:id/issues                  → { issues[] }
GET    /api/newsletters/:id/issues?status=in_progress|published|archived
                                                    → { issues[] }
GET    /api/issues/:id                              → { issue, contentCounts: { suggestion, in_review, approved, saved } }
PUT    /api/issues/:id/archive                      → { issue }
```
**Note**: Issues are created automatically by the content generation cron. No manual POST endpoint.

### 2.13 Content
```
GET    /api/issues/:id/content                      → { content[] }
GET    /api/issues/:id/content?status=suggestion|saved|in_review|approved
                                                    → { content[] }
GET    /api/issues/:id/content?reviewStep=1         → { content[] } (content at a specific review step)
GET    /api/content/:id                             → { content, blocks, fields[], sources[] }
PUT    /api/content/:id                             { headline?, fields?, sources? }
                                                    → { content } (saves edits)
                                                    Auth: current reviewer or editor
POST   /api/content/:id/select                      { sectionId, sectionOrder }
                                                    → { content } (assigns section, moves to step 1)
                                                    Auth: Editor only
POST   /api/content/:id/save                        → { content } (moves to saved status)
POST   /api/content/:id/unsave                      → { content } (moves back to suggestion)
POST   /api/content/:id/submit                      → { content } (increments currentReviewStep)
                                                    Auth: current reviewer at this step
POST   /api/content/:id/approve                     → { content } (sets status to approved)
                                                    Auth: Editor only, content must be at final step
POST   /api/content/:id/change-section              { sectionId, sectionOrder }
                                                    → { content } (triggers regeneration)
                                                    Auth: any reviewer or editor
DELETE /api/content/:id                             Auth: Editor only, not allowed if published
```
**Note**: The `submit` endpoint validates that the requesting user is the reviewer assigned to `currentReviewStep`. The `approve` endpoint validates that the user is the Editor and that `currentReviewStep == totalReviewers + 1`.

### 2.14 Platform Connection
```
GET    /api/newsletters/:id/platform                → { connection? }
POST   /api/newsletters/:id/platform/connect        { platform }
                                                    → { authUrl } (redirect to OAuth flow)
GET    /api/platform/callback                       { code, state }
                                                    → redirect (handles OAuth callback)
POST   /api/newsletters/:id/platform/disconnect     → { message }
POST   /api/newsletters/:id/platform/push           → { result }
                                                    (pushes all approved content for current issue)
```

### 2.15 Onboarding (AI Chat)
```
POST   /api/onboarding/conversations                { mode: "full"|"newsletter" }
                                                    → { conversation, firstMessage }
POST   /api/onboarding/conversations/:id/messages   { content, files? }
                                                    → { aiResponse, extractedConfig, completedItems[] }
POST   /api/onboarding/conversations/:id/complete   → { workspace?, newsletter? }
                                                    (creates all resources from extractedConfig)
```

### 2.16 Notifications
```
GET    /api/notifications                           → { notifications[] }
PUT    /api/notifications/:id/read                  → { notification }
PUT    /api/notifications/read-all                  → { count }
```

---

## 3. Platform Integrations

### 3.1 HubSpot
- **Auth**: OAuth 2.0 (authorization code flow)
- **Scopes**: `content`, `marketing-email`
- **Import schedule**: `GET /marketing/v3/emails` → read send settings
- **Import structure**: `GET /marketing/v3/emails/:id` → parse template sections
- **Push content**: `POST /marketing/v3/emails` → create/update email content
- **Push schedule**: `PUT /marketing/v3/emails/:id/schedule`
- **Webhook**: Register for `marketing-email.send` event to detect when emails are sent (updates issue status)

### 3.2 Mailchimp
- **Auth**: OAuth 2.0
- **Import schedule**: `GET /campaigns` → read campaign settings
- **Import structure**: `GET /templates/:id` → parse template content blocks
- **Push content**: `PUT /campaigns/:id/content` → set HTML content
- **Push schedule**: `POST /campaigns/:id/actions/schedule`
- **Webhook**: Subscribe to `campaign.sent` for send confirmation

### 3.3 Brevo
- **Auth**: API Key (header: `api-key`)
- **Import schedule**: `GET /emailCampaigns` → read campaign settings
- **Import structure**: `GET /emailCampaigns/:id` → template details
- **Push content**: `PUT /emailCampaigns/:id` → update campaign content
- **Push schedule**: `POST /emailCampaigns/:id/sendNow` or scheduled send

### 3.4 Integration Architecture
```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Marabel   │────►│  Platform        │────►│  HubSpot /      │
│   Backend   │◄────│  Adapter Layer   │◄────│  Mailchimp /    │
│             │     │  (unified API)   │     │  Brevo          │
└─────────────┘     └──────────────────┘     └─────────────────┘
```
**Note**: Implement a Platform Adapter interface so new platforms can be added without changing core logic. Each adapter implements: `importSchedule()`, `importStructure()`, `pushContent()`, `pushSchedule()`, `handleWebhook()`.

---

## 4. AI/ML Services

### 4.1 Content Generation Pipeline
```
Trigger: Issue published OR daily cron for in-progress issues

Pipeline:
1. Gather context:
   - Newsletter identity (persona, voice, values)
   - Brand identity (audience, voice, values)
   - Structure definition (sections, format specs)
   - Active skills (brand + newsletter level)
   - Recent source items (from SourceItem table)

2. For each section in the structure:
   - Query source items semantically relevant to newsletter persona
   - Score relevance (confidence %)
   - Generate structured content matching section format:
     - Headline (if hasHeadline)
     - Fields with correct paragraph count and line limits
     - Source attribution

3. Store as Content + ContentBlock + ContentField + ContentSource

4. Mark as "suggestion" status
```

### 4.2 Content Regeneration (section change)
```
Trigger: Content moved to different section

1. Load existing content (title, description, sources)
2. Load new section's format specification
3. Regenerate ContentBlock to match new format:
   - Different paragraph count/length
   - Add/remove headline, date, sources per config
4. Update structureVersion on Content
5. Log ReviewActivity
```

### 4.3 Source Monitoring
```
URL sources:
  - HTTP crawler with robots.txt compliance
  - RSS/Atom feed parser (prefer feeds, fall back to HTML scraping)
  - Extract: title, summary, content, publishedAt
  - Generate embedding for semantic search
  - Rate limit per domain

Document sources:
  - Parse PDF/DOC/DOCX/TXT/CSV with Apache Tika or similar
  - Chunk into sections
  - Generate embeddings per chunk
  - Store as SourceItems

API sources:
  - Call endpoint with configured auth
  - Parse response (JSON expected)
  - Map to SourceItems
  - Respect rate limits from API
```

### 4.4 Source Suggestions
```
Input: Brand identity text + newsletter identity text + existing source URLs
Process: Use LLM to suggest relevant publications, blogs, feeds
Output: { name, type, relevance (0-100), reason }
Cache: Refresh daily or on identity change
```

### 4.5 Content Match Scoring
```
Input: SourceItem embedding + newsletter identity embedding
Method: Cosine similarity, scaled to 0-100
Threshold: Suggest items scoring > 60
```

### 4.6 Ask Marabel (Chat Onboarding)
```
System prompt includes:
  - Current conversation state (which fields are collected)
  - Expected fields still needed
  - Brand/newsletter context if available

Capabilities:
  - Parse brand guidelines from uploaded PDFs
  - Extract persona info from descriptions
  - Suggest structure from natural language descriptions
  - Return structured extractedConfig alongside conversational response

Response format:
{
  "message": "conversational response text",
  "extractedConfig": {
    "brandName": "Acme Corp",
    "industry": "B2B SaaS",
    ...
  },
  "completedItems": ["Brand name", "Industry"],
  "options": ["HubSpot", "Mailchimp", "Brevo"]  // optional quick replies
}
```

---

## 5. Background Jobs

### 5.1 Content Generation Cron
```
Schedule: Every minute (checks for due newsletters)
Query: SELECT * FROM schedules WHERE nextSendAt <= NOW()

For each due schedule:
1. Mark current issue as "published" (set publishedAt)
2. Create new issue (auto-increment issueNumber)
3. Queue content generation job
4. Recompute nextSendAt

Daily update job:
Schedule: Every day at 00:00 UTC
Query: SELECT * FROM issues WHERE status = 'in_progress'
For each: Re-run content generation with latest source data
```

### 5.2 Source Sync Cron
```
Schedule: Every 5 minutes
Query: SELECT * FROM sources WHERE status = 'active' AND nextSyncAt <= NOW()

For each:
1. Set status = 'syncing'
2. Fetch new content (URL crawl / API call)
3. Parse and create SourceItems
4. Generate embeddings
5. Update lastSyncAt, nextSyncAt, itemCount
6. Set status = 'active' (or 'error' with lastError)
```

### 5.3 Platform Sync
```
Trigger: Content approved by editor
Action: Queue platform push job

Job:
1. Load all approved content for the issue
2. Format content for platform API
3. Push via Platform Adapter
4. Update content status to 'published'
5. Update issue status to 'published'
6. Trigger next issue creation
```

### 5.4 Invitation Emails
```
Trigger: POST /api/workspaces/:id/members/invite
Action:
1. Create WorkspaceMembership with status='pending'
2. Generate inviteToken (cryptographic random, 48 chars)
3. Send email with link: /invitations/{token}
4. Token expires after 7 days
```

### 5.5 Token Refresh (Platform OAuth)
```
Schedule: Every hour
Query: SELECT * FROM platform_connections WHERE tokenExpiresAt <= NOW() + INTERVAL '1 hour'

For each:
1. Call platform refresh token endpoint
2. Update accessToken, refreshToken, tokenExpiresAt
3. On failure: set status = 'error', notify admin
```

### 5.6 Stale Source Cleanup
```
Schedule: Daily
Action: Flag sources that have not synced successfully in 7+ days
Notify admin of errored sources
```

---

## 6. Authorization Rules

### 6.1 Roles & Permissions Matrix
| Action | Admin | Editor | Reviewer |
|--------|-------|--------|----------|
| Create/delete brands | Yes | No | No |
| Edit brand settings & identity | Yes | No | No |
| Create/delete newsletters | Yes | No | No |
| Invite/remove team members | Yes | No | No |
| Manage skills | Yes | No | No |
| Connect/disconnect platform | Yes | No | No |
| Configure structure | Yes | Yes | No |
| Configure schedule | Yes | Yes | No |
| Manage sources | Yes | Yes | No |
| Configure newsletter identity | Yes | Yes | No |
| Select content + assign section | No | Yes | No |
| Review content at assigned step | No | No | Yes (own step only) |
| Edit content during review | No | Yes | Yes (at own step) |
| Change content section | No | Yes | Yes (at own step) |
| Final approval | No | Yes | No |
| View all content | Yes | Yes | Yes |
| Delete content | No | Yes | No |
| View analytics/stats | Yes | Yes | Yes |

### 6.2 Constraints
- Only **one Editor per newsletter** — enforce at application layer on ReviewerAssignment
- Multiple Reviewers per newsletter, ordered by `step`
- Admin can be combined with Editor or Reviewer (`isAdmin = true`)
- Admin alone (without Editor/Reviewer role) can manage but cannot participate in review
- Content cannot transition to "approved" without an Editor assigned
- Cannot delete the last newsletter in a workspace
- Cannot remove the workspace owner from membership
- A reviewer can only submit content at their own step (validate `currentReviewStep == reviewer.step`)
- Editor can only approve content at step `max(reviewer.step) + 1`

### 6.3 Middleware Implementation
```
// Pseudocode for authorization middleware
async function authorize(req, resource, action) {
  const user = req.user
  const membership = await getMembership(user.id, resource.workspaceId)
  
  if (!membership || membership.status !== 'active') throw 403
  
  const permissions = getPermissions(membership.role, membership.isAdmin)
  if (!permissions.includes(action)) throw 403
  
  // For review actions, also check step assignment
  if (action === 'submit_review') {
    const assignment = await getReviewerAssignment(user.id, resource.newsletterId)
    if (assignment.step !== resource.content.currentReviewStep) throw 403
  }
}
```

---

## 7. File Storage

### Architecture
```
Upload flow:
1. Client requests presigned upload URL: POST /api/uploads/presign { fileName, mimeType, context }
2. Client uploads directly to S3 using presigned URL
3. Client confirms upload: POST /api/uploads/confirm { fileKey }
4. Backend validates file exists, updates relevant record

Download flow:
1. Client requests: GET /api/files/:fileKey
2. Backend generates presigned download URL (15 min expiry)
3. Returns { url } — client fetches directly from S3
```

### Storage buckets
| Bucket | Contents | Max Size | Retention |
|--------|----------|----------|-----------|
| `marabel-brand-files` | Brand guidelines, references | 10MB | Until deleted |
| `marabel-source-docs` | Source documents (PDFs, reports) | 25MB | Until deleted |
| `marabel-skill-files` | Skill guideline documents | 10MB | Until deleted |
| `marabel-chat-uploads` | Onboarding chat attachments | 10MB | 30 days |

### Virus scanning
- Run ClamAV or similar on all uploads before processing
- Reject infected files with 422 response

---

## 8. Real-time Requirements

### Recommended: Server-Sent Events (SSE)
```
GET /api/newsletters/:id/events (SSE stream)

Events:
- content.generated     { contentId, issueId }
- content.submitted     { contentId, fromStep, toStep, submittedBy }
- content.approved      { contentId, approvedBy }
- content.published     { contentId }
- source.synced         { sourceId, newItemCount }
- issue.created         { issueId, name }
- issue.published       { issueId }
```

### Alternative: Polling
- If SSE is not feasible, the frontend can poll `/api/issues/:id/content` every 30s
- Content generation progress can be polled via `/api/issues/:id` (check contentCounts)

---

## 9. Security

### Authentication
- JWT access tokens (15 min expiry)
- Refresh tokens (30 day expiry, stored in httpOnly cookie)
- Token rotation on refresh (invalidate old refresh token)
- Rate limit: 5 failed login attempts per email per 15 minutes

### Encryption
- TLS 1.3 for all traffic
- AES-256-GCM for data at rest:
  - Platform OAuth tokens
  - API source keys
  - Invite tokens (hashed, not encrypted)
- Per-workspace encryption keys stored in KMS (AWS KMS or Vault)

### API Security
- Rate limiting: 100 req/min per user, 1000 req/min per workspace
- CORS: whitelist frontend domain only
- CSRF: SameSite cookie attribute + CSRF token for mutations
- Input validation: Zod schemas on all endpoints
- SQL injection: Parameterized queries via ORM (Prisma)
- XSS: Content Security Policy headers, output encoding

### Compliance
- SOC 2 Type II (target)
- GDPR: Data export (GET /api/auth/me/export), data deletion (DELETE /api/auth/me)
- CCPA: Same endpoints, plus opt-out tracking

### Audit Logging
- All mutating actions logged to `audit_log` table
- Fields: userId, action, resourceType, resourceId, metadata (jsonb), ipAddress, userAgent, createdAt
- Retained for 2 years minimum

---

## 10. Database Design Notes

### Indexes (critical for performance)
```sql
-- Content queries (most frequent)
CREATE INDEX idx_content_issue_status ON content(issue_id, status);
CREATE INDEX idx_content_issue_section ON content(issue_id, section_id, section_order);
CREATE INDEX idx_content_issue_step ON content(issue_id, current_review_step) WHERE status = 'in_review';

-- Source sync cron
CREATE INDEX idx_source_next_sync ON sources(next_sync_at) WHERE status = 'active';

-- Schedule cron
CREATE INDEX idx_schedule_next_send ON schedules(next_send_at);

-- Source items for semantic search
CREATE INDEX idx_source_items_embedding ON source_items USING ivfflat(embedding vector_cosine_ops);

-- Audit trail
CREATE INDEX idx_review_activity_content ON review_activity(content_id, created_at DESC);
```

### Soft deletes
- Workspaces, newsletters, content: use `deletedAt` column instead of hard delete
- Allows recovery within 30-day window
- Background job permanently deletes after 30 days

### Multi-tenancy
- All queries must be scoped by `workspaceId`
- Add Row Level Security (RLS) in PostgreSQL as defense-in-depth
- Never expose internal UUIDs in URLs — use them internally, but validate workspace membership on every request

---

## 11. Observability

### Logging
- Structured JSON logs (timestamp, level, message, userId, workspaceId, traceId)
- Log all API requests with response time
- Log all background job executions with duration and outcome

### Metrics
- API response times (p50, p95, p99) per endpoint
- Content generation duration
- Source sync success/failure rate
- Queue depth for background jobs
- Active WebSocket/SSE connections

### Alerting
- API error rate > 1% for 5 minutes
- Content generation failure
- Source sync failure for 3+ consecutive attempts
- Platform OAuth token refresh failure
- Queue backup > 100 jobs

### Recommended: OpenTelemetry → Datadog or Grafana Cloud

---

## 12. Tech Stack Recommendation

| Layer | Recommendation | Alternative |
|-------|---------------|-------------|
| API Framework | Node.js + Fastify | Python + FastAPI |
| Database | PostgreSQL 16 + pgvector | - |
| ORM | Prisma | Drizzle |
| Auth | NextAuth.js v5 | Auth0, Clerk |
| File Storage | AWS S3 | Cloudflare R2 |
| Background Jobs | BullMQ (Redis) | Inngest, Temporal |
| AI/LLM | Anthropic Claude API | OpenAI |
| Vector Search | pgvector (in PostgreSQL) | Pinecone, Weaviate |
| Real-time | Server-Sent Events | Socket.io, Pusher |
| Email (transactional) | Resend | SendGrid |
| Deployment (API) | Railway | Fly.io, Render |
| Deployment (Frontend) | Vercel | Cloudflare Pages |
| Cache | Redis (shared with BullMQ) | - |
| Monitoring | Datadog | Grafana Cloud |
| Secrets | AWS KMS | HashiCorp Vault |

### Architecture Diagram
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────►│   API        │────►│  PostgreSQL  │
│   (Vercel)   │◄────│   (Railway)  │◄────│  + pgvector  │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                    ┌───────┼───────┐
                    │       │       │
              ┌─────▼──┐ ┌─▼────┐ ┌▼─────────┐
              │ Redis   │ │ S3   │ │ Claude   │
              │ (Queue) │ │(Files)│ │ API (AI) │
              └─────────┘ └──────┘ └──────────┘
                    │
              ┌─────▼──────────────────────────┐
              │     Background Workers          │
              │  - Content generation           │
              │  - Source sync                  │
              │  - Platform push                │
              │  - Email (invitations)          │
              │  - Token refresh                │
              └────────────────────────────────┘
```

---

## 13. Migration & Deployment Strategy

### Phase 1: Core (MVP)
- Auth, Workspaces, Newsletters, Members
- Brand Identity, Newsletter Identity
- Structure, Schedule
- Platform connection (HubSpot only)
- File uploads

### Phase 2: Content Pipeline
- Source management + sync jobs
- AI content generation
- Content CRUD + structured blocks
- Issue management

### Phase 3: Review Workflow
- Reviewer assignments
- Review step transitions
- Review activity audit trail
- Real-time notifications (SSE)

### Phase 4: Platform Push
- HubSpot content push
- Schedule sync (bidirectional)
- Mailchimp + Brevo adapters

### Phase 5: Intelligence
- Source suggestions
- Content confidence scoring
- Ask Marabel (chat onboarding)
- Skills processing (parse uploaded docs)
