// src/prompts/cv-parsing.prompt.ts

export const CVParsingPrompt = {
  v1: (fileContent: string, fileType: string) => `
    You are an expert CV parser. Your goal is to extract structured information from the provided CV content.
    The CV content is from a file of type: ${fileType.toUpperCase()}.

    Please extract the following information and structure it according to the JSON schema provided below.

    **Extraction Instructions:**
    1.  **Personal Information:** Extract full name (first and last), email address, phone number. LinkedIn profile URL, personal website URL, physical address (street, city, postal code, country) are optional.
    2.  **Education:** Extract institution name, degree obtained, field of study, start date, end date, and a brief description if available. Dates should be in YYYY-MM-DD format if possible.
    3.  **Experience:** Extract job title, company name, location, start date, end date, and a detailed description of responsibilities and achievements. Dates should be in YYYY-MM-DD format if possible.
    4.  **Skills:** Extract a list of skills. Categorize if explicit (e.g., technical, soft skills, tools), otherwise list all identified skills.
    5.  **Languages:** Extract a list of languages and their proficiency level if mentioned (e.g., "Fluent", "Native", "Intermediate").

    **Important Considerations:**
    -   Be accurate and precise; do not hallucinate information.
    -   If a field is not found, omit it from the output or set it to null/empty array as per the schema.
    -   Focus on the content; ignore formatting/layout details.
    -   Standardize dates to YYYY-MM-DD. If only year/month is available, use YYYY-MM-01. If only year, use YYYY-01-01.

    **CV Content:**
    \`\`\`
    ${fileContent}
    \`\`\`

    **JSON Schema for Output:**
    \`\`\`json
    {
      "type": "object",
      "properties": {
        "personal_info": {
          "type": "object",
          "properties": {
            "firstName": { "type": "string" },
            "lastName": { "type": "string" },
            "email": { "type": "string", "format": "email" },
            "phone": { "type": "string" },
            "linkedin": { "type": "string", "format": "uri" },
            "website": { "type": "string", "format": "uri" },
            "address": { "type": "string" },
            "city": { "type": "string" },
            "country": { "type": "string" },
            "postalCode": { "type": "string" }
          },
          "required": ["firstName", "lastName"]
        },
        "education": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "institution": { "type": "string" },
              "degree": { "type": "string" },
              "fieldOfStudy": { "type": "string" },
              "startDate": { "type": "string", "format": "date" },
              "endDate": { "type": "string", "format": "date" },
              "description": { "type": "string" }
            },
            "required": ["institution", "degree"]
          }
        },
        "experience": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": { "type": "string" },
              "company": { "type": "string" },
              "location": { "type": "string" },
              "startDate": { "type": "string", "format": "date" },
              "endDate": { "type": "string", "format": "date" },
              "description": { "type": "string" }
            },
            "required": ["title", "company", "startDate"]
          }
        },
        "skills": {
          "type": "array",
          "items": { "type": "string" }
        },
        "languages": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "level": { "type": "string" }
            },
            "required": ["name"]
          }
        }
      },
      "required": ["personal_info", "education", "experience", "skills", "languages"]
    }
    \`\`\`
  `,
  v2: (fileContent: string, fileType: string) => `
    You are an expert CV parser. Your goal is to extract structured information from the provided CV content.
    The CV content is from a file of type: ${fileType.toUpperCase()}.

    Please extract the following information and structure it strictly according to the JSON schema provided below.

    **Extraction Instructions:**
    1.  **Personal Information:** Extract full name (as 'name'), email address, phone number, physical address, LinkedIn profile URL, and personal portfolio URL.
    2.  **Education:** Extract institution name, degree obtained, location, start date, end date, and a brief description. Dates should be standardized to YYYY-MM-DD or YYYY-MM if only month/year is available.
    3.  **Experience:** Extract job title, company name, location, start date, end date, and a detailed description of responsibilities and achievements. Dates should be standardized to YYYY-MM-DD or YYYY-MM if only month/year is available.
    4.  **Skills:** Extract a list of skills. For each skill, identify its 'name', optional 'proficiency' (e.g., 'beginner', 'intermediate', 'advanced', 'expert'), and optional 'keywords' if related terms are prominent.
    5.  **Languages:** Extract a list of languages. For each language, identify its 'name' and optional 'proficiency' (e.g., 'basic', 'conversational', 'fluent', 'native').
    6.  **Summary:** Extract a general summary or professional objective if present.

    **Important Considerations:**
    -   Be accurate and precise; do not hallucinate information.
    -   If a field is not found, omit it from the output or set it to null/empty array as per the schema's optionality.
    -   Focus strictly on the content provided in the CV; ignore formatting/layout details.
    -   Standardize dates to YYYY-MM-DD. If only year/month is available, use YYYY-MM-01. If only year, use YYYY-01-01. If month and year, use YYYY-MM.

    **CV Content:**
    \`\`\`
    ${fileContent}
    \`\`\`

    **JSON Schema for Output:**
    \`\`\`json
    {
      "type": "object",
      "properties": {
        "personal_info": {
          "type": "object",
          "properties": {
            "name": { "type": "string", "description": "Full name of the candidate" },
            "email": { "type": "string", "format": "email" },
            "phone": { "type": "string" },
            "address": { "type": "string" },
            "linkedin": { "type": "string", "format": "uri" },
            "portfolio": { "type": "string", "format": "uri" }
          },
          "required": [],
          "additionalProperties": false
        },
        "education": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "institution": { "type": "string" },
              "degree": { "type": "string" },
              "location": { "type": "string" },
              "start_date": { "type": "string", "pattern": "^\\\\d{4}(-\\\\d{2}(-\\\\d{2})?)?$" },
              "end_date": { "type": "string", "pattern": "^\\\\d{4}(-\\\\d{2}(-\\\\d{2})?)?$" },
              "description": { "type": "string" }
            },
            "required": ["institution", "degree"],
            "additionalProperties": false
          }
        },
        "experience": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": { "type": "string" },
              "company": { "type": "string" },
              "location": { "type": "string" },
              "start_date": { "type": "string", "pattern": "^\\\\d{4}(-\\\\d{2}(-\\\\d{2})?)?$" },
              "end_date": { "type": "string", "pattern": "^\\\\d{4}(-\\\\d{2}(-\\\\d{2})?)?$" },
              "description": { "type": "string" }
            },
            "required": ["title", "company", "start_date"],
            "additionalProperties": false
          }
        },
        "skills": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "proficiency": { "type": "string", "enum": ["beginner", "intermediate", "advanced", "expert"] },
              "keywords": { "type": "array", "items": { "type": "string" } }
            },
            "required": ["name"],
            "additionalProperties": false
          }
        },
        "languages": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "proficiency": { "type": "string", "enum": ["basic", "conversational", "fluent", "native"] }
            },
            "required": ["name"],
            "additionalProperties": false
          }
        },
        "summary": { "type": "string" }
      },
      "required": [],
      "additionalProperties": false
    }
    \`\`\`
  `,
};

