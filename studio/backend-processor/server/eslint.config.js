const js  = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      }
    },
    rules: {
      "no-console": "warn",
      indent: ["error", 2],
      semi: ['error', 'always'],
      "no-unused-vars": "error",
      "no-ex-assign": "off"
    }
  }
];