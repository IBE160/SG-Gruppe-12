const baseConfig = require('../../jest.config.js');

module.exports = {
  ...baseConfig,
  projects: [], // Important: clear projects to avoid recursion
  displayName: 'src',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/src/tsconfig.json'
    }]
  },
};