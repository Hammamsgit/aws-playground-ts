process.env.TZ = 'UTC'

module.exports = {
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*', '<rootDir>/cdk/**/*'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/stubs',
    '<rootDir>/src/shims',
    '<rootDir>/src/types',
    '<rootDir>/src/configuration/secrets.ts',
  ],
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
}
