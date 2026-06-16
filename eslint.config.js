import tseslint from 'typescript-eslint'

export default tseslint.config(
  {ignores: ['dist']},
  ...tseslint.configs.recommended,
  {
    rules: {
      semi: ['error', 'never'],
    },
  },
)
