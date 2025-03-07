module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: {
          // Add specific TypeScript compiler options for tests
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      },
    ],
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  // Ignore compilation errors that might occur in test files
  bail: false,
  // Add module name mapper to handle path aliases
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/shared/$1",
    "^@infrastructure/(.*)$": "<rootDir>/infrastructure/$1",
  },
}
