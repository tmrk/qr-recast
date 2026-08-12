import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/lib/**/*.js'],
      reporter: ['text', 'html'],
    },
    environment: 'node',
    include: ['tests/**/*.test.js'],
    testTimeout: 10_000,
  },
});
