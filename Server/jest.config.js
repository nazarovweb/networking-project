/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup.ts', '/__tests__/testApp.ts'],
  clearMocks: true,
  transform: {
    '^.+\\.ts$': ['ts-jest', {}],
  },
};
