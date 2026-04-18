import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.mjs'],
    fileParallelism: false,
    hookTimeout: 120000,
    testTimeout: 60000,
    pool: 'forks'
  }
})
