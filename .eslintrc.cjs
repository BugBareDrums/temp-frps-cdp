/**
 * @type {ESLint.ConfigData}
 */
module.exports = {
  ignorePatterns: ['.server', '.public', 'src/__fixtures__', 'coverage'],
  overrides: [
    {
      extends: [
        'standard',
        'plugin:import/recommended',
        'plugin:n/recommended',
        'plugin:promise/recommended',
        'prettier'
      ],
      env: {
        browser: false
      },
      files: ['**/*.{cjs,js}'],
      parserOptions: {
        ecmaVersion: 'latest'
      },
      plugins: ['import', 'jsdoc', 'n', 'promise', 'prettier'],
      rules: {
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto'
          }
        ],
        'no-console': 'error',

        // JSDoc blocks are optional by default
        'jsdoc/require-jsdoc': 'off',

        // JSDoc @param types are mandatory for JavaScript
        'jsdoc/require-param-description': 'off',
        'jsdoc/require-param-type': 'error',
        'jsdoc/require-param': 'off',

        // JSDoc @property description is optional
        'jsdoc/require-property-description': 'off',

        // JSDoc @returns is optional
        'jsdoc/require-returns-description': 'off',
        'jsdoc/require-returns-type': 'off',
        'jsdoc/require-returns': 'off',

        // Check for mandatory file extensions
        // https://nodejs.org/api/esm.html#mandatory-file-extensions
        'import/extensions': ['error', 'always', { ignorePackages: true }],

        // Skip rules handled by TypeScript compiler
        'import/default': 'off',
        'import/namespace': 'off',
        'n/no-extraneous-require': 'off',
        'n/no-extraneous-import': 'off',
        'n/no-missing-require': 'off',
        'n/no-missing-import': 'off'
      },
      settings: {
        'import/resolver': {
          'babel-module': {},
          node: true
        }
      }
    },
    {
      files: ['**/*.js'],
      parserOptions: {
        sourceType: 'module'
      }
    },
    {
      env: {
        commonjs: true
      },
      files: ['**/*.cjs'],
      parserOptions: {
        sourceType: 'commonjs'
      },
      rules: {
        // Allow require devDependencies
        'n/no-unpublished-require': [
          'error',
          {
            allowModules: []
          }
        ]
      }
    },
    {
      env: {
        browser: true,
        node: false
      },
      files: ['src/client/**/*.js']
    },
    {
      env: {
        'jest/globals': true
      },
      extends: [
        'plugin:jest-formatting/recommended',
        'plugin:jest/recommended',
        'plugin:jest/style'
      ],
      files: ['**/*.test.{cjs,js}', '**/__mocks__/**'],
      plugins: ['jest'],
      rules: {
        // Allow import devDependencies
        'n/no-unpublished-import': [
          'error',
          {
            allowModules: []
          }
        ]
      }
    }
  ],
  root: true
}

/**
 * @import { ESLint } from 'eslint'
 */
