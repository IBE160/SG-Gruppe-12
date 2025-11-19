# AI CV & Job Application Assistant - Frontend

This is the frontend application for the AI CV & Job Application Assistant, built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## 🎨 Design System

This project implements the complete UX design specification from `docs/ux-design-specification-COMPLETE.md`.

- **Design System:** shadcn/ui (Tailwind CSS-based)
- **Color Theme:** "Confident Professional" (Blue #2563EB + Green #10B981)
- **Typography:** Inter font family
- **Icons:** Lucide React
- **Accessibility:** WCAG 2.1 Level AA compliant

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── ui/               # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── progress.tsx
│   │   ├── custom/           # Domain-specific components
│   │   │   ├── MatchScoreGauge.tsx
│   │   │   ├── ATSScoreCard.tsx
│   │   │   ├── GapAnalysisPanel.tsx
│   │   │   └── CVComparisonView.tsx
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature-specific components
│   ├── lib/
│   │   └── utils.ts          # Utility functions
│   ├── types/                # TypeScript type definitions
│   │   ├── cv.ts
│   │   └── job.ts
│   └── styles/
│       └── globals.css       # Global styles with Tailwind
├── public/                   # Static assets
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Next.js configuration
├── components.json           # shadcn/ui configuration
└── package.json              # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**

### Installation

1. **Install Node.js** (if not already installed):
   - Download from [nodejs.org](https://nodejs.org/)
   - Or use a package manager like Homebrew (Mac):
     ```bash
     brew install node
     ```

2. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 🧩 Available Components

### Base UI Components (`src/components/ui/`)

- **Button** - Primary, secondary, outline, destructive variants with loading states
- **Input** - Form inputs with labels, error states, and icons
- **Card** - Content containers with headers, footers, and variants
- **Badge** - Status indicators and tags
- **Progress** - Progress bars for loading and scores

### Custom Components (`src/components/custom/`)

#### 1. MatchScoreGauge
Visual representation of job match percentage with color-coded scores.

```tsx
<MatchScoreGauge
  score={78}
  size="md"
  showLabel={true}
  showMessage={true}
  variant="horizontal"
/>
```

#### 2. ATSScoreCard
Display ATS compatibility score with improvement suggestions.

```tsx
<ATSScoreCard
  score={92}
  suggestions={[
    "Use more industry-standard job titles",
    "Add keywords from job description"
  ]}
  showDetails={true}
/>
```

#### 3. GapAnalysisPanel
Highlight missing skills and qualifications from job requirements.

```tsx
<GapAnalysisPanel
  gaps={[
    {
      skill: "SEO optimization",
      priority: "important",
      context: "Mentioned in job description",
      suggestion: "Add SEO coursework or projects"
    }
  ]}
  onAddToCV={(gap) => console.log('Add to CV:', gap)}
/>
```

#### 4. CVComparisonView
Side-by-side comparison of original vs. tailored CV with change highlighting.

```tsx
<CVComparisonView
  originalCV={originalCVData}
  tailoredCV={tailoredCVData}
  changes={[
    {
      section: "Experience",
      type: "modified",
      description: "Rewrote job title",
      rationale: "Better matches job requirements"
    }
  ]}
  onEdit={(section) => console.log('Edit:', section)}
  onRestore={(section) => console.log('Restore:', section)}
/>
```

## 🎨 Design Principles

### 1. Empowerment over Judgment
- Supportive, never critical tone
- Framing: "You have these skills" not "You're missing this"

### 2. Clarity over Cleverness
- Simple, direct language
- No jargon unless explained
- Visual hierarchy guides attention

### 3. Speed over Perfection
- Fast loading, instant feedback
- Progressive disclosure
- Smart defaults

### 4. Confidence through Transparency
- Show why changes were made
- Explain match scores clearly
- No "black box" AI

### 5. Accessibility is Non-Negotiable
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support

## 📱 Responsive Design

Breakpoints (Tailwind CSS):
- **Mobile:** 0-639px (sm)
- **Tablet:** 640-1023px (md)
- **Desktop:** 1024px+ (lg, xl, 2xl)

All components are fully responsive with mobile-first design.

## 🧪 Type Safety

This project uses TypeScript for type safety. Key types are defined in:
- `src/types/cv.ts` - CV data structures
- `src/types/job.ts` - Job posting and analysis structures

## 🔧 Configuration

### Tailwind CSS Theme
Custom colors defined in `tailwind.config.ts`:
- Primary: `#2563EB` (blue-600)
- Secondary: `#10B981` (green-500)
- Success, Warning, Error colors
- Custom spacing and shadows

### shadcn/ui Components
Configuration in `components.json`:
- Style: default
- RSC: true (React Server Components)
- CSS variables: true
- Base color: slate

## 📚 Related Documentation

- **UX Design Specification:** `/docs/ux-design-specification-COMPLETE.md`
- **Product Brief:** `/docs/product-brief-ibe160-2025-11-18.md`
- **Project Plan:** `/docs/project-plan.md`
- **Main README:** `/README.md`

## 🚀 Next Steps

1. **Install dependencies** and run the development server
2. **Explore the components** in `/src/components/`
3. **Build new pages** using the existing components
4. **Connect to the backend API** (in `/src` at project root)
5. **Add authentication** with Firebase Auth
6. **Implement CV upload** and job analysis features

## 🤝 Contributing

This project follows the BMad Method development workflow. See `CLAUDE.md` in the project root for development guidelines.

## 📄 License

ISC License - See project root for details.
