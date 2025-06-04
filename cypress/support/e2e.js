/**
 * Arquivo principal de suporte do Cypress
 * Carrega comandos customizados e configurações globais
 */

// Import commands.js
import './commands'

// Import mochawesome reporter
import 'cypress-mochawesome-reporter/register'

// Global configurations
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions from the app
  console.log('Uncaught exception:', err.message)
  return false
})

// Clear cookies and local storage before each test
beforeEach(() => {
  cy.clearCookies()
  cy.clearLocalStorage()
  cy.setDesktopViewport()
})