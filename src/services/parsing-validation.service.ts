// src/services/parsing-validation.service.ts

import { CvData } from '../types/cv.types';
import { logger } from '../utils/logger.util';

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
}

/**
 * Parsing Validation Service
 * Story: Phase 2 Task 3 - Add parsing validation service
 *
 * Validates that AI-extracted CV data actually appears in the original text.
 * Helps detect hallucinations by checking if extracted information exists in source.
 */
export const parsingValidationService = {
  /**
   * Validates extracted CV data against original text to detect potential hallucinations.
   *
   * @param parsedData - The CV data extracted by AI
   * @param originalText - The original CV text/content
   * @returns ValidationResult with isValid flag and array of warnings
   */
  validateExtraction(parsedData: CvData, originalText: string): ValidationResult {
    const warnings: string[] = [];
    const lowerOriginalText = originalText.toLowerCase();

    // 1. Check if extracted names actually appear in text
    if (parsedData.personal_info?.name) {
      const nameWords = parsedData.personal_info.name.split(' ');
      for (const word of nameWords) {
        // Skip very short words (like "Jr.", "Sr.", initials)
        if (word.length > 2 && !lowerOriginalText.includes(word.toLowerCase())) {
          warnings.push(`Name component "${word}" not found in original CV text - possible hallucination`);
        }
      }
    }

    // 2. Check if companies actually appear in text
    if (parsedData.experience) {
      for (const exp of parsedData.experience) {
        if (exp.company) {
          const companyLower = exp.company.toLowerCase();
          // Check for full company name or significant parts (for "ABC Corp" check "abc")
          const significantParts = companyLower.split(/[\s,.-]+/).filter(part => part.length > 3);

          if (significantParts.length > 0) {
            const found = significantParts.some(part => lowerOriginalText.includes(part));
            if (!found) {
              warnings.push(`Company "${exp.company}" not found in original CV text - possible hallucination`);
            }
          } else if (!lowerOriginalText.includes(companyLower)) {
            warnings.push(`Company "${exp.company}" not found in original CV text - possible hallucination`);
          }
        }
      }
    }

    // 3. Check if educational institutions actually appear in text
    if (parsedData.education) {
      for (const edu of parsedData.education) {
        if (edu.institution) {
          const institutionLower = edu.institution.toLowerCase();
          const significantParts = institutionLower.split(/[\s,.-]+/).filter(part => part.length > 3);

          if (significantParts.length > 0) {
            const found = significantParts.some(part => lowerOriginalText.includes(part));
            if (!found) {
              warnings.push(`Institution "${edu.institution}" not found in original CV text - possible hallucination`);
            }
          } else if (!lowerOriginalText.includes(institutionLower)) {
            warnings.push(`Institution "${edu.institution}" not found in original CV text - possible hallucination`);
          }
        }
      }
    }

    // 4. Check for generic phrases in experience descriptions (hallucination indicators)
    const genericPhrases = [
      'developed features',
      'fixed bugs',
      'worked with team',
      'responsible for',
      'contributed to',
      'assisted with',
      'helped with',
      'participated in',
      'involved in',
      'worked on various',
      'handled multiple',
      'performed duties',
    ];

    if (parsedData.experience) {
      for (const exp of parsedData.experience) {
        const desc = exp.description?.toLowerCase() || '';

        for (const phrase of genericPhrases) {
          if (desc.includes(phrase) && !lowerOriginalText.includes(phrase)) {
            warnings.push(
              `Generic phrase "${phrase}" in experience description for ${exp.company || 'unknown company'} may be hallucinated - not found in original text`
            );
          }
        }
      }
    }

    // 5. Check for common hallucinated skills
    // If a skill is mentioned but doesn't appear anywhere in the original text, it's suspicious
    if (parsedData.skills) {
      for (const skill of parsedData.skills) {
        if (skill.name) {
          const skillLower = skill.name.toLowerCase();
          // Allow some flexibility for common abbreviations
          const variations = [skillLower, skillLower.replace(/\./g, '')];

          const found = variations.some(variation => lowerOriginalText.includes(variation));

          if (!found) {
            warnings.push(`Skill "${skill.name}" not found in original CV text - possible hallucination`);
          }
        }
      }
    }

    // 6. Check for email format consistency
    if (parsedData.personal_info?.email) {
      const email = parsedData.personal_info.email.toLowerCase();
      if (!lowerOriginalText.includes(email)) {
        warnings.push(`Email "${parsedData.personal_info.email}" not found in original CV text - possible hallucination or reformatting`);
      }
    }

    // 7. Check phone number format
    if (parsedData.personal_info?.phone) {
      const phone = parsedData.personal_info.phone;
      // Extract just digits for flexible matching
      const phoneDigits = phone.replace(/\D/g, '');
      const originalDigits = originalText.replace(/\D/g, '');

      if (!originalDigits.includes(phoneDigits)) {
        warnings.push(`Phone number "${phone}" not found in original CV text - possible hallucination`);
      }
    }

    const isValid = warnings.length === 0;

    if (!isValid) {
      logger.warn('CV parsing validation detected potential issues', {
        totalWarnings: warnings.length,
        warnings: warnings.slice(0, 5), // Log first 5 warnings to avoid spam
      });
    } else {
      logger.info('CV parsing validation passed - all extracted data found in original text');
    }

    return {
      isValid,
      warnings,
    };
  },

  /**
   * Validates extraction and returns a user-friendly summary.
   * Can be used to inform users of potential issues.
   */
  getValidationSummary(validationResult: ValidationResult): string {
    if (validationResult.isValid) {
      return 'All extracted information was verified against your CV text.';
    }

    const warningCount = validationResult.warnings.length;
    return `We found ${warningCount} potential ${warningCount === 1 ? 'issue' : 'issues'} with the extracted data. Please review and correct any inaccuracies.`;
  },
};
