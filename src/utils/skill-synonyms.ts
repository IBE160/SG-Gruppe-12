// src/utils/skill-synonyms.ts

/**
 * Comprehensive skill synonym database for matching equivalent terms.
 *
 * This ensures that:
 * - JavaScript = JS = ECMAScript = Node.js = Node
 * - React = ReactJS = React.js
 * - PostgreSQL = Postgres = PSQL = PG
 * - etc.
 *
 * Each canonical term maps to an array of all its synonyms and variations.
 */

export const SKILL_SYNONYMS: Record<string, string[]> = {
  // ========== Programming Languages ==========
  'javascript': [
    'js',
    'ecmascript',
    'es6',
    'es2015',
    'es2016',
    'es2017',
    'es2018',
    'es2019',
    'es2020',
    'es2021',
    'es2022',
    'node',
    'nodejs',
    'node.js',
  ],
  'typescript': ['ts', 'typescript', 'tsx'],
  'python': ['py', 'python3', 'python2', 'python 3', 'python 2'],
  'java': ['jvm', 'java programming'],
  'c++': ['cpp', 'cplusplus', 'c plus plus'],
  'c#': ['csharp', 'dotnet', '.net', 'dot net', 'c sharp'],
  'c': ['c programming', 'ansi c'],
  'ruby': ['rb', 'ruby programming'],
  'php': ['php7', 'php8', 'php 7', 'php 8'],
  'go': ['golang', 'google go'],
  'rust': ['rs', 'rust programming'],
  'swift': ['swift programming', 'ios development'],
  'kotlin': ['kt', 'kotlin programming', 'android development'],
  'scala': ['scala programming'],
  'r': ['r programming', 'r language'],
  'perl': ['perl programming'],
  'shell': ['bash', 'sh', 'shell scripting', 'bash scripting'],
  'sql': ['structured query language', 'database query language'],
  'html': ['html5', 'hypertext markup language'],
  'css': ['css3', 'cascading style sheets'],

  // ========== Frontend Frameworks & Libraries ==========
  'react': ['reactjs', 'react.js', 'react native', 'react-native', 'react js'],
  'angular': ['angularjs', 'angular.js', 'angular2', 'angular 2', 'angular4+', 'angular js'],
  'vue': ['vuejs', 'vue.js', 'vue js'],
  'svelte': ['sveltejs', 'svelte.js'],
  'next': ['nextjs', 'next.js', 'next js'],
  'nuxt': ['nuxtjs', 'nuxt.js', 'nuxt js'],
  'gatsby': ['gatsbyjs', 'gatsby.js'],
  'ember': ['emberjs', 'ember.js'],
  'backbone': ['backbonejs', 'backbone.js'],
  'jquery': ['jquery library'],
  'redux': ['redux.js', 'react-redux'],
  'mobx': ['mobx state tree'],
  'tailwind': ['tailwindcss', 'tailwind css'],
  'bootstrap': ['bootstrap css', 'bootstrap framework'],
  'material-ui': ['mui', 'material ui'],
  'ant design': ['antd', 'ant-design'],
  'styled-components': ['styled components'],
  'sass': ['scss', 'syntactically awesome style sheets'],
  'less': ['less css'],

  // ========== Backend Frameworks ==========
  'express': ['expressjs', 'express.js', 'express js'],
  'nestjs': ['nest', 'nest.js', 'nest js'],
  'koa': ['koajs', 'koa.js'],
  'fastify': ['fastifyjs'],
  'django': ['django framework', 'django rest framework', 'drf'],
  'flask': ['flask framework', 'flask-restful'],
  'fastapi': ['fast api'],
  'spring': ['spring boot', 'springboot', 'spring framework'],
  'spring boot': ['springboot'],
  'laravel': ['php laravel', 'laravel framework'],
  'symfony': ['symfony framework'],
  'rails': ['ruby on rails', 'ror', 'rails framework'],
  'asp.net': ['asp net', 'aspnet', 'asp.net core'],
  'gin': ['gin-gonic', 'go gin'],
  'actix': ['actix-web'],

  // ========== Databases ==========
  'postgresql': ['postgres', 'psql', 'pg', 'postgre sql'],
  'mongodb': ['mongo', 'mongo db', 'mongoose'],
  'mysql': ['my sql', 'mariadb', 'maria db'],
  'redis': ['redis cache', 'redis db'],
  'elasticsearch': ['elastic', 'es', 'elastic search'],
  'sqlite': ['sqlite3', 'sqlite 3'],
  'mariadb': ['maria db', 'mysql'],
  'oracle': ['oracle db', 'oracle database'],
  'mssql': ['microsoft sql server', 'sql server', 'ms sql'],
  'dynamodb': ['dynamo', 'dynamo db', 'aws dynamodb'],
  'cassandra': ['apache cassandra'],
  'couchdb': ['couch db', 'apache couchdb'],
  'firebase': ['firebase realtime database', 'firestore'],
  'supabase': ['supabase postgres'],
  'neo4j': ['neo4j graph database'],

  // ========== DevOps & Tools ==========
  'docker': ['containerization', 'containers', 'docker containers'],
  'kubernetes': ['k8s', 'k8', 'container orchestration'],
  'jenkins': ['jenkins ci', 'jenkins ci/cd'],
  'github actions': ['gh actions', 'github ci'],
  'gitlab ci': ['gitlab ci/cd'],
  'terraform': ['tf', 'terraform iac'],
  'ansible': ['ansible playbooks', 'configuration management'],
  'puppet': ['puppet configuration'],
  'chef': ['chef configuration'],
  'vagrant': ['vagrant vm'],
  'circleci': ['circle ci'],
  'travis ci': ['travis'],
  'nginx': ['nginx web server'],
  'apache': ['apache web server', 'apache http server'],
  'tomcat': ['apache tomcat'],

  // ========== Cloud Providers ==========
  'aws': [
    'amazon web services',
    'ec2',
    's3',
    'lambda',
    'aws cloud',
    'amazon cloud',
  ],
  'gcp': ['google cloud', 'google cloud platform', 'gcloud'],
  'azure': ['microsoft azure', 'azure cloud'],
  'digitalocean': ['digital ocean', 'do cloud'],
  'heroku': ['heroku platform'],
  'vercel': ['vercel platform', 'zeit'],
  'netlify': ['netlify platform'],
  'cloudflare': ['cloudflare cdn'],

  // ========== Testing ==========
  'jest': ['jestjs', 'jest testing'],
  'mocha': ['mochajs', 'mocha testing'],
  'jasmine': ['jasminejs'],
  'cypress': ['cypressio', 'cypress.io', 'cypress e2e'],
  'selenium': ['selenium webdriver', 'selenium testing'],
  'playwright': ['playwright testing'],
  'pytest': ['python testing', 'py.test'],
  'junit': ['java testing', 'junit testing'],
  'testng': ['test ng'],
  'rspec': ['ruby testing', 'rspec testing'],
  'phpunit': ['php testing', 'php unit'],
  'karma': ['karma test runner'],
  'puppeteer': ['puppeteer testing'],

  // ========== Version Control ==========
  'git': ['version control', 'source control'],
  'github': ['gh', 'github platform'],
  'gitlab': ['gitlab platform'],
  'bitbucket': ['atlassian bitbucket'],
  'svn': ['subversion', 'apache subversion'],
  'mercurial': ['hg'],

  // ========== Build Tools & Package Managers ==========
  'webpack': ['webpack bundler'],
  'vite': ['vitejs', 'vite build tool'],
  'rollup': ['rollupjs'],
  'parcel': ['parceljs'],
  'gulp': ['gulpjs', 'gulp.js'],
  'grunt': ['gruntjs', 'grunt.js'],
  'npm': ['node package manager', 'npm packages'],
  'yarn': ['yarn package manager'],
  'pnpm': ['performant npm'],
  'pip': ['python package installer', 'pypi'],
  'maven': ['apache maven'],
  'gradle': ['gradle build tool'],
  'composer': ['php composer'],
  'cargo': ['rust cargo'],

  // ========== Methodologies & Practices ==========
  'agile': ['scrum', 'kanban', 'sprint', 'agile methodology'],
  'scrum': ['scrum methodology', 'scrum framework'],
  'kanban': ['kanban methodology'],
  'ci/cd': [
    'continuous integration',
    'continuous deployment',
    'continuous delivery',
    'ci cd',
    'cicd',
  ],
  'tdd': ['test driven development', 'test-driven development', 'test driven'],
  'bdd': [
    'behavior driven development',
    'behaviour driven development',
    'behavior-driven',
  ],
  'devops': ['dev ops', 'development operations'],
  'microservices': ['micro services', 'microservice architecture'],
  'restful': ['rest', 'rest api', 'restful api'],
  'graphql': ['graph ql', 'graphql api'],
  'grpc': ['grpc protocol'],
  'soap': ['soap protocol', 'soap api'],
  'mvc': ['model view controller', 'model-view-controller'],
  'mvvm': ['model view viewmodel'],
  'oop': [
    'object oriented programming',
    'object-oriented programming',
    'object oriented',
  ],
  'functional programming': ['fp', 'functional paradigm'],

  // ========== Design & UX ==========
  'figma': ['figma design'],
  'sketch': ['sketch design'],
  'adobe xd': ['xd', 'experience design'],
  'photoshop': ['adobe photoshop', 'ps'],
  'illustrator': ['adobe illustrator', 'ai'],
  'ui/ux': ['ui ux', 'user interface user experience', 'ui design', 'ux design'],
  'responsive design': ['mobile-first design', 'responsive web design'],

  // ========== Mobile Development ==========
  'react native': ['reactnative', 'react-native', 'rn'],
  'flutter': ['flutter framework', 'dart flutter'],
  'ionic': ['ionic framework'],
  'xamarin': ['xamarin framework'],

  // ========== Data Science & ML ==========
  'tensorflow': ['tensor flow', 'tf'],
  'pytorch': ['py torch'],
  'scikit-learn': ['sklearn', 'scikit learn'],
  'pandas': ['pandas library'],
  'numpy': ['numpy library'],
  'matplotlib': ['matplotlib plotting'],
  'keras': ['keras library'],
  'jupyter': ['jupyter notebook', 'ipython'],
  'machine learning': ['ml', 'machine-learning'],
  'deep learning': ['dl', 'deep-learning', 'neural networks'],
  'artificial intelligence': ['ai', 'ai/ml'],
  'nlp': ['natural language processing', 'natural-language processing'],
  'computer vision': ['cv', 'image processing'],

  // ========== Security ==========
  'oauth': ['oauth2', 'oauth 2.0', 'open auth'],
  'jwt': ['json web token', 'json web tokens'],
  'ssl': ['tls', 'https', 'secure sockets layer'],
  'penetration testing': ['pen testing', 'pentest', 'ethical hacking'],
  'encryption': ['cryptography', 'data encryption'],

  // ========== Soft Skills ==========
  'leadership': [
    'team lead',
    'team leader',
    'leading teams',
    'team management',
  ],
  'communication': ['communicating', 'presentations', 'public speaking'],
  'collaboration': ['teamwork', 'team player', 'working in teams'],
  'problem solving': [
    'problem-solving',
    'troubleshooting',
    'analytical thinking',
  ],
  'project management': ['pm', 'managing projects'],
  'time management': ['time-management', 'prioritization'],
  'mentoring': ['mentorship', 'coaching', 'training others'],
};

/**
 * Normalizes a skill to its canonical form.
 *
 * @param skill - The skill string to normalize (e.g., "JS", "ReactJS", "Node")
 * @returns The canonical form (e.g., "javascript", "react", "javascript")
 *
 * @example
 * normalizeSkill("JS") // returns "javascript"
 * normalizeSkill("ReactJS") // returns "react"
 * normalizeSkill("PostgreSQL") // returns "postgresql"
 */
export function normalizeSkill(skill: string): string {
  const lower = skill.toLowerCase().trim();

  // Check if skill is already a canonical term
  if (SKILL_SYNONYMS[lower]) {
    return lower;
  }

  // Check if skill is a synonym of a canonical term
  for (const [canonical, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    if (synonyms.includes(lower)) {
      return canonical;
    }
  }

  // Return as-is if no match found (lowercased and trimmed)
  return lower;
}

/**
 * Checks if two skills are equivalent (exact match or synonym match).
 *
 * @param skill1 - First skill to compare
 * @param skill2 - Second skill to compare
 * @returns true if skills are equivalent, false otherwise
 *
 * @example
 * areSkillsEquivalent("JavaScript", "JS") // returns true
 * areSkillsEquivalent("React", "ReactJS") // returns true
 * areSkillsEquivalent("Python", "Java") // returns false
 */
export function areSkillsEquivalent(skill1: string, skill2: string): boolean {
  const norm1 = normalizeSkill(skill1);
  const norm2 = normalizeSkill(skill2);
  return norm1 === norm2;
}

/**
 * Gets all known variants of a skill including the canonical form.
 *
 * @param skill - The skill to get variants for
 * @returns Array of all variants including the canonical form
 *
 * @example
 * getSkillVariants("JS")
 * // returns ["javascript", "js", "ecmascript", "es6", ..., "node", "nodejs", "node.js"]
 */
export function getSkillVariants(skill: string): string[] {
  const canonical = normalizeSkill(skill);
  const synonyms = SKILL_SYNONYMS[canonical] || [];
  return [canonical, ...synonyms];
}

/**
 * Normalizes a list of skills to their canonical forms and removes duplicates.
 *
 * @param skills - Array of skill strings to normalize
 * @returns Array of normalized, deduplicated skills
 *
 * @example
 * normalizeSkillList(["JavaScript", "JS", "React", "ReactJS", "Python"])
 * // returns ["javascript", "react", "python"]
 */
export function normalizeSkillList(skills: string[]): string[] {
  const normalized = skills.map(normalizeSkill);
  return [...new Set(normalized)]; // Remove duplicates
}

/**
 * Counts how many job requirements are met by the candidate's skills.
 * Uses synonym matching to recognize equivalent terms.
 *
 * @param candidateSkills - Skills from candidate's CV
 * @param requiredSkills - Skills required by the job
 * @returns Object with present and missing skills
 *
 * @example
 * matchSkills(
 *   ["JavaScript", "React", "PostgreSQL"],
 *   ["JS", "ReactJS", "Node.js", "MongoDB"]
 * )
 * // returns {
 * //   present: ["javascript", "react"],
 * //   missing: ["mongodb"],
 * //   matchCount: 2,
 * //   totalRequired: 3,
 * //   matchPercentage: 67
 * // }
 */
export function matchSkills(
  candidateSkills: string[],
  requiredSkills: string[]
): {
  present: string[];
  missing: string[];
  matchCount: number;
  totalRequired: number;
  matchPercentage: number;
} {
  // Normalize all skills to canonical forms
  const candidateNormalized = normalizeSkillList(candidateSkills);
  const requiredNormalized = normalizeSkillList(requiredSkills);

  // Find matches
  const present = requiredNormalized.filter(required =>
    candidateNormalized.includes(required)
  );

  const missing = requiredNormalized.filter(
    required => !candidateNormalized.includes(required)
  );

  const matchCount = present.length;
  const totalRequired = requiredNormalized.length;
  const matchPercentage =
    totalRequired > 0 ? Math.round((matchCount / totalRequired) * 100) : 0;

  return {
    present,
    missing,
    matchCount,
    totalRequired,
    matchPercentage,
  };
}
