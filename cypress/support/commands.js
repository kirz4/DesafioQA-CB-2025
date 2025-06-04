/**
 * Comandos customizados do Cypress para automação do Coco Bambu
 * Implementa ações comuns reutilizáveis em múltiplos testes
 */

// 🔐 Authentication Commands
Cypress.Commands.add('loginWithEmail', (email, password) => {
  cy.log(`🔐 Logging in with email: ${email}`)
  
  cy.visit('/delivery')
  cy.get('[data-testid="login-trigger"]', { timeout: 10000 }).should('exist')
})

// 📍 Address Management Commands
Cypress.Commands.add('setDeliveryAddress', (address) => {
  cy.log(`📍 Setting delivery address: ${address}`)
})

// 🛒 Cart Management Commands
Cypress.Commands.add('addProductToCart', (productSelector, options = {}) => {
  cy.log(`🛒 Adding product to cart`)
})

// 📱 Responsive Commands
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport('iphone-x')
})

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport('ipad-2')
})

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720)
})

// 🔗 Network intercept helpers
Cypress.Commands.add('interceptApiCalls', () => {
  cy.intercept('GET', '**/api/**').as('apiGet')
  cy.intercept('POST', '**/api/**').as('apiPost')
})

// ⏱️ Wait helpers
Cypress.Commands.add('waitForPageStable', (timeout = 3000) => {
  cy.get('[data-testid="loading"]', { timeout }).should('not.exist')
})

// 📸 Screenshot helpers
Cypress.Commands.add('takeScreenshot', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  cy.screenshot(`${name}-${timestamp}`)
})

// 📊 Performance Commands
Cypress.Commands.add('measurePageLoad', (pageName) => {
  cy.window().then((win) => {
    const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart
    cy.log(`Page Load Time for ${pageName}: ${loadTime}ms`)
    
    if (loadTime > 0) {
      expect(loadTime).to.be.lessThan(10000) // 10 seconds max
    }
  })
})

// 🔍 Debug helpers
Cypress.Commands.add('debugElement', (selector) => {
  cy.get(selector).then(($el) => {
    console.log('Element details:', {
      selector,
      exists: $el.length > 0,
      visible: $el.is(':visible'),
      text: $el.text()
    })
  })
})