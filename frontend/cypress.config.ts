import { defineConfig } from 'cypress'

export default defineConfig({
  watchForFileChanges: false,
  defaultCommandTimeout: 10000,
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    }
  },

  e2e: {
    baseUrl: 'http://localhost:5173/'
  }
})
