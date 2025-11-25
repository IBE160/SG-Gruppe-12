# GDPR Compliance UI Screens

**Created:** 2025-11-24
**Purpose:** Resolve Epic 5 blocker by designing all required GDPR user interface screens
**Status:** Complete - Ready for Implementation

---

## Overview

This document provides complete UI specifications for all GDPR compliance screens required by Epic 5 (Trust & Data Governance). These designs ensure users can exercise their rights under GDPR including consent management, data export, data correction, and deletion ("right to be forgotten").

**Design Principles:**
- **Transparency:** Clear, jargon-free language explaining what data is collected and why
- **User Control:** Granular options for consent, easy access to privacy tools
- **Trust Building:** Reassure users about data security and their rights
- **Compliance First:** Meet all GDPR requirements without dark patterns

---

## 1. Consent Modal (On Signup/First Login)

### 1.1 Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│                    🔒 Privacy & Data Consent                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Welcome to AI CV Assistant! Before you start, please review  │
│ how we handle your personal data.                            │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ✓ Essential Data Processing (Required)                │   │
│ │                                                         │   │
│ │ We need to process your CV, job applications, and      │   │
│ │ contact info to provide our service.                   │   │
│ │                                                         │   │
│ │ • Encrypted storage (AES-256)                          │   │
│ │ • GDPR-compliant EU servers                            │   │
│ │ • Auto-delete after 7 days of inactivity               │   │
│ │                                                         │   │
│ │ [Learn More →]                                         │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ □ AI Training Data (Optional)                          │   │
│ │                                                         │   │
│ │ Help improve our AI by allowing anonymized analysis    │   │
│ │ of application patterns. Your personal info is NEVER   │   │
│ │ used for model training.                                │   │
│ │                                                         │   │
│ │ • Only aggregated, anonymized statistics               │   │
│ │ • No personal identifiable information (PII)           │   │
│ │ • You can opt out anytime                              │   │
│ │                                                         │   │
│ │ [Learn More →]                                         │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ □ Product Updates & Tips (Optional)                    │   │
│ │                                                         │   │
│ │ Receive helpful tips, feature updates, and job search  │   │
│ │ advice via email (max 1-2 emails per month).           │   │
│ │                                                         │   │
│ │ [Learn More →]                                         │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ [View Full Privacy Policy] [View Data Processing Agreement]  │
│                                                               │
│              [Cancel]  [Accept Essential Only]               │
│                        [Accept All & Continue]               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Specifications

**Component:** Modal Dialog (centered, 600px width on desktop, full-screen on mobile)

**Behavior:**
- Appears on first login after signup
- Cannot be dismissed without making a choice (essential processing is required to use platform)
- "Accept Essential Only" allows user to proceed with minimal data processing
- "Accept All & Continue" enables optional features
- All choices are stored with timestamp and can be modified later

**Copy Guidelines:**
- Use plain language, avoid legal jargon
- Explain benefits to user (e.g., "Help improve our AI" not "Data aggregation for model optimization")
- Be transparent about what is required vs. optional
- Emphasize security measures (encryption, auto-delete)

**Accessibility:**
- Keyboard navigable (Tab through checkboxes, Enter to expand "Learn More")
- Screen reader announces: "Privacy consent required. Essential data processing is required to use the platform."
- Focus trap within modal
- WCAG 2.1 AA contrast (4.5:1 for body text)

**Technical Notes:**
- Store consent flags in `users` table: `consent_essential` (always true), `consent_ai_training` (bool), `consent_marketing` (bool)
- Log consent event with timestamp: `consent_logs` table (user_id, consent_type, granted, timestamp)

---

## 2. Privacy Settings Screen

### 2.1 Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]   Dashboard  Settings  [Profile▾]                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ⚙️ Settings                                                  │
│                                                               │
│ ┌─────────────────────┬───────────────────────────────────┐ │
│ │ • Profile           │  🔒 Privacy & Data Management     │ │
│ │ • 🔒 Privacy        │                                    │ │
│ │ • Subscription      │  Manage your data and privacy     │ │
│ │ • Notifications     │  preferences.                      │ │
│ │ • Help              │                                    │ │
│ │                     │  ───────────────────────────────  │ │
│ │                     │                                    │ │
│ │                     │  Data Consent Preferences         │ │
│ │                     │                                    │ │
│ │                     │  ┌─────────────────────────────┐  │ │
│ │                     │  │ ✓ Essential Processing      │  │ │
│ │                     │  │   (Required - cannot change) │  │ │
│ │                     │  │                              │  │ │
│ │                     │  │   CV data, job applications, │  │ │
│ │                     │  │   account info               │  │
│ │                     │  └─────────────────────────────┘  │ │
│ │                     │                                    │ │
│ │                     │  ┌─────────────────────────────┐  │ │
│ │                     │  │ [Toggle ON] AI Training Data │  │ │
│ │                     │  │                              │  │ │
│ │                     │  │ Help improve AI accuracy by  │  │
│ │                     │  │ analyzing anonymized patterns│  │
│ │                     │  │                              │  │
│ │                     │  │ Last updated: Nov 18, 2025   │  │
│ │                     │  └─────────────────────────────┘  │ │
│ │                     │                                    │ │
│ │                     │  ┌─────────────────────────────┐  │ │
│ │                     │  │ [Toggle OFF] Product Updates │  │
│ │                     │  │                              │  │
│ │                     │  │ Receive tips and feature     │  │
│ │                     │  │ updates via email            │  │
│ │                     │  │                              │  │
│ │                     │  │ Last updated: Nov 18, 2025   │  │
│ │                     │  └─────────────────────────────┘  │ │
│ │                     │                                    │ │
│ │                     │  ───────────────────────────────  │ │
│ │                     │                                    │ │
│ │                     │  Your Data Rights (GDPR)          │ │
│ │                     │                                    │ │
│ │                     │  ┌─────────────────────────────┐  │ │
│ │                     │  │ 📥 Export Your Data          │  │
│ │                     │  │                              │  │
│ │                     │  │ Download all your personal   │  │
│ │                     │  │ data in portable JSON format │  │
│ │                     │  │                              │  │
│ │                     │  │ [Request Data Export →]      │  │
│ │                     │  └─────────────────────────────┘  │ │
│ │                     │                                    │ │
│ │                     │  ┌─────────────────────────────┐  │ │
│ │                     │  │ ✏️  Correct Your Data        │  │
│ │                     │  │                              │  │
│ │                     │  │ Update or fix any incorrect  │  │
│ │                     │  │ personal information         │  │
│ │                     │  │                              │  │
│ │                     │  │ [Go to Profile Editor →]     │  │
│ │                     │  └─────────────────────────────┘  │ │
│ │                     │                                    │ │
│ │                     │  ┌─────────────────────────────┐  │ │
│ │                     │  │ 🗑️  Delete Your Data        │  │
│ │                     │  │                              │  │
│ │                     │  │ Permanently remove all your  │  │
│ │                     │  │ data and close your account  │  │
│ │                     │  │                              │  │
│ │                     │  │ [Request Account Deletion →] │  │
│ │                     │  └─────────────────────────────┘  │ │
│ │                     │                                    │ │
│ │                     │  ───────────────────────────────  │ │
│ │                     │                                    │ │
│ │                     │  Data Retention                   │ │
│ │                     │                                    │ │
│ │                     │  • CVs: Stored until you delete   │ │
│ │                     │  • Job ads: Auto-deleted after    │ │
│ │                     │    analysis (24 hours max)        │ │
│ │                     │  • Account: Auto-deleted after    │ │
│ │                     │    7 days of inactivity           │ │
│ │                     │  • Logs: Retained 90 days (PII    │ │
│ │                     │    redacted)                      │ │
│ │                     │                                    │ │
│ │                     │  [View Privacy Policy] [Contact   │ │
│ │                     │   Data Protection Officer]        │ │
│ └─────────────────────┴───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Specifications

**Location:** Settings → Privacy tab

**Layout:**
- Left sidebar: Settings navigation
- Right panel: Privacy content (max-width 800px)

**Behavior:**
- Toggle switches update consent in real-time with confirmation toast
- "Request Data Export" → Opens confirmation modal (see Section 3)
- "Request Account Deletion" → Opens confirmation modal (see Section 4)
- "Go to Profile Editor" → Navigates to profile settings

**Consent Toggle States:**
- **Essential Processing:** Always ON, disabled (cannot be toggled off)
- **AI Training:** Toggle ON/OFF (default: OFF per GDPR consent requirement)
- **Product Updates:** Toggle ON/OFF (default: OFF per GDPR consent requirement)

**Accessibility:**
- Keyboard navigable (Tab through toggles)
- Screen reader announces toggle state changes: "AI Training Data consent enabled" / "disabled"
- ARIA labels for all interactive elements

**Technical Notes:**
- API endpoint: `PATCH /api/user/consent` (updates consent flags)
- Log all consent changes: `consent_logs` table

---

## 3. Data Export Flow

### 3.1 Export Request Modal

```
┌─────────────────────────────────────────────────────────────┐
│                    📥 Export Your Data                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ You're about to download all your personal data in a         │
│ portable JSON format. This includes:                          │
│                                                               │
│ ✓ Account information (name, email, registration date)       │
│ ✓ CV data (all versions and edits)                          │
│ ✓ Job descriptions you've analyzed                          │
│ ✓ Tailored CVs and cover letters                            │
│ ✓ Application history                                        │
│ ✓ Consent preferences                                        │
│                                                               │
│ This file will be:                                           │
│ • In machine-readable JSON format                            │
│ • Securely encrypted                                         │
│ • Available for download for 7 days                          │
│ • Automatically deleted after download or 7 days             │
│                                                               │
│ ⚠️  Note: Raw job advertisement text is not included         │
│ (automatically deleted per copyright policy).                 │
│                                                               │
│ Estimated file size: ~2-5 MB                                 │
│ Processing time: 1-2 minutes                                 │
│                                                               │
│              [Cancel]  [Confirm Export Request]              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Export Processing Screen

```
┌─────────────────────────────────────────────────────────────┐
│                    📥 Preparing Your Data                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                  ⏳ Processing your request...                │
│                                                               │
│              [████████████████░░░░] 75%                      │
│                                                               │
│ ✓ Collecting account information                             │
│ ✓ Collecting CV data                                         │
│ ✓ Collecting application history                             │
│ → Packaging files...                                         │
│                                                               │
│ This usually takes 1-2 minutes. You'll receive an email      │
│ when your data is ready to download.                         │
│                                                               │
│              [Continue Using Platform]                       │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Export Ready Notification

**Email:**
```
Subject: Your data export is ready

Hi [User Name],

Your personal data export is ready to download.

[Download Data (expires Nov 25, 2025)]

This link will expire in 7 days for security reasons.

Your exported data includes:
• Account information
• CV data (all versions)
• Application history
• Consent preferences

If you didn't request this export, please contact us immediately.

Best,
AI CV Assistant Team
```

**In-App Banner:**
```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Your data export is ready!                               │
│ [Download Now] [Dismiss]    Expires in 7 days               │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Specifications

**Behavior:**
- User clicks "Request Data Export" → Modal appears
- User confirms → Background job starts processing
- Email sent when ready (within 30 minutes, GDPR requires 30 days max)
- Download link valid for 7 days
- File auto-deleted after download or expiration

**Export Format:**
```json
{
  "export_date": "2025-11-24T14:32:00Z",
  "user": {
    "user_id": "uuid",
    "email": "emma@example.com",
    "name": "Emma Johnson",
    "registration_date": "2025-11-01T10:00:00Z"
  },
  "cvs": [
    {
      "cv_id": "uuid",
      "created_at": "2025-11-01T10:15:00Z",
      "personal_info": {...},
      "education": [...],
      "experience": [...],
      "skills": [...]
    }
  ],
  "applications": [
    {
      "output_id": "uuid",
      "created_at": "2025-11-10T14:00:00Z",
      "job_title": "Marketing Coordinator",
      "tailored_cv": {...},
      "cover_letter": "...",
      "ats_score": 92
    }
  ],
  "consent": {
    "essential": true,
    "ai_training": false,
    "marketing": false,
    "updated_at": "2025-11-01T10:05:00Z"
  }
}
```

**Technical Notes:**
- API endpoint: `POST /api/user/data-export`
- Background job: Generate JSON, compress, encrypt
- Storage: Secure temporary bucket (S3 with expiration)
- Email service: Send secure download link

---

## 4. Account Deletion Flow

### 4.1 Deletion Request Modal

```
┌─────────────────────────────────────────────────────────────┐
│              🗑️  Delete Account & All Data                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ⚠️  Warning: This action cannot be undone!                   │
│                                                               │
│ Deleting your account will permanently remove:               │
│                                                               │
│ ❌ Your profile and account information                      │
│ ❌ All CV data and versions                                  │
│ ❌ All tailored applications and cover letters               │
│ ❌ Application history and analytics                         │
│ ❌ All consent records                                        │
│                                                               │
│ Your data will be:                                           │
│ • Immediately removed from active systems                    │
│ • Permanently deleted from backups within 30 days            │
│ • Unrecoverable after deletion                               │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Before you go, would you like to export your data?    │   │
│ │ [Export Data First]                                    │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ To confirm deletion, please type: DELETE MY ACCOUNT          │
│                                                               │
│ [____________________________________________________]        │
│                                                               │
│ Why are you leaving? (Optional)                              │
│ [ ] Found a better alternative                               │
│ [ ] Privacy concerns                                         │
│ [ ] No longer job searching                                  │
│ [ ] Too expensive                                            │
│ [ ] Other: [___________________]                             │
│                                                               │
│              [Cancel]  [Permanently Delete Account]          │
│              (Disabled until confirmation typed)             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Deletion Processing Screen

```
┌─────────────────────────────────────────────────────────────┐
│                  🗑️  Deleting Your Account                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                  ⏳ Removing your data...                     │
│                                                               │
│              [████████████████░░░░] 80%                      │
│                                                               │
│ ✓ Account deactivated                                        │
│ ✓ CV data deleted                                            │
│ ✓ Application history deleted                                │
│ → Removing backups...                                        │
│                                                               │
│ This process will complete in the next few minutes.          │
│ You will be logged out automatically.                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Deletion Confirmation

**Email:**
```
Subject: Your account has been deleted

Hi [User Name],

Your AI CV Assistant account has been permanently deleted
as requested.

What was deleted:
✓ All CV data and versions
✓ All tailored applications
✓ All application history
✓ Your profile and account information

Your data will be completely removed from backups within
30 days per our data retention policy.

If you didn't request this deletion, please contact us
immediately at privacy@aicvassistant.com

We're sorry to see you go. If you'd like to share why you
left, reply to this email—your feedback helps us improve.

Best,
AI CV Assistant Team
```

**Final Screen (before logout):**
```
┌─────────────────────────────────────────────────────────────┐
│                    ✅ Account Deleted                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Your account and all data have been permanently deleted.     │
│                                                               │
│ You will be logged out in 10 seconds...                     │
│                                                               │
│ We're sorry to see you go!                                  │
│                                                               │
│ If you change your mind in the future, you can create a     │
│ new account anytime.                                         │
│                                                               │
│              [Logout Now] [Provide Feedback]                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Specifications

**Behavior:**
- User clicks "Request Account Deletion" → Modal appears
- User must type "DELETE MY ACCOUNT" exactly (case-insensitive)
- "Permanently Delete Account" button enabled only after confirmation typed
- Optional feedback collected (helps product improvement)
- User immediately logged out after deletion
- Confirmation email sent

**Deletion Process:**
1. Deactivate account (cannot login)
2. Delete all user data from active database
3. Delete all associated files (CVs, documents)
4. Anonymize logs (replace PII with user_id hash)
5. Schedule backup deletion (30 days per GDPR)
6. Send confirmation email

**Safety Measures:**
- Require explicit typed confirmation
- Offer data export before deletion
- Collect optional feedback (helps prevent unnecessary deletions)
- Send confirmation email (catches unauthorized deletions)

**Technical Notes:**
- API endpoint: `DELETE /api/user/account`
- Background job: Cascade delete across all related tables
- Log deletion event: `deletion_logs` table (anonymized)
- Email service: Send confirmation

---

## 5. Mobile Adaptations

### 5.1 Consent Modal (Mobile)

```
┌───────────────────────────┐
│  🔒 Privacy & Consent     │
├───────────────────────────┤
│                           │
│ Welcome! Review how we    │
│ handle your data.         │
│                           │
│ ┌───────────────────────┐ │
│ │ ✓ Essential (Required)│ │
│ │                       │ │
│ │ CV processing, secure │ │
│ │ storage, auto-delete. │ │
│ │                       │ │
│ │ [Learn More ↓]        │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ □ AI Training         │ │
│ │   (Optional)          │ │
│ │                       │ │
│ │ Anonymized patterns   │ │
│ │ only. No PII shared.  │ │
│ │                       │ │
│ │ [Learn More ↓]        │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ □ Product Updates     │ │
│ │   (Optional)          │ │
│ │                       │ │
│ │ 1-2 emails/month max. │ │
│ │                       │ │
│ │ [Learn More ↓]        │ │
│ └───────────────────────┘ │
│                           │
│ [Privacy Policy]          │
│                           │
│ [Essential Only]          │
│ [Accept All]              │
└───────────────────────────┘
```

**Mobile Considerations:**
- Full-screen modal (better touch UX)
- Larger touch targets (48x48px minimum)
- Shorter copy (avoid scrolling if possible)
- Sticky footer buttons

### 5.2 Privacy Settings (Mobile)

```
┌───────────────────────────┐
│ ⚙️ Settings               │
├───────────────────────────┤
│                           │
│ [Profile] [Privacy]       │
│ [Subscription] [Help]     │
│                           │
├───────────────────────────┤
│ 🔒 Privacy & Data         │
│                           │
│ Data Consent              │
│ ┌───────────────────────┐ │
│ │ ✓ Essential           │ │
│ │ (Required)            │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ AI Training   [ON]    │ │
│ │ Updated: Nov 18       │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ Updates      [OFF]    │ │
│ │ Updated: Nov 18       │ │
│ └───────────────────────┘ │
│                           │
│ Your Rights (GDPR)        │
│ ┌───────────────────────┐ │
│ │ 📥 Export Data →      │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ ✏️  Correct Data →    │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ 🗑️  Delete Account →  │ │
│ └───────────────────────┘ │
│                           │
│ Data Retention            │
│ • CVs: Until deleted      │
│ • Job ads: 24h max        │
│ • Account: 7 days idle    │
│                           │
│ [Privacy Policy]          │
│ [Contact DPO]             │
└───────────────────────────┘
```

**Mobile Considerations:**
- Vertical stacking (no sidebar)
- Tab navigation at top for settings categories
- Collapsible sections to reduce scrolling
- Full-width buttons

---

## 6. Error States

### 6.1 Export Failed

```
┌─────────────────────────────────────────────────────────────┐
│              ❌ Data Export Failed                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ We couldn't complete your data export due to a temporary     │
│ issue.                                                        │
│                                                               │
│ What happened:                                               │
│ • Server connection error (503)                              │
│                                                               │
│ What to try:                                                 │
│ • Wait a few minutes and try again                           │
│ • If the issue persists, contact support                     │
│                                                               │
│ Your data is safe and secure. This is just a temporary       │
│ processing issue.                                            │
│                                                               │
│              [Try Again]  [Contact Support]                  │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Deletion Failed

```
┌─────────────────────────────────────────────────────────────┐
│              ❌ Account Deletion Failed                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ We couldn't complete your account deletion due to a          │
│ temporary issue.                                             │
│                                                               │
│ What happened:                                               │
│ • Database connection error                                  │
│                                                               │
│ Your account and data remain intact. No changes were made.   │
│                                                               │
│ What to try:                                                 │
│ • Wait a few minutes and try again                           │
│ • Contact support for immediate assistance                   │
│                                                               │
│ If you have urgent privacy concerns, contact us immediately  │
│ at privacy@aicvassistant.com                                 │
│                                                               │
│              [Try Again]  [Contact Support]                  │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Consent Update Failed

**Toast Notification:**
```
┌─────────────────────────────────────────────────────────────┐
│ ❌ Consent update failed. Please try again. [Retry] [✕]     │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Toggle reverts to previous state
- User can retry immediately
- If retry fails, show error modal with support contact

---

## 7. Component Specifications

### 7.1 Consent Toggle Switch

**Props:**
```tsx
interface ConsentToggleProps {
  label: string
  description: string
  value: boolean
  disabled?: boolean
  required?: boolean
  onChange: (newValue: boolean) => void
  lastUpdated?: Date
}
```

**States:**
- Default: OFF (unchecked) - per GDPR, consent must be opt-in
- Hover: Light blue background
- Active: Blue background + white checkmark
- Disabled: Gray background, cursor not-allowed
- Required: Always ON, disabled

**Accessibility:**
- `role="switch"`
- `aria-checked={value}`
- `aria-disabled={disabled}`
- `aria-required={required}`
- Keyboard: Space to toggle

### 7.2 Deletion Confirmation Input

**Component:** Text Input with validation

**Validation Rules:**
- Must exactly match "DELETE MY ACCOUNT" (case-insensitive)
- Real-time validation (checks on every keystroke)
- Submit button disabled until valid
- Red border if invalid after blur

**Accessibility:**
- `aria-required="true"`
- `aria-invalid={!isValid && touched}`
- Error message: `aria-describedby="error-msg"`

---

## 8. Copy Guidelines

### 8.1 Tone & Voice

**Do:**
- Use plain language: "We'll delete your data" not "Data will be purged from repositories"
- Be transparent: "This takes 1-2 minutes" not "Processing"
- Reassure users: "Your data is safe and secure"
- Explain benefits: "Help improve AI accuracy" not "Enable telemetry"

**Don't:**
- Use legal jargon: "pursuant to", "aforementioned", "herein"
- Use dark patterns: Pre-checked boxes, confusing double negatives
- Hide information: Buried in privacy policy without summary
- Guilt-trip users: "You'll miss out on features" for declining consent

### 8.2 Key Phrases

| Instead of | Use |
|------------|-----|
| "Data processing agreement" | "How we handle your data" |
| "Withdraw consent" | "Turn off" or "Opt out" |
| "Exercise your rights" | "Manage your data" |
| "Data subject access request" | "Download your data" |
| "Right to erasure" | "Delete your data" |

---

## 9. Implementation Checklist

**Frontend (React):**
- [ ] ConsentModal component
- [ ] PrivacySettings page
- [ ] DataExportModal component
- [ ] AccountDeletionModal component
- [ ] ConsentToggle component
- [ ] DeletionConfirmationInput component
- [ ] Error state components

**Backend (Node.js/Express):**
- [ ] `POST /api/user/consent` - Update consent preferences
- [ ] `POST /api/user/data-export` - Request data export
- [ ] `GET /api/user/data-export/:token` - Download exported data
- [ ] `DELETE /api/user/account` - Delete account
- [ ] Background job: Generate data export
- [ ] Background job: Cascade delete user data
- [ ] Email templates: Export ready, deletion confirmation

**Database:**
- [ ] Add consent fields to `users` table
- [ ] Create `consent_logs` table (audit trail)
- [ ] Create `data_export_requests` table
- [ ] Create `deletion_logs` table (anonymized)

**DevOps:**
- [ ] Configure secure file storage for exports (S3 + expiration)
- [ ] Set up email service (SendGrid/SES)
- [ ] Schedule backup deletion job (30-day delay)

---

## 10. Traceability to Epic 5

| Epic 5 Story | UI Screen Designed | Status |
|--------------|-------------------|--------|
| **Story 5.1:** GDPR Consent Management | Section 1 (Consent Modal) | ✅ Complete |
| **Story 5.2:** Data Export & Deletion | Sections 3 & 4 (Export/Deletion flows) | ✅ Complete |
| **Story 5.3:** Data Encryption | (No UI, backend only) | N/A |
| **Story 5.4:** Role-Based Auth | (No UI, backend only) | N/A |
| **Story 5.5:** LLM Sandboxing | (No UI, backend only) | N/A |
| **Story 5.6:** Minimal Logging | (No UI, backend only) | N/A |
| **Story 5.7:** AI Fairness | (No UI, backend only) | N/A |

**Resolution Status:** ✅ **Epic 5 UI blocker resolved**

All user-facing GDPR compliance screens are now fully specified and ready for implementation.

---

**END OF GDPR UI SPECIFICATION**
