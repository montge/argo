module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  maxWorkers: 1, // Run tests sequentially to avoid file system conflicts
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 95,
      lines: 85,
      statements: 85,
    },
  },
  moduleNameMapper: {
    '^@argo/core$': '<rootDir>/../argo-core/src/index.ts',
  },
};
