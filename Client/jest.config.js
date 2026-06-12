/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/__mocks__/'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|scss|sass)$': '<rootDir>/__tests__/__mocks__/styleMock.js',
    '\\.(png|jpg|jpeg|gif|svg|webp)$': '<rootDir>/__tests__/__mocks__/fileMock.js',
  },
};
