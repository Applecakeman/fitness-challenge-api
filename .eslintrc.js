module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true
    },
    extends: 'eslint:recommended',
    globals: {},
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'brace-style': 'error',
        'block-spacing': 'error'
    }
};
