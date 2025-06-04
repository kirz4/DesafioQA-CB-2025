// Importando a classe BasePage para herança
import BasePage from './BasePage'

/**
 * Page Object para a página de checkout - FLUXO CRÍTICO FINAL
 * Implementa o processo completo de finalização de compra
 */
class CheckoutPage extends BasePage {
  constructor() {
    super()
    this.url = '/checkout'
  }

  // 💳 Elementos específicos da página de checkout
  get elements() {
    return {
      // Main containers
      checkoutContainer: '[data-testid="checkout-container"]',
      checkoutSteps: '[data-testid="checkout-steps"]',
      
      // Step indicators
      stepIndicator: '[data-testid="step-indicator"]',
      stepDelivery: '[data-testid="step-delivery"]',
      stepPayment: '[data-testid="step-payment"]',
      stepConfirmation: '[data-testid="step-confirmation"]',
      
      // Delivery section
      deliverySection: '[data-testid="delivery-section"]',
      deliveryAddressCard: '[data-testid="delivery-address-card"]',
      deliveryAddress: '[data-testid="delivery-address"]',
      deliveryInstructions: '[data-testid="delivery-instructions"]',
      changeAddressButton: '[data-testid="change-address-checkout"]',
      addInstructionsButton: '[data-testid="add-instructions"]',
      instructionsTextarea: '[data-testid="instructions-textarea"]',
      
      // Delivery options
      deliveryOptionsSection: '[data-testid="delivery-options"]',
      deliveryOption: '[data-testid="delivery-option"]',
      pickupOption: '[data-testid="pickup-option"]',
      deliveryTimeSelect: '[data-testid="delivery-time-select"]',
      deliveryFeeInfo: '[data-testid="delivery-fee-info"]',
      
      // Contact information
      contactSection: '[data-testid="contact-section"]',
      contactName: '[data-testid="contact-name"]',
      contactPhone: '[data-testid="contact-phone"]',
      contactEmail: '[data-testid="contact-email"]',
      editContactButton: '[data-testid="edit-contact"]',
      
      // Order summary
      orderSummarySection: '[data-testid="order-summary"]',
      orderItems: '[data-testid="order-items"]',
      orderItem: '[data-testid="order-item"]',
      itemName: '[data-testid="item-name"]',
      itemQuantity: '[data-testid="item-quantity"]',
      itemPrice: '[data-testid="item-price"]',
      itemObservations: '[data-testid="item-observations"]',
      
      // Pricing breakdown
      pricingSection: '[data-testid="pricing-section"]',
      subtotalAmount: '[data-testid="subtotal-amount"]',
      deliveryFeeAmount: '[data-testid="delivery-fee-amount"]',
      serviceFeeAmount: '[data-testid="service-fee-amount"]',
      discountAmount: '[data-testid="discount-amount"]',
      totalAmount: '[data-testid="total-amount"]',
      
      // Payment section
      paymentSection: '[data-testid="payment-section"]',
      paymentMethods: '[data-testid="payment-methods"]',
      
      // Payment options
      paymentCash: '[data-testid="payment-cash"]',
      paymentCard: '[data-testid="payment-card"]',
      paymentPix: '[data-testid="payment-pix"]',
      paymentVoucher: '[data-testid="payment-voucher"]',
      
      // Cash payment
      cashSection: '[data-testid="cash-section"]',
      needChangeCheckbox: '[data-testid="need-change"]',
      changeForInput: '[data-testid="change-for-input"]',
      changeAmount: '[data-testid="change-amount"]',
      
      // Card payment
      cardSection: '[data-testid="card-section"]',
      savedCards: '[data-testid="saved-cards"]',
      newCardOption: '[data-testid="new-card-option"]',
      cardNumberInput: '[data-testid="card-number"]',
      cardNameInput: '[data-testid="card-name"]',
      cardExpiryInput: '[data-testid="card-expiry"]',
      cardCvvInput: '[data-testid="card-cvv"]',
      saveCardCheckbox: '[data-testid="save-card"]',
      
      // PIX payment
      pixSection: '[data-testid="pix-section"]',
      pixQrCode: '[data-testid="pix-qr-code"]',
      pixCode: '[data-testid="pix-code"]',
      copyPixButton: '[data-testid="copy-pix"]',
      
      // Terms and conditions
      termsSection: '[data-testid="terms-section"]',
      termsCheckbox: '[data-testid="terms-checkbox"]',
      termsLink: '[data-testid="terms-link"]',
      privacyLink: '[data-testid="privacy-link"]',
      
      // Action buttons
      backToCartButton: '[data-testid="back-to-cart"]',
      continueButton: '[data-testid="continue-button"]',
      placeOrderButton: '[data-testid="place-order"]',
      
      // Loading and success states
      checkoutLoading: '[data-testid="checkout-loading"]',
      orderProcessing: '[data-testid="order-processing"]',
      orderSuccess: '[data-testid="order-success"]',
      orderNumber: '[data-testid="order-number"]',
      estimatedDelivery: '[data-testid="estimated-delivery"]',
      
      // Error states
      checkoutError: '[data-testid="checkout-error"]',
      paymentError: '[data-testid="payment-error"]',
      addressError: '[data-testid="address-error"]',
      validationError: '[data-testid="validation-error"]'
    }
  }

  // 🔍 Page validation methods
  isLoaded() {
    cy.log('📄 Verifying CheckoutPage is loaded')
    super.isLoaded()
    
    cy.get(this.elements.checkoutContainer, { timeout: this.timeout.medium })
      .should('be.visible')
    
    cy.get(this.elements.orderSummarySection, { timeout: this.timeout.medium })
      .should('be.visible')
    
    return this
  }

  isOnStep(stepName) {
    cy.log(`🔍 Verifying current step: ${stepName}`)
    
    cy.get(this.elements.stepIndicator)
      .should('contain', stepName)
      .and('have.class', 'active')
    
    return this
  }

  // 📍 Delivery methods
  verifyDeliveryAddress(expectedAddress) {
    cy.log(`📍 Verifying delivery address: ${expectedAddress}`)
    
    cy.get(this.elements.deliveryAddress)
      .should('be.visible')
      .and('contain', expectedAddress)
    
    return this
  }

  changeDeliveryAddress() {
    cy.log('📍 Changing delivery address')
    
    cy.get(this.elements.changeAddressButton).click()
    this.waitForLoading()
    
    return this
  }

  addDeliveryInstructions(instructions) {
    cy.log(`📝 Adding delivery instructions: ${instructions}`)
    
    cy.get(this.elements.addInstructionsButton).click()
    
    cy.get(this.elements.instructionsTextarea)
      .should('be.visible')
      .clear()
      .type(instructions)
      .should('have.value', instructions)
    
    return this
  }

  selectDeliveryOption() {
    cy.log('🚚 Selecting delivery option')
    
    cy.get(this.elements.deliveryOption)
      .should('be.visible')
      .click()
    
    return this
  }

  selectPickupOption() {
    cy.log('🏃 Selecting pickup option')
    
    cy.get(this.elements.pickupOption)
      .should('be.visible')
      .click()
    
    return this
  }

  selectDeliveryTime(timeSlot) {
    cy.log(`⏰ Selecting delivery time: ${timeSlot}`)
    
    cy.get(this.elements.deliveryTimeSelect)
      .select(timeSlot)
      .should('have.value', timeSlot)
    
    return this
  }

  // 👤 Contact information methods
  verifyContactInfo(expectedContact) {
    cy.log('👤 Verifying contact information')
    
    if (expectedContact.name) {
      cy.get(this.elements.contactName)
        .should('contain', expectedContact.name)
    }
    
    if (expectedContact.phone) {
      cy.get(this.elements.contactPhone)
        .should('contain', expectedContact.phone)
    }
    
    if (expectedContact.email) {
      cy.get(this.elements.contactEmail)
        .should('contain', expectedContact.email)
    }
    
    return this
  }

  editContactInfo(contactInfo) {
    cy.log('👤 Editing contact information')
    
    cy.get(this.elements.editContactButton).click()
    
    if (contactInfo.name) {
      cy.get(this.elements.contactName)
        .clear()
        .type(contactInfo.name)
    }
    
    if (contactInfo.phone) {
      cy.get(this.elements.contactPhone)
        .clear()
        .type(contactInfo.phone)
    }
    
    if (contactInfo.email) {
      cy.get(this.elements.contactEmail)
        .clear()
        .type(contactInfo.email)
    }
    
    return this
  }

  // 📊 Order summary methods
  verifyOrderItems(expectedItems) {
    cy.log('📊 Verifying order items')
    
    cy.get(this.elements.orderItems)
      .should('be.visible')
    
    cy.get(this.elements.orderItem)
      .should('have.length', expectedItems.length)
    
    expectedItems.forEach((item, index) => {
      const orderItem = cy.get(this.elements.orderItem).eq(index)
      
      if (item.name) {
        orderItem.find(this.elements.itemName)
          .should('contain', item.name)
      }
      
      if (item.quantity) {
        orderItem.find(this.elements.itemQuantity)
          .should('contain', item.quantity)
      }
      
      if (item.price) {
        orderItem.find(this.elements.itemPrice)
          .should('contain', item.price)
      }
    })
    
    return this
  }

  verifyPricingBreakdown(expectedPricing) {
    cy.log('💰 Verifying pricing breakdown')
    
    if (expectedPricing.subtotal) {
      cy.get(this.elements.subtotalAmount)
        .should('contain', expectedPricing.subtotal)
    }
    
    if (expectedPricing.deliveryFee) {
      cy.get(this.elements.deliveryFeeAmount)
        .should('contain', expectedPricing.deliveryFee)
    }
    
    if (expectedPricing.serviceFee) {
      cy.get(this.elements.serviceFeeAmount)
        .should('contain', expectedPricing.serviceFee)
    }
    
    if (expectedPricing.discount) {
      cy.get(this.elements.discountAmount)
        .should('contain', expectedPricing.discount)
    }
    
    if (expectedPricing.total) {
      cy.get(this.elements.totalAmount)
        .should('contain', expectedPricing.total)
    }
    
    return this
  }

  getTotalAmount() {
    cy.log('💰 Getting total amount')
    
    return cy.get(this.elements.totalAmount)
      .invoke('text')
      .then(text => {
        const total = text.replace(/[^\d.,]/g, '').replace(',', '.')
        return parseFloat(total)
      })
  }

  // 💳 Payment methods
  selectPaymentMethod(method) {
    cy.log(`💳 Selecting payment method: ${method}`)
    
    const paymentSelector = this.elements[`payment${method.charAt(0).toUpperCase() + method.slice(1)}`]
    
    cy.get(paymentSelector)
      .should('be.visible')
      .click()
    
    // Wait for payment section to load
    this.waitForLoading()
    
    return this
  }

  // 💵 Cash payment methods
  setupCashPayment(options = {}) {
    cy.log('💵 Setting up cash payment')
    
    this.selectPaymentMethod('cash')
    
    if (options.needChange) {
      cy.get(this.elements.needChangeCheckbox)
        .check()
        .should('be.checked')
      
      if (options.changeFor) {
        cy.get(this.elements.changeForInput)
          .clear()
          .type(options.changeFor.toString())
          .should('have.value', options.changeFor.toString())
      }
    }
    
    return this
  }

  verifyChangeAmount(expectedChange) {
    cy.log(`💵 Verifying change amount: ${expectedChange}`)
    
    cy.get(this.elements.changeAmount)
      .should('be.visible')
      .and('contain', expectedChange)
    
    return this
  }

  // 💳 Card payment methods
  setupCardPayment(cardInfo) {
    cy.log('💳 Setting up card payment')
    
    this.selectPaymentMethod('card')
    
    // Check if using saved card or new card
    if (cardInfo.useSaved) {
      cy.get(this.elements.savedCards)
        .find(`[data-card-id="${cardInfo.cardId}"]`)
        .click()
    } else {
      cy.get(this.elements.newCardOption).click()
      
      // Fill new card details
      cy.get(this.elements.cardNumberInput)
        .clear()
        .type(cardInfo.number)
        .should('have.value', cardInfo.number)
      
      cy.get(this.elements.cardNameInput)
        .clear()
        .type(cardInfo.name)
        .should('have.value', cardInfo.name)
      
      cy.get(this.elements.cardExpiryInput)
        .clear()
        .type(cardInfo.expiry)
        .should('have.value', cardInfo.expiry)
      
      cy.get(this.elements.cardCvvInput)
        .clear()
        .type(cardInfo.cvv)
        .should('have.value', cardInfo.cvv)
      
      if (cardInfo.saveCard) {
        cy.get(this.elements.saveCardCheckbox)
          .check()
          .should('be.checked')
      }
    }
    
    return this
  }

  // 📱 PIX payment methods
  setupPixPayment() {
    cy.log('📱 Setting up PIX payment')
    
    this.selectPaymentMethod('pix')
    
    // Wait for QR code to generate
    cy.get(this.elements.pixQrCode, { timeout: this.timeout.medium })
      .should('be.visible')
    
    cy.get(this.elements.pixCode)
      .should('be.visible')
      .and('not.be.empty')
    
    return this
  }

  copyPixCode() {
    cy.log('📱 Copying PIX code')
    
    cy.get(this.elements.copyPixButton).click()
    
    // Verify copy feedback
    cy.get(this.elements.copyPixButton)
      .should('contain', 'Copiado')
    
    return this
  }

  // 🎫 Voucher payment methods
  setupVoucherPayment(voucherCode) {
    cy.log(`🎫 Setting up voucher payment: ${voucherCode}`)
    
    this.selectPaymentMethod('voucher')
    
    // Implementation depends on voucher system
    // This is a placeholder for voucher-specific logic
    
    return this
  }

  // 📜 Terms and conditions
  acceptTerms() {
    cy.log('📜 Accepting terms and conditions')
    
    cy.get(this.elements.termsCheckbox)
      .check()
      .should('be.checked')
    
    return this
  }

  viewTerms() {
    cy.log('📜 Viewing terms and conditions')
    
    cy.get(this.elements.termsLink).click()
    // Handle terms modal or new tab
    
    return this
  }

  // 🎯 Navigation and completion methods
  backToCart() {
    cy.log('🔙 Going back to cart')
    
    cy.get(this.elements.backToCartButton).click()
    this.waitForLoading()
    
    return this
  }

  continueToNextStep() {
    cy.log('➡️ Continuing to next step')
    
    cy.get(this.elements.continueButton)
      .should('be.visible')
      .and('be.enabled')
      .click()
    
    this.waitForLoading()
    
    return this
  }

  placeOrder() {
    cy.log('🛒 Placing order')
    
    // Intercept order placement request
    cy.intercept('POST', '**/orders/create**').as('placeOrderRequest')
    
    cy.get(this.elements.placeOrderButton)
      .should('be.visible')
      .and('be.enabled')
      .click()
    
    // Wait for order processing
    cy.get(this.elements.orderProcessing, { timeout: this.timeout.short })
      .should('be.visible')
    
    cy.wait('@placeOrderRequest', { timeout: this.timeout.long })
      .then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201])
      })
    
    return this
  }

  // ✅ Order completion validation
  verifyOrderSuccess() {
    cy.log('✅ Verifying order success')
    
    cy.get(this.elements.orderSuccess, { timeout: this.timeout.medium })
      .should('be.visible')
    
    cy.get(this.elements.orderNumber)
      .should('be.visible')
      .and('not.be.empty')
    
    cy.get(this.elements.estimatedDelivery)
      .should('be.visible')
    
    cy.url().should('contain', 'success')
    
    return this
  }

  getOrderNumber() {
    cy.log('📊 Getting order number')
    
    return cy.get(this.elements.orderNumber)
      .invoke('text')
      .then(text => text.trim())
  }

  getEstimatedDelivery() {
    cy.log('📊 Getting estimated delivery time')
    
    return cy.get(this.elements.estimatedDelivery)
      .invoke('text')
      .then(text => text.trim())
  }

  // ❌ Error handling methods
  verifyCheckoutError(expectedError = null) {
    cy.log(`❌ Verifying checkout error: ${expectedError || 'any'}`)
    
    const errorElement = cy.get(this.elements.checkoutError)
      .should('be.visible')
    
    if (expectedError) {
      errorElement.and('contain', expectedError)
    }
    
    return this
  }

  verifyPaymentError(expectedError = null) {
    cy.log(`❌ Verifying payment error: ${expectedError || 'any'}`)
    
    const errorElement = cy.get(this.elements.paymentError)
      .should('be.visible')
    
    if (expectedError) {
      errorElement.and('contain', expectedError)
    }
    
    return this
  }

  verifyValidationError(field, expectedError) {
    cy.log(`❌ Verifying validation error for ${field}: ${expectedError}`)
    
    cy.get(this.elements.validationError)
      .should('be.visible')
      .and('contain', expectedError)
    
    return this
  }

  // 🎭 Complete checkout flows
  completeDeliveryStep(deliveryInfo = {}) {
    cy.log('🎭 Completing delivery step')
    
    const {
      instructions = null,
      timeSlot = null,
      contactInfo = null
    } = deliveryInfo
    
    // Add instructions if provided
    if (instructions) {
      this.addDeliveryInstructions(instructions)
    }
    
    // Select time slot if provided
    if (timeSlot) {
      this.selectDeliveryTime(timeSlot)
    }
    
    // Edit contact info if provided
    if (contactInfo) {
      this.editContactInfo(contactInfo)
    }
    
    this.continueToNextStep()
    
    return this
  }

  completePaymentStep(paymentInfo) {
    cy.log('🎭 Completing payment step')
    
    const { method, ...paymentDetails } = paymentInfo
    
    switch (method) {
      case 'cash':
        this.setupCashPayment(paymentDetails)
        break
      case 'card':
        this.setupCardPayment(paymentDetails)
        break
      case 'pix':
        this.setupPixPayment()
        break
      case 'voucher':
        this.setupVoucherPayment(paymentDetails.code)
        break
      default:
        throw new Error(`Unsupported payment method: ${method}`)
    }
    
    this.acceptTerms()
    this.continueToNextStep()
    
    return this
  }

  completeEntireCheckout(checkoutInfo) {
    cy.log('🎭 Completing entire checkout process')
    
    const {
      delivery = {},
      payment,
      skipValidation = false
    } = checkoutInfo
    
    // Step 1: Complete delivery
    this.completeDeliveryStep(delivery)
    
    // Step 2: Complete payment
    this.completePaymentStep(payment)
    
    // Step 3: Place order
    this.placeOrder()
    
    // Step 4: Verify success (unless skipped)
    if (!skipValidation) {
      this.verifyOrderSuccess()
    }
    
    return this
  }

  // 🧪 Test scenario helpers
  simulateFailedPayment() {
    cy.log('🧪 Simulating failed payment scenario')
    
    // Setup invalid card
    this.setupCardPayment({
      number: '0000000000000000',
      name: 'Invalid Card',
      expiry: '12/25',
      cvv: '123'
    })
    
    this.acceptTerms()
    this.placeOrder()
    this.verifyPaymentError('Cartão inválido')
    
    return this
  }

  simulateIncompleteForm() {
    cy.log('🧪 Simulating incomplete form scenario')
    
    // Try to proceed without required fields
    this.continueToNextStep()
    this.verifyValidationError('address', 'Endereço é obrigatório')
    
    return this
  }

  // 📱 Mobile-specific methods
  verifyMobileCheckoutLayout() {
    cy.log('📱 Verifying mobile checkout layout')
    
    cy.setMobileViewport()
    
    cy.get(this.elements.checkoutContainer).should('be.visible')
    cy.get(this.elements.placeOrderButton).should('be.visible')
    
    return this
  }

  // 🎭 Factory methods for different scenarios
  static createForDelivery() {
    return new CheckoutPage()
      .isLoaded()
      .selectDeliveryOption()
  }

  static createForPickup() {
    return new CheckoutPage()
      .isLoaded()
      .selectPickupOption()
  }

  static createWithCashPayment() {
    return new CheckoutPage()
      .isLoaded()
      .setupCashPayment({ needChange: true, changeFor: 50 })
  }

  static createWithCardPayment(cardInfo) {
    return new CheckoutPage()
      .isLoaded()
      .setupCardPayment(cardInfo)
  }
}

export default CheckoutPage