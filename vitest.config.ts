import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    tags: [
      {
        name: 'slow',
        description: 'Tests that take a long time to complete.',
      },
    ],
  },
});
