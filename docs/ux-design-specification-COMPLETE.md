# AI CV & Job Application Assistant
## Complete UX Design Specification

_Created on 2025-11-19 by BIP_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

The **AI CV & Job Application Assistant** is a web application designed to eliminate the guesswork and time-consuming manual effort from job applications for students and early-career professionals. This comprehensive UX Design Specification documents the complete user experience design—from user personas to visual systems, interaction patterns, and accessibility guidelines.

**Project Vision:** Provide exhausted job seekers with an intelligent, AI-powered platform that interprets job requirements, automatically tailors CVs and cover letters, and provides clear, actionable feedback—removing the "rewriting documents in the dark" problem.

**Target Users:** "Exhausted Job Seekers"—students and early-career professionals overwhelmed by manual tailoring, uncertain about ATS optimization, and frustrated by lack of feedback.

**Core Value Proposition:** Instant relief through AI-powered document transformation. Users paste a job ad, upload their CV, and within minutes receive a professionally tailored application that speaks the employer's language.

**Platform:** Web application (React.js + Tailwind CSS + shadcn/ui)

**Design Philosophy:** Empowerment through clarity. Every interaction should reduce anxiety, build confidence, and make users feel supported—not judged.

---

## Table of Contents

1. [User Personas](#1-user-personas)
2. [User Journey Maps](#2-user-journey-maps)
3. [Information Architecture](#3-information-architecture)
4. [Wireframes](#4-wireframes)
5. [Visual Design System](#5-visual-design-system)
6. [Component Specifications](#6-component-specifications)
7. [UX Pattern Decisions](#7-ux-pattern-decisions)
8. [Responsive Design & Accessibility](#8-responsive-design--accessibility)
9. [Implementation Guidance](#9-implementation-guidance)

---

## 1. User Personas

### 1.1 Primary Persona: Emma - The Overwhelmed Graduate

**Demographics:**
- **Age:** 24
- **Location:** Oslo, Norway
- **Education:** Bachelor's degree in Business Administration (graduated 3 months ago)
- **Employment Status:** Unemployed, actively job seeking
- **Tech Proficiency:** Intermediate (comfortable with web apps, Google Docs, LinkedIn)

**Context & Situation:**
Emma has been applying to 4-6 jobs per week for three months. She spends evenings and weekends tailoring applications, often staying up late trying to match her experience to vague job descriptions. She's applied to 40+ positions with only 3 interview callbacks and no feedback on rejections.

**Goals:**
- Secure her first professional role within 2 months
- Stand out despite limited work experience
- Understand what employers actually want from job descriptions
- Save time on application tailoring to apply to more jobs
- Feel confident her applications are ATS-compliant

**Pain Points:**
- Wastes 2-3 hours per application manually rewriting CV and cover letter
- Uncertainty about which keywords to include for ATS systems
- No feedback on why applications are rejected
- Overwhelm from job descriptions with unrealistic requirements
- Feels like she's "guessing" what employers want
- Burnout from repetitive rewriting with no results

**Behaviors:**
- Keeps 3-4 different CV versions for different job types
- Searches Google for "how to pass ATS" and "cover letter templates"
- Compares CV to job descriptions manually, highlighting keywords
- Uses free resume builders but finds them too generic
- Asks friends and career counselors to review applications
- Tracks applications in a spreadsheet

**Technology Usage:**
- **Primary devices:** MacBook laptop + iPhone
- **Daily tools:** LinkedIn, Finn.no, Google Docs, Notion
- **Expectations:** Fast, mobile-friendly, intuitive interfaces

**Needs from Platform:**
- Quick CV intake without starting from scratch
- Clear explanation of what the job ad really requires
- Instant tailored CV highlighting relevant experience
- Confidence that application will pass ATS filters
- Free tier: 1 application/week; Premium: unlimited

**Quote:** _"I feel like I'm rewriting the same experiences over and over, but I never know if I'm using the right words. I just want someone to tell me what employers actually want to see."_

---

### 1.2 Secondary Persona: Marcus - The Career Changer

**Demographics:**
- **Age:** 29
- **Location:** Bergen, Norway
- **Education:** Bachelor's in Psychology + coding bootcamp graduate
- **Employment Status:** Part-time retail, seeking career transition to tech
- **Tech Proficiency:** Advanced (developer, comfortable with technical tools)

**Context & Situation:**
Marcus completed a coding bootcamp 6 months ago and is transitioning from retail management to junior developer. He has strong technical skills but struggles to present retail leadership experience as relevant to tech roles. Applied to 60+ positions with only 5 interviews.

**Goals:**
- Transition into junior developer or QA engineer role
- Reframe retail management experience to highlight transferable skills
- Understand which tech jobs match his current skill level
- Build multiple CV versions for different tech roles
- Demonstrate portfolio projects effectively

**Pain Points:**
- Job descriptions use inconsistent terminology for same skills
- Unsure how to translate "Managed team of 8" into tech-relevant language
- Imposter syndrome despite strong portfolio
- Difficulty balancing technical skills vs. soft skills from retail
- Time spent customizing instead of learning new tech skills
- Worried about age discrimination

**Behaviors:**
- Maintains separate CVs for frontend, backend, QA roles
- Actively learns new technologies and updates CV immediately
- Researches companies extensively before applying
- Uses GitHub portfolio and personal website
- Networks actively on LinkedIn and at meetups

**Technology Usage:**
- **Primary devices:** Custom PC + Android phone
- **Daily tools:** VS Code, GitHub, Stack Overflow, LinkedIn
- **Expectations:** Technical sophistication, efficiency, transparency

**Needs from Platform:**
- Smart skill translation (retail leadership → tech collaboration)
- Gap analysis showing missing skills for target roles
- Multiple CV versions for different tech specializations
- Clear "match score" to understand qualification level
- Portfolio project highlighting in tailored applications

**Quote:** _"I know I can do the job, but my CV doesn't reflect that. I need help showing how managing a retail team is basically the same as leading a dev project—just different vocabulary."_

---

### 1.3 Tertiary Persona: Aisha - The International Student

**Demographics:**
- **Age:** 22
- **Location:** Trondheim, Norway
- **Education:** Master's student in Computer Science (from Pakistan)
- **Employment Status:** Student seeking internship/part-time work
- **Tech Proficiency:** Intermediate-Advanced (CS student, unfamiliar with Norwegian market norms)

**Context & Situation:**
Aisha moved to Norway 8 months ago for her Master's. She's applying for summer internships and part-time jobs but is unfamiliar with Norwegian CV conventions, language nuances, and employer expectations. Applied to 25 positions with minimal response.

**Goals:**
- Secure summer internship at Norwegian tech company
- Understand Norwegian CV format expectations
- Adapt CV to Norwegian job market while highlighting international experience
- Overcome language barriers (strong English, basic Norwegian)
- Build professional network in Norway

**Pain Points:**
- Uncertainty about Norwegian CV conventions (photo? personal number?)
- Language barrier—unsure if Norwegian-language applications are required
- Difficulty understanding Norwegian job board terminology
- Cultural differences in self-presentation (feels "too modest")
- No local work experience or references
- Visa/work permit uncertainty
- Lack of feedback on whether international credentials are valued

**Behaviors:**
- Researches Norwegian CV templates extensively
- Asks Norwegian classmates to review applications
- Uses Google Translate for Norwegian job descriptions
- Attends university career services workshops
- Networks at student tech events

**Technology Usage:**
- **Primary devices:** School-provided laptop + smartphone
- **Daily tools:** Canvas, LinkedIn, Finn.no, NAV.no, Notion
- **Expectations:** Simple, clear interfaces with multi-language support

**Needs from Platform:**
- Guidance on Norwegian CV format conventions
- Language-appropriate tailoring (English or Norwegian)
- Cultural adaptation of self-presentation
- Clear indication of language requirements
- International experience framing as asset

**Quote:** _"I don't know if I'm doing this right. In Pakistan, we write CVs differently. I'm not sure if Norwegian employers even understand my qualifications. I need help translating my experience to this job market."_

---

## 2. User Journey Maps

### 2.1 Journey Map: First-Time User (Emma's Experience)

**Scenario:** Emma discovers platform through friend's recommendation and generates her first tailored application.

#### Phase 1: Discovery & Signup (Awareness → Interest)

**Touchpoint:** Landing page

**Actions:**
1. Arrives via friend's referral link
2. Reads value proposition: "Stop guessing what employers want"
3. Sees social proof (testimonials, success stats)
4. Clicks "Get Started Free"
5. Signs up with Google Auth (30 seconds)

**Thoughts:** _"Can this really make applications easier? What does 'AI-tailored' mean? Is this another generic resume builder?"_

**Emotions:** Skeptical but curious, hopeful, slightly anxious

**Pain Points:** Uncertainty about time investment, data privacy concerns, "too good to be true" worry

**Opportunities:**
- Clear, jargon-free value proposition
- Quick signup (< 30 seconds)
- Transparency about data handling (GDPR, 7-day deletion)
- Show example output immediately

---

#### Phase 2: CV Intake (Interest → Evaluation)

**Touchpoint:** CV Upload Flow

**Actions:**
1. Sees onboarding: "First, let's get your CV into the system"
2. Chooses upload method: file (PDF/DOCX) or manual entry
3. Uploads existing CV (PDF)
4. AI parses and extracts structured data (education, experience, skills)
5. Reviews extracted information on confirmation screen
6. Edits any parsing errors
7. Confirms CV data

**Thoughts:** _"Will it understand my CV format? This is easier than rewriting. Hope it captures all my skills."_

**Emotions:** Tentatively hopeful, impressed if accurate, frustrated if errors

**Pain Points:** PDF parsing errors, time correcting mistakes, unclear required vs. optional fields

**Opportunities:**
- Smart parsing with 95%+ accuracy
- Clear visual feedback on extraction progress
- Inline editing with save
- Skip options for optional fields
- Progress indicator

---

#### Phase 3: Job Ad Analysis (Evaluation → Decision)

**Touchpoint:** Job Analysis Screen

**Actions:**
1. Navigates to "Tailor Application" screen
2. Pastes job ad from Finn.no
3. Clicks "Analyze Job"
4. AI processes job description (loading: "Reading job requirements...")
5. Views analysis results:
   - Key requirements extracted
   - Required vs. preferred skills highlighted
   - Match score (e.g., "78% match")
   - Gap analysis showing missing skills
   - Keyword suggestions

**Thoughts:** _"Wow, it actually understands this job! I didn't realize these keywords mattered. I have more skills than I thought!"_

**Emotions:** Excitement, relief, clarity, confidence building

**Pain Points:** Long processing times, vague job ads, overwhelming information

**Opportunities:**
- Fast processing (< 5 seconds)
- Clear, scannable analysis with visual hierarchy
- Progressive disclosure (essentials first, details on expand)
- Save job analysis for reference
- Compare multiple jobs side-by-side

---

#### Phase 4: Document Generation (Decision → Action)

**Touchpoint:** Tailored CV & Cover Letter Output

**Actions:**
1. Reviews match score and gap analysis
2. Clicks "Generate Tailored Application"
3. AI generates documents (loading: "Crafting your application...")
4. Views side-by-side comparison:
   - Original CV (left panel)
   - Tailored CV (right panel)
   - Changes highlighted in yellow
5. Reads AI-generated cover letter
6. Sees ATS score: "92/100 - Excellent"
7. Reviews suggestions

**Thoughts:** _"This rewrote my experience in the job's language! The cover letter sounds professional. I would never have phrased it this way. So much better!"_

**Emotions:** Amazed, delighted, validated, confident, eager to apply

**Pain Points:** Minor phrasing doesn't sound like "their voice", over-optimization feels robotic

**Opportunities:**
- Inline editing for generated content
- "Regenerate" with tone adjustment (formal/casual)
- Explanation tooltips showing why changes were made
- "Restore original" for sections
- Version comparison with track changes

---

#### Phase 5: Download & Apply (Action → Outcome)

**Touchpoint:** Download & Application Management

**Actions:**
1. Downloads CV (PDF)
2. Downloads cover letter (PDF/DOCX)
3. Saves application to dashboard
4. Receives confirmation: "Your application is ready! Good luck!"
5. Provides feedback: "How confident?" (1-5 scale)
6. Sees upgrade CTA: "You have 0 applications left this week. Upgrade?"

**Thoughts:** _"That was so much faster! I feel really good about submitting this. I want to use this for all applications."_

**Emotions:** Satisfied, accomplished, confident, empowered, considering upgrade

**Pain Points:** Free tier limit reached, unclear reset time

**Opportunities:**
- Clear upgrade path with value demonstration
- Weekly limit reset timer visible
- Application tracking dashboard
- Follow-up prompt: "Let us know when you hear back!"
- Referral incentive: "Share with friend, unlock bonus application"

---

#### Phase 6: Post-Application & Retention (Outcome → Loyalty)

**Touchpoint:** Email & Dashboard

**Actions:**
1. Receives follow-up email (24 hours later): "How did it go?"
2. Returns for next application
3. Sees dashboard with history
4. Generates second application (hits limit)
5. Prompted to upgrade or wait
6. Shares platform with friend

**Thoughts:** _"I wish I could use this more than once a week. This saved so much time, it's worth paying. My friends need to know about this."_

**Emotions:** Loyal, grateful, frustrated by limit, willing to pay, advocate

**Pain Points:** Free tier limit frustration, lack of tracking features

**Opportunities:**
- Seamless upgrade flow
- Application history with status tracking
- Interview callback tracking
- Success stories
- Referral rewards

---

### 2.2 Journey Map: Returning Power User (Marcus - Premium Tier)

**Scenario:** Marcus (paid subscriber) applies to 5 different tech roles in one evening.

#### Phase: Rapid Multi-Application Flow

**Touchpoint:** Dashboard & Quick Application Mode

**Actions:**
1. Logs in to dashboard
2. Sees overview: "Welcome back! 37 jobs applied. 8 interviews secured."
3. Views recent applications with status tags
4. Clicks "Create New Application"
5. Chooses "Quick Application Mode" (premium feature)
6. Pastes 5 job descriptions in batch
7. AI analyzes all 5, showing match scores side-by-side
8. Selects 3 highest-match jobs
9. Generates 3 tailored CV/cover letter sets in parallel
10. Reviews all 3 in tabbed interface
11. Downloads all 6 files as ZIP

**Thoughts:** _"This is exactly what I needed for efficiency. I can apply to more jobs in less time. Batch mode is worth the subscription alone."_

**Emotions:** Empowered, efficient, highly satisfied, loyal

**Key Premium Features Utilized:**
- Unlimited applications
- Batch job analysis
- Parallel document generation
- Application history tracking
- Download all as ZIP

---

## 3. Information Architecture

### 3.1 Site Map & Navigation Structure

```
AI CV & Job Application Assistant
│
├── 🏠 Landing Page (Unauthenticated)
│   ├── Hero Section (Value Proposition)
│   ├── How It Works (3-step process)
│   ├── Features Overview
│   ├── Social Proof (Testimonials, Stats)
│   ├── Pricing Comparison
│   └── CTA: Sign Up / Log In
│
├── 🔐 Authentication
│   ├── Sign Up (Email / Google Auth)
│   ├── Log In
│   ├── Password Reset
│   └── Email Verification
│
├── 📊 Dashboard (Post-Login Home)
│   ├── Welcome Header (stats, personalization)
│   ├── Quick Actions
│   │   ├── Create New Application [PRIMARY CTA]
│   │   ├── Manage CVs
│   │   └── View Application History
│   ├── Recent Applications (last 5)
│   ├── Success Metrics (interviews, callbacks)
│   ├── Free Tier Usage Indicator
│   └── Upgrade CTA (if free tier)
│
├── 📄 CV Management
│   ├── Upload New CV
│   │   ├── File Upload (PDF/DOCX)
│   │   ├── Manual Entry Form
│   │   └── Import from LinkedIn (future)
│   ├── My CVs (list view)
│   │   ├── View Details
│   │   ├── Edit
│   │   ├── Delete
│   │   └── Set as Default
│   └── CV Parsing Confirmation
│       ├── Extracted Data Review
│       ├── Inline Editing
│       └── Confirm & Save
│
├── ✨ Tailor Application [CORE FEATURE]
│   ├── Step 1: Select CV
│   ├── Step 2: Job Description Input
│   │   ├── Paste Text
│   │   ├── Paste URL (scraper)
│   │   └── Upload File
│   ├── Step 3: Job Analysis Results
│   │   ├── Key Requirements Extraction
│   │   ├── Required vs. Preferred Skills
│   │   ├── Match Score (%)
│   │   ├── Gap Analysis
│   │   └── Keyword Suggestions
│   ├── Step 4: Generate Documents
│   │   ├── Tailored CV (change highlighting)
│   │   ├── AI Cover Letter
│   │   ├── ATS Score & Feedback
│   │   └── Improvement Suggestions
│   └── Step 5: Review & Download
│       ├── Side-by-Side Comparison
│       ├── Inline Editing
│       ├── Regenerate Options
│       ├── Download (PDF/DOCX)
│       └── Save to History
│
├── 📋 Application History [PREMIUM]
│   ├── All Applications (table view)
│   ├── Filter & Search
│   ├── Application Details View
│   │   ├── Job Description
│   │   ├── Generated Documents
│   │   ├── Match Analysis
│   │   ├── Notes Section
│   │   └── Status Update
│   └── Export History (CSV)
│
├── 💳 Pricing & Upgrade
│   ├── Plan Comparison
│   ├── Payment Form (Stripe)
│   ├── Subscription Management
│   └── Billing History
│
├── ⚙️ Settings
│   ├── Profile (Name, Email, Password)
│   ├── Subscription & Billing
│   ├── Privacy & Data (GDPR Export/Delete)
│   └── Notifications
│
└── ❓ Help & Support
    ├── FAQ
    ├── How-To Guides
    ├── Contact Support
    └── Video Tutorials
```

### 3.2 Primary Navigation (Authenticated)

**Top Navigation Bar:**
- Logo (link to Dashboard)
- Dashboard
- **Create Application** [PRIMARY CTA BUTTON - prominent styling]
- My CVs
- History [Premium badge]
- Upgrade [If free tier - accent color]
- Profile Avatar (dropdown)
  - Settings
  - Help
  - Log Out

**Mobile Navigation:**
- Top: Logo + Hamburger menu
- Bottom Tab Bar:
  - Dashboard
  - Create [center, elevated]
  - History
  - Profile

---

## 4. Wireframes

### 4.1 Landing Page (Unauthenticated)

```
┌───────────────────────────────────────────────────────────────┐
│ [Logo] AI CV Assistant    [Features][Pricing][Login] ◄─ Nav  │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│            🎯 Stop Guessing What Employers Want                │
│                                                                 │
│      Get AI-tailored CVs and cover letters in minutes         │
│           that speak the employer's language                   │
│                                                                 │
│                  [Get Started Free] ◄───── Primary CTA         │
│                 No credit card required                        │
│                                                                 │
│  [Trusted by 10,000+ job seekers  ★★★★★ 4.8/5]               │
├───────────────────────────────────────────────────────────────┤
│                     HOW IT WORKS                               │
│                                                                 │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐            │
│  │  Upload  │  →   │  Paste   │  →   │ Download │            │
│  │    CV    │      │ Job Ad   │      │ Tailored │            │
│  │   📄    │      │   🎯    │      │   Docs   │            │
│  └──────────┘      └──────────┘      └──────────┘            │
│  Upload your       AI analyzes       Get tailored CV          │
│  CV once          & matches          & cover letter           │
├───────────────────────────────────────────────────────────────┤
│                    KEY FEATURES                                │
│                                                                 │
│ ✓ AI-Powered Job Analysis    ✓ ATS Optimization              │
│ ✓ Keyword Matching           ✓ Gap Analysis                   │
│ ✓ Instant Cover Letters      ✓ Multiple CV Versions           │
├───────────────────────────────────────────────────────────────┤
│                   WHAT USERS SAY                               │
│                                                                 │
│ "I got 3 interviews in the first week!" - Emma, Oslo           │
│ "Saved me hours per application." - Marcus, Bergen             │
│ "Finally understand what employers want." - Aisha, Trondheim   │
├───────────────────────────────────────────────────────────────┤
│                      PRICING                                   │
│                                                                 │
│  ┌───────────────┐         ┌───────────────┐                 │
│  │     FREE      │         │   PREMIUM     │                 │
│  │  1 app/week   │         │  Unlimited    │                 │
│  │  Basic ATS    │         │   Advanced    │                 │
│  │   [Start]     │         │  129 NOK/mo   │                 │
│  └───────────────┘         └──[Upgrade]────┘                 │
├───────────────────────────────────────────────────────────────┤
│          [Footer: About | Privacy | Terms | Contact]          │
└───────────────────────────────────────────────────────────────┘
```

---

### 4.2 Dashboard (First Login)

```
┌───────────────────────────────────────────────────────────────┐
│ [Logo]   Dashboard  [Create Application]  [Profile▾]          │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│ 👋 Welcome, Emma!                                              │
│                                                                 │
│ Let's get started with your first tailored application.        │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │               QUICK ACTIONS                                 ││
│ │  ┌───────────┐  ┌───────────┐  ┌───────────┐              ││
│ │  │ 📤 Upload │  │ ✨ Create │  │ 📚 View   │              ││
│ │  │    CV     │  │Application│  │  Guide    │              ││
│ │  └───────────┘  └───────────┘  └───────────┘              ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │          YOUR STATS                                         ││
│ │ Applications: 0  | Interviews: 0  | Success Rate: N/A      ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 🎯 FREE TIER                                                ││
│ │ 1 tailored application per week                             ││
│ │ Applications remaining this week: 1                          ││
│ │ Resets in: 6 days                          [Upgrade →]     ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ RECENT APPLICATIONS                                            │
│ No applications yet. Create your first one!                    │
│                                                                 │
└───────────────────────────────────────────────────────────────┘
```

---

### 4.3 Job Analysis Results

```
┌───────────────────────────────────────────────────────────────┐
│ [Logo]   Dashboard  Create Application  [Profile▾]            │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📊 Job Analysis Results                                        │
│                                                                 │
│ Marketing Coordinator - TechStart AS                            │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 🎯 YOUR MATCH SCORE                                         ││
│ │                                                              ││
│ │      ████████████████░░░░░░  78%                            ││
│ │                                                              ││
│ │ Good match! You have most of the required skills.           ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ✅ KEY REQUIREMENTS YOU HAVE                                ││
│ │ • Digital marketing experience (2+ years)                    ││
│ │ • Social media management (Instagram, LinkedIn)              ││
│ │ • Content creation and copywriting                           ││
│ │ • Data analysis (Google Analytics)                           ││
│ │ • Team collaboration                                         ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ⚠️  GAPS TO ADDRESS                                         ││
│ │ • SEO optimization (mentioned, not on your CV)               ││
│ │ • Email marketing platforms (Mailchimp, HubSpot)             ││
│ │ • Budget management experience                               ││
│ │                                                              ││
│ │ 💡 Tip: Consider adding SEO coursework or self-study        ││
│ │    to your CV if you have relevant experience.               ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 🔑 IMPORTANT KEYWORDS                                       ││
│ │ digital marketing • SEO • social media strategy •            ││
│ │ content creation • analytics • campaign management •         ││
│ │ team collaboration • stakeholder communication               ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│             [← Back]   [Generate Tailored CV →]                │
└───────────────────────────────────────────────────────────────┘
```

---

### 4.4 Tailored CV Output (Side-by-Side)

```
┌───────────────────────────────────────────────────────────────┐
│ [Logo]   Dashboard  Create Application  [Profile▾]            │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✨ Your Tailored Application                                   │
│                                                                 │
│ Marketing Coordinator - TechStart AS                            │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 📄 CV  | 📝 Cover Letter | 📊 ATS Score                    ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌────────────────┬────────────────┬─────────────────┐         │
│ │  ORIGINAL CV   │  TAILORED CV   │    CHANGES      │         │
│ ├────────────────┼────────────────┼─────────────────┤         │
│ │Marketing Intern│Digital Marketing│ ✏️  Reworded   │         │
│ │TechCorp AS     │Specialist       │    title        │         │
│ │2023-2024       │TechCorp AS      │                 │         │
│ │                │2023-2024        │                 │         │
│ │• Managed social│• Led social media│ ✏️  Added     │         │
│ │  media accounts│  strategy across │    "strategy"  │         │
│ │• Created       │  Instagram &     │                 │         │
│ │  content       │  LinkedIn        │ ✏️  Made      │         │
│ │• Worked with   │• Developed data- │    metrics     │         │
│ │  team          │  driven content  │    explicit    │         │
│ │                │  (20% engagement │                 │         │
│ │                │  increase)       │ ✏️  Highlighted│         │
│ │                │• Collaborated    │    teamwork    │         │
│ │                │  cross-functional│                 │         │
│ │                │  with design team│                 │         │
│ ├────────────────┼────────────────┼─────────────────┤         │
│ │   SKILLS       │    SKILLS       │                 │         │
│ │Marketing       │Digital Marketing│ ✏️  Prioritized│         │
│ │Social Media    │Social Media     │    job-relevant │         │
│ │Excel           │  Strategy       │    skills first │         │
│ │Customer Service│Data Analysis    │                 │         │
│ │...             │SEO Fundamentals │ ✏️  Added      │         │
│ │                │Content Creation │    keyword     │         │
│ └────────────────┴────────────────┴─────────────────┘         │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ✅ ATS SCORE: 92/100 - EXCELLENT                            ││
│ │ Your CV is highly optimized for Applicant Tracking          ││
│ │ Systems and should pass initial screening.                   ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ [Download CV]  [Download Cover Letter]  [Edit]  [Save]        │
└───────────────────────────────────────────────────────────────┘
```

---

## 5. Visual Design System

### 5.1 Design System Foundation

**Selected System:** **shadcn/ui** (Tailwind CSS-based component primitives built on Radix UI)

**Rationale:**
- Modern, accessible, WCAG 2.1 AA compliant by default
- Perfect Tailwind CSS integration (aligns with tech stack)
- Copy-paste component philosophy (no npm bloat)
- Extensive component library for MVP needs
- Flexible theming system for brand customization
- Active community and excellent documentation

**Components Provided:**
- Forms: Input, Textarea, Select, Checkbox, Radio, Switch
- Buttons: Primary, Secondary, Outline, Ghost, Destructive
- Feedback: Alert, Toast, Progress, Skeleton
- Overlays: Dialog, Sheet, Popover, Tooltip, Dropdown Menu
- Navigation: Tabs, Accordion, Command
- Data Display: Card, Badge, Separator, Avatar
- Layout: Container, Aspect Ratio

---

### 5.2 Color Palette

**Theme Name:** "Confident Professional"

**Philosophy:** Colors that inspire confidence, clarity, and trust. Blue conveys professionalism and reliability (critical for job seekers). Green accents signal success and progress. Neutral grays provide breathing room and readability.

#### Primary Colors

- **Primary Blue:** `#2563EB` (blue-600)
  - **Usage:** Primary CTAs, links, active states, brand elements
  - **Psychological impact:** Trust, professionalism, clarity
  - **Hover:** `#1D4ED8` (blue-700)
  - **Active:** `#1E40AF` (blue-800)

- **Primary Blue (Light):** `#3B82F6` (blue-500)
  - **Usage:** Hover states, accents, highlights

- **Primary Blue (Lighter):** `#60A5FA` (blue-400)
  - **Usage:** Disabled states, backgrounds

#### Secondary Colors

- **Secondary Green (Success):** `#10B981` (green-500)
  - **Usage:** Success states, positive feedback, ATS scores, match indicators
  - **Psychological impact:** Growth, achievement, go-ahead
  - **Hover:** `#059669` (green-600)

- **Accent Purple:** `#8B5CF6` (purple-500)
  - **Usage:** Premium features, upgrade CTAs, special highlights
  - **Psychological impact:** Premium, exclusive, creative

#### Semantic Colors

- **Success:** `#10B981` (green-500)
- **Warning:** `#F59E0B` (amber-500) - Gap analysis, missing skills
- **Error/Destructive:** `#EF4444` (red-500) - Errors, delete actions
- **Info:** `#3B82F6` (blue-500) - Tips, guidance, informational notices

#### Neutral Colors (Grays)

- **Text Primary:** `#111827` (gray-900) - Headings, body text
- **Text Secondary:** `#6B7280` (gray-500) - Supporting text, captions
- **Text Muted:** `#9CA3AF` (gray-400) - Placeholder text, disabled text

- **Background Primary:** `#FFFFFF` (white) - Main background
- **Background Secondary:** `#F9FAFB` (gray-50) - Alternate sections
- **Background Tertiary:** `#F3F4F6` (gray-100) - Cards, panels

- **Border Default:** `#E5E7EB` (gray-200) - Borders, dividers
- **Border Focused:** `#2563EB` (blue-600) - Focus rings
- **Border Error:** `#EF4444` (red-500) - Error states

#### Highlight & Overlay Colors

- **Highlight (Change Indicator):** `#FEF3C7` (amber-100) - Changed text in CV comparison
- **Overlay (Backdrop):** `rgba(0, 0, 0, 0.5)` - Modal backdrops
- **Skeleton (Loading):** `#E5E7EB` (gray-200) - Skeleton screens

---

### 5.3 Typography System

**Font Families:**

- **Headings:** `Inter` (sans-serif)
  - Modern, professional, excellent legibility
  - Variable font weights for hierarchy
  - Widely used in SaaS products

- **Body Text:** `Inter` (sans-serif)
  - Same as headings for consistency
  - Optimized for screen reading

- **Monospace (Code/Technical):** `JetBrains Mono` (monospace)
  - For displaying extracted data, JSON previews (dev-facing only)

**Type Scale:**

| Element | Font Size | Line Height | Font Weight | Usage |
|---------|-----------|-------------|-------------|-------|
| h1      | 36px (2.25rem) | 1.2 | 700 (Bold) | Page titles |
| h2      | 30px (1.875rem) | 1.3 | 700 (Bold) | Section headers |
| h3      | 24px (1.5rem) | 1.4 | 600 (Semibold) | Subsection headers |
| h4      | 20px (1.25rem) | 1.4 | 600 (Semibold) | Card titles |
| h5      | 18px (1.125rem) | 1.5 | 600 (Semibold) | Minor headings |
| Body Large | 18px (1.125rem) | 1.6 | 400 (Regular) | Lead paragraphs |
| Body Regular | 16px (1rem) | 1.6 | 400 (Regular) | Standard body text |
| Body Small | 14px (0.875rem) | 1.5 | 400 (Regular) | Supporting text |
| Caption | 12px (0.75rem) | 1.4 | 400 (Regular) | Captions, labels |
| Button | 16px (1rem) | 1.5 | 500 (Medium) | Button text |
| Link | 16px (1rem) | 1.5 | 500 (Medium) | Inline links |

**Font Weights:**
- **Regular (400):** Body text
- **Medium (500):** Buttons, links, emphasis
- **Semibold (600):** Headings h3-h5
- **Bold (700):** Main headings h1-h2

---

### 5.4 Spacing & Layout System

**Spacing Scale** (Tailwind CSS spacing units, 4px base):

| Token | Value | Usage |
|-------|-------|-------|
| xs    | 4px   | Tight spacing (badges, tight elements) |
| sm    | 8px   | Small spacing (button padding, small gaps) |
| md    | 16px  | Standard spacing (between elements) |
| lg    | 24px  | Large spacing (section padding) |
| xl    | 32px  | Extra large spacing (major sections) |
| 2xl   | 48px  | Section separators |
| 3xl   | 64px  | Hero spacing |

**Layout Grid:**
- **Max Content Width:** 1280px (xl container)
- **Content Width:** 1024px (lg container) for reading content
- **Padding (Desktop):** 32px horizontal
- **Padding (Mobile):** 16px horizontal

**Component Spacing:**
- **Card Padding:** 24px (p-6)
- **Button Padding:** 12px vertical, 24px horizontal
- **Input Padding:** 10px vertical, 16px horizontal
- **Section Spacing:** 48px (py-12) between major sections

---

### 5.5 Border Radius & Shadows

**Border Radius:**

| Token | Value | Usage |
|-------|-------|-------|
| sm    | 4px   | Badges, small elements |
| md    | 8px   | Buttons, inputs, cards (default) |
| lg    | 12px  | Large cards, modals |
| xl    | 16px  | Hero sections, major panels |
| full  | 9999px | Circular buttons, avatars |

**Shadows (Elevation):**

- **shadow-sm:** Subtle lift (cards, inputs)
  - `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)`

- **shadow-md:** Standard elevation (dropdowns, popovers)
  - `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)`

- **shadow-lg:** Prominent elevation (modals, important cards)
  - `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)`

- **shadow-xl:** Maximum elevation (overlays)
  - `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)`

---

### 5.6 Iconography

**Icon System:** **Lucide Icons** (React component library)

**Rationale:**
- Lightweight, tree-shakable
- Consistent design language
- Excellent React/Tailwind integration
- 1000+ icons covering all use cases

**Icon Sizes:**

| Size | Value | Usage |
|------|-------|-------|
| xs   | 12px  | Inline badges |
| sm   | 16px  | Inline text, buttons |
| md   | 20px  | Standard UI icons |
| lg   | 24px  | Section headers, prominent icons |
| xl   | 32px  | Hero icons, empty states |
| 2xl  | 48px  | Landing page features |

**Key Icons Used:**

- **Upload:** `Upload` - CV upload
- **File:** `FileText` - Document icons
- **Analysis:** `Target` - Job analysis
- **Match:** `CheckCircle2` - Match indicator
- **Gap:** `AlertTriangle` - Gap analysis
- **Download:** `Download` - Download actions
- **Edit:** `Pencil` - Edit actions
- **Delete:** `Trash2` - Delete actions
- **Success:** `CheckCircle` - Success states
- **Error:** `XCircle` - Error states
- **Info:** `Info` - Informational notices
- **Settings:** `Settings` - Settings menu
- **Profile:** `User` - User profile
- **History:** `Clock` - Application history
- **Dashboard:** `LayoutDashboard` - Dashboard
- **Upgrade:** `Zap` - Premium features

---

## 6. Component Specifications

### 6.1 Component Library Strategy

**Approach:** Leverage shadcn/ui components with custom adaptations for domain-specific needs.

**Component Categories:**

1. **Standard Components** (from shadcn/ui):
   - Buttons, Inputs, Forms, Modals, Tooltips, Badges, Cards

2. **Custom Components** (application-specific):
   - CVComparisonView
   - MatchScoreGauge
   - ATSScoreCard
   - GapAnalysisPanel
   - JobRequirementsExtraction
   - ApplicationHistoryTable

---

### 6.2 Button Component Specifications

**Variants:**

#### Primary Button
- **Background:** `bg-blue-600` (primary)
- **Text:** `text-white`
- **Hover:** `hover:bg-blue-700`
- **Active:** `active:bg-blue-800`
- **Focus:** `focus-visible:ring-2 ring-blue-600 ring-offset-2`
- **Disabled:** `disabled:bg-blue-300 disabled:cursor-not-allowed`
- **Padding:** `px-6 py-3` (md size)
- **Border Radius:** `rounded-md` (8px)
- **Font:** `font-medium text-base`
- **Usage:** Primary CTAs (Create Application, Generate CV, Sign Up)

#### Secondary Button
- **Background:** `bg-gray-100`
- **Text:** `text-gray-900`
- **Border:** `border border-gray-300`
- **Hover:** `hover:bg-gray-200`
- **Usage:** Secondary actions (Cancel, Back)

#### Outline Button
- **Background:** `bg-transparent`
- **Text:** `text-blue-600`
- **Border:** `border-2 border-blue-600`
- **Hover:** `hover:bg-blue-50`
- **Usage:** Tertiary actions (Learn More, View Details)

#### Destructive Button
- **Background:** `bg-red-600`
- **Text:** `text-white`
- **Hover:** `hover:bg-red-700`
- **Usage:** Delete actions (Delete CV, Cancel Subscription)

**Button Sizes:**

| Size | Padding | Font Size | Icon Size |
|------|---------|-----------|-----------|
| sm   | px-3 py-2 | text-sm (14px) | 16px |
| md   | px-6 py-3 | text-base (16px) | 20px |
| lg   | px-8 py-4 | text-lg (18px) | 24px |

**React Props:**

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}
```

---

### 6.3 Input Component Specifications

**Default Input:**

- **Border:** `border border-gray-300`
- **Background:** `bg-white`
- **Padding:** `px-4 py-2.5`
- **Border Radius:** `rounded-md`
- **Font:** `text-base`
- **Placeholder:** `text-gray-400`
- **Focus:** `focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20`
- **Disabled:** `disabled:bg-gray-100 disabled:cursor-not-allowed`

**Input States:**

- **Default:** Gray border
- **Focus:** Blue border + blue ring
- **Error:** Red border (`border-red-500`) + red ring
- **Success:** Green border (`border-green-500`)
- **Disabled:** Gray background, no interaction

**Input Sizes:**

| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| sm   | px-3 py-2 | text-sm | 36px |
| md   | px-4 py-2.5 | text-base | 42px |
| lg   | px-5 py-3 | text-lg | 48px |

**React Props:**

```tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  error?: string
  label?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}
```

---

### 6.4 Card Component Specifications

**Default Card:**

- **Background:** `bg-white`
- **Border:** `border border-gray-200`
- **Border Radius:** `rounded-lg` (12px)
- **Padding:** `p-6` (24px)
- **Shadow:** `shadow-sm`
- **Hover:** `hover:shadow-md` (for interactive cards)

**Card Variants:**

- **Default:** White background, subtle border
- **Elevated:** No border, prominent shadow (`shadow-md`)
- **Outlined:** Border emphasized (`border-2 border-gray-300`)
- **Interactive:** Hover state with shadow transition

**React Props:**

```tsx
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}
```

---

### 6.5 Custom Component: CVComparisonView

**Purpose:** Side-by-side display of original vs. tailored CV with change highlighting.

**Layout:**

```
┌────────────────┬────────────────┬─────────────────┐
│  ORIGINAL CV   │  TAILORED CV   │   CHANGES       │
├────────────────┼────────────────┼─────────────────┤
│  Content...    │  Content...    │  • Added keyword│
│                │                │  • Reworded     │
└────────────────┴────────────────┴─────────────────┘
```

**Features:**

- Three-column layout (desktop) / tabbed view (mobile)
- Synchronized scrolling between original and tailored
- Highlighted changes (yellow background `bg-amber-100`)
- Tooltip explanations on hover (why change was made)
- Toggle to show/hide changes panel

**React Props:**

```tsx
interface CVComparisonViewProps {
  originalCV: CVData
  tailoredCV: CVData
  changes: Change[]
  onEdit?: (section: string) => void
  onRestore?: (section: string) => void
}

interface Change {
  section: string
  type: 'added' | 'modified' | 'removed' | 'reordered'
  description: string
  rationale: string
}
```

---

### 6.6 Custom Component: MatchScoreGauge

**Purpose:** Visual representation of job match percentage.

**Design:**

```
  🎯 YOUR MATCH SCORE

     ████████████████░░░░░░  78%

  Good match! You have most required skills.
```

**Features:**

- Circular or horizontal progress bar
- Color-coded by score range:
  - **90-100%:** Green (`text-green-600`)
  - **70-89%:** Blue (`text-blue-600`)
  - **50-69%:** Amber (`text-amber-600`)
  - **< 50%:** Red (`text-red-600`)
- Animated progress fill on page load
- Contextual message based on score

**React Props:**

```tsx
interface MatchScoreGaugeProps {
  score: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showMessage?: boolean
  variant?: 'circular' | 'horizontal'
}
```

---

### 6.7 Custom Component: ATSScoreCard

**Purpose:** Display ATS compatibility score with feedback.

**Design:**

```
┌─────────────────────────────────────────────┐
│ ✅ ATS SCORE: 92/100 - EXCELLENT            │
│                                              │
│ Your CV is highly optimized for Applicant   │
│ Tracking Systems and should pass initial    │
│ screening.                                   │
│                                              │
│ Improvements:                                │
│ • Use more industry-standard job titles      │
│ • Add keywords from job description          │
└─────────────────────────────────────────────┘
```

**Features:**

- Score display with color-coded label
- Qualitative rating (Excellent, Good, Fair, Poor)
- Specific improvement suggestions
- Expandable details panel

**React Props:**

```tsx
interface ATSScoreCardProps {
  score: number // 0-100
  suggestions: string[]
  showDetails?: boolean
  onViewDetails?: () => void
}
```

---

### 6.8 Custom Component: GapAnalysisPanel

**Purpose:** Highlight missing skills/qualifications from job requirements.

**Design:**

```
┌─────────────────────────────────────────────┐
│ ⚠️  GAPS TO ADDRESS                         │
│                                              │
│ • SEO optimization (mentioned, not on CV)    │
│ • Email marketing platforms (Mailchimp)      │
│ • Budget management experience              │
│                                              │
│ 💡 Tip: Consider adding SEO coursework if   │
│    you have relevant experience.             │
└─────────────────────────────────────────────┘
```

**Features:**

- List of missing requirements
- Contextual tips for addressing gaps
- Priority indicators (critical, important, nice-to-have)
- "Add to CV" quick action

**React Props:**

```tsx
interface GapAnalysisPanelProps {
  gaps: Gap[]
  onAddToCV?: (gap: Gap) => void
}

interface Gap {
  skill: string
  priority: 'critical' | 'important' | 'nice-to-have'
  context: string
  suggestion?: string
}
```

---

## 7. UX Pattern Decisions

### 7.1 Button Hierarchy & Actions

**Primary Actions:**
- **Style:** Solid blue background (`bg-blue-600`), white text
- **Usage:** Main CTAs (Create Application, Generate CV, Save, Submit)
- **Rule:** Max 1 primary button per screen section

**Secondary Actions:**
- **Style:** Gray background (`bg-gray-100`) or outline (`border-gray-300`)
- **Usage:** Supporting actions (Cancel, Back, Edit, View Details)
- **Rule:** Multiple secondary buttons allowed

**Tertiary Actions:**
- **Style:** Text links or ghost buttons (no background)
- **Usage:** Low-priority actions (Learn More, Help, FAQ)

**Destructive Actions:**
- **Style:** Red background (`bg-red-600`)
- **Usage:** Irreversible actions (Delete CV, Cancel Subscription)
- **Rule:** Always require confirmation dialog

---

### 7.2 Feedback & Notification Patterns

**Success Feedback:**
- **Pattern:** Toast notification (top-right, auto-dismiss in 5s)
- **Style:** Green background, checkmark icon
- **Usage:** Application generated, CV saved, document downloaded
- **Example:** "✅ Your tailored application has been generated!"

**Error Feedback:**
- **Pattern:** Inline error message + toast (critical errors)
- **Style:** Red text, error icon, clear error description
- **Usage:** Form validation errors, API failures, parsing errors
- **Example:** "❌ Failed to parse CV. Please try a different file format."

**Warning Feedback:**
- **Pattern:** Inline banner (dismissible)
- **Style:** Amber background, warning icon
- **Usage:** Free tier limit, missing information, ATS issues
- **Example:** "⚠️ You've used your free application this week. Upgrade for unlimited?"

**Info Feedback:**
- **Pattern:** Subtle banner or tooltip
- **Style:** Blue background, info icon
- **Usage:** Tips, guidance, feature explanations
- **Example:** "💡 Tip: Include quantifiable achievements for stronger impact."

**Loading States:**
- **Pattern:** Progress indicator or skeleton screen
- **Style:** Animated spinner or skeleton components
- **Usage:** CV parsing, AI analysis, document generation
- **Example:** "⏳ Analyzing job description... (3-5 seconds)"

---

### 7.3 Form Patterns & Validation

**Label Position:**
- **Pattern:** Above input field
- **Rationale:** Better mobile UX, clear hierarchy

**Required Field Indicator:**
- **Pattern:** Red asterisk (*) next to label
- **Example:** `Email *`

**Validation Timing:**
- **Pattern:** `onBlur` for individual fields, `onSubmit` for form-level
- **Rationale:** Immediate feedback without annoying user mid-typing

**Error Display:**
- **Pattern:** Inline below input field
- **Style:** Red text (`text-red-600`), error icon
- **Example:** "❌ Email address is required"

**Help Text:**
- **Pattern:** Gray caption below input (`text-sm text-gray-500`)
- **Usage:** Explain expected format or constraints
- **Example:** "Use the email associated with your LinkedIn profile"

**Multi-Step Forms:**
- **Pattern:** Progress stepper at top, visible steps
- **Navigation:** "Back" and "Continue" buttons, no "Skip" for required steps

---

### 7.4 Modal & Dialog Patterns

**Modal Sizes:**
- **Small:** 400px width - confirmations, simple forms
- **Medium:** 600px width - standard dialogs, content modals
- **Large:** 800px width - complex forms, detailed content
- **Full-screen:** Mobile only, overlays entire viewport

**Dismiss Behavior:**
- **Click outside:** Closes modal (unless form has unsaved changes)
- **Escape key:** Closes modal
- **Explicit close button:** Always present (X icon, top-right)

**Focus Management:**
- **On open:** Auto-focus first interactive element (input or button)
- **On close:** Return focus to trigger element

**Confirmation Dialogs:**
- **Pattern:** Modal with clear question, two action buttons
- **Example:**
  ```
  Delete CV?
  This action cannot be undone.

  [Cancel]  [Delete]
  ```

---

### 7.5 Navigation Patterns

**Active State Indication:**
- **Pattern:** Bold text + blue underline for current page
- **Example:** `Dashboard` (active) vs. Dashboard (inactive)

**Breadcrumbs:**
- **Usage:** Deep navigation (e.g., Dashboard > My CVs > Edit CV)
- **Style:** Gray text with chevron separators
- **Interactive:** Each breadcrumb is clickable (except current page)

**Back Button Behavior:**
- **Browser back:** Navigates to previous page in history
- **App back button:** Explicit "← Back" button for multi-step flows
- **Rule:** Always provide explicit back button in wizards

**Deep Linking:**
- **Pattern:** All major views have unique URLs
- **Examples:**
  - `/dashboard`
  - `/create-application`
  - `/cv/manage`
  - `/applications/history`
  - `/applications/123` (individual application detail)

---

### 7.6 Empty State Patterns

**First Use (No CVs):**
- **Pattern:** Large icon, clear message, primary CTA
- **Example:**
  ```
  📄
  No CVs yet
  Upload your first CV to get started.

  [Upload CV]
  ```

**No Results (Search/Filter):**
- **Pattern:** Helpful message, suggest actions
- **Example:**
  ```
  🔍
  No applications found
  Try adjusting your filters or search term.

  [Clear Filters]
  ```

**Cleared Content:**
- **Pattern:** Empty state with undo option (if applicable)
- **Example:**
  ```
  All applications deleted.
  [Undo]
  ```

---

### 7.7 Confirmation & Undo Patterns

**Delete Confirmation:**
- **Pattern:** Always confirm with modal dialog
- **Copy:** Clear, specific description of what will be deleted
- **Buttons:** "Cancel" (default) + "Delete" (destructive)

**Unsaved Changes Warning:**
- **Pattern:** Modal dialog on navigation attempt
- **Copy:** "You have unsaved changes. Discard or save?"
- **Buttons:** "Discard", "Cancel", "Save"

**Undo Actions:**
- **Pattern:** Toast with undo button (5-second window)
- **Usage:** Non-critical deletions, bulk actions
- **Example:** "CV deleted. [Undo]"

---

### 7.8 Search & Filter Patterns

**Search Trigger:**
- **Pattern:** Auto-search on typing (debounced, 300ms)
- **Rationale:** Instant feedback, modern UX expectation

**Results Display:**
- **Pattern:** Real-time results update as user types
- **Loading:** Subtle spinner in search input

**Filters:**
- **Placement:** Left sidebar (desktop) or collapsible panel (mobile)
- **Behavior:** Applied immediately on selection
- **Clear:** "Clear All Filters" button always visible when filters active

**No Results:**
- **Pattern:** Helpful message + suggested actions
- **Example:** "No jobs match 'Senior Developer'. Try broader terms or adjust filters."

---

### 7.9 Date & Time Patterns

**Date Format:**
- **Relative (recent):** "2 hours ago", "Yesterday", "3 days ago"
- **Absolute (older):** "Nov 18, 2025" (MMM DD, YYYY)
- **Rule:** Use relative for < 7 days, absolute for older

**Timezone Handling:**
- **Pattern:** Display in user's local timezone
- **Server:** Store as UTC, convert on client

**Date Pickers:**
- **Pattern:** Calendar overlay with month navigation
- **Input:** Allow manual entry (format: DD/MM/YYYY or MM/DD/YYYY based on locale)

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Breakpoints

**Breakpoint Strategy:**

| Breakpoint | Min Width | Max Width | Columns | Navigation | Primary Use Case |
|------------|-----------|-----------|---------|------------|------------------|
| Mobile (xs) | 0px | 639px | 1 | Bottom tabs | Smartphones (portrait) |
| Mobile (sm) | 640px | 767px | 1 | Bottom tabs | Smartphones (landscape) |
| Tablet (md) | 768px | 1023px | 2 | Top nav | Tablets |
| Desktop (lg) | 1024px | 1279px | 3 | Top nav + sidebar | Small laptops |
| Desktop (xl) | 1280px | 1535px | 3-4 | Top nav + sidebar | Large desktops |
| Desktop (2xl) | 1536px+ | - | 4 | Top nav + sidebar | Wide monitors |

**Tailwind CSS Breakpoints:**
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

---

### 8.2 Responsive Adaptation Patterns

**Navigation:**
- **Mobile:** Bottom tab bar (Dashboard, Create, History, Profile) + hamburger menu for secondary links
- **Tablet:** Top navigation bar, collapsed to hamburger at md breakpoint
- **Desktop:** Full top navigation bar + sidebar (if applicable)

**Layout:**
- **Mobile:** Single-column layout, stacked components
- **Tablet:** Two-column layout where applicable (e.g., CV comparison becomes tabbed view)
- **Desktop:** Three-column layout for complex views (original CV | tailored CV | changes)

**Modals:**
- **Mobile:** Full-screen overlay (better touch UX)
- **Desktop:** Centered modal with backdrop

**Tables:**
- **Mobile:** Card-based view (each row becomes a card)
- **Tablet:** Horizontal scroll with sticky first column
- **Desktop:** Full table view

**Forms:**
- **Mobile:** Single-column, full-width inputs
- **Tablet/Desktop:** Two-column grid for related fields (e.g., First Name | Last Name)

**Touch Targets:**
- **Minimum size:** 44x44px (WCAG 2.1 AA) on mobile
- **Spacing:** 8px minimum between interactive elements

---

### 8.3 Accessibility Strategy (WCAG 2.1 AA Compliance)

**Target Compliance Level:** **WCAG 2.1 Level AA**

**Rationale:**
- Industry standard for modern web applications
- Legally required for government/education/public sites in many jurisdictions
- Ensures usability for widest range of users
- Supported by shadcn/ui components by default

---

#### 8.3.1 Color & Contrast

**Requirements:**

- **Text Contrast (Normal):** Minimum 4.5:1 ratio
  - Body text (`#111827` on `#FFFFFF`): **✅ 16.1:1 ratio**

- **Text Contrast (Large, 18px+ or 14px+ bold):** Minimum 3:1 ratio
  - All headings meet or exceed this requirement

- **UI Component Contrast:** Minimum 3:1 ratio
  - Borders, icons, focus indicators all meet requirement

**Color-Blind Considerations:**
- Never rely solely on color to convey information
- Use icons + text labels for all status indicators
- Success (green), Warning (amber), Error (red) always paired with semantic icons

**Focus Indicators:**
- **Visible focus ring:** 2px solid blue (`ring-2 ring-blue-600`)
- **Offset:** 2px (`ring-offset-2`) for clarity
- **Applied to:** All interactive elements (buttons, links, inputs, checkboxes)

---

#### 8.3.2 Keyboard Navigation

**Requirements:**

- **All interactive elements keyboard-accessible:** ✅
  - Buttons, links, inputs, selects, checkboxes, modals

- **Logical tab order:** Sequential, matches visual layout

- **Skip links:** "Skip to main content" link at top (hidden until focused)

- **Modal focus management:**
  - On open: Focus first interactive element
  - On close: Return focus to trigger element
  - Trap focus within modal (Tab cycles through modal elements only)

**Keyboard Shortcuts:**

| Key | Action |
|-----|--------|
| Tab | Next focusable element |
| Shift + Tab | Previous focusable element |
| Enter | Activate button/link |
| Space | Activate button, check checkbox |
| Escape | Close modal/dropdown |
| Arrow keys | Navigate within dropdowns, tabs, radio groups |

---

#### 8.3.3 Screen Reader Support

**ARIA Labels & Roles:**

- **Buttons:** `role="button"` (implicit for `<button>`)
- **Links:** `role="link"` (implicit for `<a>`)
- **Navigation:** `role="navigation"` + `aria-label="Main navigation"`
- **Form fields:** `aria-label` or associated `<label>` (for attribute)
- **Errors:** `aria-invalid="true"` + `aria-describedby="error-message-id"`
- **Live regions:** `aria-live="polite"` for status updates (toasts)

**Semantic HTML:**
- Use proper heading hierarchy (h1 → h2 → h3, no skipping levels)
- Use `<nav>`, `<main>`, `<aside>`, `<footer>` landmarks
- Use `<button>` for actions, `<a>` for navigation

**Alt Text for Images:**
- Decorative images: `alt=""` (empty, not omitted)
- Functional images: `alt="[description of function]"`
- Example: `<img src="logo.png" alt="AI CV Assistant home">`

**Screen Reader Announcements:**

- Form validation errors announced on submit
- Loading states announced: "Analyzing job description, please wait"
- Success/error toasts announced via `aria-live` regions

---

#### 8.3.4 Accessible Forms

**Label Association:**
- Every input has associated `<label>` with `for` attribute
- Example:
  ```html
  <label for="email">Email *</label>
  <input id="email" type="email" aria-required="true" />
  ```

**Required Fields:**
- Visual indicator: Red asterisk (*)
- Semantic: `aria-required="true"` attribute

**Error Handling:**
- Visual: Red border + inline error message
- Semantic: `aria-invalid="true"` + `aria-describedby="error-id"`
- Example:
  ```html
  <input id="email" aria-invalid="true" aria-describedby="email-error" />
  <span id="email-error" role="alert">Email is required</span>
  ```

**Help Text:**
- Associated with input via `aria-describedby`
- Example:
  ```html
  <input id="email" aria-describedby="email-help" />
  <span id="email-help">Use your LinkedIn email</span>
  ```

---

#### 8.3.5 Testing Strategy

**Automated Testing:**
- **Tools:** Lighthouse, axe DevTools, Pa11y
- **Frequency:** Every major feature release
- **CI Integration:** Fail builds on WCAG AA violations

**Manual Testing:**
- **Keyboard-only navigation:** Test all flows without mouse
- **Screen reader testing:** NVDA (Windows), VoiceOver (Mac/iOS), TalkBack (Android)
- **Color-blind simulation:** Chrome DevTools (Emulate vision deficiencies)

**User Testing:**
- Include users with disabilities in usability testing
- Gather feedback on assistive technology compatibility

---

### 8.4 Mobile-Specific Considerations

**Touch Target Sizes:**
- **Minimum:** 44x44px (WCAG 2.1 AA)
- **Recommended:** 48x48px (Material Design standard)
- **Spacing:** 8px minimum between targets

**Mobile Gestures:**
- Swipe: Dismiss toasts, navigate carousels (if applicable)
- Pull to refresh: Refresh dashboard (future consideration)
- Pinch to zoom: Allow on content (don't disable user-scalability)

**Mobile Performance:**
- Optimize images for mobile (responsive images, lazy loading)
- Minimize JavaScript bundle size
- Use skeleton screens for perceived performance

**Mobile Forms:**
- Use appropriate input types:
  - `type="email"` → email keyboard
  - `type="tel"` → phone keyboard
  - `type="number"` → numeric keyboard
- Autofocus first input on form load (mobile only)

---

## 9. Implementation Guidance

### 9.1 Development Handoff Checklist

**For Developers:**

- [ ] Review complete UX Design Specification
- [ ] Access Figma mockups (if created separately)
- [ ] Access interactive HTML prototypes:
  - Color theme visualizer: `ux-color-themes.html`
  - Design direction mockups: `ux-design-directions.html`
- [ ] Review component specifications (Section 6)
- [ ] Understand UX pattern decisions (Section 7)
- [ ] Review accessibility requirements (Section 8.3)
- [ ] Set up shadcn/ui in React project
- [ ] Configure Tailwind CSS with custom theme colors
- [ ] Install Lucide Icons for React

**For Designers:**

- [ ] Create high-fidelity mockups in Figma (optional, based on this spec)
- [ ] Design component library in Figma matching specifications
- [ ] Create interactive prototype for user testing
- [ ] Document animation/transition details (if complex)

---

### 9.2 Tailwind CSS Configuration

**`tailwind.config.js` Custom Theme:**

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // blue-600
          hover: '#1D4ED8', // blue-700
          active: '#1E40AF', // blue-800
        },
        secondary: {
          DEFAULT: '#10B981', // green-500
          hover: '#059669', // green-600
        },
        accent: {
          DEFAULT: '#8B5CF6', // purple-500
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
}
```

---

### 9.3 React Component Structure

**Recommended Folder Structure:**

```
src/
├── components/
│   ├── ui/ (shadcn/ui components)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Dialog.tsx
│   │   └── ...
│   ├── custom/ (domain-specific components)
│   │   ├── CVComparisonView.tsx
│   │   ├── MatchScoreGauge.tsx
│   │   ├── ATSScoreCard.tsx
│   │   ├── GapAnalysisPanel.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── ...
│   └── features/ (feature-specific components)
│       ├── dashboard/
│       ├── cv-upload/
│       ├── job-analysis/
│       ├── tailored-output/
│       └── ...
├── pages/ (Next.js) or routes/ (React Router)
│   ├── index.tsx (Landing)
│   ├── dashboard.tsx
│   ├── create-application.tsx
│   ├── cv/manage.tsx
│   ├── applications/history.tsx
│   └── ...
├── styles/
│   ├── globals.css (Tailwind imports)
│   └── ...
├── lib/
│   ├── utils.ts (helper functions)
│   └── ...
└── types/
    ├── cv.ts
    ├── job.ts
    └── ...
```

---

### 9.4 Priority Implementation Order

**Phase 1: MVP Core (Weeks 1-2)**
1. Authentication (signup, login)
2. CV upload & parsing confirmation
3. Job description input & analysis
4. Tailored CV/cover letter generation
5. Download functionality

**Phase 2: Essential UX (Weeks 3-4)**
1. Dashboard with stats
2. Match score gauge
3. ATS score card
4. Gap analysis panel
5. Side-by-side CV comparison

**Phase 3: Polish & Premium (Weeks 5-6)**
1. Application history (premium)
2. Upgrade flow & payment integration
3. Responsive design refinement
4. Accessibility testing & fixes
5. Performance optimization

---

### 9.5 Design QA Checklist

**Before Launch:**

- [ ] All interactive elements have hover states
- [ ] All interactive elements have focus states (visible ring)
- [ ] All forms have proper validation & error messages
- [ ] All buttons have loading states (where applicable)
- [ ] All empty states are designed and implemented
- [ ] All modals have close functionality (X button, Escape key, click outside)
- [ ] All tooltips are keyboard-accessible
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text)
- [ ] All images have alt text
- [ ] All form inputs have associated labels
- [ ] Tab order is logical
- [ ] Keyboard navigation works for all flows
- [ ] Screen reader announces important updates
- [ ] Mobile breakpoints tested (375px, 768px, 1024px, 1280px)
- [ ] Touch targets are minimum 44x44px on mobile

---

## 10. Appendix

### 10.1 Related Documents

- **Product Requirements:** `/docs/product-brief-ibe160-2025-11-18.md`
- **Brainstorming Session:** `/docs/brainstorming-session-results-2025-11-16.md`
- **Project Proposal:** `/proposal.md`
- **Project Plan:** `/docs/project-plan.md`

---

### 10.2 Interactive Deliverables

This UX Design Specification was created through visual collaboration:

- **Color Theme Visualizer:** `ux-color-themes.html` (to be generated)
  - Interactive HTML showing all color theme options explored
  - Live UI component examples in each theme
  - Side-by-side comparison and semantic color usage

- **Design Direction Mockups:** `ux-design-directions.html` (to be generated)
  - Interactive HTML with 6-8 complete design approaches
  - Full-screen mockups of key screens
  - Design philosophy and rationale for each direction

---

### 10.3 Design Principles Summary

**1. Empowerment over Judgment**
- Tone: Supportive, never critical
- Framing: "You have these skills" not "You're missing this"

**2. Clarity over Cleverness**
- Simple, direct language
- No jargon unless explained
- Visual hierarchy guides attention

**3. Speed over Perfection**
- Fast loading, instant feedback
- Progressive disclosure (don't overwhelm)
- Smart defaults, optional customization

**4. Confidence through Transparency**
- Show why changes were made
- Explain match scores clearly
- No "black box" AI—users understand the logic

**5. Accessibility is Non-Negotiable**
- WCAG 2.1 AA compliance mandatory
- Keyboard navigation always works
- Screen readers fully supported

---

### 10.4 Version History

| Date       | Version | Changes                             | Author |
|------------|---------|-------------------------------------|--------|
| 2025-11-19 | 1.0     | Initial UX Design Specification     | BIP    |

---

### 10.5 Next Steps & Follow-Up Workflows

This UX Design Specification can serve as input to:

- **Wireframe Generation Workflow** - Create detailed wireframes from user flows
- **Figma Design Workflow** - Generate Figma files via MCP integration
- **Interactive Prototype Workflow** - Build clickable HTML prototypes
- **Component Showcase Workflow** - Create interactive component library
- **AI Frontend Prompt Workflow** - Generate prompts for v0, Lovable, Bolt, etc.
- **Solution Architecture Workflow** - Define technical architecture with UX context

---

_This UX Design Specification was created through collaborative design facilitation, not template generation. All decisions were made with user input and are documented with rationale._

_The design prioritizes the needs of "Exhausted Job Seekers" who need clarity, confidence, and support—not another tool that makes them feel inadequate._

---

**END OF UX DESIGN SPECIFICATION**
