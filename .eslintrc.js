module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    project: "./tsconfig.json",
    sourceType: "module",
    createDefaultProgram: true,
  },
  extends: [
    "airbnb-typescript/base",
    "prettier",
    "plugin:prettier/recommended",
  ],
  rules: {
    "no-console": "off",
    "no-plusplus": "off",
    "no-continue": "off",
  },
};
