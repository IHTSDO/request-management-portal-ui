const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.js',
  },
  env: {
    username: 'testuser',
    password: 'password123',
  },
}) 