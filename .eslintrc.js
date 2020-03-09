module.exports = {
  ignorePatterns: [
    '*.d.ts'
  ],
  extends: [
    'airbnb-typescript/base'
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  rules: {
    'consistent-return': 'off',
    'no-restricted-syntax': 'off'
  }
};
