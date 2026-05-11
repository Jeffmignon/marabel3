# Marabel — User Workflows

## Table of Contents
1. [First-Time User Onboarding](#1-first-time-user-onboarding)
2. [Creating a New Newsletter](#2-creating-a-new-newsletter)
3. [Creating a New Brand](#3-creating-a-new-brand)
4. [Content Generation Lifecycle](#4-content-generation-lifecycle)
5. [Content Selection & Section Assignment](#5-content-selection--section-assignment)
6. [Content Editing](#6-content-editing)
7. [Review & Approval Workflow](#7-review--approval-workflow)
8. [Issue Management](#8-issue-management)
9. [Source Management](#9-source-management)
10. [Brand Identity Management](#10-brand-identity-management)
11. [Newsletter Identity Management](#11-newsletter-identity-management)
12. [Newsletter Structure Configuration](#12-newsletter-structure-configuration)
13. [Schedule Management & Platform Sync](#13-schedule-management--platform-sync)
14. [Skills Management](#14-skills-management)
15. [Reviewer & Team Management](#15-reviewer--team-management)
16. [Platform Connection & Switching](#16-platform-connection--switching)
17. [Multi-Brand / Multi-Newsletter Navigation](#17-multi-brand--multi-newsletter-navigation)
18. [Brand & Newsletter Deletion](#18-brand--newsletter-deletion)
19. [Account Settings & Security](#19-account-settings--security)
20. [Invitation & Role Assignment](#20-invitation--role-assignment)
21. [Error States & Edge Cases](#21-error-states--edge-cases)
22. [State Machines](#22-state-machines)

---

## 1. First-Time User Onboarding

### Entry
User creates an account (email+password or SSO) → lands on empty overview → prompted to create first brand.

### Three paths available (choice modal)

#### Path A: Guided Setup (`/onboarding`)
```
Step 1:  Create Brand         → Name, industry
Step 2:  Brand Identity       → Upload brand guide (top) OR fill in:
                                 - Target audience (textarea, scrollable)
                                 - Brand voice (textarea, scrollable)
                                 - Brand values (textarea, scrollable)
Step 3:  Platform             → Select HubSpot, Mailchimp, or Brevo
Step 4:  Create Newsletter    → Newsletter name
Step 5:  Newsletter Identity  → Target persona (textarea)
                                 Key responsibilities (textarea)
                                 What makes them open it (textarea)
                                 Voice selection (checkboxes + free text)
                                 Option: "Copy from Brand Identity"
Step 6:  Structure            → Add sections manually (empty start)
                                 Per section: name, content count, toggles
                                 (headline, date, sources), paragraphs
                                 Option: Import from platform
Step 7:  Schedule             → Frequency (daily/weekly/biweekly/monthly)
                                 Day selector, time picker
                                 Option: Import from platform
Step 8:  Sources              → Add URLs inline
                                 Upload documents button
                                 Connect API button
Step 9:  Reviewers            → Add reviewers (name + email)
                                 Assign editor (name + email)
Step 10: Summary              → All settings as clickable cards
                                 Green = complete, Red = incomplete
                                 Click any to jump back and edit
                                 CTA: "Start Generating Content"
```

**Navigation features:**
- Progress bar at top — click any step to jump to it
- Back/Continue buttons at top AND bottom of each step
- Green checkmark = step visited and completed
- Red circle = step visited but incomplete
- Gray = not yet visited
- "Skip setup" link in header at all times

#### Path B: Ask Marabel (`/onboarding-chat`)
```
Conversational AI interface:
- Left: Chat area with message bubbles
- Right: Progress sidebar with completion checklist (13 items)

Conversation flow:
1.  Brand name (free text)
2.  Industry (free text)
3.  Audience (free text or upload brand guide)
4.  Brand voice (free text)
5.  Brand values (free text)
6.  Platform (quick-select buttons: HubSpot, Mailchimp, Brevo, Later)
7.  Newsletter name (free text)
8.  Target persona (free text or upload persona doc)
9.  Newsletter voice (quick-select: Same as brand, Different)
10. Structure (open-ended: "Describe what a typical issue looks like")
11. Schedule (quick-select: Weekly, Biweekly, Monthly, Daily)
12. Sources (free text URLs, can upload documents)
13. Reviewers (free text: name, email, role)
14. Done → "Go to Content" button
```

**Chat features:**
- Upload documents at any point via paperclip icon
- Files show as attachments in message bubbles
- Enter to send, Shift+Enter for new line
- Typing indicator (animated dots) during AI response
- "Switch to guided setup" link in header
- "Skip" link in header

#### Path C: Manual Setup
```
1. Brand created with name "New Brand"
2. User lands in sidebar with all menu items showing red status dots
3. User clicks each item to configure:
   Brand Identity → Platform → Newsletter Identity → Structure →
   Schedule → Sources → Skills → Content → Reviewers
4. Status dots turn green as each section is completed
```

### Post-onboarding
- First issue created automatically based on schedule
- Marabel begins generating content immediately
- User directed to Content page

---

## 2. Creating a New Newsletter

### Trigger
- Click "Create Newsletter" button on overview page (per brand)
- Click "Create Newsletter" dashed card in brand's newsletter grid
- Click "Create Newsletter" button in sidebar (within a brand)

### Flow
```
1. Choice modal appears (same 3 options):
   a. Guided Setup → /onboarding?mode=newsletter (steps 4-10 only)
   b. Ask Marabel → /onboarding-chat?mode=newsletter
   c. Set up manually → Newsletter created immediately

2. Guided/chat paths cover:
   - Newsletter name
   - Newsletter identity
   - Structure
   - Schedule
   - Sources
   - Reviewers
   - Summary

3. Manual path:
   - Newsletter created with name "New Newsletter"
   - Appears in sidebar with red status dots
   - User configures from menu
```

### Post-creation
- Newsletter appears in sidebar under its brand
- Status dots show what still needs configuration
- First issue created once schedule is set
- Content generation begins when sources + identity + structure are configured

---

## 3. Creating a New Brand

### Trigger
- Click "Create Brand" button on overview page
- Click "Create Brand" dashed card at bottom of overview
- Click "Create Brand" button in sidebar

### Flow
```
1. Choice modal appears (3 options: Guided, Ask Marabel, Manual)
2. Guided/chat paths cover full onboarding (brand + first newsletter)
3. Manual creates brand with default newsletter
```

---

## 4. Content Generation Lifecycle

### Trigger: Automatic
```
Content generation starts when:
1. An issue is published → next issue is created automatically
2. Marabel begins generating content for the new issue
3. Content is updated daily until the send date

Inputs for generation:
- Newsletter identity (persona, voice, values)
- Brand identity (audience, voice, values)
- Structure definition (sections, format, paragraph config)
- Active skills (brand-level + newsletter-level)
- Monitored sources (URLs, documents, APIs)
- Source activity (new articles, data updates)
```

### Content states
```
suggestion → saved → in_review → approved → published
                ↑                                │
                └── unsave (back to suggestion) ──┘ (not applicable)
```

### Per-suggestion data
```
- Title
- Description (short summary)
- Confidence score (0-100%)
- Topic tags
- Source attribution
- Assigned issue
- Assigned section (after selection)
- Position within section (after selection)
```

---

## 5. Content Selection & Section Assignment

### Who: Editor only

### Flow
```
1. Editor views Suggestions tab for an in-progress issue
2. For each suggestion, 3 actions:
   a. Select → opens section picker
   b. Save → moves to Saved tab (bookmark)
   c. Delete → confirmation modal → removed permanently

3. Section picker (modal):
   Step 1: Choose section
     - Shows all sections defined in Structure
     - Each shows format: pieces count, headline, paragraphs, date, sources
     - If section has only 1 piece → immediately assigns
     - If section has 2+ pieces → goes to Step 2

   Step 2: Choose position (only if section has 2+ pieces)
     - Shows position 1, 2, 3... with "Top of section" / "Bottom of section"
     - Click position → content is assigned

4. After selection:
   - Content is reformatted to match the section structure
   - Content moves to the first reviewer's tab
   - Green notice: '"Title" → Section Name (position X) — sent for review'
   - Tab counts update
```

### Saving for later
```
- Click "Save" (bookmark icon) on a suggestion
- Moves to Saved tab
- From Saved tab:
  - "Unsave" → returns to Suggestions tab
  - "Select" → same section picker flow
  - "Delete" → confirmation modal
```

---

## 6. Content Editing

### Who: Any reviewer or editor at their current step

### Entering edit mode
```
1. Click content title from any tab → content detail page
2. Click "Edit" button
3. Fields become editable:
   - Headline → inline text input
   - All text fields → textareas with dashed borders
   - Sources → name + URL inputs, add/remove
```

### Section reassignment during edit
```
1. In edit mode, "Move to section" dropdown appears
2. Dropdown shows amber warning: "Content will be regenerated to match the new section"
3. Select new section → content reformats
4. Tab switches to the new section's location
```

### Saving edits
```
- "Save Changes" button (disabled until changes made)
- "Unsaved changes" amber text shown
- "Cancel" reverts all changes
- Green notice on save: "Changes saved successfully"
- Must save before submitting for review
```

### Content detail view structure
```
Three tabs: The Brief | Field Notes | Beyond the Stack
(maps to newsletter structure sections)

Per tab:
- Section label with icon and color
- Headline card
- Content field cards (What's New, Why It Matters, One Question, Body)
- Quote blocks (with left border accent)
- Sources list (clickable links)

Footer:
- Author info (Marabel AI) + generation date
- "Submit for Review" button
```

---

## 7. Review & Approval Workflow

### Roles
```
Editor: Selects content, assigns sections, gives final approval
Reviewer: Reviews content at their assigned step, can change sections
```

### Content tabs (dynamic based on reviewers)
```
Example with 2 reviewers (Alex, Chris) and editor (Sam):

Suggestions | Alex Morgan | Chris Park | Final Review | Approved | Saved
```

### Reviewer tab view
```
Each reviewer tab shows:
- Reviewer info bar (avatar, name, step number, role badge)
- Content cards (same layout as Suggestions):
  - Title (clickable), description, confidence %
  - Section assignment bar: section name + format details
  - "Change section" dropdown with reformat warning
  - Topics, sources
  - "Submit for Review" button
```

### Flow per content piece
```
1. Suggestions tab → Editor clicks Select → assigns section
2. Content moves to Reviewer 1 tab (step 1)
3. Reviewer 1 reviews:
   - Can view full content detail
   - Can edit content
   - Can change section (triggers reformat)
   - Clicks "Submit for Review"
4. Content moves to Reviewer 2 tab (step 2)
5. Reviewer 2 reviews → clicks "Submit for Review"
6. Content moves to Final Review tab
7. Editor reviews → clicks "Approved"
8. Content moves to Approved tab
9. Green notice: '"Title" has been approved'
```

### Tab counts
```
- Update in real time as content moves between tabs
- Each tab shows count badge
```

---

## 8. Issue Management

### Automatic creation
```
- Issues created automatically by schedule
- When current issue is published → next issue created
- Marabel begins generating content for new issue immediately
- Content updated daily until send date
```

### Issue statuses
```
In Progress → Published → Archived
```

### Content page navigation
```
1. Status filter tabs: In Progress | Published | Archived (with counts)
2. Click tab → see list of issues with that status
3. Each issue card shows:
   - Issue name
   - Date (Scheduled: [date] or Published: [date])
   - Status badge
   - Archive button (on published issues only)
   - Arrow to enter
4. Click issue → see its content with tabs
5. "Back to [status] issues" link at top
6. Issue name + status + date shown as heading
```

### Published issue view
```
- Only Approved tab visible (no Suggestions, Review, Saved)
- No Filter or Create Brief buttons
- Content is read-only
- Badge shows "Published" instead of "Approved"
- No push button (already sent)
- Content count shown: "5 pieces of content"
```

### Archived issue view
```
- Same as published (read-only)
- Badge shows "Archived"
```

### Archiving
```
- "Archive" button on published issues (in issue list)
- Click → issue moves to Archived status immediately
- Archived tab count updates
```

---

## 9. Source Management

### Source types
```
URL:
  - Input: URL + optional name
  - Name auto-detected if not provided
  - Supports: websites, blogs, RSS feeds, social profiles, news pages

Document:
  - Drag & drop or file picker
  - Supported: PDF, DOC, DOCX, TXT, CSV, XLS (up to 25MB)
  - Processed and indexed after upload

API:
  - Input: name, API endpoint, API key
  - API key masked by default (show/hide toggle)
  - Key stored encrypted
  - Supports: CRMs, analytics platforms, internal systems
```

### Adding sources
```
1. Three buttons at top right: URL | Document | API
2. Click one → form panel appears (color-coded by type):
   - Navy dashed border for URL
   - Violet dashed border for Document
   - Emerald dashed border for API
3. Fill in fields → Add/Connect
4. Source appears at top of list with "Syncing..." status
5. Panel closes
```

### Marabel suggestions
```
- Right column: "Suggested by Marabel"
- Subtitle: "Based on your Brand Identity"
- Each suggestion shows:
  - Source name
  - Relevance score (%)
  - Reason (e.g., "Matches your B2B marketing audience")
- Actions: Add (adds to active sources) | Dismiss
```

### Source list
```
- Each source shows:
  - Type icon (color-coded: navy/violet/emerald)
  - Name + type badge (URL/Document/API)
  - Detail (URL, filename, or endpoint)
  - Item count + last sync time
  - Status icon (green check or spinning loader)
  - Delete button (trash)
```

### Deletion
```
- Trash icon per source → confirmation modal
- "Marabel will no longer monitor this source for content"
- Cancel or Remove
```

---

## 10. Brand Identity Management

### Location: Brand level in sidebar (above newsletters)

### Three tabs: Audience | Brand Voice | Brand Values

### Each tab offers three setup methods
```
1. Guided Wizard → answer questions in form fields → Save
2. Upload File → drag & drop → Upload & Analyze
3. Reference Examples → paste URLs with notes → Analyze & Save
   (only on Voice and Values tabs)
```

### Configured state
```
- "Configured" card shown when setup is done
- Green status dot in sidebar
```

### Editing
```
- "Edit" button on each tab
- Opens inline form to modify existing configuration
```

---

## 11. Newsletter Identity Management

### Location: Newsletter level in sidebar (Newsletter Identity menu item)

### Three tabs: Audience | Voice | Values

### Same setup methods as Brand Identity plus:
```
- "Copy from Brand Identity" button (top right)
- One click → copies brand audience, voice, values
- Green notice: "Brand Identity copied — customize it for this newsletter"
- User can then modify for this specific persona
```

### Audience tab questions (wizard)
```
- What is the specific persona this newsletter targets?
- What are their day-to-day responsibilities?
- What decisions do they influence in the buying process?
- What content do they currently consume?
- What would make them forward this newsletter to a colleague?
```

### Voice tab questions (wizard)
```
- How should this newsletter sound compared to your brand voice?
- What level of technical depth is appropriate?
- What emotions should readers feel?
- What language or phrases should this newsletter avoid?
```

### Values tab questions (wizard)
```
- What editorial perspective does this newsletter take?
- What makes this newsletter different from competitors?
- What principles guide content selection?
```

---

## 12. Newsletter Structure Configuration

### Location: Structure page (per newsletter)

### Empty start
- No prefilled sections
- "Add Section" dashed button
- Message: "Create at least one section to define your newsletter structure"

### Creating a section
```
1. Click "Add Section"
2. Type name (e.g., "The Brief") → click Add or press Enter
3. Section appears expanded with defaults:
   - 1 content piece
   - Headline: on
   - Date: on
   - Sources: on
   - 1 paragraph (3 lines, no title)
```

### Configuring a section
```
- Editable name (click to rename)
- Content count (+/- stepper)
- Toggles: Headline | Date | Sources
- Paragraphs:
  - Title toggle → when on, title input field appears
  - Lines count (+/- stepper, 1-10)
  - Add/remove paragraphs
- Collapse/expand (chevron)
- Delete (trash with confirmation)
```

### Import from platform
```
- "Import from HubSpot" card at top (if connected)
- Click Import → structure populated from platform template
- Review and save to confirm
```

### Live preview
```
- Wireframe preview per section
- Updates as toggles/counts change
- Shows: headline block, date block, paragraph blocks, source links
```

---

## 13. Schedule Management & Platform Sync

### Schedule configuration
```
Frequency cards: Daily | Weekly | Biweekly | Monthly
Day selector: Mon-Sun buttons (weekly/biweekly) or 1-28 grid (monthly)
Time: native time picker
Timezone: dropdown with 13+ common timezones
```

### Platform sync (bidirectional)
```
Two modes (toggle selection):

Import from Platform:
  - "Pull the current schedule from [Platform] into Marabel"
  - Click "Import Schedule" → spinner → fields populated
  - Green notice: "Schedule imported — review and save to confirm"

Set in Marabel:
  - Configure locally → save
  - "Sync to HubSpot" button (disabled if unsaved changes)
  - Click → spinner → "Schedule synced to [Platform]"
  - Last synced timestamp updates
```

### How content generation works with schedule
```
Summary card explains:
"The newsletter is sent every [day] at [time] [timezone].
As soon as an issue is published, Marabel starts generating
content for the next issue and updates it daily until the send date."
```

### Save flow
```
- "Save" button (disabled until changes)
- "Unsaved changes" amber text
- "Cancel" reverts to last saved
- Green notice on save
```

---

## 14. Skills Management

### Two levels (tab selector)
```
Brand Level: Skills apply to all newsletters in the brand
Newsletter Level: Skills apply only to the selected newsletter
```

### Adding a skill
```
1. Click "Add Skill"
2. Fill in:
   - Skill name
   - Description (textarea)
   - Upload file (optional): drag & drop area
     PDF, DOC, DOCX, TXT, CSV, JSON — up to 10MB
3. Click "Add Skill"
4. Skill created as active
```

### Managing skills
```
Per skill card:
- Name, description, file name, date added
- Type badge (Brand or Newsletter)
- Active/inactive toggle (navy on / gray off)
- Delete button (trash) → confirmation modal
- Inactive skills show "Inactive" badge + dimmed text
```

### Inheritance display (newsletter tab)
```
When viewing newsletter-level skills:
- Newsletter-specific skills shown first
- "Inherited from [Brand]" section below
- Brand skills can be toggled on/off from here too
- Brand skills cannot be deleted from newsletter view
```

---

## 15. Reviewer & Team Management

### Reviewers page (per newsletter, in sidebar)

#### Section 1: Active Reviewers
```
- Ordered list with step numbers
- Per reviewer: avatar, name, email, role badge(s), admin badge
- Reorder: up/down arrows
- Remove: trash icon → confirmation modal
- Constraints: editor always last step
```

#### Section 2: Editor (Final Approver)
```
- Single person with "Editor" badge
- One per newsletter
- Warning state if none assigned:
  "Content cannot be published without a final approver"
  + "Assign Editor" CTA
```

#### Section 3: Available from Brand
```
- People in other newsletters of this brand not assigned to this one
- "Add" button per person → adds as reviewer
```

#### Approval flow visualization
```
Marabel → Reviewer 1 → Reviewer 2 → Editor → Publish
(with avatars and names)
```

#### Invite new person (modal)
```
- Name, email
- Role dropdown: Reviewer | Editor
  (Editor disabled if one already assigned)
- Admin toggle: "Also grant Admin access"
- "Add" button
- Success confirmation
```

---

## 16. Platform Connection & Switching

### Viewing
```
Platform page shows 3 options:
- HubSpot (orange) — connected/available
- Mailchimp (yellow) — connected/available
- Brevo (green) — connected/available
```

### Connecting
```
1. Click "Connect" on desired platform
2. Confirmation modal:
   - Shows platform name and icon
   - "This will be the active connector for [Newsletter]"
   - Warning if another is connected: "[Platform] will be disconnected"
   - Cancel or Connect
3. After connecting: "Active" badge appears
```

### Disconnecting
```
1. Click "Disconnect" on active platform
2. Confirmation modal:
   - "Content will no longer be pushed to this platform for [Newsletter]"
   - Cancel or Disconnect
```

### Constraint
```
- Only one platform active per newsletter
- Connecting a new one automatically disconnects the current one
```

---

## 17. Multi-Brand / Multi-Newsletter Navigation

### Overview page (`/overview`)
```
- All brands listed with newsletter cards
- Per newsletter card:
  - Name, next send date
  - Open rate (with trend), click rate (with trend), suggestions ready
  - Click → navigates to that newsletter's Content page
- Dashed "Create Newsletter" card per brand
- Dashed "Create Brand" card at bottom
```

### Sidebar structure
```
Overview (link to /overview)
───
Brands
  Brand A
    Brand Identity (brand-level, with status dot)
    ─── Newsletters ───
    Newsletter 1 (with delete on hover)
      Platform (status dot)
      Newsletter Identity (status dot)
      Structure (status dot)
      Schedule (status dot)
      Sources (status dot)
      Skills (status dot)
      Content (no dot — always in progress)
      Reviewers (status dot)
    Newsletter 2
      [same sub-nav]
    + Create Newsletter (navy button)
  Brand B
    [same structure]
  + Create Brand (navy button)
───
Settings
───
User info (avatar, name, role)
```

### Switching context
```
- Click brand name → expands, shows its newsletters + sub-nav
- Previous brand collapses
- Click newsletter name → that newsletter becomes active
- All newsletter-level pages update to show that newsletter's data
```

### Status dots
```
Green dot: Section fully configured
Red dot: Section needs attention
No dot: Neutral (Content page)
```

### Logo
```
- Marabel logo in sidebar and all pages
- Clicking logo navigates to /overview from anywhere
```

---

## 18. Brand & Newsletter Deletion

### Deleting a brand
```
1. Hover over brand name in sidebar → trash icon appears
2. Click trash → confirmation modal:
   - "Delete brand?"
   - "[Brand Name] will be permanently deleted."
   - Warning: "All newsletters, content, and settings in this brand will be lost."
   - Cancel or Delete (red button)
3. After delete → switches to next available brand
```

### Deleting a newsletter
```
1. Hover over newsletter name in sidebar → trash icon appears
   (only shows if brand has 2+ newsletters)
2. Click trash → confirmation modal:
   - "Delete newsletter?"
   - "[Newsletter Name] will be permanently deleted."
   - Warning: "All content, issues, and settings for this newsletter will be lost."
   - Cancel or Delete
3. After delete → switches to next available newsletter

Constraint: Cannot delete the last newsletter in a brand
```

---

## 19. Account Settings & Security

### Account tab
```
- Profile section: avatar, first name, last name, email, role
- "Change" button on avatar
- "Save Changes" button
- Workspace section: workspace name, industry
- "Save Changes" button
```

### Team tab
```
- Member count
- "Invite Member" button → modal:
  - Email, name (optional)
  - Role dropdown with descriptions:
    Admin: "Full access. Manage team, brands, and settings."
    Editor: "Final approver for newsletter content."
    Reviewer: "Reviews content before final approval."
    Admin + Editor: "Admin access plus final approval rights."
    Admin + Reviewer: "Admin access plus content review rights."
  - "Send Invitation" button
  - Success state: "Invitation sent" with email shown
  - Auto-closes after 1.5s
- Members table: name, email, role (with badges), status (Active/Pending)
- Role descriptions at bottom (3 cards: Admin, Editor, Reviewer)
```

### Security tab
```
- Authentication methods listed:
  - Email & Password (Active)
  - Google SSO (Active)
  - Microsoft SSO (Active)
- Change password form: current, new, confirm
- "Update Password" button
```

---

## 20. Invitation & Role Assignment

### From Settings > Team
```
- Invite to the overall workspace
- Role assigned at workspace level
- New member appears as "Pending" until they accept
```

### From Reviewers page
```
- Invite directly to a specific newsletter
- Assign role (Reviewer or Editor) + step in approval chain
- Optional: grant Admin access via toggle
- Available brand members can be added with one click
```

### Role combinations
```
Standalone:
- Admin (manage only, no review)
- Editor (final approver only)
- Reviewer (review at assigned step only)

Combined:
- Admin + Editor (manage + final approval)
- Admin + Reviewer (manage + review at step)
```

### Invitation acceptance flow
```
1. Invited user receives email with invite link (/invitations/{token})
2. If user has an account → logs in → auto-joins workspace as assigned role
3. If user is new → signup form (name, password) → account created → joins workspace
4. Invite token expires after 7 days
5. Expired invites: admin can resend from Team tab
6. After accepting: status changes from "Pending" to "Active"
```

### Constraints
```
- Only one Editor per newsletter
- Editor role disabled in dropdown if already assigned
- Multiple Reviewers allowed, ordered by step
- Admin can add/remove people; non-admins cannot
- Cannot remove the workspace owner
```

---

## 21. Error States & Edge Cases

### No editor assigned
```
- Reviewers page shows amber warning card:
  "No editor assigned. Content cannot be published without a final approver."
  + "Assign Editor" CTA
```

### No reviewers assigned
```
- Reviewers page shows empty state:
  "No reviewers assigned"
  + "Add reviewers to have content checked before final approval"
```

### No sources
```
- Sources page shows suggestions only
- Content generation may produce lower quality suggestions
```

### No structure defined
```
- Structure page shows empty state:
  "Create at least one section to define your newsletter structure"
- Content cannot be properly formatted without structure
```

### No schedule set
```
- Schedule page shows defaults but not synced
- Issues not auto-created until schedule is saved
```

### Empty issue (no content)
```
- All tabs show empty states with contextual messages
- "No suggestions for this issue" / "No content pending review"
```

### Published content
```
- Read-only — no edit, delete, save, select, or section change
- No action buttons shown
```

### Last newsletter in brand
```
- Delete icon not shown (cannot delete last newsletter)
```

### Unsaved changes
```
- Amber "Unsaved changes" text appears
- "Save" button enabled
- "Cancel" reverts to last saved state
- Navigating away does not auto-save (implicit discard)
```

---

## 22. State Machines

### Content State Machine
```
                    ┌──────────────┐
                    │  suggestion  │
                    └──────┬───────┘
                           │
              ┌────────────┼──────────────┐
              │            │              │
       ┌──────▼───┐  ┌─────▼─────┐  ┌────▼────┐
       │  saved    │  │  select   │  │ delete  │
       │(bookmark) │  │(+section) │  │(removed)│
       └─────┬────┘  └─────┬─────┘  └─────────┘
             │              │
             │       ┌──────▼──────┐
             └──────►│  in_review  │ (step 1)
                     └──────┬──────┘
                            │ submit
                     ┌──────▼──────┐
                     │  in_review  │ (step 2)
                     └──────┬──────┘
                            │ submit
                     ┌──────▼──────┐
                     │  in_review  │ (step N — final review)
                     └──────┬──────┘
                            │ approved
                     ┌──────▼──────┐
                     │  approved   │
                     └──────┬──────┘
                            │ push to platform
                     ┌──────▼──────┐
                     │  published  │ (read-only)
                     └─────────────┘
```

### Issue State Machine
```
     ┌────────────────┐
     │  in_progress   │ (auto-created by schedule)
     └───────┬────────┘
             │ all content pushed
     ┌───────▼────────┐
     │   published    │
     └───────┬────────┘
             │ archive button
     ┌───────▼────────┐
     │   archived     │ (read-only)
     └────────────────┘
```

### Source State Machine
```
     ┌──────────┐
     │  syncing │ (initial after adding)
     └────┬─────┘
          │ sync complete
     ┌────▼─────┐
     │  active  │ (monitoring)
     └────┬─────┘
          │ delete
     ┌────▼─────┐
     │ removed  │
     └──────────┘

     (Documents use "processed" instead of "active")
```

### Skill State Machine
```
     ┌──────────┐
     │  active  │ (default on creation)
     └────┬─────┘
          │ toggle
     ┌────▼─────┐
     │ inactive │ (still exists, not applied)
     └────┬─────┘
          │ toggle
     ┌────▼─────┐
     │  active  │
     └──────────┘
```

---

## Workflow Diagram: End-to-End Newsletter Production

```
┌─────────────────────────────────────────────────────────────┐
│                      SETUP (one-time)                        │
│                                                              │
│  Brand Identity → Platform → Newsletter Identity →           │
│  Structure → Schedule → Sources → Skills → Reviewers         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONTENT PRODUCTION (per issue)              │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │ Marabel  │───►│ Sources  │───►│ Generate │               │
│  │ monitors │    │ update   │    │ content  │               │
│  └──────────┘    └──────────┘    └────┬─────┘               │
│                                       │                      │
│  ┌────────────────────────────────────▼──────────────────┐   │
│  │                 REVIEW PIPELINE                        │   │
│  │                                                        │   │
│  │  Suggestions → Editor selects → Reviewer 1 approves → │   │
│  │  Reviewer 2 approves → Editor final approval           │   │
│  └────────────────────────────┬───────────────────────────┘   │
│                               │                              │
│                        ┌──────▼──────┐                       │
│                        │   Approved  │                       │
│                        └──────┬──────┘                       │
│                               │                              │
│                        ┌──────▼──────┐                       │
│                        │    Push to  │                       │
│                        │  Platform   │                       │
│                        └──────┬──────┘                       │
│                               │                              │
│                        ┌──────▼──────┐                       │
│                        │  Published  │──► Next issue created │
│                        └─────────────┘    (cycle repeats)    │
└─────────────────────────────────────────────────────────────┘
```
