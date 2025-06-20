import eslint from '@eslint/js';
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,

    // jsdoc.configs["flat/recommended"],

    // eslintPluginPrettierRecommended,

    // pluginPromise.configs["flat/recommended"],

    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
                ecmaFeatures: {
                    modules: true
                }
            },
            // globals: {
            //     ...globals.browser,
            //     ...globals.node,
            //     ...globals.jest
            // }
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            // "simple-import-sort": eslintPluginSimpleImportSort,
            // prettier: eslintPluginPrettier,
            // promise: pluginPromise,
            // jsdoc
        },
        settings: {
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true
                }
            },
            jsdoc: {
                mode: "typescript"
            }
        },

        files: ["**/*.{js,ts,mjs,cjs}"],
        rules: {
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/prefer-optional-chain": "error",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "caughtErrorsIgnorePattern": "^_"
                }
            ],
            // "prettier/prettier": [
            //     "error",
            //     {
            //         printWidth: 120,
            //         trailingComma: "none",
            //         arrowParens: "always",
            //         endOfLine: "auto"
            //     }
            // ],
            "promise/always-return": "off",
            // "simple-import-sort/imports": "error",
            "jsdoc/no-defaults": "off",
            // "jsdoc/require-param": 2,
            // "jsdoc/require-description": [
            //     "error",
            //     {
            //         publicOnly: true,
            //         require: {
            //             FunctionDeclaration: true,
            //             MethodDefinition: false,
            //             ClassDeclaration: true,
            //             ArrowFunctionExpression: true,
            //             FunctionExpression: false
            //         },
            //         contexts: ["any"]
            //     }
            // ],
            // "jsdoc/tag-lines": [
            //     "error",
            //     "any",
            //     {
            //         startLines: 1
            //     }
            // ],
            "no-console": "off",
            curly: "error",
            "object-shorthand": ["error", "always"],
            "no-warning-comments": [
                "warn",
                {
                    terms: ["TODO", "FIXME"],
                    location: "anywhere"
                }
            ],
            "max-depth": [
                "error",
                {
                    max: 3
                }
            ]
        }
    },
    {
        files: ["**/*.test.*"],
        rules: {
            "@typescript-eslint/no-non-null-assertion": "off",
            "no-magic-numbers": "off"
        }
    },
    {
        files: ["**/*.js"],
        rules: {
            "@typescript-eslint/no-var-requires": "off"
        }
    },
    {
        ignores: [
            "sanity/.sanity",
            "quasar/.quasar",
            "**/.eslintrc.js",
            "**/*.config.js",
            "**/*.config.mjs",
            "**/.postcssrc.js",
            "**/dist",
            "**/bin/**/*.js",
            "**/lib/**/*.js",
            "**/src/**/*.js",
            "**/test/**/*.js",
            "**/*.d.ts",
            "**/*.snap",
            "aws/cdk.out"
        ]
    }
)
