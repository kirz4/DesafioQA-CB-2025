// cypress/support/page-objects/BasePage.js

/**
 * Classe base para todos os Page Objects
 * Implementa funcionalidades comuns e padroniza a interface
 */
class BasePage {
  constructor() {
    this.timeout = {
      short: 5000,
      medium: 10000,
      long: 30000
    }
  }

  // 🎯 Common selectors that appear on every page
  get commonElements() {
    return {
      // Header elements
      logo: '[data-testid="logo"]',
      userMenu: '[data-testid="user-menu"]',
      cartIcon: '[data-testid="cart-icon"]',
      cartCounter: '[data-testid="cart-counter"]',
      searchInput: '[data-testid="search-input"]',
      
      // Navigation
      homeNav: '[data-testid="nav-home"]',
      promocoesNav: '[data-testid="nav-promocoes"]',
      vouchersNav: '[data-testid="nav-vouchers"]',
      perfilNav: '[data-testid="nav-perfil"]',
      
      // Loading states
      loadingSpinner: '[data-testid="loading"]',
      loadingOverlay: '.loading-overlay',
      
      // Messages
      successMessage: '[data-testid="success-message"]',
      errorMessage: '[data-testid="error-message"]',
      warningMessage: '[data-testid="warning-message"]',
      
      // Modal/Dialog
      modal: '[data-testid="modal"]',
      modalClose: '[data-testid="modal-close"]',
      modalConfirm: '[data-testid="modal-confirm"]',
      modalCancel: '[data-testid="modal-cancel"]',
      
      // Forms
      submitButton: '[data-testid="submit-button"]',
      cancelButton: '[data-testid="cancel-button"]',
      
      // Footer
      footer: '[data-testid="footer"]'
    }
  }

  // 🔍 Core page validation methods
  isLoaded() {
    cy.log(`📄 Verifying ${this.constructor.name} is loaded`)
    
    // Wait for page to be stable
    cy.waitForPageStable()
    
    // Verify common elements
    cy.get(this.commonElements.logo, { timeout: this.timeout.medium })
      .should('be.visible')
    
    return this
  }

  hasError() {
    return cy.get('body').then(($body) => {
      return $body.find(this.commonElements.errorMessage).length > 0
    })
  }

  // 🎭 Common actions available on all pages
  clickLogo() {
    cy.log('🏠 Clicking logo to go home')
    cy.get(this.commonElements.logo).click()
    cy.waitForPageStable()
    return this
  }

  openUserMenu() {
    cy.log('👤 Opening user menu')
    cy.get(this.commonElements.userMenu).click()
    return this
  }

  openCart() {
    cy.log('🛒 Opening cart')
    cy.get(this.commonElements.cartIcon).click()
    cy.waitForPageStable()
    return this
  }

  search(term) {
    cy.log(`🔍 Searching for: ${term}`)
    cy.get(this.commonElements.searchInput)
      .clear()
      .type(term)
      .type('{enter}')
    cy.waitForPageStable()
    return this
  }

  // 🎯 Navigation methods
  goToHome() {
    cy.log('🏠 Navigating to home')
    cy.get(this.commonElements.homeNav).click()
    cy.waitForPageStable()
    return this
  }

  goToPromocoes() {
    cy.log('🎉 Navigating to promoções')
    cy.get(this.commonElements.promocoesNav).click()
    cy.waitForPageStable()
    return this
  }

  goToVouchers() {
    cy.log('🎫 Navigating to vouchers')
    cy.get(this.commonElements.vouchersNav).click()
    cy.waitForPageStable()
    return this
  }

  goToPerfil() {
    cy.log('👤 Navigating to perfil')
    cy.get(this.commonElements.perfilNav).click()
    cy.waitForPageStable()
    return this
  }

  // ⏱️ Wait methods
  waitForLoading() {
    cy.log('⏱️ Waiting for loading to complete')
    cy.get(this.commonElements.loadingSpinner, { timeout: this.timeout.medium })
      .should('not.exist')
    cy.get(this.commonElements.loadingOverlay, { timeout: this.timeout.short })
      .should('not.exist')
    return this
  }

  waitForModal() {
    cy.log('⏱️ Waiting for modal to appear')
    cy.get(this.commonElements.modal, { timeout: this.timeout.medium })
      .should('be.visible')
    return this
  }

  closeModal() {
    cy.log('❌ Closing modal')
    cy.get(this.commonElements.modalClose).click()
    cy.get(this.commonElements.modal).should('not.exist')
    return this
  }

  // 📝 Message verification methods
  verifySuccessMessage(expectedMessage = null) {
    cy.log(`✅ Verifying success message: ${expectedMessage || 'any'}`)
    const messageElement = cy.get(this.commonElements.successMessage, { timeout: this.timeout.short })
      .should('be.visible')
    
    if (expectedMessage) {
      messageElement.and('contain', expectedMessage)
    }
    
    return this
  }

  verifyErrorMessage(expectedMessage = null) {
    cy.log(`❌ Verifying error message: ${expectedMessage || 'any'}`)
    const messageElement = cy.get(this.commonElements.errorMessage, { timeout: this.timeout.short })
      .should('be.visible')
    
    if (expectedMessage) {
      messageElement.and('contain', expectedMessage)
    }
    
    return this
  }

  verifyWarningMessage(expectedMessage = null) {
    cy.log(`⚠️ Verifying warning message: ${expectedMessage || 'any'}`)
    const messageElement = cy.get(this.commonElements.warningMessage, { timeout: this.timeout.short })
      .should('be.visible')
    
    if (expectedMessage) {
      messageElement.and('contain', expectedMessage)
    }
    
    return this
  }

  // 🛡️ Validation methods
  verifyUrl(expectedUrl) {
    cy.log(`🔗 Verifying URL contains: ${expectedUrl}`)
    cy.url().should('contain', expectedUrl)
    return this
  }

  verifyPageTitle(expectedTitle) {
    cy.log(`📄 Verifying page title: ${expectedTitle}`)
    cy.title().should('contain', expectedTitle)
    return this
  }

  verifyElementExists(selector) {
    cy.log(`🔍 Verifying element exists: ${selector}`)
    cy.get(selector).should('exist')
    return this
  }

  verifyElementVisible(selector) {
    cy.log(`👁️ Verifying element visible: ${selector}`)
    cy.get(selector).should('be.visible')
    return this
  }

  verifyElementNotVisible(selector) {
    cy.log(`🙈 Verifying element not visible: ${selector}`)
    cy.get(selector).should('not.be.visible')
    return this
  }

  verifyElementText(selector, expectedText) {
    cy.log(`📝 Verifying element text: ${selector} = ${expectedText}`)
    cy.get(selector).should('contain', expectedText)
    return this
  }

  // 📊 Cart-specific methods (common across pages)
  verifyCartCount(expectedCount) {
    cy.log(`🛒 Verifying cart count: ${expectedCount}`)
    
    if (expectedCount === 0) {
      cy.get(this.commonElements.cartCounter).should('not.exist')
    } else {
      cy.get(this.commonElements.cartCounter)
        .should('be.visible')
        .and('contain', expectedCount.toString())
    }
    
    return this
  }

  // 📱 Responsive testing helpers
  verifyMobileLayout() {
    cy.log('📱 Verifying mobile layout')
    cy.setMobileViewport()
    
    // Verify mobile-specific elements
    cy.get(this.commonElements.logo).should('be.visible')
    
    return this
  }

  verifyDesktopLayout() {
    cy.log('🖥️ Verifying desktop layout')
    cy.setDesktopViewport()
    
    // Verify desktop-specific elements
    cy.get(this.commonElements.logo).should('be.visible')
    
    return this
  }

  // 🎯 Generic interaction methods
  clickElement(selector) {
    cy.log(`👆 Clicking element: ${selector}`)
    cy.get(selector).click()
    return this
  }

  typeInElement(selector, text) {
    cy.log(`⌨️ Typing in element: ${selector}`)
    cy.get(selector).clear().type(text)
    return this
  }

  selectFromDropdown(selector, value) {
    cy.log(`📋 Selecting from dropdown: ${selector} = ${value}`)
    cy.get(selector).select(value)
    return this
  }

  // 📸 Debug helpers
  takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const screenshotName = `${this.constructor.name}-${name}-${timestamp}`
    cy.screenshot(screenshotName)
    return this
  }

  debugElement(selector) {
    cy.log(`🐛 Debugging element: ${selector}`)
    cy.debugElement(selector)
    return this
  }

  // 🔒 Security helpers
  verifyNoSensitiveDataInUrl() {
    cy.log('🔒 Verifying no sensitive data in URL')
    cy.url().should('not.contain', 'password')
    cy.url().should('not.contain', 'token')
    cy.url().should('not.contain', 'session')
    cy.url().should('not.contain', 'key')
    return this
  }

  // 🚀 Performance helpers
  measurePageLoad() {
    cy.log(`⚡ Measuring page load for ${this.constructor.name}`)
    cy.measurePageLoad(this.constructor.name)
    return this
  }

  // 🔄 Retry helpers
  retryAction(action, maxRetries = 3) {
    cy.log(`🔄 Retrying action with max ${maxRetries} attempts`)
    
    let attempts = 0
    const executeAction = () => {
      attempts++
      try {
        action()
      } catch (error) {
        if (attempts < maxRetries) {
          cy.log(`❌ Attempt ${attempts} failed, retrying...`)
          cy.wait(1000) // Wait 1 second before retry
          executeAction()
        } else {
          throw error
        }
      }
    }
    
    executeAction()
    return this
  }

  // 🎭 Factory method for subclasses
  static create() {
    return new this()
  }
}

export default BasePage