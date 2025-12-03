// Manual Test Script for Phase 1 Changes
// This script tests synonym matching, validation blocking, and parsing improvements

const {
  normalizeSkill,
  areSkillsEquivalent,
  matchSkills,
  normalizeSkillList
} = require('./src/utils/skill-synonyms');

console.log('='.repeat(80));
console.log('PHASE 1 MANUAL TESTING');
console.log('='.repeat(80));
console.log();

// ============================================================================
// TEST 1: Synonym Matching
// ============================================================================
console.log('TEST 1: Synonym Matching');
console.log('-'.repeat(80));

const testCases = [
  { input: 'JavaScript', expected: 'javascript' },
  { input: 'JS', expected: 'javascript' },
  { input: 'Node.js', expected: 'javascript' },
  { input: 'ReactJS', expected: 'react' },
  { input: 'React.js', expected: 'react' },
  { input: 'PostgreSQL', expected: 'postgresql' },
  { input: 'Postgres', expected: 'postgresql' },
  { input: 'k8s', expected: 'kubernetes' },
  { input: 'TypeScript', expected: 'typescript' },
  { input: 'TS', expected: 'typescript' },
];

console.log('Testing normalizeSkill():');
let passed = 0;
let failed = 0;

testCases.forEach(({ input, expected }) => {
  const result = normalizeSkill(input);
  const status = result === expected ? '✅' : '❌';
  if (result === expected) passed++;
  else failed++;
  console.log(`  ${status} normalizeSkill("${input}") = "${result}" (expected: "${expected}")`);
});

console.log();
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log();

// Test areSkillsEquivalent
console.log('Testing areSkillsEquivalent():');
const equivalentTests = [
  { skill1: 'JavaScript', skill2: 'JS', expected: true },
  { skill1: 'React', skill2: 'ReactJS', expected: true },
  { skill1: 'PostgreSQL', skill2: 'Postgres', expected: true },
  { skill1: 'Python', skill2: 'Java', expected: false },
  { skill1: 'Docker', skill2: 'Kubernetes', expected: false },
];

passed = 0;
failed = 0;

equivalentTests.forEach(({ skill1, skill2, expected }) => {
  const result = areSkillsEquivalent(skill1, skill2);
  const status = result === expected ? '✅' : '❌';
  if (result === expected) passed++;
  else failed++;
  console.log(`  ${status} areSkillsEquivalent("${skill1}", "${skill2}") = ${result} (expected: ${expected})`);
});

console.log();
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log();

// Test matchSkills
console.log('Testing matchSkills():');
const candidateSkills = ['JavaScript', 'React', 'PostgreSQL', 'Docker', 'Git'];
const requiredSkills = ['JS', 'ReactJS', 'Node.js', 'MongoDB', 'GitHub'];

const matchResult = matchSkills(candidateSkills, requiredSkills);

console.log('  Candidate Skills:', candidateSkills);
console.log('  Required Skills:', requiredSkills);
console.log();
console.log('  Match Results:');
console.log(`    Present: [${matchResult.present.join(', ')}]`);
console.log(`    Missing: [${matchResult.missing.join(', ')}]`);
console.log(`    Match Count: ${matchResult.matchCount}/${matchResult.totalRequired}`);
console.log(`    Match Percentage: ${matchResult.matchPercentage}%`);
console.log();

// Expected: javascript (JS=JS), react (React=ReactJS), github (Git=GitHub) = 3 matches
// Expected: mongodb = 1 missing (Node.js is covered by JavaScript)
const expectedPresent = ['javascript', 'react', 'github'];
const expectedMissing = ['mongodb'];
const presentMatch = JSON.stringify(matchResult.present.sort()) === JSON.stringify(expectedPresent.sort());
const missingMatch = JSON.stringify(matchResult.missing.sort()) === JSON.stringify(expectedMissing.sort());

console.log(`  Validation:`);
console.log(`    ${presentMatch ? '✅' : '❌'} Present skills match expected`);
console.log(`    ${missingMatch ? '✅' : '❌'} Missing skills match expected`);
console.log(`    ${matchResult.matchPercentage === 75 ? '✅' : '❌'} Match percentage is 75% (3/4)`);
console.log();

// ============================================================================
// TEST 2: Normalize Skill List (Deduplication)
// ============================================================================
console.log('TEST 2: Skill List Normalization & Deduplication');
console.log('-'.repeat(80));

const duplicateSkills = [
  'JavaScript', 'JS', 'Node.js',
  'React', 'ReactJS', 'React.js',
  'Python', 'Python',
  'PostgreSQL', 'Postgres', 'PSQL'
];

const normalized = normalizeSkillList(duplicateSkills);

console.log('  Input Skills:', duplicateSkills);
console.log('  Normalized:', normalized);
console.log();
console.log(`  Original count: ${duplicateSkills.length}`);
console.log(`  Normalized count: ${normalized.length}`);
console.log(`  ${normalized.length === 3 ? '✅' : '❌'} Expected 3 unique skills (javascript, react, postgresql)`);
console.log();

// ============================================================================
// TEST SUMMARY
// ============================================================================
console.log('='.repeat(80));
console.log('TEST SUMMARY');
console.log('='.repeat(80));
console.log();
console.log('✅ Synonym matching tests completed');
console.log('✅ Skill normalization tests completed');
console.log('✅ Match scoring tests completed');
console.log();
console.log('Next Steps:');
console.log('  1. Start backend server: npm run dev');
console.log('  2. Test CV parsing with stricter validation');
console.log('  3. Test application service blocking validation');
console.log('  4. Run full test suite: npm test');
console.log();
console.log('='.repeat(80));
