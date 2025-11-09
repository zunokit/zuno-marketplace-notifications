const path = require('path')
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: path.resolve(__dirname, '../../'),
})

const customJestConfig = {
  rootDir: '../../',
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/app/**/*.{js,jsx,ts,tsx}', // Exclude Next.js app directory
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],
}

module.exports = createJestConfig(customJestConfig)
