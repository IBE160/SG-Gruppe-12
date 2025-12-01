const baseConfig = require('../../jest.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'frontend',
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/frontend/src/**/*.test.ts', '<rootDir>/frontend/src/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/frontend/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/frontend/src/$1'
  },
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      babelConfig: true,
      tsconfig: {
        module: 'commonjs',
        extends: '<rootDir>/frontend/tsconfig.json'
      }
    }],
    '^.+\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@testing-library/jest-dom)/'
  ]
};
