# Application History Screen - UX Specification

**Created:** 2025-11-24
**Purpose:** Resolve Epic 4 (Story 4.4) - Design comprehensive wireframes for application history feature
**Status:** Complete - Ready for Implementation

---

## Overview

The Application History screen enables users to view, search, filter, and manage all their past tailored job applications. This is a premium feature (Growth tier) that provides users with a centralized dashboard to track their application progress, revisit previous tailored documents, and make data-driven decisions about their job search strategy.

**Key User Value:**
- Track which jobs they've applied to
- Reuse successful CVs for similar roles
- Avoid duplicate applications
- Analyze patterns (which types of jobs yield interviews)
- Export application data for personal tracking

---

## 1. Desktop Wireframe (1024px+)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Dashboard  Create Application  [History] ⬅ Active  [Profile▾]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ 📋 Application History                                   [Export CSV]        │
│                                                                               │
│ ┌───────────────────────────────────────────────────────────────────────┐   │
│ │  [🔍 Search by company or job title...]           [+ Create New]      │   │
│ │                                                                         │   │
│ │  Filters:  [All Status ▾]  [All Dates ▾]  [Match Score: All ▾]       │   │
│ │            [Clear Filters]                                             │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│ Showing 12 of 37 applications                                 [Sort: Newest ▾]│
│                                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Marketing Coordinator - TechStart AS                    Nov 22, 2025   │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ Match Score: 78%  |  ATS Score: 92  |  Status: [Interview Scheduled] │ │
│ │                                                                         │ │
│ │ Applied: 3 days ago  |  Last updated: 2 hours ago                      │ │
│ │                                                                         │ │
│ │ [View CV] [View Cover Letter] [View Job Ad] [Edit Status] [Notes] [⋮] │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Junior Developer - CodeCraft                            Nov 18, 2025   │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ Match Score: 85%  |  ATS Score: 88  |  Status: [Applied]              │ │
│ │                                                                         │ │
│ │ Applied: 1 week ago  |  Last updated: 1 week ago                       │ │
│ │                                                                         │ │
│ │ [View CV] [View Cover Letter] [View Job Ad] [Edit Status] [Notes] [⋮] │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Content Strategist - MediaHub                           Nov 15, 2025   │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ Match Score: 72%  |  ATS Score: 90  |  Status: [Rejected]             │ │
│ │                                                                         │ │
│ │ Applied: 2 weeks ago  |  Last updated: 1 week ago                      │ │
│ │                                                                         │ │
│ │ [View CV] [View Cover Letter] [View Job Ad] [Edit Status] [Notes] [⋮] │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│                          [Load More]                                          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mobile Wireframe (375px)

```
┌───────────────────────────┐
│ 📋 History  [+ Create]    │
├───────────────────────────┤
│ [🔍 Search...]            │
│                           │
│ [All Status ▾]            │
│ [All Dates ▾]             │
│ [Clear Filters]           │
├───────────────────────────┤
│ 37 applications           │
│ Sort: [Newest ▾]          │
├───────────────────────────┤
│ ┌───────────────────────┐ │
│ │ Marketing Coordinator │ │
│ │ TechStart AS          │ │
│ │                       │ │
│ │ 78% Match | ATS 92    │ │
│ │ ✅ Interview          │ │
│ │                       │ │
│ │ Nov 22 | 3 days ago   │ │
│ │                       │ │
│ │ [View Details →]      │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ Junior Developer      │ │
│ │ CodeCraft             │ │
│ │                       │ │
│ │ 85% Match | ATS 88    │ │
│ │ 📤 Applied            │ │
│ │                       │ │
│ │ Nov 18 | 1 week ago   │ │
│ │                       │ │
│ │ [View Details →]      │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ Content Strategist    │ │
│ │ MediaHub              │ │
│ │                       │ │
│ │ 72% Match | ATS 90    │ │
│ │ ❌ Rejected           │ │
│ │                       │ │
│ │ Nov 15 | 2 weeks ago  │ │
│ │                       │ │
│ │ [View Details →]      │ │
│ └───────────────────────┘ │
│                           │
│ [Load More]               │
│                           │
│ ─────────────────────────  │
│ [Home][Create][History]   │
│                [Profile]  │
└───────────────────────────┘
```

---

## 3. Application Detail View (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [← Back to History]                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ 📄 Marketing Coordinator - TechStart AS                                      │
│                                                                               │
│ ┌───────────────────────────────────────────────────────────────────────┐   │
│ │ Status: [Interview Scheduled ▾]    Date Applied: Nov 22, 2025        │   │
│ │                                                                         │   │
│ │ Match Score: 78%  |  ATS Score: 92/100                                │   │
│ │                                                                         │   │
│ │ [Save]  [Mark as Archived]                                             │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│ ┌───────────────────────────────────────────────────────────────────────┐   │
│ │ 📝 Notes                                                               │   │
│ │                                                                         │   │
│ │ [____________________________________________________________________] │   │
│ │ [____________________________________________________________________] │   │
│ │ [____________________________________________________________________] │   │
│ │                                                                         │   │
│ │ Add your personal notes, interview dates, feedback, etc.              │   │
│ │                                                                         │   │
│ │ [Save Notes]                                                           │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│ ┌──────────────────────────────┬────────────────────────────────────────┐   │
│ │ 📄 Tailored CV               │  📝 Cover Letter                       │   │
│ ├──────────────────────────────┼────────────────────────────────────────┤   │
│ │ Emma Johnson                 │  Dear Hiring Manager,                  │   │
│ │ Digital Marketing Specialist │                                        │   │
│ │                              │  I am writing to express my interest   │   │
│ │ EXPERIENCE                   │  in the Marketing Coordinator position │   │
│ │ • Led social media strategy  │  at TechStart AS...                    │   │
│ │   across Instagram & LinkedIn│                                        │   │
│ │ • Developed data-driven      │  [Full cover letter preview...]        │   │
│ │   content...                 │                                        │   │
│ │                              │                                        │   │
│ │ [Download PDF]               │  [Download DOCX]                       │   │
│ │ [Download DOCX]              │  [Download PDF]                        │   │
│ └──────────────────────────────┴────────────────────────────────────────┘   │
│                                                                               │
│ ┌───────────────────────────────────────────────────────────────────────┐   │
│ │ 🎯 Job Description (Saved)                                            │   │
│ │                                                                         │   │
│ │ Marketing Coordinator - TechStart AS                                   │   │
│ │                                                                         │   │
│ │ We're seeking a Marketing Coordinator to join our growing team...     │   │
│ │                                                                         │   │
│ │ Key Requirements:                                                      │   │
│ │ • 2+ years digital marketing experience                                │   │
│ │ • Social media management (Instagram, LinkedIn)                        │   │
│ │ • Content creation and copywriting                                     │   │
│ │ • Data analysis (Google Analytics)                                     │   │
│ │                                                                         │   │
│ │ [View Full Job Description]                                            │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│ ┌───────────────────────────────────────────────────────────────────────┐   │
│ │ 🔄 Timeline                                                            │   │
│ │                                                                         │   │
│ │ ✅ Nov 22, 2025 - Application created and tailored                     │   │
│ │ ✅ Nov 22, 2025 - CV and cover letter generated (ATS: 92)             │   │
│ │ ✅ Nov 23, 2025 - Status updated: Interview scheduled                 │   │
│ │ ✅ Nov 24, 2025 - Notes added: "Interview on Dec 1 at 10am"           │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│ [Delete Application]                                                          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Application Detail View (Mobile)

```
┌───────────────────────────┐
│ [← History]               │
├───────────────────────────┤
│ Marketing Coordinator     │
│ TechStart AS              │
│                           │
│ [Interview Scheduled ▾]   │
│ Nov 22, 2025              │
│                           │
│ 78% Match | ATS 92        │
│                           │
│ [Save]                    │
├───────────────────────────┤
│ 📝 Notes                  │
│                           │
│ [____________________]    │
│ [____________________]    │
│ [____________________]    │
│                           │
│ [Save Notes]              │
├───────────────────────────┤
│ 📄 Tailored CV            │
│                           │
│ Emma Johnson              │
│ Digital Marketing         │
│ Specialist                │
│                           │
│ EXPERIENCE                │
│ • Led social media        │
│   strategy...             │
│                           │
│ [Download PDF]            │
│ [Download DOCX]           │
│ [View Full CV →]          │
├───────────────────────────┤
│ 📝 Cover Letter           │
│                           │
│ Dear Hiring Manager,      │
│                           │
│ I am writing to express   │
│ my interest in the        │
│ Marketing Coordinator...  │
│                           │
│ [Download PDF]            │
│ [Download DOCX]           │
│ [View Full Letter →]      │
├───────────────────────────┤
│ 🎯 Job Description        │
│                           │
│ Marketing Coordinator     │
│ TechStart AS              │
│                           │
│ Key Requirements:         │
│ • 2+ years digital        │
│   marketing experience    │
│ • Social media management │
│ • Content creation        │
│                           │
│ [View Full Job Ad →]      │
├───────────────────────────┤
│ 🔄 Timeline               │
│                           │
│ ✅ Nov 22 - Created       │
│ ✅ Nov 22 - Generated     │
│ ✅ Nov 23 - Interview     │
│ ✅ Nov 24 - Notes added   │
│                           │
│ [View Full Timeline]      │
├───────────────────────────┤
│ [Delete Application]      │
└───────────────────────────┘
```

---

## 5. Filter & Search Specifications

### 5.1 Search Functionality

**Behavior:**
- Real-time search as user types (debounced 300ms)
- Searches across: Company name, job title, job description keywords
- Minimum 2 characters to trigger search
- Clear "X" button appears when text is entered
- Search persists across page refreshes (saved in URL params)

**Empty State:**
```
┌─────────────────────────────────────────────┐
│ 🔍 No results found for "Senior Designer"  │
│                                              │
│ Try:                                         │
│ • Checking your spelling                    │
│ • Using fewer or different keywords          │
│ • Clearing your filters                      │
│                                              │
│ [Clear Search]  [Clear All Filters]         │
└─────────────────────────────────────────────┘
```

### 5.2 Status Filter

**Options:**
- All Status (default)
- Applied
- Interview Scheduled
- Interviewing
- Offered
- Rejected
- Withdrawn
- Archived

**UI:** Dropdown menu with checkboxes (multi-select)

### 5.3 Date Filter

**Options:**
- All Dates (default)
- Last 7 days
- Last 30 days
- Last 3 months
- Last 6 months
- Last year
- Custom range (date picker)

**UI:** Dropdown menu with radio buttons (single-select)

### 5.4 Match Score Filter

**Options:**
- All (default)
- Excellent (90-100%)
- Good (70-89%)
- Fair (50-69%)
- Poor (< 50%)

**UI:** Dropdown menu with checkboxes (multi-select)

---

## 6. Sort Options

**Options:**
- Newest first (default)
- Oldest first
- Match score (high to low)
- Match score (low to high)
- ATS score (high to low)
- Company name (A-Z)
- Job title (A-Z)

**UI:** Dropdown menu (single-select)

---

## 7. Status Management

### 7.1 Status Dropdown (Inline Edit)

**Behavior:**
- Click status badge → Dropdown opens
- Select new status → Auto-saves
- Toast confirmation: "Status updated to Interview Scheduled"
- Color-coded status badges:
  - **Applied:** Blue (`bg-blue-100 text-blue-700`)
  - **Interview Scheduled:** Purple (`bg-purple-100 text-purple-700`)
  - **Interviewing:** Purple (`bg-purple-100 text-purple-700`)
  - **Offered:** Green (`bg-green-100 text-green-700`)
  - **Rejected:** Red (`bg-red-100 text-red-700`)
  - **Withdrawn:** Gray (`bg-gray-100 text-gray-700`)
  - **Archived:** Gray (`bg-gray-100 text-gray-700`)

### 7.2 Custom Status (Future)

Allow users to create custom status labels (e.g., "Waiting for response," "Second interview")

---

## 8. Notes Functionality

### 8.1 Notes Section

**Features:**
- Rich text editor (bold, italic, lists, links)
- Auto-save every 30 seconds
- Character limit: 5,000 characters
- Timestamp: "Last edited 2 hours ago"
- Private (never shared)

**Use Cases:**
- Interview date/time
- Interviewer names
- Salary discussed
- Feedback from interview
- Follow-up reminders

### 8.2 Notes UI

**Component:** Textarea or rich text editor (e.g., TipTap, Quill)

**Placeholder Text:**
```
Add notes about this application:
• Interview dates and interviewers
• Salary range discussed
• Key talking points
• Follow-up actions
```

---

## 9. Export Functionality

### 9.1 Export CSV Button

**Behavior:**
- Exports current filtered/searched results (not all applications)
- Includes: Company, Job Title, Date Applied, Status, Match Score, ATS Score, Notes

**CSV Format:**
```csv
Company,Job Title,Date Applied,Status,Match Score,ATS Score,Notes
TechStart AS,Marketing Coordinator,2025-11-22,Interview Scheduled,78,92,"Interview on Dec 1 at 10am"
CodeCraft,Junior Developer,2025-11-18,Applied,85,88,
MediaHub,Content Strategist,2025-11-15,Rejected,72,90,"Rejected due to lack of SEO experience"
```

**File Name:** `ai-cv-applications-2025-11-24.csv`

---

## 10. Empty States

### 10.1 No Applications Yet

```
┌─────────────────────────────────────────────┐
│            📋 No Applications Yet            │
│                                              │
│ Start building your application history by  │
│ creating your first tailored application.   │
│                                              │
│           [Create First Application]         │
│                                              │
│ Don't have a CV yet? [Upload CV First]      │
└─────────────────────────────────────────────┘
```

### 10.2 No Results After Filter

```
┌─────────────────────────────────────────────┐
│           🔍 No Applications Found           │
│                                              │
│ No applications match your current filters. │
│                                              │
│ Try adjusting your filters or search term.  │
│                                              │
│           [Clear All Filters]                │
└─────────────────────────────────────────────┘
```

---

## 11. Actions Menu (⋮)

**Options:**
- Edit Status
- Add/Edit Notes
- Duplicate Application (reuse for similar job)
- Archive Application
- Delete Application

**Delete Confirmation:**
```
┌─────────────────────────────────────────────┐
│           🗑️  Delete Application?           │
├─────────────────────────────────────────────┤
│                                              │
│ Are you sure you want to delete this        │
│ application for "Marketing Coordinator"?    │
│                                              │
│ This will permanently remove:               │
│ • Tailored CV and cover letter              │
│ • Job description snapshot                   │
│ • Notes and timeline                         │
│                                              │
│ This action cannot be undone.               │
│                                              │
│         [Cancel]  [Delete Permanently]       │
└─────────────────────────────────────────────┘
```

---

## 12. Component Specifications

### 12.1 ApplicationCard Component

**Props:**
```tsx
interface ApplicationCardProps {
  application: {
    id: string
    jobTitle: string
    company: string
    dateApplied: Date
    lastUpdated: Date
    status: ApplicationStatus
    matchScore: number
    atsScore: number
    notes?: string
  }
  onViewDetails: (id: string) => void
  onEditStatus: (id: string, newStatus: ApplicationStatus) => void
  onDelete: (id: string) => void
}
```

### 12.2 ApplicationDetailView Component

**Props:**
```tsx
interface ApplicationDetailViewProps {
  application: ApplicationDetail
  onSave: (updates: Partial<ApplicationDetail>) => void
  onDelete: (id: string) => void
  onBack: () => void
}

interface ApplicationDetail {
  id: string
  jobTitle: string
  company: string
  dateApplied: Date
  status: ApplicationStatus
  matchScore: number
  atsScore: number
  notes: string
  tailoredCV: CVData
  coverLetter: string
  jobDescription: string
  timeline: TimelineEvent[]
}
```

### 12.3 StatusBadge Component

**Props:**
```tsx
interface StatusBadgeProps {
  status: ApplicationStatus
  editable?: boolean
  onChange?: (newStatus: ApplicationStatus) => void
}

type ApplicationStatus =
  | 'applied'
  | 'interview_scheduled'
  | 'interviewing'
  | 'offered'
  | 'rejected'
  | 'withdrawn'
  | 'archived'
```

---

## 13. Accessibility

**Keyboard Navigation:**
- Tab through all interactive elements
- Enter/Space to open dropdowns
- Arrow keys to navigate dropdown options
- Escape to close dropdowns/modals

**Screen Reader:**
- Status badges announced: "Status: Interview Scheduled"
- Search input: `aria-label="Search applications by company or job title"`
- Filter dropdowns: `aria-label="Filter by status"`, `aria-expanded={isOpen}`
- Cards: `role="article"`, `aria-label="Application for Marketing Coordinator at TechStart AS"`

**WCAG 2.1 AA:**
- Color contrast: 4.5:1 for text
- Touch targets: 44x44px minimum on mobile
- Focus indicators: Visible 2px blue ring

---

## 14. Implementation Checklist

**Frontend (React):**
- [ ] ApplicationHistory page component
- [ ] ApplicationCard component
- [ ] ApplicationDetailView component
- [ ] StatusBadge component (with inline edit)
- [ ] SearchBar component (with debounced search)
- [ ] FilterPanel component (status, date, match score)
- [ ] SortDropdown component
- [ ] ExportCSV functionality
- [ ] Notes editor (textarea or rich text)
- [ ] Timeline component
- [ ] Empty states

**Backend (Node.js/Express):**
- [ ] `GET /api/applications` - List applications (with search, filter, sort)
- [ ] `GET /api/applications/:id` - Get application details
- [ ] `PATCH /api/applications/:id` - Update application (status, notes)
- [ ] `DELETE /api/applications/:id` - Delete application
- [ ] `GET /api/applications/export` - Export as CSV

**Database:**
- [ ] `applications` table already exists from Epic 4 (Story 4.4)
- [ ] Add columns: `status`, `notes`, `archived`, `last_updated`
- [ ] Index: `user_id`, `status`, `date_applied` for fast filtering

---

## 15. Traceability to Epic 4

| Epic 4 Story | UI Component Designed | Status |
|--------------|----------------------|--------|
| **Story 4.4:** Save & Retrieve Tailored Application History | Sections 1-14 (Complete wireframes) | ✅ Complete |

**Resolution Status:** ✅ **Application History UI fully specified**

All wireframes, components, and interaction patterns are now defined for Epic 4, Story 4.4 implementation.

---

**END OF APPLICATION HISTORY UX SPECIFICATION**
