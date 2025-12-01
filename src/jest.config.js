const baseConfig = require('../jest.config.js');

module.exports = {
  ...baseConfig,
  projects: [], // Important: clear projects to avoid recursion
  displayName: 'src',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^file-type$': '<rootDir>/tests/__mocks__/file-type.ts',
    '.*storage\\.service$': '<rootDir>/tests/__mocks__/storage.service.ts',
  },
  transform: {
    '^.+\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json'
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(file-type)/)'
  ],
};