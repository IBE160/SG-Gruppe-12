// src/tests/unit/skill-synonyms.test.ts
import {
  normalizeSkill,
  areSkillsEquivalent,
  matchSkills,
  normalizeSkillList,
  getSkillVariants,
} from '../../utils/skill-synonyms';

describe('Skill Synonyms Module', () => {
  describe('normalizeSkill', () => {
    it('should normalize JavaScript and its variants to "javascript"', () => {
      expect(normalizeSkill('JavaScript')).toBe('javascript');
      expect(normalizeSkill('JS')).toBe('javascript');
      expect(normalizeSkill('js')).toBe('javascript');
      expect(normalizeSkill('Node.js')).toBe('javascript');
      expect(normalizeSkill('node')).toBe('javascript');
      expect(normalizeSkill('ECMAScript')).toBe('javascript');
    });

    it('should normalize React and its variants to "react"', () => {
      expect(normalizeSkill('React')).toBe('react');
      expect(normalizeSkill('ReactJS')).toBe('react');
      expect(normalizeSkill('React.js')).toBe('react');
      expect(normalizeSkill('react native')).toBe('react');
    });

    it('should normalize PostgreSQL and its variants to "postgresql"', () => {
      expect(normalizeSkill('PostgreSQL')).toBe('postgresql');
      expect(normalizeSkill('Postgres')).toBe('postgresql');
      expect(normalizeSkill('PSQL')).toBe('postgresql');
      expect(normalizeSkill('pg')).toBe('postgresql');
    });

    it('should normalize Kubernetes variants to "kubernetes"', () => {
      expect(normalizeSkill('Kubernetes')).toBe('kubernetes');
      expect(normalizeSkill('k8s')).toBe('kubernetes');
      expect(normalizeSkill('K8s')).toBe('kubernetes');
    });

    it('should return lowercase trimmed string for unknown skills', () => {
      expect(normalizeSkill('UnknownSkill')).toBe('unknownskill');
      expect(normalizeSkill('  Spaced Skill  ')).toBe('spaced skill');
    });
  });

  describe('areSkillsEquivalent', () => {
    it('should return true for equivalent skills', () => {
      expect(areSkillsEquivalent('JavaScript', 'JS')).toBe(true);
      expect(areSkillsEquivalent('React', 'ReactJS')).toBe(true);
      expect(areSkillsEquivalent('PostgreSQL', 'Postgres')).toBe(true);
      expect(areSkillsEquivalent('Docker', 'Containers')).toBe(true);
      expect(areSkillsEquivalent('kubernetes', 'k8s')).toBe(true);
    });

    it('should return false for non-equivalent skills', () => {
      expect(areSkillsEquivalent('JavaScript', 'Python')).toBe(false);
      expect(areSkillsEquivalent('React', 'Angular')).toBe(false);
      expect(areSkillsEquivalent('PostgreSQL', 'MongoDB')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(areSkillsEquivalent('javascript', 'JavaScript')).toBe(true);
      expect(areSkillsEquivalent('REACT', 'reactjs')).toBe(true);
    });
  });

  describe('normalizeSkillList', () => {
    it('should normalize and deduplicate skill list', () => {
      const skills = ['JavaScript', 'JS', 'React', 'ReactJS', 'Python'];
      const normalized = normalizeSkillList(skills);

      expect(normalized).toHaveLength(3);
      expect(normalized).toContain('javascript');
      expect(normalized).toContain('react');
      expect(normalized).toContain('python');
    });

    it('should handle empty array', () => {
      expect(normalizeSkillList([])).toEqual([]);
    });

    it('should deduplicate exact matches', () => {
      const skills = ['JavaScript', 'JavaScript', 'JavaScript'];
      const normalized = normalizeSkillList(skills);

      expect(normalized).toHaveLength(1);
      expect(normalized[0]).toBe('javascript');
    });

    it('should handle complex deduplication across synonyms', () => {
      const skills = [
        'JavaScript',
        'JS',
        'Node.js',
        'PostgreSQL',
        'Postgres',
        'PSQL',
        'React',
        'ReactJS',
      ];
      const normalized = normalizeSkillList(skills);

      expect(normalized).toHaveLength(3); // javascript, postgresql, react
      expect(normalized).toContain('javascript');
      expect(normalized).toContain('postgresql');
      expect(normalized).toContain('react');
    });
  });

  describe('getSkillVariants', () => {
    it('should return all variants for JavaScript', () => {
      const variants = getSkillVariants('JS');

      expect(variants).toContain('javascript');
      expect(variants).toContain('js');
      expect(variants).toContain('node');
      expect(variants).toContain('nodejs');
      expect(variants.length).toBeGreaterThan(5);
    });

    it('should return canonical form and synonyms for React', () => {
      const variants = getSkillVariants('ReactJS');

      expect(variants).toContain('react');
      expect(variants).toContain('reactjs');
      expect(variants).toContain('react.js');
    });

    it('should return just the skill if no synonyms exist', () => {
      const variants = getSkillVariants('UnknownSkill');

      expect(variants).toEqual(['unknownskill']);
    });
  });

  describe('matchSkills', () => {
    it('should correctly match skills with synonyms', () => {
      const candidateSkills = ['JavaScript', 'React', 'PostgreSQL'];
      const requiredSkills = ['JS', 'ReactJS', 'MongoDB'];

      const result = matchSkills(candidateSkills, requiredSkills);

      expect(result.present).toContain('javascript');
      expect(result.present).toContain('react');
      expect(result.missing).toContain('mongodb');
      expect(result.matchCount).toBe(2);
      expect(result.totalRequired).toBe(3);
      expect(result.matchPercentage).toBe(67); // 2/3 = 66.67 rounded to 67
    });

    it('should handle exact matches', () => {
      const candidateSkills = ['Python', 'Java', 'C++'];
      const requiredSkills = ['Python', 'Java'];

      const result = matchSkills(candidateSkills, requiredSkills);

      expect(result.present).toHaveLength(2);
      expect(result.missing).toHaveLength(0);
      expect(result.matchPercentage).toBe(100);
    });

    it('should handle no matches', () => {
      const candidateSkills = ['Python', 'Java'];
      const requiredSkills = ['Ruby', 'PHP'];

      const result = matchSkills(candidateSkills, requiredSkills);

      expect(result.present).toHaveLength(0);
      expect(result.missing).toHaveLength(2);
      expect(result.matchPercentage).toBe(0);
    });

    it('should handle empty candidate skills', () => {
      const candidateSkills: string[] = [];
      const requiredSkills = ['Python', 'Java'];

      const result = matchSkills(candidateSkills, requiredSkills);

      expect(result.present).toHaveLength(0);
      expect(result.missing).toHaveLength(2);
      expect(result.matchPercentage).toBe(0);
    });

    it('should handle empty required skills', () => {
      const candidateSkills = ['Python', 'Java'];
      const requiredSkills: string[] = [];

      const result = matchSkills(candidateSkills, requiredSkills);

      expect(result.present).toHaveLength(0);
      expect(result.missing).toHaveLength(0);
      expect(result.matchPercentage).toBe(0);
    });

    it('should deduplicate matches correctly', () => {
      const candidateSkills = ['JavaScript', 'JS', 'Node.js'];
      const requiredSkills = ['JS', 'ECMAScript', 'Python'];

      const result = matchSkills(candidateSkills, requiredSkills);

      // All three candidate skills normalize to 'javascript'
      // Two required skills normalize to 'javascript', one to 'python'
      // So we should have 1 match (javascript) and 1 missing (python)
      expect(result.present).toHaveLength(1);
      expect(result.present).toContain('javascript');
      expect(result.missing).toHaveLength(1);
      expect(result.missing).toContain('python');
      expect(result.matchPercentage).toBe(50); // 1/2 = 50%
    });
  });

  describe('Integration: Real-world scenarios', () => {
    it('should match developer profile to job requirements', () => {
      const candidateSkills = [
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
        'Express',
        'PostgreSQL',
        'Docker',
        'Git',
        'Agile',
        'REST API',
      ];

      const jobRequirements = [
        'JS',
        'TS',
        'ReactJS',
        'Node',
        'MongoDB',
        'Kubernetes',
        'GitHub',
        'Scrum',
        'RESTful API',
      ];

      const result = matchSkills(candidateSkills, jobRequirements);

      // Matches: javascript, typescript, react, git/github, agile/scrum, restful
      expect(result.matchCount).toBeGreaterThanOrEqual(6);
      expect(result.matchPercentage).toBeGreaterThanOrEqual(60);

      // Missing: mongodb, kubernetes
      expect(result.missing).toContain('mongodb');
      expect(result.missing).toContain('kubernetes');
    });

    it('should handle frontend developer matching', () => {
      const candidateSkills = [
        'HTML',
        'CSS',
        'JavaScript',
        'React',
        'Redux',
        'TypeScript',
        'Webpack',
        'Sass',
        'Jest',
      ];

      const jobRequirements = [
        'HTML5',
        'CSS3',
        'JS',
        'ReactJS',
        'TS',
        'SCSS',
        'Testing',
      ];

      const result = matchSkills(candidateSkills, jobRequirements);

      // Should match most skills
      expect(result.matchPercentage).toBeGreaterThanOrEqual(70);
    });
  });
});
