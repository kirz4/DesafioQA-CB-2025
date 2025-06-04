// cypress/support/page-objects/HomePage.js

import BasePage from './BasePage'

/**
 * Page Object para a página inicial do Coco Bambu Delivery
 * Herda funcionalidades comuns da BasePage
 */
class HomePage extends BasePage {
  constructor() {
    super()
    this.url = '/delivery'
  }

  // 🎯 Elementos específicos da página inicial
  get elements() {
    return {
      // Address selection
      addressInput: '[data-testid="address-input"]',
      addressSuggestions: '[data-testid="address-suggestions"]',
      addressButton: '[data-testid="address-button"]',
      locationMap: '[data-testid="location-map"]',
      
      // Restaurant selection
      restaurantCards: '[data-testid="restaurant-card"]',
      restaurantTitle: '[data-testid="restaurant-title"]',
      restaurantDistance: '[data-testid="restaurant-distance"]',
      restaurantRating: '[data-testid="restaurant-rating"]',
      
      // Welcome message
      welcomeMessage: '[data-testid="welcome-message"]',
      locationPrompt: '[data-testid="location-prompt"]',
      
      // Delivery options
      deliveryTab: '[data-testid="delivery-tab"]',
      pickupTab: '[data-testid="pickup-tab"]',
      
      // Restaurant features
      restaurantImage: '[data-testid="restaurant-image"]',
      deliveryTime: '[data-testid="delivery-time"]',
      minimumOrder: '[data-testid="minimum-order"]',
      deliveryFee: '[data-testid="delivery-fee"]',
      
      // Error states
      noAddressError: '[data-testid="no-address-error"]',
      noRestaurantsError: '[data-testid="no-restaurants-error"]',
      locationDeniedError: '[data-testid="location-denied-error"]',
      
      // Loading states
      addressLoading: '[data-testid="address-loading"]',
      restaurantsLoading: '[data-testid="restaurants-loading"]'
    }
  }

  // 🏠 Navigation methods
  visit() {
    cy.log('🏠 Visiting HomePage')
    cy.visit(this.url)
    return this.isLoaded()
  }

  isLoaded() {
    cy.log('📄 Verifying HomePage is loaded')
    super.isLoaded()
    
    // Verify page-specific elements
    cy.get(this.elements.welcomeMessage, { timeout: this.timeout.medium })
      .should('be.visible')
    
    return this
  }

  // 📍 Address management methods
  enterAddress(address) {
    cy.log(`📍 Entering address: ${address}`)
    
    cy.get(this.elements.addressInput)
      .should('be.visible')
      .clear()
      .type(address)
    
    // Wait for suggestions to appear
    cy.get(this.elements.addressSuggestions, { timeout: this.timeout.medium })
      .should('be.visible')
    
    return this
  }

  selectFirstAddressSuggestion() {
    cy.log('📍 Selecting first address suggestion')
    
    cy.get(this.elements.addressSuggestions)
      .should('be.visible')
      .find('[data-testid="address-suggestion-item"]')
      .first()
      .click()
    
    this.waitForLoading()
    return this
  }

  selectAddressSuggestion(index) {
    cy.log(`📍 Selecting address suggestion at index: ${index}`)
    
    cy.get(this.elements.addressSuggestions)
      .find('[data-testid="address-suggestion-item"]')
      .eq(index)
      .click()
    
    this.waitForLoading()
    return this
  }

  confirmAddress() {
    cy.log('✅ Confirming address selection')
    
    cy.get(this.elements.addressButton)
      .should('be.visible')
      .and('be.enabled')
      .click()
    
    this.waitForLoading()
    return this
  }

  // 🏪 Restaurant selection methods
  verifyRestaurantsLoaded() {
    cy.log('🏪 Verifying restaurants are loaded')
    
    cy.get(this.elements.restaurantsLoading, { timeout: this.timeout.short })
      .should('not.exist')
    
    cy.get(this.elements.restaurantCards, { timeout: this.timeout.medium })
      .should('have.length.greaterThan', 0)
    
    return this
  }

  selectRestaurant(restaurantName) {
    cy.log(`🏪 Selecting restaurant: ${restaurantName}`)
    
    cy.get(this.elements.restaurantCards)
      .contains('[data-testid="restaurant-title"]', restaurantName)
      .closest('[data-testid="restaurant-card"]')
      .click()
    
    this.waitForLoading()
    return this
  }

  selectFirstRestaurant() {
    cy.log('🏪 Selecting first available restaurant')
    
    cy.get(this.elements.restaurantCards)
      .first()
      .click()
    
    this.waitForLoading()
    return this
  }

  getRestaurantInfo(index = 0) {
    cy.log(`📊 Getting restaurant info for index: ${index}`)
    
    const restaurantCard = cy.get(this.elements.restaurantCards).eq(index)
    
    const info = {}
    
    restaurantCard.find(this.elements.restaurantTitle)
      .invoke('text')
      .then(title => info.title = title.trim())
    
    restaurantCard.find(this.elements.restaurantDistance)
      .invoke('text')
      .then(distance => info.distance = distance.trim())
    
    restaurantCard.find(this.elements.deliveryTime)
      .invoke('text')
      .then(time => info.deliveryTime = time.trim())
    
    return cy.wrap(info)
  }

  // 🚚 Delivery option methods
  selectDeliveryOption() {
    cy.log('🚚 Selecting delivery option')
    
    cy.get(this.elements.deliveryTab)
      .should('be.visible')
      .click()
    
    return this
  }

  selectPickupOption() {
    cy.log('🏃 Selecting pickup option')
    
    cy.get(this.elements.pickupTab)
      .should('be.visible')
      .click()
    
    return this
  }

  // 🔍 Validation methods specific to HomePage
  verifyAddressSet(expectedAddress) {
    cy.log(`🔍 Verifying address is set: ${expectedAddress}`)
    
    cy.get(this.elements.addressInput)
      .should('have.value', expectedAddress)
    
    return this
  }

  verifyRestaurantDetails(restaurantName) {
    cy.log(`🔍 Verifying restaurant details for: ${restaurantName}`)
    
    const restaurantCard = cy.get(this.elements.restaurantCards)
      .contains('[data-testid="restaurant-title"]', restaurantName)
      .closest('[data-testid="restaurant-card"]')
    
    // Verify essential information is present
    restaurantCard.find(this.elements.restaurantTitle)
      .should('be.visible')
      .and('contain', restaurantName)
    
    restaurantCard.find(this.elements.deliveryTime)
      .should('be.visible')
    
    restaurantCard.find(this.elements.restaurantDistance)
      .should('be.visible')
    
    return this
  }

  verifyNoAddressError() {
    cy.log('❌ Verifying no address error is displayed')
    
    cy.get(this.elements.noAddressError)
      .should('be.visible')
      .and('contain', 'endereço')
    
    return this
  }

  verifyNoRestaurantsAvailable() {
    cy.log('❌ Verifying no restaurants available message')
    
    cy.get(this.elements.noRestaurantsError)
      .should('be.visible')
      .and('contain', 'não entregamos')
    
    return this
  }

  // 🎭 Complete flow methods
  completeAddressSelection(address) {
    cy.log(`🎯 Complete address selection flow: ${address}`)
    
    return this.enterAddress(address)
               .selectFirstAddressSuggestion()
               .confirmAddress()
               .verifyRestaurantsLoaded()
  }

  selectRestaurantAndProceed(restaurantName = null) {
    cy.log(`🎯 Select restaurant and proceed: ${restaurantName || 'first available'}`)
    
    if (restaurantName) {
      this.selectRestaurant(restaurantName)
    } else {
      this.selectFirstRestaurant()
    }
    
    // Verify we're on the restaurant menu page
    cy.url().should('not.contain', '/delivery')
    this.waitForLoading()
    
    return this
  }

  // 🧪 Test scenario helpers
  setupValidDeliveryScenario(address = 'SHIS QI 23 Ch. 4, 19 - Lago Sul, Brasília - DF') {
    cy.log('🧪 Setting up valid delivery scenario')
    
    return this.visit()
               .completeAddressSelection(address)
               .selectDeliveryOption()
  }

  setupPickupScenario(address = 'SHIS QI 23 Ch. 4, 19 - Lago Sul, Brasília - DF') {
    cy.log('🧪 Setting up pickup scenario')
    
    return this.visit()
               .completeAddressSelection(address)
               .selectPickupOption()
  }

  setupNoAddressScenario() {
    cy.log('🧪 Setting up no address scenario')
    
    return this.visit()
               .verifyNoAddressError()
  }

  // 📱 Mobile-specific methods
  verifyMobileAddressInput() {
    cy.log('📱 Verifying mobile address input')
    
    cy.setMobileViewport()
    
    cy.get(this.elements.addressInput)
      .should('be.visible')
      .and('have.css', 'width')
    
    return this
  }

  // 🔧 Accessibility testing
  verifyAccessibility() {
    cy.log('♿ Verifying HomePage accessibility')
    
    // Check for essential accessibility attributes
    cy.get(this.elements.addressInput)
      .shouldBeAccessible()
    
    cy.get(this.elements.restaurantCards)
      .each(($card) => {
        cy.wrap($card).shouldBeAccessible()
      })
    
    return this
  }

  // 🎯 Factory methods for different scenarios
  static createForNewUser() {
    return new HomePage().visit()
  }

  static createWithValidAddress(address) {
    return new HomePage()
      .visit()
      .completeAddressSelection(address)
  }

  static createForPickupFlow(address) {
    return new HomePage()
      .setupPickupScenario(address)
  }
}

export default HomePage