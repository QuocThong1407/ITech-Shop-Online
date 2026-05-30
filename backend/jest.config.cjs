module.exports = {
  testEnvironment: "node",
  clearMocks: true,
  restoreMocks: true,
  setupFiles: ["<rootDir>/tests/jest.setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^uuid$": "<rootDir>/tests/mocks/uuid.js",
  },
};
