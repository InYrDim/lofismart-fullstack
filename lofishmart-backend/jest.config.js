/**
 * Jest Configuration for lofishmart-backend
 * Configures test environment for ST-02 inventory tests
 */

module.exports = {
  // Test environment - node for backend API tests
  testEnvironment: 'node',

  // Timeout for each test (30 seconds for DB operations)
  testTimeout: 30000,

  // Test file pattern
  testMatch: ['**/tests/**/*.test.js'],

  // Setup files - run before tests
  setupFiles: ['./tests/jest.setup.js'],

  // Verbose output
  verbose: true,

  // Collect coverage from these files
  collectCoverageFrom: [
    'controllers/**/*.js',
    '!controllers/**/*.test.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],

  // Coverage thresholds (optional)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Clear mocks between tests
  clearMocks: true,
};
