import { defineConfig } from 'cypress'

export default defineConfig({
  watchForFileChanges: false,
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    }
  },

  e2e: {
    baseUrl: 'http://localhost:5173/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  }
})
