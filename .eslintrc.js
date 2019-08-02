module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "airbnb-typescript/base",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2018,
    project: "./tsconfig.json",
    sourceType: "module",
  },
  plugins: [
    "functional"
  ],
  rules: {
    "no-var": 2,
    "functional/no-this": 2,
    "functional/no-class": 2,
    //"functional/immutable-data": 1,
    "functional/no-method-signature": 1
  }
};