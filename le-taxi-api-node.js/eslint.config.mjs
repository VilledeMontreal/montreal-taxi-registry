import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    "**/.*",
    "node_modules",
    "test",
    "output",
    "dist",
    "temp",
    "test-*",
    "log",
    "html",
    "generators/app/templates/",
    "generated",
    "**/Jenkinsfile",
    "**/package.json",
    "**/package-lock.json",
    "**/yarn.lock",
    "**/README.md",
    "**/license",
    "**/*.map",
    "**/*.yaml",
    "**/*.hbs",
    "**/*.txt",
    "**/*.js",
  ]),
  {
    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "prettier"
    ),

    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "commonjs",

      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
        es6: true,
      },
    },

    rules: {
      "prettier/prettier": "error",
      eqeqeq: "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-ternary": "off",

      "@typescript-eslint/restrict-template-expressions": [
        "off",
        {
          allowAny: true,
        },
      ],

      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/restrict-plus-operands": "off",

      "@typescript-eslint/ban-types": [
        "off",
        {
          types: {
            "{}": true,
          },

          extendDefaults: true,
        },
      ],

      "no-async-promise-executor": "off",
      "no-prototype-builtins": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
    },
  },
]);
