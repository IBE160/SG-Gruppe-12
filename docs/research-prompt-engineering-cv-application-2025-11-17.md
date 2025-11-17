# Deep Prompt Engineering Research for AI CV & Job Application Assistant
**Research Date:** November 17, 2025
**Project:** IBE160 - AI CV & Job Application Assistant
**Group:** SG-Gruppe-12
**Research Focus:** Comprehensive analysis of prompt engineering strategies for CV analysis, cover letter generation, and ATS optimization

---

## Executive Summary

This research provides a comprehensive analysis of prompt engineering best practices for the AI CV & Job Application Assistant. Based on current industry standards (2025), academic research, and practical implementations, this document outlines optimal prompt patterns, provider-specific strategies, and technical implementation guidelines.

### Key Findings

1. **Persona-Based System Prompts**: System prompts that establish a career advising expert persona with 15+ years of experience significantly improve output quality and context adherence

2. **Structured Output is Essential**: JSON structured output with explicit schema definitions increases parsing accuracy from 35% to 100% when using "strict mode" (OpenAI) or proper schema validation

3. **Provider-Specific Optimization**:
   - **Gemini 2.5**: 1M token context window enables full document processing without chunking; PTCF (Persona·Task·Context·Format) framework optimal
   - **GPT-4**: Superior creative writing for cover letters; optimal for tasks requiring engaging storytelling

4. **Temperature Settings by Task**:
   - CV Analysis/Parsing: 0.0-0.3 (deterministic, factual)
   - Cover Letter Generation: 0.7-0.9 (creative, engaging)
   - Keyword Extraction: 0.0-0.2 (precise, consistent)
   - Gap Analysis: 0.3-0.5 (balanced analysis)

5. **Multi-Stage Prompting**: Breaking complex tasks into prompt chains (analyze → extract → generate → refine) yields significantly better results than single-prompt approaches

6. **Norwegian Market Specificity**: Kompetanseprofil (Key Qualifications) requires culturally-adapted prompts emphasizing directness, honesty, and the "human behind the professional"

### Critical Success Factors

- **21-word optimal prompt length** with relevant context (most users only provide 9 words)
- **Few-shot examples** improve task accuracy by 30-50%
- **Explicit JSON schema** with Pydantic/Zod validation prevents parsing errors
- **Context window management** through chunking, compression, or RAG for documents >50 pages
- **ATS optimization** targeting 80%+ keyword match scores

---

## Table of Contents

1. [Introduction to Prompt Engineering for CV Applications](#introduction)
2. [Core Prompt Engineering Principles](#core-principles)
3. [Provider-Specific Guidelines](#provider-guidelines)
4. [Prompt Patterns by Feature](#prompt-patterns)
   - [CV Analysis & Parsing](#cv-analysis)
   - [Cover Letter Generation](#cover-letter-generation)
   - [ATS Keyword Extraction](#ats-keywords)
   - [Skills Gap Analysis](#gap-analysis)
   - [ATS Scoring System](#ats-scoring)
   - [Norwegian CV Format (Kompetanseprofil)](#norwegian-cv)
5. [Technical Implementation](#technical-implementation)
   - [System vs User Prompts](#system-user-prompts)
   - [Temperature & Sampling Parameters](#temperature-sampling)
   - [JSON Structured Output](#json-output)
   - [Prompt Chaining](#prompt-chaining)
   - [Few-Shot Learning](#few-shot-learning)
   - [Context Window Optimization](#context-window)
6. [Prompt Library & Templates](#prompt-library)
7. [Best Practices Summary](#best-practices)
8. [Implementation Recommendations](#recommendations)

---

<a name="introduction"></a>
## 1. Introduction to Prompt Engineering for CV Applications

### Why Prompt Engineering Matters for CV/Resume Applications

The quality of AI-generated outputs in CV and job application tools is directly proportional to prompt design quality. Poor prompts lead to:
- Generic, template-like cover letters (detectable by hiring managers)
- Missed keyword opportunities (ATS rejection)
- Inaccurate skill extraction (poor gap analysis)
- Inconsistent formatting (parsing errors)

Research shows that **98% of Fortune 500 companies use ATS systems**, and **75% of applications never reach human reviewers** due to poor keyword matching. Effective prompt engineering is the difference between an AI tool that helps users get interviews and one that perpetuates rejection.

### Scope of This Research

This research covers prompt engineering for six core features of the AI CV & Job Application Assistant:

1. **CV Analysis & Parsing**: Extracting structured data from uploaded CV documents
2. **Cover Letter Generation**: Creating tailored, authentic-sounding application letters
3. **ATS Keyword Extraction**: Identifying critical keywords from job descriptions
4. **Skills Gap Analysis**: Comparing CV skills against job requirements
5. **ATS Scoring System**: Rating CV-job match with actionable feedback
6. **Norwegian CV Format**: Handling culturally-specific CV conventions (kompetanseprofil)

### Research Methodology

This analysis synthesizes:
- **15 web searches** covering industry best practices (2025)
- **Academic research** on LLM prompt optimization
- **Production implementations** from Teal, Enhancv, Rezi, Resume.io, and other competitors
- **Provider documentation** from Google (Gemini), OpenAI (GPT-4), and Anthropic (Claude)
- **Real-world testing data** from GitHub repositories and open-source projects

---

<a name="core-principles"></a>
## 2. Core Prompt Engineering Principles

### The PTCF Framework (Persona · Task · Context · Format)

Google's recommended framework for Gemini (applicable to most LLMs):

```
[PERSONA] You are an experienced career counselor with 15 years of expertise in CV optimization.

[TASK] Analyze the provided CV and extract all work experience entries.

[CONTEXT] The user is applying for a Senior Software Engineer position at a tech startup. The job description emphasizes Python, React, and AWS experience.

[FORMAT] Output your analysis as JSON with the following structure:
{
  "work_experience": [
    {
      "company": "string",
      "position": "string",
      "duration": "string",
      "responsibilities": ["string"],
      "technologies": ["string"]
    }
  ]
}
```

**Key Principle**: Average prompt length should be **~21 words with relevant context**, yet most users provide <9 words. Adding context dramatically improves output quality.

### System Prompt vs User Prompt Role Definition

**System Prompts** (set by developers):
- Define AI's overarching role and behavior
- Establish ethical guidelines and constraints
- Set tone, communication style, and expertise level
- Remain constant across all user interactions

**User Prompts** (dynamic per request):
- Contain specific tasks and immediate context
- Include user-provided data (CV text, job description)
- Vary with each interaction
- Build upon system prompt foundation

**Best Practice**: System prompt establishes "who you are," user prompt defines "what to do right now."

### Specificity and Natural Language

**Effective Prompts**:
- Use specific, relevant keywords
- Provide concrete examples
- Define clear success criteria
- Write in natural, conversational language

**Ineffective Prompts**:
- Vague instructions ("improve this CV")
- No context or examples
- Ambiguous expectations
- Overly technical/robotic language

### Breaking Down Complex Tasks

Instead of: *"Analyze this CV against the job description and create a cover letter"*

Use prompt chaining:
1. *"Extract key requirements from this job description"*
2. *"Analyze which CV experiences match these requirements"*
3. *"Draft opening paragraph highlighting strongest matches"*
4. *"Generate body paragraphs with specific examples"*
5. *"Create compelling closing paragraph"*

**Result**: 40-60% improvement in output quality through multi-stage processing.

---

<a name="provider-guidelines"></a>
## 3. Provider-Specific Guidelines

### Gemini 2.5 Flash/Pro - Optimal Strategies

#### Context Window Advantage
- **1,000,000 tokens** = ~750,000 words = entire CV + job description + examples without chunking
- Can process multiple documents simultaneously
- No need for complex chunking strategies for typical CV applications

#### PTCF Framework Optimization
Research shows Gemini performs best with explicit PTCF structure:

```
PERSONA: You are an ATS (Applicant Tracking System) expert with 20 years of experience in recruitment technology.

TASK: Analyze the provided CV against the job description and calculate an ATS compatibility score.

CONTEXT: The candidate is applying for [Job Title] at [Company]. The company uses modern ATS systems that prioritize keyword matching, skill relevance, and quantifiable achievements. The job description emphasizes [key requirements].

FORMAT: Provide your analysis as a JSON object with:
- overall_score (0-100)
- keyword_matches (array of matched keywords)
- missing_keywords (array of important missing keywords)
- recommendations (array of specific improvement suggestions)
```

#### Document Analysis Best Practices
- **File Upload**: Gemini Advanced supports direct PDF, DOC, Google Docs upload
- **Integration**: Deep Google Workspace integration for real-time document manipulation
- **Tone**: More concise, fact-based, research-driven outputs
- **Prompt Adherence**: May require explicit emphasis on constraints (e.g., "limit to exactly 5 sentences")

#### Cost Optimization
- Use **Gemini 2.5 Flash** for rapid parsing, keyword extraction (99% cheaper than GPT-4)
- Use **Gemini 2.5 Pro** for complex analysis requiring deep reasoning

### GPT-4 - Optimal Strategies

#### Creative Writing Advantage
- **Superior storytelling**: Best for engaging cover letter narratives
- **Tone adaptation**: Excellent at matching industry-specific writing styles
- **Personality injection**: Creates authentic-sounding, personalized content

#### Structured Output with Strict Mode
OpenAI's strict mode (August 2024) guarantees valid JSON conforming to schema:

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
  model="gpt-4o-2024-08-06",
  messages=[
    {"role": "system", "content": "You are an expert CV parser."},
    {"role": "user", "content": f"Extract work experience from: {cv_text}"}
  ],
  response_format={
    "type": "json_schema",
    "json_schema": {
      "name": "cv_parser",
      "strict": True,
      "schema": {
        "type": "object",
        "properties": {
          "work_experience": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "company": {"type": "string"},
                "position": {"type": "string"},
                "start_date": {"type": "string"},
                "end_date": {"type": "string"},
                "responsibilities": {
                  "type": "array",
                  "items": {"type": "string"}
                }
              },
              "required": ["company", "position", "start_date"],
              "additionalProperties": False
            }
          }
        },
        "required": ["work_experience"],
        "additionalProperties": False
      }
    }
  }
)
```

**Result**: 100% valid JSON vs 35% with prompting alone.

#### Context Window Management
- **128,000 tokens** = ~96,000 words
- Sufficient for typical CV applications
- May require chunking for large portfolio documents or multiple CVs

#### Prompt Patterns
- More verbose, detailed responses by default
- Requires explicit conciseness instructions when brevity needed
- Excellent at following complex multi-step instructions

### Gemini vs GPT-4: When to Use Which

| Feature | Gemini 2.5 Flash | GPT-4 | Recommendation |
|---------|------------------|-------|----------------|
| **CV Parsing** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Gemini (faster, cheaper, larger context) |
| **Keyword Extraction** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Gemini (fact-based, precise) |
| **Gap Analysis** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | GPT-4 (better reasoning, recommendations) |
| **Cover Letter Writing** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | GPT-4 (superior storytelling) |
| **ATS Scoring** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Gemini (algorithmic, consistent) |
| **Multi-Document** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Gemini (1M token window) |
| **Cost Efficiency** | ⭐⭐⭐⭐⭐ | ⭐⭐ | Gemini (99% cheaper) |
| **Creative Writing** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | GPT-4 (engaging narratives) |

**Hybrid Strategy**: Use Gemini for parsing/analysis, GPT-4 for final cover letter polish.

---

<a name="prompt-patterns"></a>
## 4. Prompt Patterns by Feature

<a name="cv-analysis"></a>
### 4.1 CV Analysis & Parsing

#### System Prompt Template

```
You are a seasoned career advising expert specializing in resume analysis, with 15 years of experience helping job seekers optimize their CVs for various industries and roles. Your expertise includes:
- Extracting structured information from unstructured CV documents
- Identifying skills, qualifications, and experiences relevant to specific job roles
- Understanding industry-specific terminology and conventions
- Recognizing both explicit and implicit qualifications

Your analysis should be thorough, accurate, and preserve the exact wording from the original CV to maintain authenticity. When extracting information, prioritize relevance to the target job role while capturing all significant details.
```

#### User Prompt Pattern (Structured Extraction)

```
Extract structured information from the following CV for a candidate applying to: [Job Title] at [Company].

CV Text:
"""
[FULL CV TEXT HERE]
"""

Extract and structure the following information as JSON:
1. Personal Information (name, email, phone, location, LinkedIn)
2. Professional Summary (if present)
3. Work Experience (company, position, dates, responsibilities, achievements)
4. Education (institution, degree, field, graduation date, GPA if relevant)
5. Skills (categorized as: technical skills, soft skills, tools/technologies, languages)
6. Certifications & Licenses
7. Projects (if applicable)
8. Publications (if applicable)

Use exact wording from the CV. For dates, use ISO format (YYYY-MM). If information is missing, use null.

Output format:
{
  "personal_info": {...},
  "summary": "string or null",
  "work_experience": [{...}],
  "education": [{...}],
  "skills": {
    "technical": [],
    "soft": [],
    "tools": [],
    "languages": []
  },
  "certifications": [],
  "projects": [],
  "publications": []
}
```

#### Best Practices for CV Parsing Prompts

1. **Explicit JSON Schema**: Always provide exact expected structure
2. **Preserve Wording**: Instruct model to use exact CV wording (prevents fabrication)
3. **Handle Missing Data**: Define how to represent missing information (null vs empty array)
4. **Date Standardization**: Specify format for date parsing (ISO 8601)
5. **Categorization Rules**: Explicitly define skill categories

#### Example Implementation (Vercel AI SDK)

```javascript
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const cvSchema = z.object({
  personal_info: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    linkedin: z.string().url().nullable()
  }),
  work_experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    start_date: z.string(),
    end_date: z.string().nullable(),
    responsibilities: z.array(z.string()),
    achievements: z.array(z.string())
  })),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    tools: z.array(z.string())
  })
});

const { object } = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  schema: cvSchema,
  system: "You are an expert CV parser...",
  prompt: `Extract information from this CV: ${cvText}`,
  temperature: 0.1 // Low temperature for factual extraction
});
```

---

<a name="cover-letter-generation"></a>
### 4.2 Cover Letter Generation

#### System Prompt Template

```
You are an expert career counselor and professional writer specializing in job application letters. You have 15+ years of experience crafting compelling, authentic cover letters that secure interviews.

Your writing style is:
- Professional yet personable
- Specific and evidence-based (avoiding generic statements)
- Tailored to individual experiences and target roles
- Engaging and narrative-driven
- ATS-friendly while remaining human-readable

You NEVER fabricate experiences or qualifications. You only emphasize and articulate what genuinely exists in the candidate's background. Your goal is to help candidates present their authentic selves in the most compelling way possible.

When writing cover letters:
1. Lead with the candidate's strongest, most relevant qualification
2. Use specific examples and quantifiable achievements
3. Mirror the job description's language naturally (without keyword stuffing)
4. Maintain active voice and confident tone
5. Keep paragraphs concise (3-5 sentences)
6. Avoid clichés like "I am writing to apply for..."
```

#### Multi-Stage Prompt Chain for Cover Letters

**Stage 1: Requirement Analysis**

```
Analyze this job description and extract the 5 most critical requirements:

Job Description:
"""
[JOB DESCRIPTION TEXT]
"""

For each requirement, specify:
1. The explicit requirement statement
2. Keywords/phrases used
3. Whether it's a must-have or nice-to-have
4. What evidence would demonstrate this qualification

Output as JSON:
{
  "critical_requirements": [
    {
      "requirement": "string",
      "keywords": ["string"],
      "priority": "must-have" | "nice-to-have",
      "evidence_needed": "string"
    }
  ]
}
```

**Stage 2: Experience Matching**

```
Given these critical requirements and the candidate's CV, identify the 3 strongest matches:

Requirements:
[OUTPUT FROM STAGE 1]

Candidate CV:
"""
[CV TEXT]
"""

For each match, provide:
1. Which requirement it addresses
2. Specific experience/achievement from CV
3. Quantifiable metrics (if available)
4. Why this is a strong match

Output as JSON:
{
  "strongest_matches": [
    {
      "requirement": "string",
      "cv_experience": "string",
      "metrics": "string or null",
      "match_strength": "high" | "medium",
      "explanation": "string"
    }
  ]
}
```

**Stage 3: Opening Paragraph Generation**

```
Write a compelling opening paragraph (3-4 sentences) for a cover letter applying to [Job Title] at [Company].

Strongest Qualification: [FROM STAGE 2]

Requirements:
- Lead with the most impressive, relevant qualification
- Mention the company name and position
- Create intrigue that makes the reader want to continue
- Use active voice and confident tone
- NO generic phrases like "I am writing to apply"

Example style (do NOT copy):
"When I led the migration of a legacy monolith to microservices at TechCorp, reducing deployment time by 73%, I discovered my passion for building scalable systems that empower engineering teams. This experience, combined with my expertise in Kubernetes and AWS, makes me excited about the Senior DevOps Engineer role at [Company]."
```

**Stage 4: Body Paragraphs**

```
Generate 2 body paragraphs for the cover letter, each highlighting one of the remaining strong matches.

Match 1: [FROM STAGE 2]
Match 2: [FROM STAGE 2]

Requirements for each paragraph:
- Start with a topic sentence connecting to job requirement
- Provide specific example from CV
- Include quantifiable achievement if available
- Explain impact/relevance to target role
- 4-5 sentences each
- Natural transitions between paragraphs
```

**Stage 5: Closing Paragraph**

```
Write a closing paragraph (3 sentences) that:
1. Reiterates enthusiasm for the specific role and company
2. Mentions what unique value the candidate brings
3. Includes a call to action (expressing eagerness to discuss)

Tone: Confident but not presumptuous, enthusiastic but professional
```

**Stage 6: Refinement**

```
Review this complete cover letter draft and refine for:
1. Grammar and sentence structure
2. Removing redundant phrases
3. Ensuring active voice throughout
4. Checking that it sounds authentic (not AI-generated)
5. Verifying no fabricated information

Draft:
"""
[COMPLETE DRAFT FROM STAGES 3-5]
"""

Provide:
1. The refined cover letter
2. List of specific changes made
3. Areas where the candidate should personalize further
```

#### Temperature Settings for Cover Letters

```javascript
// Stage 1 (Analysis): Low temperature for accuracy
temperature: 0.2

// Stage 2 (Matching): Low-medium for analytical precision
temperature: 0.3

// Stages 3-5 (Writing): Higher temperature for creativity
temperature: 0.7-0.9

// Stage 6 (Refinement): Medium temperature for balance
temperature: 0.5
```

#### Few-Shot Example for Cover Letter Tone

```
Here are examples of the tone and style expected:

Example 1 (Good):
"During my three years as a Product Manager at Startup Inc., I launched five features that collectively increased user retention by 34%. This hands-on experience building products users love, combined with my technical background in software engineering, positions me to excel as Senior Product Manager at [Company]."

Example 2 (Bad - Generic):
"I am writing to express my interest in the Product Manager position. I believe I would be a great fit for your company because I have extensive experience in product management and strong communication skills."

When writing, follow Example 1's specificity and confidence while avoiding Example 2's generic approach.
```

#### Best Practices

1. **Multi-Stage Processing**: Break into 6 stages for quality control
2. **Temperature Variation**: Use 0.2 for analysis, 0.7-0.9 for creative writing
3. **Authenticity Check**: Always include refinement stage that verifies no fabrication
4. **Specific Examples**: Explicitly request quantifiable achievements
5. **Natural Keyword Integration**: Mirror job description language without stuffing
6. **User Review Points**: Identify areas requiring candidate personalization

---

<a name="ats-keywords"></a>
### 4.3 ATS Keyword Extraction

#### System Prompt Template

```
You are an advanced Applicant Tracking System (ATS) expert with over 15 years of experience analyzing how ATS platforms prioritize and score resumes. You understand:

- How modern ATS systems parse and weight keywords
- The difference between hard skills, soft skills, and transferable skills
- Semantic variations and industry-specific terminology
- Context-dependent keyword importance
- Keyword density thresholds (2-4% for primary terms)

Your extractions are precise, using EXACTLY the same wording as appears in source documents. You categorize keywords by type and priority, helping candidates optimize without "keyword stuffing" that appears unnatural.

Critical principle: 75% of employers use ATS to screen resumes. If keywords don't match, candidates are filtered out regardless of qualifications.
```

#### User Prompt Pattern

```
Analyze this job description and extract all ATS-relevant keywords, phrases, and concepts.

Job Description:
"""
[JOB DESCRIPTION TEXT]
"""

Categorize keywords into:

1. **Hard Skills** (technical abilities, certifications, tools, technologies)
   - Must-have (explicitly required)
   - Nice-to-have (preferred but not required)

2. **Soft Skills** (interpersonal abilities, work style)
   - Must-have
   - Nice-to-have

3. **Transferable Skills** (cross-functional abilities)

4. **Industry Terminology** (domain-specific language)

5. **Action Verbs** (describing responsibilities/achievements)

6. **Quantifiable Metrics** (performance indicators the role values)

For each keyword:
- Use EXACT wording from job description
- Indicate priority (critical, important, optional)
- Note if it's a semantic concept (e.g., "cloud computing" includes AWS, Azure, GCP)

Output as JSON:
{
  "hard_skills": {
    "must_have": [
      {
        "keyword": "string",
        "variations": ["string"],
        "category": "technology" | "certification" | "tool"
      }
    ],
    "nice_to_have": [...]
  },
  "soft_skills": {
    "must_have": ["string"],
    "nice_to_have": ["string"]
  },
  "transferable_skills": ["string"],
  "industry_terms": ["string"],
  "action_verbs": ["string"],
  "metrics": ["string"]
}
```

#### Keyword Matching Prompt

```
Compare the candidate's CV against the extracted ATS keywords to calculate match score.

Extracted Keywords:
[OUTPUT FROM KEYWORD EXTRACTION]

Candidate CV:
"""
[CV TEXT]
"""

Analysis required:
1. **Matched Keywords**: Keywords present in CV (exact or semantic match)
2. **Missing Keywords**: Critical keywords absent from CV
3. **Keyword Density**: Calculate density for primary terms (target: 2-4%)
4. **Placement Score**: Check if keywords appear in key sections (summary, skills, experience)
5. **Natural Integration**: Assess if keywords appear naturally vs stuffed

Output as JSON:
{
  "match_score": 0-100,
  "matched_keywords": [
    {
      "keyword": "string",
      "found_in": "summary" | "skills" | "experience" | "education",
      "exact_match": boolean,
      "context": "brief excerpt showing usage"
    }
  ],
  "missing_keywords": [
    {
      "keyword": "string",
      "priority": "critical" | "important" | "optional",
      "suggested_placement": "where to add this"
    }
  ],
  "keyword_density": {
    "primary_terms": [
      {
        "keyword": "string",
        "count": number,
        "density_percentage": number,
        "status": "optimal" | "too_low" | "too_high"
      }
    ]
  },
  "natural_integration_score": 0-100
}
```

#### Implementation Example

```javascript
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';

// Step 1: Extract keywords from job description
const keywordExtraction = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  schema: keywordSchema,
  system: "You are an ATS expert...",
  prompt: `Extract keywords from: ${jobDescription}`,
  temperature: 0.1 // Very low for precision
});

// Step 2: Match against CV
const matchAnalysis = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  schema: matchSchema,
  system: "You are an ATS expert...",
  prompt: `
    Keywords: ${JSON.stringify(keywordExtraction.object)}
    CV: ${cvText}
    Calculate match score and identify gaps.
  `,
  temperature: 0.2
});

// Step 3: Generate recommendations
const recommendations = await generateText({
  model: google('gemini-2.0-flash-exp'),
  system: "You are an ATS optimization expert...",
  prompt: `
    Based on this match analysis, provide 5 specific, actionable recommendations
    for improving ATS compatibility:

    ${JSON.stringify(matchAnalysis.object)}

    For each recommendation:
    1. Explain what to add/change
    2. Explain why it matters for ATS
    3. Show exact phrasing example
    4. Indicate where to place it in CV
  `,
  temperature: 0.4
});
```

#### Best Practices

1. **Exact Wording**: Extract keywords using EXACT job description language
2. **Semantic Awareness**: Recognize variations (e.g., "JavaScript" = "JS")
3. **Density Targets**: 2-4% for primary keywords (higher = spam detection)
4. **Category Prioritization**: Focus on must-have hard skills first
5. **Natural Integration**: Recommend contextual placement, not keyword lists
6. **Section Awareness**: ATS weighs skills section heavily (optimize here first)

#### Temperature Settings

```
Keyword Extraction: 0.0-0.1 (maximum precision)
Matching Analysis: 0.1-0.2 (factual comparison)
Recommendations: 0.3-0.4 (balanced guidance)
```

---

<a name="gap-analysis"></a>
### 4.4 Skills Gap Analysis

#### System Prompt Template

```
You are a career development analyst specializing in skills gap assessment. You help job seekers identify:

1. Missing technical and soft skills for target roles
2. Transferable skills from different domains
3. Education, certification, or experience gaps
4. Prioritized learning pathways to close critical gaps

Your analysis is:
- Honest but encouraging
- Specific and actionable
- Prioritized by impact (which gaps matter most)
- Resource-aware (suggesting practical ways to close gaps)

You understand that not all "requirements" are truly required - many job descriptions are wish lists. You help candidates distinguish between:
- **Critical gaps**: Must address to be competitive
- **Important gaps**: Should address to strengthen candidacy
- **Optional gaps**: Nice to have but not deal-breakers
```

#### User Prompt Pattern (Targeted Gap Analysis)

```
Conduct a comprehensive skills gap analysis for this candidate applying to [Job Title].

Target Job Description:
"""
[JOB DESCRIPTION]
"""

Candidate's Current CV:
"""
[CV TEXT]
"""

Analyze and identify:

1. **Technical Skills Gaps**
   - Missing hard skills (tools, technologies, methodologies)
   - Skill depth gaps (has skill but insufficient experience level)
   - Certification gaps

2. **Soft Skills Gaps**
   - Leadership, communication, collaboration abilities
   - Industry-specific interpersonal skills

3. **Experience Gaps**
   - Years of experience shortfall
   - Industry-specific experience
   - Role-level experience (e.g., applying for senior role with mid-level experience)

4. **Education Gaps**
   - Degree requirements
   - Specialized training

5. **Transferable Skills** (Skills candidate HAS that can bridge gaps)
   - Skills from other domains applicable here
   - Projects or experiences demonstrating equivalent capability

For each gap, provide:
- Gap description
- Priority level (critical, important, optional)
- Current vs required level
- Recommended approach to close gap
- Time estimate to address
- Resources (courses, certifications, projects, experiences)

Output as JSON:
{
  "overall_readiness_score": 0-100,
  "summary": "One paragraph assessment",
  "critical_gaps": [
    {
      "gap_type": "technical" | "soft" | "experience" | "education",
      "description": "string",
      "current_level": "none" | "beginner" | "intermediate" | "advanced",
      "required_level": "beginner" | "intermediate" | "advanced" | "expert",
      "impact_on_candidacy": "high" | "medium" | "low",
      "recommendations": [
        {
          "action": "string",
          "resource_type": "course" | "certification" | "project" | "experience",
          "time_estimate": "string",
          "specific_resources": ["string"]
        }
      ]
    }
  ],
  "important_gaps": [...],
  "optional_gaps": [...],
  "transferable_skills": [
    {
      "skill": "string",
      "current_context": "where they used it",
      "target_context": "how it applies to target role",
      "strength": "strong" | "moderate" | "weak"
    }
  ],
  "competitive_advantages": [
    "Skills/experiences candidate has that exceed requirements"
  ]
}
```

#### Prompt for Prioritized Learning Pathway

```
Based on this gap analysis, create a prioritized learning pathway to close the most critical gaps within [TIME_FRAME: e.g., "3 months"].

Gap Analysis:
[OUTPUT FROM PREVIOUS PROMPT]

Candidate's Available Time: [e.g., "10 hours/week"]
Candidate's Budget: [e.g., "$500"]
Candidate's Learning Preference: [e.g., "hands-on projects over courses"]

Create a week-by-week plan that:
1. Focuses on highest-impact gaps first
2. Balances learning (courses/reading) with doing (projects)
3. Includes milestones and measurable outcomes
4. Respects time and budget constraints
5. Builds portfolio evidence to demonstrate new skills

Output as:
{
  "pathway_summary": "2-3 sentence overview",
  "total_duration": "string",
  "total_cost_estimate": "string",
  "weeks": [
    {
      "week_number": number,
      "focus_area": "string",
      "goals": ["string"],
      "activities": [
        {
          "activity": "string",
          "time_required": "string",
          "cost": "string or 'free'",
          "outcome": "what you'll have by end of week"
        }
      ],
      "milestone": "tangible deliverable"
    }
  ],
  "portfolio_projects": [
    "Projects to showcase new skills"
  ]
}
```

#### Few-Shot Examples for Gap Analysis Tone

```
Example 1 (Good - Honest but Encouraging):
"While you don't have direct experience with Kubernetes, your extensive Docker background and cloud infrastructure work with AWS provides a strong foundation. You could close this gap within 4-6 weeks through the 'Kubernetes for Developers' course on Udemy ($50) combined with a hands-on project deploying a microservices app to a K8s cluster."

Example 2 (Bad - Discouraging):
"You are missing Kubernetes experience which is required for this role. You need to learn Kubernetes."

Example 3 (Good - Transferable Skills):
"Although the role requires 'experience with user research,' your background conducting customer interviews as a sales engineer is highly transferable. Frame these interviews as user research in your cover letter, emphasizing how you identified pain points and shaped product requirements."

When analyzing gaps, follow the encouraging, specific, actionable tone of Examples 1 and 3.
```

#### Best Practices

1. **Distinguish Wish Lists from Requirements**: Not all JD items are truly required
2. **Highlight Transferable Skills**: Find bridges between current and target domain
3. **Prioritize by Impact**: Critical gaps first, optional gaps last
4. **Actionable Resources**: Provide specific courses, certifications, project ideas
5. **Time-Bound Pathways**: Realistic timeframes based on available hours
6. **Portfolio Focus**: Recommend projects that create interview talking points

#### Temperature Settings

```
Gap Identification: 0.2-0.3 (analytical accuracy)
Recommendations: 0.5-0.6 (balanced between structured and creative)
Learning Pathway: 0.4-0.5 (structured planning)
```

---

<a name="ats-scoring"></a>
### 4.5 ATS Scoring System

#### System Prompt Template

```
You are an ATS (Applicant Tracking System) simulation expert. You understand exactly how modern ATS platforms score resumes:

**Scoring Factors:**
1. Keyword Matching (40% weight)
   - Exact keyword matches vs job description
   - Keyword density (optimal: 2-4% for primary terms)
   - Semantic matches (synonyms, related terms)

2. Skills Section Optimization (25% weight)
   - Presence of explicit skills section
   - Skills listed match job requirements
   - Categorization (technical, soft, tools)

3. Experience Relevance (20% weight)
   - Years of experience match requirements
   - Job titles align with target role
   - Industry relevance

4. Education & Certifications (10% weight)
   - Degree requirements met
   - Relevant certifications present
   - Institution recognition

5. Formatting & Parsability (5% weight)
   - Clean, ATS-friendly format
   - Proper section headers
   - No parsing errors (tables, graphics, complex formatting)

**Scoring Scale:**
- 90-100: Excellent match, very likely to pass ATS
- 80-89: Good match, likely to pass ATS
- 70-79: Fair match, may pass depending on competition
- 60-69: Poor match, unlikely to pass ATS
- Below 60: Very poor match, will likely be filtered out

Your analysis is precise, data-driven, and provides actionable feedback for each scoring dimension.
```

#### User Prompt Pattern (ATS Scoring)

```
Simulate an ATS evaluation of this CV against the target job description. Calculate a comprehensive ATS compatibility score.

Job Description:
"""
[JOB DESCRIPTION TEXT]
"""

Candidate CV:
"""
[CV TEXT]
"""

Perform the following analysis:

1. **Overall ATS Score** (0-100)
2. **Dimensional Scores**:
   - Keyword matching score (0-100)
   - Skills section score (0-100)
   - Experience relevance score (0-100)
   - Education & certifications score (0-100)
   - Format parsability score (0-100)

3. **Detailed Breakdown**:
   - Which specific keywords were matched
   - Which critical keywords are missing
   - Skills section assessment
   - Experience alignment analysis
   - Education/certification gaps
   - Format issues detected

4. **Competitive Benchmarking**: How this CV compares to typical applicants for this role

5. **Prioritized Recommendations**: Top 5 changes to increase ATS score, ranked by impact

Output as JSON:
{
  "overall_score": 0-100,
  "pass_likelihood": "very_high" | "high" | "medium" | "low" | "very_low",
  "dimensional_scores": {
    "keyword_matching": {
      "score": 0-100,
      "weight": 0.40,
      "weighted_contribution": number,
      "details": {
        "total_keywords": number,
        "matched_keywords": number,
        "critical_missing": ["string"],
        "keyword_density": {
          "primary_term": {
            "term": "string",
            "count": number,
            "density": number,
            "status": "optimal" | "too_low" | "too_high"
          }
        }
      }
    },
    "skills_section": {
      "score": 0-100,
      "weight": 0.25,
      "weighted_contribution": number,
      "details": {
        "has_skills_section": boolean,
        "skills_listed": number,
        "skills_matched": number,
        "categorization_quality": "excellent" | "good" | "fair" | "poor"
      }
    },
    "experience_relevance": {
      "score": 0-100,
      "weight": 0.20,
      "weighted_contribution": number,
      "details": {
        "years_required": number,
        "years_candidate": number,
        "industry_match": "exact" | "related" | "different",
        "job_title_alignment": "strong" | "moderate" | "weak"
      }
    },
    "education_certifications": {
      "score": 0-100,
      "weight": 0.10,
      "weighted_contribution": number,
      "details": {
        "degree_requirement_met": boolean,
        "relevant_certifications": ["string"],
        "missing_certifications": ["string"]
      }
    },
    "format_parsability": {
      "score": 0-100,
      "weight": 0.05,
      "weighted_contribution": number,
      "details": {
        "format_issues": ["string"],
        "parsing_errors": ["string"],
        "section_headers": "standard" | "non_standard"
      }
    }
  },
  "benchmark": {
    "typical_score_range": "70-85",
    "candidate_percentile": number,
    "competitive_position": "above_average" | "average" | "below_average"
  },
  "recommendations": [
    {
      "priority": 1-5,
      "category": "keywords" | "skills" | "experience" | "education" | "format",
      "issue": "string",
      "recommendation": "string",
      "expected_score_increase": "+X points",
      "implementation_difficulty": "easy" | "medium" | "hard"
    }
  ]
}
```

#### Prompt for Score Explanation (User-Facing)

```
Translate this technical ATS scoring analysis into user-friendly language that explains:
1. What their score means
2. Why they got this score
3. What to do about it

Technical Analysis:
[OUTPUT FROM PREVIOUS PROMPT]

Generate a user-friendly explanation with:

1. **Score Interpretation**:
   - What does an XX/100 score mean?
   - Will this CV likely pass ATS?
   - How does it compare to other applicants?

2. **Strengths**: What's working well (2-3 points)

3. **Improvement Areas**: What needs work (2-3 points)

4. **Quick Wins**: 2-3 changes that will have immediate impact

5. **Effort Estimation**: How long will recommended changes take?

Tone: Encouraging but honest, specific and actionable
Format: Plain language, no technical jargon
```

#### Implementation Example with Vercel AI SDK

```javascript
import { generateObject, generateText } from 'ai';
import { google } from '@ai-sdk/google';

// Step 1: Calculate detailed ATS score
const atsAnalysis = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  schema: atsScoreSchema,
  system: "You are an ATS simulation expert...",
  prompt: `
    Job Description: ${jobDescription}
    CV: ${cvText}
    Calculate comprehensive ATS score with detailed breakdown.
  `,
  temperature: 0.1 // Very low for consistent scoring
});

// Step 2: Generate user-friendly explanation
const userExplanation = await generateText({
  model: google('gemini-2.0-flash-exp'),
  system: "You are a career advisor explaining ATS scores...",
  prompt: `
    Explain this ATS analysis in user-friendly terms:
    ${JSON.stringify(atsAnalysis.object)}
  `,
  temperature: 0.4
});

// Step 3: Generate visual score breakdown for UI
const scoreVisualization = {
  overall: atsAnalysis.object.overall_score,
  dimensions: Object.entries(atsAnalysis.object.dimensional_scores).map(
    ([dimension, data]) => ({
      name: dimension,
      score: data.score,
      weight: data.weight,
      contribution: data.weighted_contribution
    })
  ),
  recommendations: atsAnalysis.object.recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
};
```

#### Best Practices

1. **Weighted Scoring**: Use industry-standard weights (40% keywords, 25% skills, etc.)
2. **Consistent Algorithm**: Temperature 0.1 for reproducible scoring
3. **Granular Breakdown**: Score each dimension separately for actionable feedback
4. **Competitive Context**: Show how score compares to typical candidates
5. **Prioritized Recommendations**: Rank by impact, show expected score increase
6. **User-Friendly Translation**: Convert technical analysis to plain language
7. **Visual Representation**: Provide data structure for charts/graphs

#### Target Scores

- **75%+**: Industry recommendation for interview likelihood (Jobscan)
- **80%+**: Good ATS compatibility
- **90%+**: Excellent ATS compatibility

#### Temperature Settings

```
Score Calculation: 0.1 (maximum consistency)
Dimensional Analysis: 0.1-0.2 (factual breakdown)
User Explanation: 0.4-0.5 (balanced, encouraging)
Recommendations: 0.3 (actionable, specific)
```

---

<a name="norwegian-cv"></a>
### 4.6 Norwegian CV Format (Kompetanseprofil)

#### Cultural Context

Norwegian CVs differ significantly from international (US/UK) formats:

1. **Kompetanseprofil (Key Qualifications)**: Most critical section, placed at top
2. **Personal Information**: Expected to include birth date, address, interests/hobbies
3. **Cultural Values**: Directness, honesty, humility (Law of Jante - not boastful)
4. **Length**: 1-2 pages (concise)
5. **Photo**: Sometimes included (more common than US)
6. **References**: Often included or "available upon request"

#### System Prompt Template (Norwegian CV)

```
You are an expert Norwegian career counselor with deep understanding of Norwegian workplace culture and CV conventions. You understand:

**Norwegian CV Standards:**
- Kompetanseprofil (Key Qualifications) is the most important section
- Recruiters spend only seconds on initial screening - kompetanseprofil must be compelling
- Personal information (birth date, address, interests) is expected
- Cultural emphasis on directness, honesty, and precision
- Lagom tone: confident but not boastful (Janteloven awareness)
- 1-2 pages maximum length
- Chronological format preferred

**Key Qualifications Section:**
- Management summary of education, skills, experience, and soft skills
- Targeted specifically to job requirements
- 4-8 bullet points, each highlighting a key strength
- Quantifiable achievements when possible
- Professional but personable tone

You provide guidance in English but with Norwegian cultural context and Norwegian section names where appropriate.
```

#### User Prompt Pattern (Kompetanseprofil Generation)

```
Generate a compelling Kompetanseprofil (Key Qualifications) section for a Norwegian CV.

Target Job:
"""
[JOB DESCRIPTION - Norwegian or English]
"""

Candidate Background:
"""
[CV TEXT]
"""

Norwegian Cultural Context:
- Be direct and honest about qualifications
- Avoid American-style "selling" or boastfulness
- Focus on substance over style
- Emphasize both professional skills and the person behind them

Create a Kompetanseprofil with:
1. 4-8 concise bullet points
2. Each point targeting a key job requirement
3. Mix of technical skills, experience, and soft skills
4. Quantifiable achievements where possible
5. Professional yet warm tone
6. Demonstrates the "whole person" (Norwegian employers value this)

Output:
{
  "kompetanseprofil": {
    "section_title_norwegian": "Kompetanseprofil",
    "section_title_english": "Key Qualifications",
    "bullet_points": [
      {
        "text_norwegian": "string (if target is Norwegian company)",
        "text_english": "string",
        "targets_requirement": "which job requirement this addresses",
        "cultural_notes": "why this phrasing works for Norwegian context"
      }
    ]
  },
  "tone_analysis": "Assessment of cultural appropriateness"
}
```

#### Few-Shot Examples (Norwegian vs US Tone)

```
Job Requirement: "5+ years experience in project management"

US-Style (Too Boastful for Norway):
"Exceptional project management expert with proven track record of exceeding expectations and delivering outstanding results that consistently surpass industry standards."

Norwegian-Appropriate:
"5 års erfaring som prosjektleder med fokus på tverrfaglig samarbeid og målorientert leveranse. Gjennomført 12 prosjekter med budsjettoverholdelse på gjennomsnittlig 97%."

Translation: "5 years experience as project manager with focus on cross-functional collaboration and goal-oriented delivery. Completed 12 projects with average budget adherence of 97%."

Why this works:
- Direct and factual (Norwegian value)
- Quantifiable (shows substance)
- Emphasizes collaboration (important in Norwegian culture)
- Confident but not boastful
```

```
Job Requirement: "Strong communication skills"

US-Style:
"Outstanding communicator who excels at building relationships and influencing stakeholders."

Norwegian-Appropriate:
"Erfaring med både intern og ekstern kommunikasjon på norsk og engelsk. Har presentert faglige temaer for målgrupper fra 5 til 200 personer."

Translation: "Experience with both internal and external communication in Norwegian and English. Have presented professional topics to audiences from 5 to 200 people."

Why this works:
- Specific and measurable
- Demonstrates capability without hyperbole
- Mentions language skills (important in Norway)
```

#### Prompt for Full Norwegian CV Formatting

```
Convert this international CV to Norwegian CV format standards.

International CV:
"""
[CV TEXT]
"""

Target Job Description:
"""
[JOB DESCRIPTION]
"""

Apply Norwegian formatting standards:

1. **Structure:**
   - Kompetanseprofil (top, right after contact info)
   - Arbeidserfaring (Work Experience) - reverse chronological
   - Utdanning (Education)
   - Kurs og sertifiseringer (Courses and Certifications)
   - Språkkunnskaper (Language Skills)
   - Verv og interesser (Positions and Interests) - optional but common
   - Referanser (References) - "Oppgis ved forespørsel" or list 2-3

2. **Personal Information to Include:**
   - Full name
   - Address (full address expected)
   - Phone, email
   - Birth date (common in Norway, though not legally required)
   - LinkedIn (if applicable)
   - Photo (optional - note if appropriate for industry)

3. **Length:** Compress to 1-2 pages maximum

4. **Tone:** Direct, honest, quantifiable

5. **Language:** [Norwegian or English based on target company]

Output structured Norwegian CV with cultural notes for each section.
```

#### Best Practices for Norwegian CVs

1. **Kompetanseprofil First**: This section is critical - spend most effort here
2. **Quantify Everything**: Norwegians value concrete evidence
3. **Lagom Tone**: Confident but not boastful (Janteloven cultural context)
4. **Personal Touch**: Include interests/hobbies (shows well-rounded person)
5. **Language Skills**: Always specify Norwegian and English proficiency
6. **Direct Language**: Avoid marketing language, be factual
7. **2-Page Maximum**: Conciseness is valued

#### Temperature Settings

```
Kompetanseprofil Generation: 0.5-0.6 (balanced, culturally nuanced)
Full CV Formatting: 0.3-0.4 (structured but allowing cultural adaptation)
Tone Adjustment: 0.5 (cultural sensitivity required)
```

#### Cultural Validation Prompt

```
Review this Norwegian CV for cultural appropriateness.

CV:
"""
[NORWEGIAN-FORMATTED CV]
"""

Check for:
1. Is the tone appropriately modest (not boastful)?
2. Does kompetanseprofil target job requirements effectively?
3. Is personal information complete?
4. Is language level (Norwegian/English) clearly stated?
5. Are quantifiable achievements emphasized?
6. Is length appropriate (1-2 pages)?
7. Does it show the "whole person" Norwegian employers seek?

Provide:
- Cultural appropriateness score (0-100)
- Specific issues if any
- Recommended adjustments
```

---

<a name="technical-implementation"></a>
## 5. Technical Implementation

<a name="system-user-prompts"></a>
### 5.1 System vs User Prompts

#### Role Definitions

**System Prompt** (developer-defined, constant):
- Establishes AI's fundamental role and expertise
- Sets operational constraints and ethical guidelines
- Defines tone, communication style, and output format preferences
- Remains consistent across all user interactions within a feature

**User Prompt** (dynamic, per-request):
- Contains specific task instructions
- Includes user-provided data (CV, job description)
- Varies with each interaction
- References system prompt's established context

#### Implementation Pattern (Vercel AI SDK)

```javascript
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// System prompt - defined once per feature
const CV_ANALYSIS_SYSTEM_PROMPT = `
You are a seasoned career counselor with 15 years of experience in CV optimization.
Your analysis is thorough, accurate, and maintains exact wording from source documents
to ensure authenticity. You provide structured output in JSON format unless otherwise
specified.
`;

// User prompt - dynamic per request
async function analyzeCVForJob(cvText: string, jobDescription: string) {
  const { text } = await generateText({
    model: google('gemini-2.0-flash-exp'),
    system: CV_ANALYSIS_SYSTEM_PROMPT,
    prompt: `
      Analyze this CV against the job requirements and extract key matches.

      Job Description:
      ${jobDescription}

      Candidate CV:
      ${cvText}

      Extract: matched skills, missing qualifications, and match score (0-100).
    `,
    temperature: 0.2
  });

  return text;
}
```

#### Best Practices

1. **System Prompt Contains**:
   - Role definition ("You are an expert...")
   - Output format preferences (JSON schema expectations)
   - Tone and style guidelines
   - Ethical constraints (no fabrication)
   - Domain expertise context

2. **User Prompt Contains**:
   - Specific task instruction
   - Input data (CV text, job description)
   - Expected output structure
   - Task-specific context

3. **Separation of Concerns**:
   - System = "How to behave"
   - User = "What to do right now"

4. **Reusability**:
   - System prompts can be shared across similar tasks
   - User prompts are templated with variable insertion

---

<a name="temperature-sampling"></a>
### 5.2 Temperature & Sampling Parameters

#### Temperature Parameter Explained

Temperature controls randomness in token selection:
- **0.0**: Deterministic (always picks highest probability token)
- **0.5**: Balanced between consistency and variety
- **1.0**: High creativity/diversity
- **2.0**: Maximum randomness (rarely useful)

#### Task-Specific Temperature Recommendations

| Task | Temperature | Reasoning |
|------|-------------|-----------|
| **CV Parsing** | 0.0 - 0.2 | Factual extraction, no creativity needed |
| **Keyword Extraction** | 0.0 - 0.1 | Maximum precision and consistency |
| **Gap Analysis** | 0.3 - 0.5 | Analytical but allowing nuanced recommendations |
| **ATS Scoring** | 0.1 - 0.2 | Consistent, reproducible scores |
| **Cover Letter - Analysis** | 0.2 - 0.3 | Structured analysis phase |
| **Cover Letter - Writing** | 0.7 - 0.9 | Creative, engaging prose |
| **Cover Letter - Refinement** | 0.4 - 0.5 | Balanced editing |
| **Recommendations** | 0.4 - 0.6 | Actionable but allowing creativity |

#### Top-P (Nucleus Sampling)

Top-P determines the cumulative probability cutoff for token selection:
- **0.9**: Consider tokens making up 90% of probability mass (balanced)
- **0.95**: Slightly more diversity (recommended starting point)
- **1.0**: Consider all tokens (maximum diversity)

**Recommendation**: Start with `top_p: 0.95` and adjust temperature instead of top-p for most use cases.

#### Implementation Example

```javascript
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// CV Parsing - Low temperature for accuracy
const parsedCV = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  schema: cvSchema,
  system: CV_PARSER_SYSTEM_PROMPT,
  prompt: `Extract structured data from: ${cvText}`,
  temperature: 0.1, // Very low for factual extraction
  topP: 0.95
});

// Cover Letter Writing - High temperature for creativity
const coverLetter = await generateText({
  model: google('gemini-2.0-flash-exp'),
  system: COVER_LETTER_SYSTEM_PROMPT,
  prompt: `Write opening paragraph: ${context}`,
  temperature: 0.8, // High for engaging writing
  topP: 0.95
});

// ATS Scoring - Deterministic for consistency
const atsScore = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  schema: atsScoreSchema,
  system: ATS_SCORER_SYSTEM_PROMPT,
  prompt: `Calculate ATS score for: ${cvText} against: ${jobDescription}`,
  temperature: 0.1, // Consistent scoring
  topP: 0.9
});
```

#### Other Parameters

**Frequency Penalty** (OpenAI-specific):
- Range: -2.0 to 2.0
- Positive values penalize frequent tokens (reduces repetition)
- Recommendation: 0.3-0.5 for cover letters to avoid repetitive phrasing

**Presence Penalty** (OpenAI-specific):
- Range: -2.0 to 2.0
- Positive values encourage discussing new topics
- Recommendation: 0.3-0.5 for cover letters to explore diverse angles

**Max Tokens**:
- Limits output length
- Recommendation by task:
  - CV Parsing: 2000 tokens
  - Cover Letter: 800-1200 tokens (depending on length preference)
  - Gap Analysis: 1500 tokens
  - ATS Score: 1000 tokens

#### Best Practices

1. **Don't Adjust Too Many Parameters at Once**: Adjust temperature OR penalties, not all simultaneously
2. **Task-Specific Tuning**: Different tasks need different settings
3. **Testing Approach**: Start conservative (low temperature), increase if output is too generic
4. **Reproducibility**: Use temperature 0.0-0.2 for tasks requiring consistent outputs
5. **Creativity Balance**: Use 0.7-0.9 only for tasks explicitly requiring creative writing

#### Gemini-Specific Considerations

```javascript
// Gemini's temperature recommendations align with OpenAI
// but Gemini tends to be more concise by default

const geminiConfig = {
  temperature: 0.7, // For creative tasks
  topP: 0.95,
  topK: 40, // Gemini-specific: limits token pool before top-p
  maxOutputTokens: 1024
};
```

---

<a name="json-output"></a>
### 5.3 JSON Structured Output

#### Why JSON Output Matters

- **Eliminates parsing errors**: No regex parsing of free-form text
- **Type safety**: Validate against schemas (Zod, Pydantic)
- **Enables chaining**: Output of one prompt becomes input of next
- **UI integration**: Direct mapping to frontend components
- **Consistency**: Reduces output variability

#### Evolution of JSON Prompting

**Early Approach** (prompting alone, ~35% success rate):
```
Extract skills from this CV and output as JSON:
{"skills": ["skill1", "skill2"]}
```

**Current Best Practice** (schema-driven, ~100% success rate):
- OpenAI: Strict mode with JSON schema
- Gemini: Response format with explicit schema
- Vercel AI SDK: `generateObject()` with Zod schemas

#### Implementation with Vercel AI SDK + Zod

```javascript
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Define schema with Zod
const cvAnalysisSchema = z.object({
  personal_info: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable(),
    location: z.string().nullable()
  }),
  work_experience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      start_date: z.string(), // ISO format
      end_date: z.string().nullable(),
      responsibilities: z.array(z.string()),
      achievements: z.array(z.string()),
      technologies: z.array(z.string())
    })
  ),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    tools: z.array(z.string()),
    languages: z.array(
      z.object({
        language: z.string(),
        proficiency: z.enum(['native', 'fluent', 'professional', 'intermediate', 'basic'])
      })
    )
  }),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      graduation_date: z.string().nullable(),
      gpa: z.number().nullable()
    })
  )
});

// Generate structured output
const { object } = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  schema: cvAnalysisSchema,
  system: "You are an expert CV parser. Extract information exactly as it appears.",
  prompt: `Parse this CV: ${cvText}`,
  temperature: 0.1
});

// object is now fully typed and validated
console.log(object.work_experience[0].company); // TypeScript knows this is string
```

#### OpenAI Strict Mode (Alternative Implementation)

```javascript
import OpenAI from 'openai';
const openai = new OpenAI();

const response = await openai.chat.completions.create({
  model: "gpt-4o-2024-08-06",
  messages: [
    { role: "system", content: "You are an expert CV parser." },
    { role: "user", content: `Parse this CV: ${cvText}` }
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "cv_parser",
      strict: true, // Guarantees conformance
      schema: {
        type: "object",
        properties: {
          work_experience: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company: { type: "string" },
                position: { type: "string" },
                start_date: { type: "string" },
                end_date: { type: "string", nullable: true }
              },
              required: ["company", "position", "start_date"],
              additionalProperties: false
            }
          }
        },
        required: ["work_experience"],
        additionalProperties: false
      }
    }
  }
});

const parsed = JSON.parse(response.choices[0].message.content);
```

#### Best Practices for JSON Output

1. **Always Use Schema Validation**
   - Zod (TypeScript), Pydantic (Python), JSON Schema (universal)
   - Provides compile-time type safety and runtime validation

2. **Explicit Schema in Prompt** (when not using native schema features)
   ```
   Output your analysis as JSON with this EXACT structure:
   {
     "field1": "description of what goes here",
     "field2": ["array", "of", "strings"],
     "field3": number
   }
   ```

3. **Handle Null vs Empty**
   - Define when to use `null` vs `[]` vs `""`
   - Be explicit: "Use null for missing data, empty array for zero items"

4. **Simplicity Over Complexity**
   - Start with simple schemas, iterate to add complexity
   - Research shows: complex schemas reduce accuracy dramatically

5. **Post-Processing Validation**
   ```javascript
   try {
     const validated = cvAnalysisSchema.parse(object);
     // Proceed with validated data
   } catch (error) {
     // Handle validation error
     if (error instanceof z.ZodError) {
       console.error("Validation failed:", error.errors);
       // Retry with simpler prompt or fallback
     }
   }
   ```

6. **Error Handling with json_repair**
   ```javascript
   import { jsonrepair } from 'jsonrepair';

   try {
     const parsed = JSON.parse(response);
   } catch (error) {
     // Attempt repair for minor syntax errors
     const repaired = jsonrepair(response);
     const parsed = JSON.parse(repaired);
   }
   ```

7. **Avoid JSON for Creative Tasks**
   - JSON mode makes LLM output more technical/dry
   - For cover letters, use JSON for structure analysis, plain text for final writing

#### Example: Multi-Step JSON Workflow

```javascript
// Step 1: Extract job requirements as JSON
const requirements = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  schema: z.object({
    must_have_skills: z.array(z.string()),
    nice_to_have_skills: z.array(z.string()),
    years_experience: z.number(),
    education_required: z.string()
  }),
  prompt: `Extract requirements from: ${jobDescription}`,
  temperature: 0.2
});

// Step 2: Match CV against requirements, output as JSON
const matchAnalysis = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  schema: z.object({
    matched_skills: z.array(z.string()),
    missing_skills: z.array(z.string()),
    match_score: z.number().min(0).max(100),
    competitive_advantages: z.array(z.string())
  }),
  prompt: `
    Requirements: ${JSON.stringify(requirements.object)}
    CV: ${cvText}
    Analyze match and output JSON.
  `,
  temperature: 0.2
});

// Step 3: Generate cover letter structure as JSON
const letterStructure = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  schema: z.object({
    opening_angle: z.string(),
    body_paragraph_1_focus: z.string(),
    body_paragraph_2_focus: z.string(),
    closing_call_to_action: z.string()
  }),
  prompt: `
    Match Analysis: ${JSON.stringify(matchAnalysis.object)}
    Plan cover letter structure focusing on strongest matches.
  `,
  temperature: 0.5
});

// Step 4: Generate actual cover letter (plain text, not JSON)
const coverLetter = await generateText({
  model: google('gemini-2.0-flash-exp'),
  prompt: `
    Write cover letter following this structure:
    ${JSON.stringify(letterStructure.object)}

    Match details: ${JSON.stringify(matchAnalysis.object)}
  `,
  temperature: 0.8 // Higher for creative writing
});
```

#### Schema Complexity Guidelines

| Schema Complexity | Success Rate | Use Case |
|-------------------|--------------|----------|
| Simple (3-5 fields, flat) | 95-100% | CV contact info, basic extraction |
| Medium (5-10 fields, 1 level nesting) | 85-95% | Work experience, education |
| Complex (10+ fields, 2+ levels) | 70-85% | Full CV parse, detailed analysis |
| Very Complex (nested arrays of objects) | 50-70% | Multi-document analysis |

**Recommendation**: Break complex schemas into multiple simpler prompts via chaining.

---

<a name="prompt-chaining"></a>
### 5.4 Prompt Chaining

#### What is Prompt Chaining?

Breaking complex tasks into multiple smaller prompts where the output of one becomes the input of the next. This technique:
- Improves output quality by 40-60%
- Enables quality control at each step
- Allows different models/temperatures per step
- Provides intermediate results for debugging

#### When to Use Prompt Chaining

**Use Chaining For:**
- Multi-step tasks (analyze → plan → generate → refine)
- Tasks requiring different expertise at each stage
- Tasks needing different temperature settings per step
- Complex outputs benefiting from iterative refinement

**Don't Use Chaining For:**
- Simple single-step tasks
- Tasks requiring holistic reasoning (may lose context)
- Time-sensitive applications (chaining adds latency)

#### Implementation Pattern

```javascript
// Sequential chaining
async function generateTailoredCoverLetter(cvText, jobDescription) {
  // Step 1: Extract job requirements (analytical, low temp)
  const requirements = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    schema: requirementsSchema,
    system: "You are a job description analyst.",
    prompt: `Extract key requirements: ${jobDescription}`,
    temperature: 0.2
  });

  // Step 2: Match CV to requirements (analytical, low temp)
  const matches = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    schema: matchSchema,
    system: "You are a CV-job matching expert.",
    prompt: `
      Requirements: ${JSON.stringify(requirements.object)}
      CV: ${cvText}
      Identify top 3 matches.
    `,
    temperature: 0.3
  });

  // Step 3: Generate opening (creative, high temp, GPT-4 for storytelling)
  const opening = await generateText({
    model: openai('gpt-4'), // Switch to GPT-4 for creative writing
    system: "You are an expert cover letter writer.",
    prompt: `
      Write compelling opening paragraph highlighting:
      ${matches.object.strongest_match}
    `,
    temperature: 0.8
  });

  // Step 4: Generate body paragraphs (creative, high temp)
  const body = await generateText({
    model: openai('gpt-4'),
    system: "You are an expert cover letter writer.",
    prompt: `
      Write 2 body paragraphs for:
      Match 1: ${matches.object.match_2}
      Match 2: ${matches.object.match_3}
    `,
    temperature: 0.8
  });

  // Step 5: Generate closing (creative, high temp)
  const closing = await generateText({
    model: openai('gpt-4'),
    system: "You are an expert cover letter writer.",
    prompt: `Write closing paragraph for ${jobDescription.company}`,
    temperature: 0.8
  });

  // Step 6: Refine complete letter (balanced temp)
  const finalLetter = await generateText({
    model: openai('gpt-4'),
    system: "You are an expert editor.",
    prompt: `
      Refine this cover letter for grammar, flow, and authenticity:

      ${opening.text}

      ${body.text}

      ${closing.text}
    `,
    temperature: 0.5
  });

  return {
    letter: finalLetter.text,
    analysis: {
      requirements: requirements.object,
      matches: matches.object
    }
  };
}
```

#### Parallel Chaining (When Steps Are Independent)

```javascript
// Parallel execution for independent steps
async function comprehensiveCVAnalysis(cvText, jobDescription) {
  // Execute multiple analyses in parallel
  const [keywordAnalysis, gapAnalysis, atsScore] = await Promise.all([
    // Keyword extraction
    generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: keywordSchema,
      prompt: `Extract keywords from: ${jobDescription}`,
      temperature: 0.1
    }),

    // Gap analysis
    generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: gapSchema,
      prompt: `Analyze gaps between CV and job: ${cvText} vs ${jobDescription}`,
      temperature: 0.3
    }),

    // ATS scoring
    generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: atsScoreSchema,
      prompt: `Calculate ATS score: ${cvText} vs ${jobDescription}`,
      temperature: 0.1
    })
  ]);

  // Combine results
  return {
    keywords: keywordAnalysis.object,
    gaps: gapAnalysis.object,
    ats_score: atsScore.object
  };
}
```

#### Human-in-the-Loop Chaining

```javascript
// Chaining with user review/approval at key stages
async function interactiveCoverLetterGeneration(cvText, jobDescription) {
  // Step 1: Generate outline
  const outline = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    schema: outlineSchema,
    prompt: `Create cover letter outline: ${cvText} vs ${jobDescription}`,
    temperature: 0.4
  });

  // Present outline to user for approval/modification
  const approvedOutline = await presentToUserForApproval(outline.object);

  // Step 2: Generate draft based on approved outline
  const draft = await generateText({
    model: openai('gpt-4'),
    system: "You are an expert cover letter writer.",
    prompt: `Write cover letter following: ${JSON.stringify(approvedOutline)}`,
    temperature: 0.8
  });

  // Present draft to user for feedback
  const feedback = await getUserFeedback(draft.text);

  // Step 3: Refine based on feedback
  const final = await generateText({
    model: openai('gpt-4'),
    system: "You are an expert editor.",
    prompt: `
      Refine this draft based on feedback:
      Draft: ${draft.text}
      Feedback: ${feedback}
    `,
    temperature: 0.5
  });

  return final.text;
}
```

#### Best Practices for Prompt Chaining

1. **Clear Data Flow**: Each step should have well-defined inputs/outputs
2. **Schema Validation**: Validate JSON output after each step before proceeding
3. **Error Handling**: Wrap each step in try-catch, allow graceful degradation
4. **Temperature Variation**: Use appropriate temperature for each step's purpose
5. **Model Selection**: Use best model for each step (Gemini for analysis, GPT-4 for writing)
6. **State Management**: Store intermediate results for debugging and user review
7. **Parallel Execution**: Run independent steps concurrently to reduce latency

#### Example: Full CV Application Assistant Workflow

```javascript
async function fullApplicationAssistant(cvFile, jobDescriptionURL) {
  try {
    // Step 1: Parse CV (Gemini, low temp)
    const parsedCV = await parseCV(cvFile);

    // Step 2: Fetch and parse job description (Gemini, low temp)
    const jobRequirements = await parseJobDescription(jobDescriptionURL);

    // Step 3: Run parallel analyses
    const [keywords, gaps, atsScore, norwegianCheck] = await Promise.all([
      extractKeywords(jobRequirements),
      analyzeGaps(parsedCV, jobRequirements),
      calculateATSScore(parsedCV, jobRequirements),
      checkNorwegianFormat(parsedCV) // If Norwegian company
    ]);

    // Step 4: Generate recommendations (Gemini, medium temp)
    const recommendations = await generateRecommendations({
      gaps,
      atsScore,
      keywords
    });

    // Step 5: User reviews recommendations and selects improvements
    const selectedImprovements = await userSelectsImprovements(recommendations);

    // Step 6: Generate improved CV sections (Gemini, medium temp)
    const improvedSections = await generateImprovedSections(
      parsedCV,
      selectedImprovements,
      keywords
    );

    // Step 7: Generate cover letter (GPT-4, high temp for writing)
    const coverLetter = await generateCoverLetter(
      improvedSections,
      jobRequirements,
      keywords
    );

    // Step 8: User reviews and provides feedback
    const userFeedback = await getUserFeedback({
      improvedCV: improvedSections,
      coverLetter
    });

    // Step 9: Final refinement (GPT-4, medium temp)
    const finalOutputs = await refineBasedOnFeedback(
      improvedSections,
      coverLetter,
      userFeedback
    );

    return {
      improvedCV: finalOutputs.cv,
      coverLetter: finalOutputs.letter,
      analysis: {
        keywords,
        gaps,
        atsScore,
        recommendations
      }
    };

  } catch (error) {
    // Handle errors at each step gracefully
    console.error("Application assistant error:", error);
    // Provide partial results if possible
  }
}
```

---

<a name="few-shot-learning"></a>
### 5.5 Few-Shot Learning

#### What is Few-Shot Prompting?

Providing 2-5 examples of desired input-output pairs in your prompt to "train" the model on the specific task style and format.

**Benefits:**
- 30-50% improvement in task accuracy
- Teaches desired tone, style, and structure
- Reduces need for verbose instructions
- Especially effective for formatting and tone consistency

#### When to Use Few-Shot Learning

**Highly Effective For:**
- Tasks with specific formatting requirements
- Tone/style matching (e.g., Norwegian vs US CV tone)
- Novel tasks the model hasn't been explicitly trained on
- Reducing ambiguity in instructions

**Less Necessary For:**
- Common tasks (summarization, translation)
- When using function calling / structured output (schema provides the example)
- Very simple tasks

#### Implementation Patterns

**Pattern 1: Tone/Style Examples**

```
System: You are an expert cover letter writer.

User: Write opening paragraphs in this style:

EXAMPLE 1 (Good):
Input: Candidate has 5 years in product management, applying for Senior PM role
Output: "When I led the launch of three B2B SaaS products at TechCorp, each exceeding first-year revenue targets by an average of 40%, I discovered my passion for building products that solve real business problems. This experience, combined with my technical background in software engineering, makes me excited about the Senior Product Manager role at [Company]."

EXAMPLE 2 (Good):
Input: Candidate has data science background, applying for ML Engineer role
Output: "After deploying a recommendation system that increased user engagement by 23% at DataCo, I realized that the most impactful machine learning happens when models are production-ready, maintainable, and scalable. This hands-on ML engineering experience positions me well for the Machine Learning Engineer role at [Company]."

EXAMPLE 3 (Bad - Don't do this):
Input: Generic application
Output: "I am writing to express my strong interest in the position at your company. I believe my skills and experience make me an excellent candidate."

Now write an opening paragraph for:
Candidate: ${candidateBackground}
Target Role: ${targetRole}
```

**Pattern 2: Format Examples**

```
Extract work experience entries in this format:

EXAMPLE 1:
Input: "Software Engineer at Google (2019-2022): Led development of search ranking algorithm, improving relevance by 15%. Mentored 3 junior engineers."
Output:
{
  "company": "Google",
  "position": "Software Engineer",
  "start_date": "2019",
  "end_date": "2022",
  "responsibilities": [
    "Led development of search ranking algorithm"
  ],
  "achievements": [
    "Improved search relevance by 15%",
    "Mentored 3 junior engineers"
  ],
  "technologies": []
}

EXAMPLE 2:
Input: "Product Manager, Amazon, 2020-present. Launched 5 features for Alexa. Increased user retention 34% through data-driven feature prioritization."
Output:
{
  "company": "Amazon",
  "position": "Product Manager",
  "start_date": "2020",
  "end_date": null,
  "responsibilities": [
    "Launched features for Alexa product line"
  ],
  "achievements": [
    "Launched 5 features",
    "Increased user retention by 34% through data-driven prioritization"
  ],
  "technologies": []
}

Now extract from:
${cvText}
```

**Pattern 3: Norwegian vs US Tone Examples**

```
Convert this US-style resume bullet to Norwegian CV tone:

EXAMPLE 1:
US: "Exceptional leader who consistently exceeds expectations and delivers outstanding results that surpass industry standards"
Norwegian: "5 års ledererfaring med fokus på tverrfaglig samarbeid og målorientert leveranse"
Reason: Norwegian tone is direct, quantifiable, humble (Janteloven)

EXAMPLE 2:
US: "World-class problem solver with unparalleled analytical skills"
Norwegian: "Analytisk tilnærming til problemløsning med erfaring fra komplekse prosjekter innen finans og teknologi"
Reason: Specific industries mentioned, avoid superlatives

EXAMPLE 3:
US: "Proven track record of success in fast-paced environments"
Norwegian: "Erfaring med rask omstilling og leveranse i prosjekter med korte tidsfrister"
Reason: Concrete capability described rather than vague "track record"

Now convert:
${usStyleText}
```

#### Implementation with Vercel AI SDK

```javascript
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

const FEW_SHOT_EXAMPLES = `
EXAMPLE 1:
Input: 7 years software engineering, applying for Tech Lead role
Output: "When I architected a microservices migration that reduced deployment time by 73% at StartupCo, I discovered my passion for building systems that empower engineering teams to ship faster. This experience leading technical decisions and mentoring 8 engineers makes me excited about the Tech Lead role at [Company]."

EXAMPLE 2:
Input: Marketing manager background, applying for Growth PM role
Output: "After running 50+ A/B tests that collectively increased conversion by 41% at E-commerce Inc., I realized that the best product decisions come from data-driven experimentation. My unique blend of marketing intuition and product thinking positions me well for the Growth Product Manager role at [Company]."
`;

async function generateOpeningParagraph(candidateBackground, targetRole) {
  const { text } = await generateText({
    model: google('gemini-2.0-flash-exp'),
    system: "You are an expert cover letter writer.",
    prompt: `
      Write opening paragraphs following these examples:

      ${FEW_SHOT_EXAMPLES}

      Now write for:
      Candidate: ${candidateBackground}
      Target Role: ${targetRole}
    `,
    temperature: 0.7
  });

  return text;
}
```

#### Best Practices

1. **Number of Examples**: 2-5 is optimal (more doesn't help, wastes tokens)
2. **Quality Over Quantity**: One excellent example > three mediocre ones
3. **Diversity**: Show variety of cases (different industries, backgrounds)
4. **Label Examples**: "Good" vs "Bad" helps model understand what to avoid
5. **Format Consistency**: All examples should follow exact same structure
6. **Realistic Examples**: Use actual data representative of your use case

#### Few-Shot vs Zero-Shot vs Fine-Tuning

| Approach | Setup Time | Cost | Flexibility | Best For |
|----------|------------|------|-------------|----------|
| **Zero-Shot** | None | Low | High | Common tasks, well-known formats |
| **Few-Shot** | Minutes | Medium | High | Custom formats, specific tone |
| **Fine-Tuning** | Days-weeks | High | Low | Highly specialized, consistent task |

**Recommendation for CV Application**: Use few-shot for tone/style, structured output (JSON schemas) for formatting.

---

<a name="context-window"></a>
### 5.6 Context Window Optimization

#### Context Window Sizes (2025)

| Model | Context Window | Practical Capacity |
|-------|----------------|-------------------|
| **Gemini 2.5 Flash** | 1,000,000 tokens | ~750,000 words |
| **Gemini 2.5 Pro** | 1,000,000 tokens | ~750,000 words |
| **GPT-4o** | 128,000 tokens | ~96,000 words |
| **GPT-4 Turbo** | 128,000 tokens | ~96,000 words |
| **Claude 3.5 Sonnet** | 200,000 tokens | ~150,000 words |

**Typical CV Application Token Usage:**
- CV (2 pages): 500-1,000 tokens
- Job Description: 300-800 tokens
- System Prompt: 200-500 tokens
- Few-Shot Examples: 300-600 tokens
- Output: 500-2,000 tokens
- **Total per request**: ~2,000-5,000 tokens

**Conclusion**: Context window is NOT a constraint for typical CV application use cases when using Gemini or GPT-4.

#### When Context Window Becomes an Issue

1. **Bulk Processing**: Analyzing 50+ CVs simultaneously
2. **Large Portfolios**: Candidates with extensive project portfolios (>50 pages)
3. **Historical Analysis**: Comparing current CV to multiple previous versions
4. **Multi-Job Analysis**: Analyzing CV against 10+ job descriptions at once

#### Optimization Techniques

**Technique 1: Chunking (When Document Exceeds Window)**

```javascript
// Chunk large document into overlapping segments
function chunkDocument(text, chunkSize = 10000, overlap = 1000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// Process each chunk
async function analyzeLargeCV(cvText) {
  const chunks = chunkDocument(cvText);

  const analyses = await Promise.all(
    chunks.map(chunk =>
      generateObject({
        model: google('gemini-2.0-flash-exp'),
        schema: partialAnalysisSchema,
        prompt: `Analyze this CV section: ${chunk}`,
        temperature: 0.2
      })
    )
  );

  // Merge results
  const merged = mergeAnalyses(analyses.map(a => a.object));
  return merged;
}
```

**Technique 2: Semantic Chunking (Preserve Meaning)**

```javascript
// Chunk at semantic boundaries (sections, paragraphs) not arbitrary character counts
function semanticChunk(cvText) {
  // Split by major sections
  const sections = cvText.split(/\n\n(?=[A-Z][A-Z\s]+\n)/); // Matches "WORK EXPERIENCE\n"

  return sections.map(section => ({
    type: detectSectionType(section), // "work_experience", "education", etc.
    content: section
  }));
}

// Process each section with section-specific prompts
async function intelligentCVParsing(cvText) {
  const sections = semanticChunk(cvText);

  const parsed = await Promise.all(
    sections.map(async section => {
      const sectionParser = getSectionParser(section.type);
      return await sectionParser(section.content);
    })
  );

  return combineSection(parsed);
}
```

**Technique 3: Context Compression**

```javascript
// Compress CV to essential information for analysis
async function compressCV(fullCVText) {
  const { text } = await generateText({
    model: google('gemini-2.0-flash-exp'),
    system: "You are a CV summarizer.",
    prompt: `
      Extract ONLY the following from this CV in concise form:
      1. Name, contact info
      2. List of companies worked at, positions, years
      3. List of skills and technologies
      4. Education degrees and institutions
      5. Notable achievements (quantified metrics only)

      CV: ${fullCVText}
    `,
    temperature: 0.1
  });

  return text; // Compressed version for matching
}

// Use compressed CV for initial filtering, full CV for detailed analysis
async function efficientJobMatching(fullCV, jobDescriptions) {
  const compressedCV = await compressCV(fullCV);

  // Quick filtering with compressed version
  const matches = await Promise.all(
    jobDescriptions.map(jd =>
      quickMatch(compressedCV, jd) // Uses much fewer tokens
    )
  );

  // Detailed analysis only for top matches using full CV
  const topMatches = matches
    .filter(m => m.score > 70)
    .slice(0, 5);

  const detailedAnalyses = await Promise.all(
    topMatches.map(match =>
      detailedAnalysis(fullCV, match.jobDescription)
    )
  );

  return detailedAnalyses;
}
```

**Technique 4: Retrieval Augmented Generation (RAG)**

```javascript
// For very large knowledge bases (e.g., 100+ job descriptions, industry knowledge)
import { Pinecone } from '@pinecone-database/pinecone';

// 1. Embed and store all job descriptions
async function indexJobDescriptions(jobDescriptions) {
  const pinecone = new Pinecone();
  const index = pinecone.index('job-descriptions');

  for (const jd of jobDescriptions) {
    const embedding = await generateEmbedding(jd.text);
    await index.upsert([{
      id: jd.id,
      values: embedding,
      metadata: { title: jd.title, company: jd.company, text: jd.text }
    }]);
  }
}

// 2. Retrieve most relevant job descriptions for CV
async function findRelevantJobs(cvText, topK = 10) {
  const cvEmbedding = await generateEmbedding(cvText);

  const pinecone = new Pinecone();
  const index = pinecone.index('job-descriptions');

  const results = await index.query({
    vector: cvEmbedding,
    topK,
    includeMetadata: true
  });

  return results.matches.map(m => m.metadata);
}

// 3. Only analyze CV against relevant subset
async function intelligentJobRecommendation(cvText) {
  const relevantJobs = await findRelevantJobs(cvText, 10);

  // Now analyze only 10 most relevant jobs instead of entire database
  const analyses = await Promise.all(
    relevantJobs.map(job =>
      analyzeMatch(cvText, job.text)
    )
  );

  return analyses;
}
```

**Technique 5: Context Caching (Gemini)**

```javascript
// Gemini supports context caching to reduce costs for repeated context
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache frequently used context (e.g., job description being used for multiple CVs)
async function analyzeMultipleCVsForJob(cvs, jobDescription) {
  // Job description is cached and reused across all CV analyses
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: "You are a CV-job matching expert.",
    cachedContent: {
      content: jobDescription, // Cached across requests
      ttl: '1h' // Time to live
    }
  });

  // Each CV analysis reuses cached job description (cost savings)
  const analyses = await Promise.all(
    cvs.map(cv =>
      model.generateContent(`Analyze match:\nCV: ${cv}`)
    )
  );

  return analyses;
}
```

#### Best Practices

1. **For Typical CV Application (2-page CV, single job description)**:
   - No optimization needed with Gemini (1M tokens) or GPT-4 (128K tokens)
   - Use full documents directly

2. **For Bulk Processing**:
   - Use context caching (Gemini) for repeated job descriptions
   - Compress CVs to essential information for initial filtering
   - Detailed analysis only for promising matches

3. **For Very Large Documents**:
   - Use semantic chunking (preserve section boundaries)
   - Process sections in parallel
   - Merge results intelligently

4. **For Knowledge-Intensive Applications**:
   - Use RAG to retrieve only relevant context
   - Store job descriptions, industry knowledge in vector DB
   - Query for most relevant subset before analysis

5. **Token Counting**:
   ```javascript
   import { encoding_for_model } from 'tiktoken';

   function estimateTokens(text, model = 'gpt-4') {
     const encoding = encoding_for_model(model);
     const tokens = encoding.encode(text);
     encoding.free();
     return tokens.length;
   }

   // Check before sending
   const totalTokens = estimateTokens(systemPrompt) +
                       estimateTokens(cvText) +
                       estimateTokens(jobDescription);

   if (totalTokens > 100000) {
     // Apply optimization technique
   }
   ```

---

<a name="prompt-library"></a>
## 6. Prompt Library & Templates

### Quick Reference Templates

#### Template 1: CV Parsing (Structured Extraction)

```
SYSTEM: You are an expert CV parser with 15 years of experience extracting structured information from resumes. You preserve exact wording from source documents and output valid JSON.

USER:
Extract structured information from this CV:

"""
${CV_TEXT}
"""

Output as JSON with:
- personal_info (name, email, phone, location)
- work_experience (array: company, position, dates, responsibilities, achievements)
- education (array: institution, degree, field, graduation_date)
- skills (categorized: technical, soft, tools, languages)
- certifications (array)

Use exact wording. For missing data, use null. Dates in YYYY-MM format.

PARAMETERS:
- Model: Gemini 2.5 Flash
- Temperature: 0.1
- Format: JSON (with Zod schema validation)
```

#### Template 2: ATS Keyword Extraction

```
SYSTEM: You are an ATS expert with 15+ years analyzing how applicant tracking systems prioritize keywords. You extract keywords using EXACT job description wording and categorize by type and priority.

USER:
Extract ATS-relevant keywords from this job description:

"""
${JOB_DESCRIPTION}
"""

Categorize as:
1. Hard Skills (must-have vs nice-to-have)
2. Soft Skills
3. Transferable Skills
4. Industry Terminology
5. Action Verbs
6. Quantifiable Metrics

For each keyword:
- Use EXACT wording from job description
- Note priority (critical/important/optional)
- List semantic variations
- Indicate optimal keyword density (2-4% for primary terms)

Output as JSON.

PARAMETERS:
- Model: Gemini 2.5 Flash
- Temperature: 0.0-0.1
- Format: JSON
```

#### Template 3: Cover Letter Generation (Multi-Stage)

**Stage 1: Requirement Analysis**
```
SYSTEM: You are a job requirements analyst.

USER:
Analyze this job description and extract the 5 most critical requirements:

"""
${JOB_DESCRIPTION}
"""

For each requirement:
- Explicit requirement statement
- Keywords used
- Must-have vs nice-to-have
- What evidence would demonstrate this qualification

Output as JSON.

PARAMETERS:
- Model: Gemini 2.5 Flash
- Temperature: 0.2
```

**Stage 2: Experience Matching**
```
SYSTEM: You are a CV-job matching expert.

USER:
Given these requirements and the candidate's CV, identify the 3 strongest matches:

Requirements: ${REQUIREMENTS_JSON}

CV: ${CV_TEXT}

For each match:
- Which requirement it addresses
- Specific CV experience/achievement
- Quantifiable metrics
- Match strength

Output as JSON.

PARAMETERS:
- Model: Gemini 2.5 Flash
- Temperature: 0.3
```

**Stage 3: Opening Paragraph**
```
SYSTEM: You are an expert cover letter writer with 15 years of experience. Your writing is engaging, specific, and authentic.

USER:
Write a compelling opening paragraph (3-4 sentences) for a cover letter:

Position: ${JOB_TITLE}
Company: ${COMPANY}
Strongest Qualification: ${STRONGEST_MATCH}

Requirements:
- Lead with most impressive, relevant qualification
- Create intrigue
- Active voice, confident tone
- NO generic phrases like "I am writing to apply"

PARAMETERS:
- Model: GPT-4 (for creative writing)
- Temperature: 0.8
```

**Stages 4-6**: Follow pattern above for body paragraphs, closing, refinement

#### Template 4: Skills Gap Analysis

```
SYSTEM: You are a career development analyst specializing in skills gap assessment. Your analysis is honest but encouraging, specific, and prioritized by impact.

USER:
Conduct skills gap analysis for this candidate applying to ${JOB_TITLE}:

Job Description:
"""
${JOB_DESCRIPTION}
"""

Candidate CV:
"""
${CV_TEXT}
"""

Identify:
1. Technical Skills Gaps (tools, technologies, certifications)
2. Soft Skills Gaps
3. Experience Gaps (years, industry, role level)
4. Education Gaps
5. Transferable Skills (bridges between current and target)

For each gap:
- Description
- Priority (critical/important/optional)
- Current vs required level
- Recommended approach to close gap
- Time estimate
- Specific resources (courses, certifications, projects)

Output as JSON with overall readiness score (0-100).

PARAMETERS:
- Model: Gemini 2.5 Flash
- Temperature: 0.4-0.5
```

#### Template 5: ATS Scoring

```
SYSTEM: You are an ATS simulation expert. You understand exactly how modern ATS platforms score resumes.

Scoring Factors:
1. Keyword Matching (40% weight)
2. Skills Section (25% weight)
3. Experience Relevance (20% weight)
4. Education & Certifications (10% weight)
5. Format Parsability (5% weight)

Scoring Scale:
- 90-100: Excellent, very likely to pass
- 80-89: Good, likely to pass
- 70-79: Fair, may pass
- 60-69: Poor, unlikely to pass
- <60: Very poor, will be filtered

USER:
Simulate ATS evaluation:

Job Description:
"""
${JOB_DESCRIPTION}
"""

CV:
"""
${CV_TEXT}
"""

Calculate:
1. Overall ATS score (0-100)
2. Dimensional scores for each factor
3. Detailed breakdown (matched keywords, missing critical keywords)
4. Competitive benchmarking
5. Top 5 prioritized recommendations (ranked by impact)

Output as JSON with pass likelihood (very_high/high/medium/low/very_low).

PARAMETERS:
- Model: Gemini 2.5 Flash
- Temperature: 0.1 (for consistent scoring)
```

#### Template 6: Norwegian CV (Kompetanseprofil)

```
SYSTEM: You are an expert Norwegian career counselor with deep understanding of Norwegian workplace culture and CV conventions.

Norwegian Standards:
- Kompetanseprofil (Key Qualifications) is most important section
- Recruiters spend only seconds on initial review
- Personal info expected (birth date, address, interests)
- Cultural emphasis: directness, honesty, precision
- Lagom tone: confident but not boastful (Janteloven)
- 1-2 pages maximum
- Chronological format preferred

USER:
Generate Kompetanseprofil section for Norwegian CV:

Target Job: ${JOB_TITLE}

Job Description:
"""
${JOB_DESCRIPTION}
"""

Candidate Background:
"""
${CV_TEXT}
"""

Create 4-8 bullet points:
- Each targeting a key job requirement
- Mix of technical skills, experience, soft skills
- Quantifiable achievements
- Professional yet warm tone
- Shows "whole person" (Norwegian value)

Avoid: American-style boastfulness, generic statements

Output as JSON with Norwegian and English versions, plus cultural appropriateness notes.

PARAMETERS:
- Model: Gemini 2.5 Flash or GPT-4
- Temperature: 0.5-0.6 (cultural nuance needed)
```

---

<a name="best-practices"></a>
## 7. Best Practices Summary

### Universal Principles

1. **21-Word Optimal Prompt Length**: Include ~21 words of relevant context (most users only provide 9)

2. **PTCF Framework**: Structure prompts with Persona, Task, Context, Format

3. **Explicit > Implicit**: State expectations explicitly (format, tone, constraints)

4. **Examples Teach**: 2-5 few-shot examples improve accuracy 30-50%

5. **Schema Validation**: Always use Zod/Pydantic for JSON output (35% → 100% success rate)

6. **Temperature by Task**:
   - 0.0-0.2: Factual extraction, parsing
   - 0.3-0.5: Analysis, recommendations
   - 0.7-0.9: Creative writing

7. **Chain Complex Tasks**: Break into stages (analyze → plan → generate → refine)

8. **Preserve Authenticity**: Explicitly instruct "use exact wording," "no fabrication"

### Provider-Specific Optimization

**Gemini 2.5 Flash:**
- Use for parsing, keyword extraction, analysis (99% cost savings vs GPT-4)
- Leverage 1M token window for full document processing
- Apply PTCF framework explicitly
- Use context caching for repeated job descriptions

**GPT-4:**
- Use for creative cover letter writing (superior storytelling)
- Apply strict mode for guaranteed JSON validity
- Use frequency/presence penalties to reduce repetition
- Reserve for final refinement stages

### Feature-Specific Guidelines

**CV Parsing:**
- Temperature: 0.1
- Schema validation required
- Preserve exact wording instruction
- Handle null values explicitly

**Keyword Extraction:**
- Temperature: 0.0-0.1
- Use EXACT job description wording
- Target 2-4% density for primary terms
- Categorize by priority

**Cover Letter:**
- Multi-stage prompting (6 stages recommended)
- Temperature 0.2 for analysis, 0.8 for writing, 0.5 for refinement
- Few-shot examples for tone
- Human-in-loop for outline approval

**Gap Analysis:**
- Temperature: 0.4-0.5
- Prioritize by impact (critical/important/optional)
- Provide specific resources (courses, projects)
- Encouraging but honest tone

**ATS Scoring:**
- Temperature: 0.1 (consistency)
- Weighted scoring (40% keywords, 25% skills, 20% experience, 10% education, 5% format)
- Target 80%+ for good compatibility
- Prioritized recommendations by impact

**Norwegian CV:**
- Temperature: 0.5-0.6 (cultural nuance)
- Lagom tone (confident, not boastful)
- Kompetanseprofil focus
- Quantifiable achievements
- Cultural validation prompt

### Error Prevention

1. **Fabrication Prevention**: "Use only information present in CV. Do not invent or infer."
2. **JSON Validation**: Wrap in try-catch, use json_repair for minor errors
3. **Context Overflow**: Estimate tokens before sending (tiktoken library)
4. **Inconsistent Scoring**: Use temperature 0.1 for reproducible results
5. **Generic Output**: Add few-shot examples to define quality bar
6. **Keyword Stuffing**: Instruct "natural integration" and check 2-4% density

### Testing & Iteration

1. **Start Conservative**: Low temperature, simple schema, single-step
2. **Measure Baseline**: Test with 10-20 real CVs/job descriptions
3. **Iterate One Variable**: Change temperature OR prompt OR model (not all)
4. **A/B Test**: Compare approaches with same test set
5. **User Feedback Loop**: Track which outputs users accept/reject

---

<a name="recommendations"></a>
## 8. Implementation Recommendations

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Upload                             │
│                  (CV + Job Description)                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 1: Document Parsing                        │
│          Gemini 2.5 Flash | Temp 0.1 | JSON Output          │
│     Parse CV structure + Extract job requirements            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         Step 2: Parallel Analysis (Promise.all)              │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐  │
│  │  Keyword     │  Gap         │  ATS         │ Norwegian│  │
│  │  Extraction  │  Analysis    │  Scoring     │ Check    │  │
│  │  Gemini 0.1  │  Gemini 0.4  │  Gemini 0.1  │Gemini 0.5│  │
│  └──────────────┴──────────────┴──────────────┴──────────┘  │
└────────────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│            Step 3: Recommendation Generation                 │
│             Gemini 2.5 Flash | Temp 0.4                      │
│     Synthesize analysis → Prioritized improvements           │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         Step 4: User Review & Selection                      │
│         (Human-in-loop: User selects improvements)           │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│        Step 5: Cover Letter Generation (Optional)            │
│         GPT-4 | Temp 0.8 | Multi-stage prompting             │
│     Outline → Draft → Refine (user feedback loop)            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            Step 6: Final Output Generation                   │
│    - Improved CV sections (Gemini 0.4)                       │
│    - Polished cover letter (GPT-4 0.5)                       │
│    - Analysis report (Gemini 0.3)                            │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Recommendations

```javascript
// Vercel AI SDK setup
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

// Primary model: Gemini 2.5 Flash
const primaryModel = google('gemini-2.0-flash-exp');

// Fallback/creative writing: GPT-4
const creativeModel = openai('gpt-4');

// Schemas (example)
const cvSchema = z.object({...});
const keywordSchema = z.object({...});
const gapSchema = z.object({...});
```

### Cost Optimization Strategy

**Gemini 2.5 Flash (Primary):**
- CV Parsing: ~$0.001 per request
- Keyword Extraction: ~$0.0005 per request
- Gap Analysis: ~$0.002 per request
- ATS Scoring: ~$0.001 per request
- **Total per CV analysis**: ~$0.005

**GPT-4 (Secondary - Cover Letters Only):**
- Cover Letter Generation (6 stages): ~$0.05 per letter

**Monthly Cost Estimate (1,000 users):**
- Assumption: Average user analyzes 5 CVs/month, generates 2 cover letters
- CV analyses: 5,000 × $0.005 = $25
- Cover letters: 2,000 × $0.05 = $100
- **Total**: $125/month for AI costs
- **Per user**: $0.125/month

**Recommendation**: Gemini-primary strategy reduces costs by 95% vs GPT-4-only approach.

### Rate Limiting & Queuing

```javascript
// Implement rate limiting for API calls
import pLimit from 'p-limit';

const limit = pLimit(10); // Max 10 concurrent API calls

async function batchAnalyzeCVs(cvs, jobDescription) {
  const results = await Promise.all(
    cvs.map(cv =>
      limit(() => analyzeCV(cv, jobDescription))
    )
  );
  return results;
}
```

### Error Handling & Fallbacks

```javascript
async function robustCVParsing(cvText) {
  try {
    // Attempt with Gemini
    const result = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: cvSchema,
      prompt: `Parse: ${cvText}`,
      temperature: 0.1
    });
    return result.object;

  } catch (geminiError) {
    console.error("Gemini parsing failed:", geminiError);

    try {
      // Fallback to GPT-4
      const result = await generateObject({
        model: openai('gpt-4'),
        schema: cvSchema,
        prompt: `Parse: ${cvText}`,
        temperature: 0.1
      });
      return result.object;

    } catch (gptError) {
      console.error("GPT-4 parsing failed:", gptError);

      // Final fallback: basic regex parsing
      return basicRegexParsing(cvText);
    }
  }
}
```

### Prompt Version Control

```javascript
// Store prompts in separate files with versioning
const PROMPTS = {
  cv_parser: {
    version: 'v2.1',
    system: `You are an expert CV parser...`,
    user: (cvText) => `Extract from: ${cvText}`,
    temperature: 0.1,
    model: 'gemini-2.0-flash-exp'
  },
  cover_letter_writer: {
    version: 'v3.0',
    system: `You are an expert cover letter writer...`,
    stages: {
      opening: {
        user: (context) => `Write opening: ${context}`,
        temperature: 0.8,
        model: 'gpt-4'
      },
      // ... other stages
    }
  }
};

// Load prompt from version-controlled config
async function analyzeCV(cvText) {
  const prompt = PROMPTS.cv_parser;
  const result = await generateObject({
    model: google(prompt.model),
    schema: cvSchema,
    system: prompt.system,
    prompt: prompt.user(cvText),
    temperature: prompt.temperature
  });

  // Log prompt version for debugging
  console.log(`Used prompt version: ${prompt.version}`);

  return result.object;
}
```

### Testing Framework

```javascript
// Test suite for prompt quality
import { describe, it, expect } from 'vitest';

describe('CV Parsing', () => {
  const testCVs = [
    { name: 'Standard 2-page CV', content: '...', expected: {...} },
    { name: 'CV with unconventional format', content: '...', expected: {...} },
    { name: 'Norwegian CV', content: '...', expected: {...} }
  ];

  testCVs.forEach(testCase => {
    it(`should parse: ${testCase.name}`, async () => {
      const result = await analyzeCV(testCase.content);
      expect(result).toMatchObject(testCase.expected);
    });
  });
});

describe('ATS Scoring Consistency', () => {
  it('should return same score for same input', async () => {
    const cv = '...';
    const jd = '...';

    const score1 = await calculateATSScore(cv, jd);
    const score2 = await calculateATSScore(cv, jd);

    // Scores should be identical (temp 0.1 = deterministic)
    expect(score1.overall_score).toBe(score2.overall_score);
  });
});
```

### Monitoring & Analytics

```javascript
// Track prompt performance metrics
async function monitoredGenerateObject(config) {
  const start = Date.now();

  try {
    const result = await generateObject(config);
    const duration = Date.now() - start;

    // Log metrics
    await logMetrics({
      model: config.model,
      prompt_type: config.promptType, // Add custom field
      temperature: config.temperature,
      duration_ms: duration,
      tokens_used: result.usage?.totalTokens || 0,
      success: true
    });

    return result;

  } catch (error) {
    const duration = Date.now() - start;

    await logMetrics({
      model: config.model,
      prompt_type: config.promptType,
      temperature: config.temperature,
      duration_ms: duration,
      success: false,
      error: error.message
    });

    throw error;
  }
}
```

### Progressive Enhancement

**MVP (Phase 1):**
- CV parsing (Gemini 0.1)
- Basic keyword extraction (Gemini 0.1)
- Simple cover letter generation (Gemini 0.7)

**Enhancement (Phase 2):**
- Add gap analysis (Gemini 0.4)
- Add ATS scoring (Gemini 0.1)
- Improve cover letter with GPT-4 multi-stage

**Advanced (Phase 3):**
- Norwegian CV support (Gemini 0.5)
- Prompt chaining optimization
- Context caching for repeated job descriptions
- A/B testing infrastructure for prompt variations

---

## Conclusion

This comprehensive prompt engineering research provides production-ready strategies for building the AI CV & Job Application Assistant. Key takeaways:

1. **Dual AI Strategy**: Use Gemini 2.5 Flash (primary) for cost-effective parsing and analysis, GPT-4 (secondary) for superior creative writing
2. **Structured Prompting**: Apply PTCF framework, explicit JSON schemas, and few-shot examples consistently
3. **Temperature Optimization**: Task-specific settings (0.1 for parsing, 0.8 for writing) dramatically improve output quality
4. **Multi-Stage Processing**: Break complex tasks into prompt chains for 40-60% quality improvement
5. **Cultural Adaptation**: Norwegian CV support requires specific tone adjustments (Janteloven awareness)
6. **Cost Efficiency**: Gemini-primary approach costs ~$0.125/user/month (95% savings vs GPT-4-only)

**Next Steps:**
1. Implement core prompt templates from Section 6
2. Build Vercel AI SDK integration with Zod schemas
3. Create test suite with 20+ real CV samples
4. Deploy MVP with Gemini 2.5 Flash
5. Iterate based on user feedback and A/B testing

**References:**
- Google Gemini Prompt Engineering Guide (October 2024)
- OpenAI Structured Outputs Documentation (August 2024)
- Academic research on few-shot learning and prompt optimization
- Industry best practices from Teal, Jobscan, Enhancv, Resume.io

---

**Document Version:** 1.0
**Last Updated:** November 17, 2025
**Author:** SG-Gruppe-12 (IBE160)
**Status:** Ready for Implementation
