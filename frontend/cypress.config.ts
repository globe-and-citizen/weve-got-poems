import { defineConfig } from 'cypress'
// export default defineConfig({
// })
export default defineConfig({
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
  e2e: {
    baseUrl: 'http://localhost:1234',
  },
})