# Frontend Component Inventory

This document provides an inventory of the React components used in the `frontend` part of the "AI CV and Application" project. The components are built using Next.js, TypeScript, and styled with Tailwind CSS, following the shadcn/ui conventions.

## Base UI Components

Located in `frontend/src/components/ui/`, these are generic, reusable components that form the base of the design system.

### `Button`
- **File:** `button.tsx`
- **Description:** A highly versatile button component.
- **Props:**
    - `variant`: `primary`, `secondary`, `outline`, `destructive`, `ghost`, `link`.
    - `size`: `sm`, `md`, `lg`, `icon`.
    - `loading`: Boolean to show a loading spinner.
    - `icon`: A React node to display an icon.
    - `iconPosition`: `left` or `right`.

### `Badge`
- **File:** `badge.tsx`
- **Description:** A component for displaying short, informational labels or tags.
- **Props:**
    - `variant`: `default`, `secondary`, `success`, `warning`, `error`, `info`, `outline`.

### `Card`
- **File:** `card.tsx`
- **Description:** A set of components (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) for creating flexible card-based layouts.
- **Props:**
    - `variant`: `default`, `elevated`, `outlined`, `interactive`.
    - `padding`: `none`, `sm`, `md`, `lg`.

### `Input`
- **File:** `input.tsx`
- **Description:** A styled form input field with extensive features.
- **Props:**
    - `variant`: `default`, `error`, `success`.
    - `inputSize`: `sm`, `md`, `lg`.
    - `label`, `error`, `helperText`: For associated text.
    - `icon`: A React node for an icon within the input.
    - `iconPosition`: `left` or `right`.

### `Progress`
- **File:** `progress.tsx`
- **Description:** A simple progress bar to indicate the completion of a task.

### `Tabs`
- **File:** `tabs.tsx`
- **Description:** A set of tab components (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) for creating tabbed interfaces. Built on Radix UI primitives.
- **Components:**
    - `Tabs`: Root container component
    - `TabsList`: Container for tab triggers
    - `TabsTrigger`: Individual tab button/trigger
    - `TabsContent`: Content area for each tab
- **Usage:** Used in CVUploadForm to switch between file upload and text paste modes.

---

## Custom Application Components

Located in `frontend/src/components/custom/`, these are domain-specific components built for the core functionality of the application.

### `ATSScoreCard`
- **File:** `ATSScoreCard.tsx`
- **Description:** Displays an Applicant Tracking System (ATS) compatibility score. The card's appearance and messaging are determined by the score. It provides a list of actionable suggestions for the user to improve their CV's score.
- **Key Props:**
    - `score`: A number from 0-100.
    - `suggestions`: An array of strings with improvement tips.

### `CVComparisonView`
- **File:** `CVComparisonView.tsx`
- **Description:** A sophisticated view for comparing an original CV against an AI-tailored version. It can render the two versions side-by-side, highlight differences, and display a detailed log of all changes (added, modified, removed, reordered).
- **Key Props:**
    - `originalCV`: The user's original CV data.
    - `tailoredCV`: The AI-modified CV data.
    - `changes`: An array of change objects detailing what was modified.

### `GapAnalysisPanel`
- **File:** `GapAnalysisPanel.tsx`
- **Description:** Analyzes and displays the "gaps" between a user's CV and the requirements of a specific job posting. Gaps are prioritized as `critical`, `important`, or `nice-to-have`. For each gap, it provides context and a suggestion for how to address it.
- **Key Props:**
    - `gaps`: An array of gap objects, each containing the skill, context, and priority.
    - `onAddToCV`: A function to allow the user to add a suggested skill directly to their CV.

### `MatchScoreGauge`
- **File:** `MatchScoreGauge.tsx`
- **Description:** A visual gauge that displays the percentage match between a CV and a job description. It provides immediate visual feedback on the quality of the match and can be rendered as either a horizontal bar or a circular gauge.
- **Key Props:**
    - `score`: A number from 0-100.
    - `variant`: `horizontal` or `circular`.
    - `size`: `sm`, `md`, or `lg`.

### Job Analysis Components

#### `JobDescriptionInput`
- **File:** `JobDescriptionInput.tsx` (located at `frontend/src/components/features/job-analysis/JobDescriptionInput.tsx`)
- **Description:** Component for users to input a job description for AI analysis. It handles text input, basic frontend validation, and triggers the API call to the backend.
- **Related Files:**
    - `app/(dashboard)/create-application/page.tsx` (Page where this component is used)
    - `lib/schemas/job.ts` (Zod schema for validation)
    - `lib/api/job-analysis.ts` (API client for backend communication)
    - `store/jobAnalysisStore.ts` (Zustand store for managing job analysis state)
- **Key Props:**
    - `onSubmit`: Callback function triggered on form submission.
    - `isLoading`: Boolean to show loading state.
    - `error`: Error message to display.
