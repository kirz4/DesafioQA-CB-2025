// cypress/support/page-objects/ProductPage.js

import BasePage from './BasePage'

/**
 * Page Object para página de produto - FLUXO CRÍTICO
 * Implementa o fluxo de adicionar produto ao carrinho
 */
class ProductPage extends BasePage {
  constructor() {
    super()
  }

  // 🎯 Elementos específicos da página de produto
  get elements() {
    return {
      // Product information
      productTitle: '[data-testid="product-title"]',
      productPrice: '[data-testid="product-price"]',
      productDescription: '[data-testid="product-description"]',
      productImage: '[data-testid="product-image"]',
      productRating: '[data-testid="product-rating"]',
      
      // Quantity selector
      quantitySelector: '[data-testid="quantity-selector"]',
      quantityIncrease: '[data-testid="quantity-increase"]',
      quantityDecrease: '[data-testid="quantity-decrease"]',
      quantityInput: '[data-testid="quantity-input"]',
      
      // Customization options
      observationsTextarea: '[data-testid="observations-textarea"]',
      packagingOption: '[data-testid="packaging-option"]',
      
      // Add to cart section
      addToCartButton: '[data-testid="add-to-cart-btn"]',
      totalPrice: '[data-testid="total-price"]',
      
      // Authentication required
      loginRequiredMessage: '[data-testid="login-required-message"]',
      loginPrompt: '[data-testid="login-prompt"]',
      
      // Success/Error states
      addToCartSuccess: '[data-testid="add-cart-success"]',
      addToCartError: '[data-testid="add-cart-error"]',
      
      // Loading states
      addToCartLoading: '[data-testid="add-cart-loading"]',
      priceCalculating: '[data-testid="price-calculating"]',
      
      // Back navigation
      backButton: '[data-testid="back-button"]',
      breadcrumb: '[data-testid="breadcrumb"]'
    }
  }

  // 🔍 Page validation methods
  isLoaded() {
    cy.log('📄 Verifying ProductPage is loaded')
    super.isLoaded()
    
    // Verify product-specific elements
    cy.get(this.elements.productTitle, { timeout: this.timeout.medium })
      .should('be.visible')
    
    cy.get(this.elements.productPrice, { timeout: this.timeout.medium })
      .should('be.visible')
    
    cy.get(this.elements.addToCartButton, { timeout: this.timeout.medium })
      .should('be.visible')
    
    return this
  }

  isProductAvailable() {
    cy.log('✅ Verifying product is available for purchase')
    
    cy.get(this.elements.addToCartButton)
      .should('be.visible')
      .and('not.be.disabled')
      .and('not.have.class', 'unavailable')
    
    return this
  }

  isLoginRequired() {
    cy.log('🔐 Checking if login is required')
    
    return cy.get('body').then(($body) => {
      return $body.find(this.elements.loginRequiredMessage).length > 0
    })
  }

  // 📝 Product information methods
  getProductInfo() {
    cy.log('📊 Getting product information')
    
    const productInfo = {}
    
    cy.get(this.elements.productTitle)
      .invoke('text')
      .then(title => productInfo.title = title.trim())
    
    cy.get(this.elements.productPrice)
      .invoke('text')
      .then(price => productInfo.price = price.trim())
    
    cy.get(this.elements.productDescription)
      .invoke('text')
      .then(description => productInfo.description = description.trim())
    
    return cy.wrap(productInfo)
  }

  verifyProductDetails(expectedProduct) {
    cy.log(`🔍 Verifying product details: ${expectedProduct.title}`)
    
    if (expectedProduct.title) {
      cy.get(this.elements.productTitle)
        .should('contain', expectedProduct.title)
    }
    
    if (expectedProduct.price) {
      cy.get(this.elements.productPrice)
        .should('contain', expectedProduct.price)
    }
    
    if (expectedProduct.description) {
      cy.get(this.elements.productDescription)
        .should('contain', expectedProduct.description)
    }
    
    return this
  }

  // 🔢 Quantity management methods
  setQuantity(quantity) {
    cy.log(`🔢 Setting quantity to: ${quantity}`)
    
    // Clear and type new quantity
    cy.get(this.elements.quantityInput)
      .clear()
      .type(quantity.toString())
      .should('have.value', quantity.toString())
    
    // Wait for price recalculation
    this.waitForPriceUpdate()
    
    return this
  }

  increaseQuantity(times = 1) {
    cy.log(`➕ Increasing quantity ${times} times`)
    
    for (let i = 0; i < times; i++) {
      cy.get(this.elements.quantityIncrease).click()
      cy.wait(500) // Small wait between clicks
    }
    
    this.waitForPriceUpdate()
    return this
  }

  decreaseQuantity(times = 1) {
    cy.log(`➖ Decreasing quantity ${times} times`)
    
    for (let i = 0; i < times; i++) {
      cy.get(this.elements.quantityDecrease).click()
      cy.wait(500) // Small wait between clicks
    }
    
    this.waitForPriceUpdate()
    return this
  }

  getCurrentQuantity() {
    cy.log('📊 Getting current quantity')
    
    return cy.get(this.elements.quantityInput)
      .invoke('val')
      .then(val => parseInt(val))
  }

  // 📝 Customization methods
  addObservations(observations) {
    cy.log(`📝 Adding observations: ${observations}`)
    
    cy.get(this.elements.observationsTextarea)
      .clear()
      .type(observations)
      .should('have.value', observations)
    
    return this
  }

  selectPackaging() {
    cy.log('📦 Selecting packaging option')
    
    cy.get(this.elements.packagingOption)
      .check()
      .should('be.checked')
    
    this.waitForPriceUpdate()
    return this
  }

  // 🛒 Add to cart methods - CORE FUNCTIONALITY
  clickAddToCart() {
    cy.log('🛒 Clicking add to cart button')
    
    // Intercept the add to cart request
    cy.intercept('POST', '**/cart/add**').as('addToCartRequest')
    
    // Ensure button is ready
    cy.get(this.elements.addToCartButton)
      .should('be.visible')
      .and('be.enabled')
      .click()
    
    return this
  }

  waitForAddToCartResponse() {
    cy.log('⏱️ Waiting for add to cart response')
    
    cy.wait('@addToCartRequest', { timeout: this.timeout.medium })
      .then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201])
      })
    
    // Wait for loading to disappear
    cy.get(this.elements.addToCartLoading, { timeout: this.timeout.short })
      .should('not.exist')
    
    return this
  }

  waitForPriceUpdate() {
    cy.log('💰 Waiting for price update')
    
    cy.get(this.elements.priceCalculating, { timeout: this.timeout.short })
      .should('not.exist')
    
    return this
  }

  // 🎯 Complete add to cart flow - MAIN CRITICAL FLOW
  addProductToCart(options = {}) {
    const {
      quantity = 1,
      observations = null,
      includePackaging = false,
      waitForSuccess = true
    } = options

    cy.log(`🎯 Complete add to cart flow - Quantity: ${quantity}`)

    // Verify product is available
    this.isProductAvailable()

    // Set quantity if different from default
    if (quantity !== 1) {
      this.setQuantity(quantity)
    }

    // Add observations if provided
    if (observations) {
      this.addObservations(observations)
    }

    // Select packaging if requested
    if (includePackaging) {
      this.selectPackaging()
    }

    // Add to cart
    this.clickAddToCart()

    if (waitForSuccess) {
      this.waitForAddToCartResponse()
      this.verifyAddToCartSuccess()
    }

    return this
  }

  // ✅ Success/Error validation methods
  verifyAddToCartSuccess() {
    cy.log('✅ Verifying add to cart success')
    
    cy.get(this.elements.addToCartSuccess, { timeout: this.timeout.medium })
      .should('be.visible')
      .and('contain', 'adicionado')
    
    // Verify cart counter updated
    this.verifyCartCount(1) // At least 1 item
    
    return this
  }

  verifyAddToCartError(expectedError = null) {
    cy.log(`❌ Verifying add to cart error: ${expectedError || 'any'}`)
    
    const errorElement = cy.get(this.elements.addToCartError, { timeout: this.timeout.short })
      .should('be.visible')
    
    if (expectedError) {
      errorElement.and('contain', expectedError)
    }
    
    return this
  }

  verifyLoginRequired() {
    cy.log('🔐 Verifying login required message')
    
    cy.get(this.elements.loginRequiredMessage)
      .should('be.visible')
      .and('contain', 'não está logado')
    
    return this
  }

  // 🔄 Navigation methods
  goBack() {
    cy.log('⬅️ Going back to previous page')
    
    cy.get(this.elements.backButton).click()
    this.waitForLoading()
    
    return this
  }

  // 🧪 Test scenario helpers
  addSingleProductToCart() {
    cy.log('🧪 Test scenario: Add single product to cart')
    
    return this.isLoaded()
               .isProductAvailable()
               .addProductToCart({ quantity: 1 })
  }

  addMultipleProductsToCart(quantity) {
    cy.log(`🧪 Test scenario: Add multiple products (${quantity}) to cart`)
    
    return this.isLoaded()
               .isProductAvailable()
               .addProductToCart({ quantity })
  }

  addProductWithObservations(observations) {
    cy.log(`🧪 Test scenario: Add product with observations`)
    
    return this.isLoaded()
               .isProductAvailable()
               .addProductToCart({ 
                 quantity: 1, 
                 observations 
               })
  }

  tryAddToCartWithoutLogin() {
    cy.log('🧪 Test scenario: Try add to cart without login')
    
    return this.isLoaded()
               .clickAddToCart()
               .verifyLoginRequired()
  }

  // 🔧 Edge case testing methods
  testQuantityBoundaries() {
    cy.log('🔧 Testing quantity boundaries')
    
    // Test minimum quantity (1)
    this.setQuantity(1)
    this.getCurrentQuantity().should('eq', 1)
    
    // Test maximum quantity (usually 99)
    this.setQuantity(99)
    this.getCurrentQuantity().should('eq', 99)
    
    // Test invalid quantity (0)
    this.setQuantity(0)
    // Should either prevent or reset to 1
    this.getCurrentQuantity().should('be.gte', 1)
    
    return this
  }

  testInvalidQuantity(invalidQuantity) {
    cy.log(`🔧 Testing invalid quantity: ${invalidQuantity}`)
    
    cy.get(this.elements.quantityInput)
      .clear()
      .type(invalidQuantity.toString())
    
    // Should show error or prevent submission
    this.clickAddToCart()
    
    cy.get('body').then(($body) => {
      if ($body.find(this.elements.addToCartError).length > 0) {
        this.verifyAddToCartError()
      } else {
        // Quantity should be corrected
        this.getCurrentQuantity().should('be.gte', 1)
      }
    })
    
    return this
  }

  // 📱 Mobile-specific methods
  verifyMobileLayout() {
    cy.log('📱 Verifying mobile layout for ProductPage')
    
    cy.setMobileViewport()
    
    // Verify essential elements are visible on mobile
    cy.get(this.elements.productTitle).should('be.visible')
    cy.get(this.elements.productPrice).should('be.visible')
    cy.get(this.elements.addToCartButton).should('be.visible')
    cy.get(this.elements.quantitySelector).should('be.visible')
    
    return this
  }

  // 🎭 Factory methods for different scenarios
  static createForLoggedUser() {
    return new ProductPage()
      .isLoaded()
      .isProductAvailable()
  }

  static createForGuestUser() {
    return new ProductPage()
      .isLoaded()
  }

  static createForUnavailableProduct() {
    return new ProductPage()
      .isLoaded()
  }
}

export default ProductPage