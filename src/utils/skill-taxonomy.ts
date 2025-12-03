// src/utils/skill-taxonomy.ts

/**
 * Skill Taxonomy and Hierarchy
 * Story: Phase 3 Task 3 - Skill taxonomy/hierarchy understanding
 *
 * Defines relationships between skills (e.g., TypeScript implies JavaScript knowledge).
 * Helps understand that having a framework skill often implies the underlying language.
 */

export interface SkillRelationship {
  skill: string;
  implies: string[]; // Skills that this skill implies knowledge of
  relatedTo: string[]; // Related skills that often go together
  category: string; // Skill category for grouping
}

/**
 * Skill taxonomy mapping
 * Key: skill name (lowercase)
 * Value: relationship information
 */
export const SKILL_TAXONOMY: Record<string, SkillRelationship> = {
  // Frontend Frameworks → JavaScript
  'react': {
    skill: 'React',
    implies: ['javascript', 'html', 'css', 'jsx'],
    relatedTo: ['redux', 'react router', 'next.js', 'react native', 'webpack'],
    category: 'frontend-framework',
  },
  'angular': {
    skill: 'Angular',
    implies: ['javascript', 'typescript', 'html', 'css', 'rxjs'],
    relatedTo: ['angular material', 'ngrx', 'webpack'],
    category: 'frontend-framework',
  },
  'vue': {
    skill: 'Vue',
    implies: ['javascript', 'html', 'css'],
    relatedTo: ['vuex', 'vue router', 'nuxt.js', 'webpack'],
    category: 'frontend-framework',
  },
  'svelte': {
    skill: 'Svelte',
    implies: ['javascript', 'html', 'css'],
    relatedTo: ['sveltekit'],
    category: 'frontend-framework',
  },
  'next.js': {
    skill: 'Next.js',
    implies: ['react', 'javascript', 'node.js', 'html', 'css'],
    relatedTo: ['vercel', 'webpack', 'server-side rendering'],
    category: 'frontend-framework',
  },

  // TypeScript → JavaScript
  'typescript': {
    skill: 'TypeScript',
    implies: ['javascript'],
    relatedTo: ['node.js', 'react', 'angular', 'nest.js'],
    category: 'programming-language',
  },

  // Backend Frameworks → Languages
  'express': {
    skill: 'Express',
    implies: ['node.js', 'javascript'],
    relatedTo: ['mongodb', 'postgresql', 'rest api'],
    category: 'backend-framework',
  },
  'nest.js': {
    skill: 'NestJS',
    implies: ['node.js', 'typescript', 'express'],
    relatedTo: ['graphql', 'postgresql', 'microservices'],
    category: 'backend-framework',
  },
  'django': {
    skill: 'Django',
    implies: ['python'],
    relatedTo: ['postgresql', 'rest api', 'django rest framework'],
    category: 'backend-framework',
  },
  'flask': {
    skill: 'Flask',
    implies: ['python'],
    relatedTo: ['sqlalchemy', 'rest api'],
    category: 'backend-framework',
  },
  'fastapi': {
    skill: 'FastAPI',
    implies: ['python'],
    relatedTo: ['pydantic', 'rest api', 'async'],
    category: 'backend-framework',
  },
  'spring boot': {
    skill: 'Spring Boot',
    implies: ['java', 'spring'],
    relatedTo: ['hibernate', 'rest api', 'microservices'],
    category: 'backend-framework',
  },
  'laravel': {
    skill: 'Laravel',
    implies: ['php'],
    relatedTo: ['mysql', 'composer'],
    category: 'backend-framework',
  },
  'ruby on rails': {
    skill: 'Ruby on Rails',
    implies: ['ruby'],
    relatedTo: ['postgresql', 'rest api'],
    category: 'backend-framework',
  },
  'asp.net': {
    skill: 'ASP.NET',
    implies: ['c#', '.net'],
    relatedTo: ['sql server', 'rest api'],
    category: 'backend-framework',
  },

  // Mobile Development
  'react native': {
    skill: 'React Native',
    implies: ['react', 'javascript', 'mobile development'],
    relatedTo: ['ios', 'android', 'expo'],
    category: 'mobile-framework',
  },
  'flutter': {
    skill: 'Flutter',
    implies: ['dart', 'mobile development'],
    relatedTo: ['ios', 'android'],
    category: 'mobile-framework',
  },
  'swift': {
    skill: 'Swift',
    implies: ['ios development', 'mobile development'],
    relatedTo: ['xcode', 'ios', 'swiftui'],
    category: 'programming-language',
  },
  'kotlin': {
    skill: 'Kotlin',
    implies: ['android development', 'mobile development', 'java'],
    relatedTo: ['android studio', 'android', 'jetpack compose'],
    category: 'programming-language',
  },

  // DevOps & Cloud
  'kubernetes': {
    skill: 'Kubernetes',
    implies: ['docker', 'containerization', 'devops'],
    relatedTo: ['helm', 'aws', 'gcp', 'azure', 'microservices'],
    category: 'devops',
  },
  'docker': {
    skill: 'Docker',
    implies: ['containerization'],
    relatedTo: ['kubernetes', 'docker compose', 'devops'],
    category: 'devops',
  },
  'terraform': {
    skill: 'Terraform',
    implies: ['infrastructure as code', 'devops'],
    relatedTo: ['aws', 'gcp', 'azure'],
    category: 'devops',
  },
  'jenkins': {
    skill: 'Jenkins',
    implies: ['ci/cd', 'devops'],
    relatedTo: ['docker', 'kubernetes', 'automation'],
    category: 'devops',
  },
  'github actions': {
    skill: 'GitHub Actions',
    implies: ['ci/cd', 'devops', 'git'],
    relatedTo: ['docker', 'automation'],
    category: 'devops',
  },

  // Databases
  'mongodb': {
    skill: 'MongoDB',
    implies: ['nosql', 'database'],
    relatedTo: ['mongoose', 'node.js', 'express'],
    category: 'database',
  },
  'postgresql': {
    skill: 'PostgreSQL',
    implies: ['sql', 'database'],
    relatedTo: ['node.js', 'python', 'django'],
    category: 'database',
  },
  'mysql': {
    skill: 'MySQL',
    implies: ['sql', 'database'],
    relatedTo: ['php', 'laravel'],
    category: 'database',
  },
  'redis': {
    skill: 'Redis',
    implies: ['caching', 'database', 'nosql'],
    relatedTo: ['node.js', 'python'],
    category: 'database',
  },

  // Testing
  'jest': {
    skill: 'Jest',
    implies: ['testing', 'javascript'],
    relatedTo: ['react', 'node.js', 'typescript'],
    category: 'testing',
  },
  'pytest': {
    skill: 'Pytest',
    implies: ['testing', 'python'],
    relatedTo: ['django', 'flask'],
    category: 'testing',
  },
  'junit': {
    skill: 'JUnit',
    implies: ['testing', 'java'],
    relatedTo: ['spring boot', 'maven'],
    category: 'testing',
  },
};

/**
 * Gets all skills implied by having a particular skill.
 *
 * @param skill - Skill to check
 * @returns Array of implied skills
 */
export function getImpliedSkills(skill: string): string[] {
  const normalized = skill.toLowerCase().trim();
  const taxonomy = SKILL_TAXONOMY[normalized];
  return taxonomy ? taxonomy.implies : [];
}

/**
 * Gets related skills that often go together with a particular skill.
 *
 * @param skill - Skill to check
 * @returns Array of related skills
 */
export function getRelatedSkills(skill: string): string[] {
  const normalized = skill.toLowerCase().trim();
  const taxonomy = SKILL_TAXONOMY[normalized];
  return taxonomy ? taxonomy.relatedTo : [];
}

/**
 * Gets the category for a skill.
 *
 * @param skill - Skill to check
 * @returns Category name or 'unknown'
 */
export function getSkillCategory(skill: string): string {
  const normalized = skill.toLowerCase().trim();
  const taxonomy = SKILL_TAXONOMY[normalized];
  return taxonomy ? taxonomy.category : 'unknown';
}

/**
 * Checks if having skill A implies knowledge of skill B.
 *
 * @param skillA - Skill the candidate has
 * @param skillB - Skill required by job
 * @returns true if skillA implies skillB
 */
export function doesSkillImply(skillA: string, skillB: string): boolean {
  const impliedSkills = getImpliedSkills(skillA);
  return impliedSkills.some(
    implied => implied.toLowerCase() === skillB.toLowerCase()
  );
}

/**
 * Expands a list of skills to include all implied skills.
 *
 * @param skills - Original list of skills
 * @returns Expanded list including implied skills
 */
export function expandSkillsWithImplied(skills: string[]): string[] {
  const expanded = new Set<string>();

  for (const skill of skills) {
    expanded.add(skill);
    const implied = getImpliedSkills(skill);
    implied.forEach(impliedSkill => expanded.add(impliedSkill));
  }

  return Array.from(expanded);
}

/**
 * Groups skills by category.
 *
 * @param skills - List of skills to group
 * @returns Map of category to skills
 */
export function groupSkillsByCategory(skills: string[]): Map<string, string[]> {
  const grouped = new Map<string, string[]>();

  for (const skill of skills) {
    const category = getSkillCategory(skill);
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(skill);
  }

  return grouped;
}
