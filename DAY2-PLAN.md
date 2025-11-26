# Day 2 Plan - Epic 2: CV Management

**Date:** 2025-11-27 (Day 2 of 7)
**Goal:** Complete Epic 2 core features (Stories 2.4-2.6)
**Time Available:** 8 hours
**Status:** Epic 1 DONE ✅

---

## 🎯 Day 2 Objectives

### Must Complete (P0):
1. ✅ **Story 2.4:** CV Section Editing - Education, Skills, Languages (IN PROGRESS → DONE)
2. ✅ **Story 2.5:** Dynamic CV Preview (simplified - single template)
3. ✅ **Story 2.6:** CV Download Functionality (PDF generation)

### Nice to Have (P1):
4. ⏸️ **Story 2.7:** Autosave & Unsaved Changes Warning (if time permits)
5. ⏸️ Basic smoke tests for CV features

### Defer (P2):
- Story 2.8: CV Data Versioning (defer to Day 3)
- Comprehensive testing (defer to Day 5)

---

## ⏰ Hourly Time Allocation

### Morning Session (4 hours)

**09:00-09:30** | Sprint Standup & Setup
- Review Day 1 accomplishments
- Pull latest changes
- Review Epic 2 requirements

**09:30-11:30** | Story 2.4: CV Editing (2 hours)
- **Task 1:** Complete education section editing
  - Add education entry (school, degree, field, dates)
  - Edit education entry
  - Delete education entry
  - Validation (dates, required fields)

- **Task 2:** Complete skills section editing
  - Add skill (name, proficiency level)
  - Edit skill
  - Delete skill
  - Skill categories (optional)

- **Task 3:** Complete languages section editing
  - Add language (name, proficiency)
  - Edit language
  - Delete language

**11:30-12:00** | Story 2.4: Testing & Polish
- Manual test all CRUD operations
- Fix any critical bugs
- Commit Story 2.4

**12:00-13:00** | Lunch Break

---

### Afternoon Session (4 hours)

**13:00-15:00** | Story 2.5: CV Preview (2 hours)
- **Task 1:** Create CV preview component (1 hour)
  - Display all CV sections (personal, education, experience, skills, languages)
  - Single template design (professional, simple)
  - Responsive layout
  - Read-only view

- **Task 2:** Integrate with CV data (30 min)
  - Fetch CV data from backend
  - Handle empty sections gracefully
  - Loading states

- **Task 3:** Polish & test (30 min)
  - Styling with Tailwind CSS
  - Print-friendly layout
  - Test with different CV data

**15:00-17:00** | Story 2.6: PDF Download (2 hours)
- **Task 1:** Choose PDF library (15 min)
  - Research: react-pdf vs pdfkit vs jsPDF
  - Install chosen library
  - Set up basic PDF endpoint

- **Task 2:** Implement PDF generation (1 hour)
  - Create PDF template matching preview
  - Convert CV data to PDF
  - Server-side generation (Node.js endpoint)
  - OR client-side generation (React component)

- **Task 3:** Download functionality (30 min)
  - Download button in UI
  - File naming: `${userName}-CV-${date}.pdf`
  - Error handling
  - Loading state during generation

- **Task 4:** Testing (15 min)
  - Test PDF generation with various CV data
  - Test download in different browsers
  - Verify PDF content is correct

**17:00-18:00** | Buffer & Day Wrap-up
- **If ahead of schedule:** Start Story 2.7 (Autosave)
- **If on schedule:** Polish and test
- **If behind schedule:** Commit what's done, defer remaining work

- End-of-day tasks:
  - Manual test complete flow: Create CV → Edit → Preview → Download
  - Update sprint-status.yaml
  - Commit all changes
  - Push to GitHub
  - Plan Day 3

---

## 📋 Detailed Acceptance Criteria

### Story 2.4: CV Section Editing ✅

**Frontend (React):**
- [ ] Education form component
  - Fields: school, degree, field of study, start date, end date, description
  - Validation: dates, required fields
  - Add/Edit/Delete buttons

- [ ] Skills form component
  - Fields: skill name, proficiency (1-5 or Beginner/Intermediate/Advanced)
  - Add/Edit/Delete buttons
  - Optional: skill categories

- [ ] Languages form component
  - Fields: language name, proficiency (A1-C2 or Beginner/Advanced)
  - Add/Edit/Delete buttons

**Backend (Node.js + Prisma):**
- [ ] PATCH /api/v1/cv/:id endpoint
  - Update education array
  - Update skills array
  - Update languages array
  - Validation via Zod

**Database (Prisma):**
- [ ] CV model supports JSON arrays for education, skills, languages (already done)

**DONE When:**
- User can add/edit/delete education entries
- User can add/edit/delete skills
- User can add/edit/languages
- Data persists to database
- Changes visible immediately

---

### Story 2.5: Dynamic CV Preview ✅

**Frontend (React):**
- [ ] CVPreview component
  - Displays personal info
  - Displays education list
  - Displays experience list
  - Displays skills list
  - Displays languages list

- [ ] Template design (single template for MVP)
  - Professional layout
  - Clear section headers
  - Print-friendly (white background, black text)
  - Responsive (looks good on desktop and tablet)

**API Integration:**
- [ ] GET /api/v1/cv/:id endpoint (already exists)
- [ ] Fetch CV data on component mount
- [ ] Loading state
- [ ] Error handling

**DONE When:**
- Preview displays all CV sections
- Preview looks professional
- Preview updates when CV data changes
- Empty sections handled gracefully (show message or hide)
- Print-friendly (can use Cmd+P to print)

---

### Story 2.6: CV Download Functionality (PDF/DOCX) ✅

**Implementation Options:**

**Option A: Server-Side PDF (Recommended)**
- Library: `pdfkit` or `pdf-lib`
- Endpoint: POST /api/v1/cv/:id/download
- Pros: Better control, server resources
- Cons: Requires backend work

**Option B: Client-Side PDF**
- Library: `@react-pdf/renderer` or `jsPDF`
- Component: PDFDownloadButton
- Pros: Faster for user, no server load
- Cons: Limited styling, client resources

**For MVP: Choose Option B** (faster implementation)

**Frontend (React):**
- [ ] PDF download button
- [ ] Loading state during generation
- [ ] Error handling
- [ ] File naming: `${firstName}-${lastName}-CV-${YYYY-MM-DD}.pdf`

**Backend (if Option A):**
- [ ] POST /api/v1/cv/:id/download endpoint
- [ ] Generate PDF from CV data
- [ ] Return PDF file
- [ ] Content-Disposition header

**DONE When:**
- Download button works
- PDF contains all CV data
- PDF is formatted professionally
- File downloads with correct name
- PDF can be opened in any PDF reader

---

## 🛠️ Technical Implementation Notes

### Story 2.4: Frontend Forms

```jsx
// Example: Education form component
function EducationForm({ cvId, educationList, onUpdate }) {
  const [entries, setEntries] = useState(educationList);

  const addEntry = () => {
    setEntries([...entries, {
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const deleteEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const saveChanges = async () => {
    await fetch(`/api/v1/cv/${cvId}`, {
      method: 'PATCH',
      body: JSON.stringify({ education: entries })
    });
    onUpdate();
  };

  return (/* form JSX */);
}
```

### Story 2.5: CV Preview Template

```jsx
// Example: Simple CV preview
function CVPreview({ cv }) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* Personal Info */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{cv.personal_info.name}</h1>
        <p>{cv.personal_info.email} | {cv.personal_info.phone}</p>
      </header>

      {/* Education */}
      {cv.education?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold border-b-2 mb-3">Education</h2>
          {cv.education.map((edu, i) => (
            <div key={i} className="mb-3">
              <h3 className="font-medium">{edu.degree} - {edu.school}</h3>
              <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</p>
            </div>
          ))}
        </section>
      )}

      {/* Similar sections for experience, skills, languages */}
    </div>
  );
}
```

### Story 2.6: PDF Generation (Client-Side)

```jsx
import { PDFDownloadLink, Document, Page, Text } from '@react-pdf/renderer';

function DownloadButton({ cv }) {
  const MyDocument = () => (
    <Document>
      <Page>
        <Text>{cv.personal_info.name}</Text>
        {/* Add all CV sections */}
      </Page>
    </Document>
  );

  return (
    <PDFDownloadLink
      document={<MyDocument />}
      fileName={`${cv.personal_info.name}-CV.pdf`}
    >
      {({ loading }) => loading ? 'Generating...' : 'Download PDF'}
    </PDFDownloadLink>
  );
}
```

---

## 📦 Dependencies to Install

```bash
# For PDF generation (client-side)
cd frontend
npm install @react-pdf/renderer

# OR for server-side
cd src
npm install pdfkit

# For date handling (if needed)
npm install date-fns
```

---

## 🚨 Risk Mitigation

### If Behind Schedule at Noon (12:00):
- **Story 2.4 not done:**
  - Implement only education section
  - Skip skills and languages (defer to Day 3)
  - Proceed to Story 2.5

### If Behind Schedule at 3pm (15:00):
- **Story 2.5 not done:**
  - Use plain HTML/CSS preview (no fancy styling)
  - Just show data in structured format
  - Proceed to Story 2.6

### If Behind Schedule at 5pm (17:00):
- **Story 2.6 not done:**
  - Add "Download PDF" button (UI only)
  - Defer actual PDF generation to Day 3
  - Focus on getting Stories 2.4 + 2.5 working

---

## 🎯 End of Day 2 Success Criteria

**Minimum Success (Must Have):**
- ✅ Story 2.4: Can edit education section
- ✅ Story 2.5: Can preview CV
- ✅ Story 2.6: Download button exists (even if PDF not working)

**Target Success (Should Have):**
- ✅ Story 2.4: Can edit education + skills + languages
- ✅ Story 2.5: Professional-looking CV preview
- ✅ Story 2.6: Can download PDF

**Stretch Success (Nice to Have):**
- ✅ All above PLUS Story 2.7 started (autosave)
- ✅ Basic smoke tests written

---

## 📝 End of Day Checklist

- [ ] Manual test: Create CV → Edit all sections → Preview → Download
- [ ] All changes committed to Git
- [ ] sprint-status.yaml updated
- [ ] Pushed to GitHub
- [ ] Day 3 plan created
- [ ] Team standup update sent

---

## 📊 Progress Tracking

Update sprint-status.yaml at end of day:

```yaml
development_status:
  epic-2: contexted
  2-1-structured-cv-data-model-design-implementation: done
  2-2-ai-powered-cv-parsing-from-file-upload: done
  2-3-user-interface-for-cv-section-editing-work-experience: done
  2-4-user-interface-for-cv-section-editing-education-skills-languages: done  # ← Update this
  2-5-dynamic-cv-preview-template-selection: done  # ← Update this
  2-6-cv-download-functionality-pdf-docx: done  # ← Update this
  2-7-autosave-unsaved-changes-warning: ready-for-dev  # ← Or in-progress if started
  2-8-cv-data-versioning: ready-for-dev
```

---

## 🎯 Day 3 Preview

If Day 2 goes well, Day 3 will focus on:
1. Story 2.7: Autosave (if not done Day 2)
2. Story 2.8: CV versioning (basic)
3. Polish CV features
4. Add basic validation
5. Start thinking about Epic 3 (Job Analysis) or Epic 4 (AI features)

---

**Last Updated:** 2025-11-26
**Owner:** Development Team
**Sprint:** One-Week Emergency Sprint
**Days Remaining:** 5 (after Day 2)
