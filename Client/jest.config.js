const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/__mocks__/'],
  moduleNameMapper: {
    '\\.(css|scss|sass)$': '<rootDir>/__tests__/__mocks__/styleMock.js',
    '\\.(png|jpg|jpeg|gif|svg|webp)$': '<rootDir>/__tests__/__mocks__/fileMock.js',
  },
};

module.exports = createJestConfig(config);
