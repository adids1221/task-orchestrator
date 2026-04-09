module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/lib", "<rootDir>/app"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
