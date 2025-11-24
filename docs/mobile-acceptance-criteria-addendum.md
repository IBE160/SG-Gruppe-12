# Mobile Acceptance Criteria - Epic Addendum

**Created:** 2025-11-24
**Purpose:** Define mobile-specific acceptance criteria for all user-facing stories in Epics 2-4
**Status:** Complete - Ready for Implementation

---

## Overview

This document provides mobile-specific acceptance criteria to be integrated into all relevant stories in Epics 2, 3, and 4. These criteria ensure that the platform is **mobile-first** and fully responsive, addressing the needs of our primary user persona (Emma, 24, job-seeking student) who primarily uses mobile devices.

**Mobile Strategy:**
- **Breakpoints:** 375px (mobile), 768px (tablet), 1024px+ (desktop)
- **Touch Targets:** Minimum 44x44px (WCAG 2.1 AA)
- **Navigation:** Bottom tab bar on mobile (Home, Create, History, Profile)
- **Performance:** < 3s page load on 4G networks
- **Offline:** Basic offline support (view saved applications)

---

## Mobile Acceptance Criteria by Epic

### Epic 2: AI-Powered CV Data Management & Preview

#### Story 2.2: AI-Powered CV Parsing from File Upload

**Mobile AC:**
- **AC-M1:** On mobile devices (< 768px), the file upload interface uses the native OS file picker with camera option for photo-based CV upload.
- **AC-M2:** Parsing progress indicator is optimized for small screens (full-width, prominent positioning).
- **AC-M3:** Confirmation screen for parsed data uses a scrollable single-column layout with touch-friendly edit buttons (min 44x44px).

#### Story 2.4: User Interface for CV Section Editing (Work Experience)

**Mobile AC:**
- **AC-M1:** On mobile, all form fields stack vertically in a single column.
- **AC-M2:** Date pickers use native mobile date inputs (`<input type="date">`) for better UX.
- **AC-M3:** "Add Work Experience" button is fixed at the bottom of the screen (sticky) with 16px padding.
- **AC-M4:** Edit/Delete buttons are minimum 44x44px with 8px spacing between them.

#### Story 2.5: User Interface for CV Section Editing (Education, Skills, Languages)

**Mobile AC:**
- **AC-M1:** Skill tags are displayed in a horizontally scrollable row (swipe to see more) to save vertical space.
- **AC-M2:** "Add Skill" button opens a mobile-optimized modal (full-screen or bottom sheet) with autocomplete suggestions.
- **AC-M3:** Language proficiency selects use native mobile selects or radio button groups (no dropdowns).

#### Story 2.6: Dynamic CV Preview & Template Selection

**Mobile AC:**
- **AC-M1:** On mobile, CV preview and editing views are separate screens (not side-by-side), accessible via "Preview" button in the header.
- **AC-M2:** Template selection uses a horizontally scrollable carousel with thumbnail previews.
- **AC-M3:** Preview screen has a "Back to Edit" button (top-left) and "Download" button (top-right).

#### Story 2.7: CV Download Functionality (PDF/DOCX)

**Mobile AC:**
- **AC-M1:** On mobile, download buttons trigger native share sheet (iOS) or download notification (Android).
- **AC-M2:** Downloaded files are named with CV-{Name}-{Date}.pdf format for easy identification.
- **AC-M3:** After download, a toast notification confirms success with option to share.

#### Story 2.8: Autosave & Unsaved Changes Warning

**Mobile AC:**
- **AC-M1:** Autosave toast notification is positioned at the bottom of the screen (above navigation bar).
- **AC-M2:** Unsaved changes warning uses native mobile confirmation dialog (not custom modal).

#### Story 2.9: CV Data Versioning

**Mobile AC:**
- **AC-M1:** Version history list uses vertically stacked cards (full-width) with swipe-to-delete gesture.
- **AC-M2:** "Restore Version" button is prominent and full-width at the bottom of each version card.

---

### Epic 3: Job Ad Analysis & Match Scoring

#### Story 3.1: Job Description Input Interface

**Mobile AC:**
- **AC-M1:** Text area for job description paste uses full screen height (minus header/navigation) for easier pasting.
- **AC-M2:** Keyboard opens automatically when user navigates to this screen.
- **AC-M3:** "Analyze Job" button is sticky at the bottom with 16px padding from screen edges.

#### Story 3.2: AI-Powered Job Description Text Extraction

**Mobile AC:**
- **AC-M1:** Loading state uses a full-screen skeleton with progress percentage displayed prominently.
- **AC-M2:** Extracted keywords are displayed in a horizontally scrollable row with touch-friendly tap targets.

#### Story 3.4: Match Score Calculation & Display

**Mobile AC:**
- **AC-M1:** Match score gauge uses the circular variant on mobile (more compact than horizontal).
- **AC-M2:** Strengths and weaknesses sections are collapsible accordions to reduce scrolling.
- **AC-M3:** "Generate Tailored CV" button is sticky at the bottom of the screen.

#### Story 3.5: ATS Score Calculation & Display

**Mobile AC:**
- **AC-M1:** ATS score card displays prominently at the top of the match results screen on mobile.
- **AC-M2:** Detailed scoring breakdown uses a bottom sheet (slide-up modal) instead of inline expansion.
- **AC-M3:** Improvement suggestions are displayed as vertically stacked cards with checkboxes for "Mark as Done."

---

### Epic 4: Tailored Application Generation

#### Story 4.1: AI-Driven Tailored CV Generation

**Mobile AC:**
- **AC-M1:** Generation progress uses a full-screen loading state with multi-stage indicators ("Analyzing job... Tailoring experience... Optimizing keywords...").
- **AC-M2:** On mobile, generation time estimate is displayed: "This usually takes 5-8 seconds."

#### Story 4.2: AI-Driven Personalized Cover Letter Generation

**Mobile AC:**
- **AC-M1:** Cover letter generation follows the same mobile loading pattern as Story 4.1.
- **AC-M2:** Generated cover letter is displayed in a scrollable view with "Edit" button fixed at the bottom.

#### Story 4.3: User Review & Editing Interface for AI-Generated Content

**Mobile AC:**
- **AC-M1:** On mobile (< 768px), CVComparisonView uses a tabbed interface (not side-by-side):
  - Tab 1: "Original" (original CV)
  - Tab 2: "Tailored" (AI-generated version)
  - Tab 3: "Changes" (list of modifications)
- **AC-M2:** Tabs are sticky at the top, swipeable (swipe left/right to switch tabs).
- **AC-M3:** Change items in "Changes" tab are expandable cards showing rationale on tap.
- **AC-M4:** "Accept All" and "Restore Original" buttons are sticky at the bottom with 48px height.

#### Story 4.4: Save & Retrieve Tailored Application History

**Mobile AC:**
- **AC-M1:** Application history list uses vertically stacked cards (full-width) on mobile.
- **AC-M2:** Filters collapse into a slide-in panel (accessible via "Filter" button in header).
- **AC-M3:** Search bar is sticky at the top of the screen with pull-down-to-refresh gesture.
- **AC-M4:** Application detail view (when tapping a card) is a full-screen modal with back button (top-left).
- **AC-M5:** "View CV" and "View Cover Letter" buttons open full-screen previews (not side-by-side).

#### Story 4.5: Robust AI Processing Feedback & Handling

**Mobile AC:**
- **AC-M1:** Loading states use skeleton screens optimized for mobile (single column layout).
- **AC-M2:** Error messages use mobile-optimized bottom sheets with clear retry buttons (min 48px height).
- **AC-M3:** Retry buttons are full-width and prominently placed.

---

## General Mobile Acceptance Criteria (All Stories)

**These criteria apply to ALL user-facing stories across Epics 2, 3, and 4:**

### 1. Touch Target Sizes
- **AC-G1:** All interactive elements (buttons, links, inputs, toggles) have a minimum touch target size of 44x44px.
- **AC-G2:** Spacing between adjacent interactive elements is at least 8px.

### 2. Responsive Layout
- **AC-G3:** The feature adapts responsively to screen widths from 375px (mobile) to 1024px+ (desktop).
- **AC-G4:** On mobile (< 768px), layouts use single-column stacking (no side-by-side content).
- **AC-G5:** On tablet (768px-1023px), layouts use two-column grids where appropriate.

### 3. Navigation
- **AC-G6:** On mobile, navigation uses a bottom tab bar (Home, Create, History, Profile) with 56px height.
- **AC-G7:** Active tab is visually distinguished with bold text and blue underline.
- **AC-G8:** Back button (when applicable) is positioned in the top-left corner with 44x44px touch target.

### 4. Typography & Readability
- **AC-G9:** Body text is minimum 16px on mobile (no smaller font sizes for readability).
- **AC-G10:** Line height is 1.5 or greater for mobile body text.

### 5. Modals & Overlays
- **AC-G11:** On mobile, modals use full-screen overlays (not centered floating modals).
- **AC-G12:** Modals have a close button in the top-right corner (44x44px) or swipe-down-to-dismiss gesture.

### 6. Forms
- **AC-G13:** On mobile, form fields use native input types (type="email", type="tel", type="number") to trigger appropriate keyboards.
- **AC-G14:** Form field labels are positioned above inputs (not beside) for better mobile UX.
- **AC-G15:** Submit buttons are sticky at the bottom of the screen with 48px height and 16px horizontal padding.

### 7. Performance
- **AC-G16:** Page load time on mobile (4G network) is under 3 seconds.
- **AC-G17:** Scroll performance maintains 60fps on modern mobile devices (last 3 years).

### 8. Accessibility
- **AC-G18:** All features work with screen magnification (up to 200% zoom) without horizontal scrolling.
- **AC-G19:** Color contrast meets WCAG 2.1 AA standards (4.5:1 for normal text).

---

## Testing Checklist (Mobile)

**Before marking any story as "Done," verify:**

- [ ] Tested on iPhone (iOS Safari, viewport 375x812px)
- [ ] Tested on Android (Chrome, viewport 360x800px)
- [ ] All touch targets are minimum 44x44px
- [ ] Navigation works correctly (bottom tab bar)
- [ ] Forms use native mobile input types
- [ ] Modals are full-screen on mobile
- [ ] Loading states are mobile-optimized
- [ ] Error messages are mobile-optimized
- [ ] Scroll performance is smooth (60fps)
- [ ] No horizontal scrolling at 375px width
- [ ] Text is readable without zooming (min 16px)

---

## Implementation Notes

### For Developers:

**Responsive Breakpoints (Tailwind CSS):**
```css
/* Mobile first (default) */
.class { /* 0px-767px */ }

/* Tablet */
@media (min-width: 768px) { .md:class }

/* Desktop */
@media (min-width: 1024px) { .lg:class }
```

**Example Usage:**
```tsx
// Mobile: Full-width button
// Desktop: Auto-width button
<button className="w-full lg:w-auto px-6 py-3">
  Submit
</button>
```

**Mobile Detection (React):**
```tsx
const isMobile = useMediaQuery('(max-width: 767px)')

if (isMobile) {
  return <MobileView />
} else {
  return <DesktopView />
}
```

---

## Traceability

| Epic | Stories with Mobile AC | Status |
|------|------------------------|--------|
| **Epic 2** | Stories 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9 | ✅ Complete |
| **Epic 3** | Stories 3.1, 3.2, 3.4, 3.5 | ✅ Complete |
| **Epic 4** | Stories 4.1, 4.2, 4.3, 4.4, 4.5 | ✅ Complete |

**Resolution Status:** ✅ **Mobile acceptance criteria fully specified**

All user-facing stories in Epics 2-4 now have explicit mobile acceptance criteria, ensuring mobile-first development.

---

**END OF MOBILE ACCEPTANCE CRITERIA ADDENDUM**
