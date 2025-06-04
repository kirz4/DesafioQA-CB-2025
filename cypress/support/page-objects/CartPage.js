import BasePage from './BasePage'

/**
 * Page Object para a página do carrinho - FLUXO CRÍTICO
 * Implementa operações de gerenciamento do carrinho e validações
 */
class CartPage extends BasePage {
  constructor() {
    super()
    this.url = '/cart'
  }

  // 🛒 Elementos específicos da página do carrinho
  get elements() {
    return {
      // Cart container and state
      cartContainer: '[data-testid="cart-container"]',
      emptyCartMessage: '[data-testid="empty-cart-message"]',
      emptyCartIcon: '[data-testid="empty-cart-icon"]',
      emptyCartAction: '[data-testid="empty-cart-action"]',
      
      // Cart items
      cartItems: '[data-testid="cart-item"]',
      cartItemCard: '[data-testid="cart-item-card"]',
      
      // Individual item elements
      itemImage: '[data-testid="item-image"]',
      itemTitle: '[data-testid="item-title"]',
      itemDescription: '[data-testid="item-description"]',
      itemPrice: '[data-testid="item-price"]',
      itemUnitPrice: '[data-testid="item-unit-price"]',
      itemTotalPrice: '[data-testid="item-total-price"]',
      itemObservations: '[data-testid="item-observations"]',
      
      // Quantity controls
      quantityContainer: '[data-testid="quantity-container"]',
      quantityDecrease: '[data-testid="quantity-decrease"]',
      quantityIncrease: '[data-testid="quantity-increase"]',
      quantityInput: '[data-testid="quantity-input"]',
      quantityLabel: '[data-testid="quantity-label"]',
      
      // Item actions
      removeItemButton: '[data-testid="remove-item"]',
      editItemButton: '[data-testid="edit-item"]',
      addObservationButton: '[data-testid="add-observation"]',
      
      // Cart summary
      cartSummary: '[data-testid="cart-summary"]',
      subtotal: '[data-testid="subtotal"]',
      deliveryFee: '[data-testid="delivery-fee"]',
      serviceFee: '[data-testid="service-fee"]',
      discount: '[data-testid="discount"]',
      total: '[data-testid="total"]',
      
      // Coupon/Discount
      couponSection: '[data-testid="coupon-section"]',
      couponInput: '[data-testid="coupon-input"]',
      applyCouponButton: '[data-testid="apply-coupon"]',
      removeCouponButton: '[data-testid="remove-coupon"]',
      couponError: '[data-testid="coupon-error"]',
      couponSuccess: '[data-testid="coupon-success"]',
      
      // Delivery information
      deliveryInfo: '[data-testid="delivery-info"]',
      deliveryAddress: '[data-testid="delivery-address"]',
      deliveryTime: '[data-testid="delivery-time"]',
      changeAddressButton: '[data-testid="change-address"]',
      
      // Action buttons
      continueShoppingButton: '[data-testid="continue-shopping"]',
      checkoutButton: '[data-testid="checkout-button"]',
      clearCartButton: '[data-testid="clear-cart"]',
      
      // Loading states
      cartLoading: '[data-testid="cart-loading"]',
      itemUpdating: '[data-testid="item-updating"]',
      checkoutLoading: '[data-testid="checkout-loading"]',
      
      // Modal confirmations
      removeItemModal: '[data-testid="remove-item-modal"]',
      clearCartModal: '[data-testid="clear-cart-modal"]',
      confirmRemove: '[data-testid="confirm-remove"]',
      cancelRemove: '[data-testid="cancel-remove"]',
      
      // Error states
      cartError: '[data-testid="cart-error"]',
      itemError: '[data-testid="item-error"]',
      updateError: '[data-testid="update-error"]'
    }
  }

  // 🔍 Page validation methods
  isLoaded() {
    cy.log('📄 Verifying CartPage is loaded')
    super.isLoaded()
    
    // Wait for cart container to be visible
    cy.get(this.elements.cartContainer, { timeout: this.timeout.medium })
      .should('be.visible')
    
    return this
  }

  isEmpty() {
    cy.log('🔍 Checking if cart is empty')
    
    return cy.get('body').then(($body) => {
      return $body.find(this.elements.emptyCartMessage).length > 0
    })
  }

  hasItems() {
    cy.log('🔍 Checking if cart has items')
    
    return cy.get('body').then(($body) => {
      return $body.find(this.elements.cartItems).length > 0
    })
  }

  // 📊 Cart information methods
  getCartItemCount() {
    cy.log('📊 Getting cart item count')
    
    return cy.get(this.elements.cartItems)
      .its('length')
  }

  getCartTotal() {
    cy.log('💰 Getting cart total')
    
    return cy.get(this.elements.total)
      .invoke('text')
      .then(text => {
        const total = text.replace(/[^\d.,]/g, '').replace(',', '.')
        return parseFloat(total)
      })
  }

  getItemDetails(itemIndex = 0) {
    cy.log(`📊 Getting details for item at index ${itemIndex}`)
    
    const itemDetails = {}
    const itemElement = cy.get(this.elements.cartItems).eq(itemIndex)
    
    itemElement.find(this.elements.itemTitle)
      .invoke('text')
      .then(title => itemDetails.title = title.trim())
    
    itemElement.find(this.elements.itemPrice)
      .invoke('text')
      .then(price => itemDetails.price = price.trim())
    
    itemElement.find(this.elements.quantityInput)
      .invoke('val')
      .then(quantity => itemDetails.quantity = parseInt(quantity))
    
    return cy.wrap(itemDetails)
  }

  // 🔢 Quantity management methods
  updateItemQuantity(itemIndex, newQuantity) {
    cy.log(`🔢 Updating item ${itemIndex} quantity to ${newQuantity}`)
    
    // Intercept update request
    cy.intercept('PUT', '**/cart/update**').as('updateCartRequest')
    
    const itemElement = cy.get(this.elements.cartItems).eq(itemIndex)
    
    // Clear and set new quantity
    itemElement.find(this.elements.quantityInput)
      .clear()
      .type(newQuantity.toString())
      .should('have.value', newQuantity.toString())
    
    // Wait for auto-update or trigger update
    cy.wait('@updateCartRequest', { timeout: this.timeout.medium })
      .then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201])
      })
    
    this.waitForLoading()
    return this
  }

  increaseItemQuantity(itemIndex, times = 1) {
    cy.log(`➕ Increasing item ${itemIndex} quantity ${times} times`)
    
    const itemElement = cy.get(this.elements.cartItems).eq(itemIndex)
    
    for (let i = 0; i < times; i++) {
      itemElement.find(this.elements.quantityIncrease).click()
      cy.wait(500) // Small wait between clicks
    }
    
    this.waitForLoading()
    return this
  }

  decreaseItemQuantity(itemIndex, times = 1) {
    cy.log(`➖ Decreasing item ${itemIndex} quantity ${times} times`)
    
    const itemElement = cy.get(this.elements.cartItems).eq(itemIndex)
    
    for (let i = 0; i < times; i++) {
      itemElement.find(this.elements.quantityDecrease).click()
      cy.wait(500) // Small wait between clicks
    }
    
    this.waitForLoading()
    return this
  }

  // 🗑️ Item removal methods
  removeItem(itemIndex) {
    cy.log(`🗑️ Removing item at index ${itemIndex}`)
    
    // Intercept remove request
    cy.intercept('DELETE', '**/cart/remove**').as('removeItemRequest')
    
    const itemElement = cy.get(this.elements.cartItems).eq(itemIndex)
    
    // Click remove button
    itemElement.find(this.elements.removeItemButton).click()
    
    // Handle confirmation modal if it appears
    cy.get('body').then(($body) => {
      if ($body.find(this.elements.removeItemModal).length > 0) {
        cy.get(this.elements.confirmRemove).click()
      }
    })
    
    // Wait for item to be removed
    cy.wait('@removeItemRequest', { timeout: this.timeout.medium })
      .then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 204])
      })
    
    this.waitForLoading()
    return this
  }

  clearCart() {
    cy.log('🧹 Clearing entire cart')
    
    cy.get(this.elements.clearCartButton).click()
    
    // Handle confirmation modal
    cy.get(this.elements.clearCartModal, { timeout: this.timeout.short })
      .should('be.visible')
    
    cy.get(this.elements.confirmRemove).click()
    
    // Wait for cart to be cleared
    this.waitForLoading()
    this.verifyCartEmpty()
    
    return this
  }

  // 🎫 Coupon methods
  applyCoupon(couponCode) {
    cy.log(`🎫 Applying coupon: ${couponCode}`)
    
    cy.intercept('POST', '**/coupon/apply**').as('applyCouponRequest')
    
    cy.get(this.elements.couponInput)
      .clear()
      .type(couponCode)
    
    cy.get(this.elements.applyCouponButton).click()
    
    cy.wait('@applyCouponRequest', { timeout: this.timeout.medium })
      .then((interception) => {
        if (interception.response.statusCode === 200) {
          this.verifyCouponApplied(couponCode)
        } else {
          this.verifyCouponError()
        }
      })
    
    return this
  }

  removeCoupon() {
    cy.log('🗑️ Removing applied coupon')
    
    cy.get(this.elements.removeCouponButton).click()
    this.waitForLoading()
    
    return this
  }

  // ✅ Validation methods
  verifyCartEmpty() {
    cy.log('✅ Verifying cart is empty')
    
    cy.get(this.elements.emptyCartMessage)
      .should('be.visible')
      .and('contain', 'carrinho está vazio')
    
    cy.get(this.elements.emptyCartIcon)
      .should('be.visible')
    
    cy.get(this.elements.cartItems)
      .should('not.exist')
    
    return this
  }

  verifyItemInCart(expectedItem) {
    cy.log(`✅ Verifying item in cart: ${expectedItem.title}`)
    
    cy.get(this.elements.cartItems)
      .should('have.length.gte', 1)
    
    if (expectedItem.title) {
      cy.get(this.elements.itemTitle)
        .should('contain', expectedItem.title)
    }
    
    if (expectedItem.quantity) {
      cy.get(this.elements.quantityInput)
        .should('have.value', expectedItem.quantity.toString())
    }
    
    if (expectedItem.price) {
      cy.get(this.elements.itemPrice)
        .should('contain', expectedItem.price)
    }
    
    return this
  }

  verifyCartTotals(expectedTotals) {
    cy.log('✅ Verifying cart totals')
    
    if (expectedTotals.subtotal) {
      cy.get(this.elements.subtotal)
        .should('contain', expectedTotals.subtotal)
    }
    
    if (expectedTotals.deliveryFee) {
      cy.get(this.elements.deliveryFee)
        .should('contain', expectedTotals.deliveryFee)
    }
    
    if (expectedTotals.total) {
      cy.get(this.elements.total)
        .should('contain', expectedTotals.total)
    }
    
    return this
  }

  verifyCouponApplied(couponCode) {
    cy.log(`✅ Verifying coupon applied: ${couponCode}`)
    
    cy.get(this.elements.couponSuccess)
      .should('be.visible')
      .and('contain', couponCode)
    
    cy.get(this.elements.discount)
      .should('be.visible')
      .and('not.contain', 'R$ 0')
    
    return this
  }

  verifyCouponError() {
    cy.log('❌ Verifying coupon error')
    
    cy.get(this.elements.couponError)
      .should('be.visible')
      .and('contain', 'inválido')
    
    return this
  }

  verifyDeliveryInfo(expectedInfo) {
    cy.log('✅ Verifying delivery information')
    
    if (expectedInfo.address) {
      cy.get(this.elements.deliveryAddress)
        .should('contain', expectedInfo.address)
    }
    
    if (expectedInfo.estimatedTime) {
      cy.get(this.elements.deliveryTime)
        .should('contain', expectedInfo.estimatedTime)
    }
    
    return this
  }

  // 🎯 Navigation methods
  continueShopping() {
    cy.log('🔙 Continuing shopping')
    
    cy.get(this.elements.continueShoppingButton).click()
    this.waitForLoading()
    
    return this
  }

  proceedToCheckout() {
    cy.log('💳 Proceeding to checkout')
    
    cy.get(this.elements.checkoutButton)
      .should('be.visible')
      .and('be.enabled')
      .click()
    
    this.waitForLoading()
    cy.url().should('contain', 'checkout')
    
    return this
  }

  changeDeliveryAddress() {
    cy.log('📍 Changing delivery address')
    
    cy.get(this.elements.changeAddressButton).click()
    this.waitForLoading()
    
    return this
  }

  // 🎭 Complete flow methods
  updateMultipleItems(updates) {
    cy.log('🎭 Updating multiple items')
    
    updates.forEach((update, index) => {
      if (update.quantity) {
        this.updateItemQuantity(index, update.quantity)
      }
      
      if (update.remove) {
        this.removeItem(index)
      }
    })
    
    return this
  }

  completeCartReview(options = {}) {
    cy.log('🎭 Completing cart review')
    
    const {
      applyCoupon = null,
      verifyTotals = true,
      proceedToCheckout = true
    } = options
    
    // Apply coupon if provided
    if (applyCoupon) {
      this.applyCoupon(applyCoupon)
    }
    
    // Verify cart has items
    this.hasItems().should('be.true')
    
    // Verify totals if requested
    if (verifyTotals) {
      cy.get(this.elements.total)
        .should('be.visible')
        .and('not.contain', 'R$ 0')
    }
    
    // Proceed to checkout if requested
    if (proceedToCheckout) {
      this.proceedToCheckout()
    }
    
    return this
  }

  // 🧪 Test scenario helpers
  simulateCartUpdate() {
    cy.log('🧪 Simulating cart update scenario')
    
    return this.isLoaded()
               .hasItems()
               .then((hasItems) => {
                 if (hasItems) {
                   this.updateItemQuantity(0, 2)
                       .verifyItemInCart({ quantity: 2 })
                 }
               })
  }

  simulateItemRemoval() {
    cy.log('🧪 Simulating item removal scenario')
    
    return this.isLoaded()
               .getCartItemCount()
               .then((initialCount) => {
                 if (initialCount > 0) {
                   this.removeItem(0)
                   
                   if (initialCount === 1) {
                     this.verifyCartEmpty()
                   } else {
                     this.getCartItemCount()
                         .should('eq', initialCount - 1)
                   }
                 }
               })
  }

  // 📱 Mobile-specific methods
  verifyMobileCartLayout() {
    cy.log('📱 Verifying mobile cart layout')
    
    cy.setMobileViewport()
    
    cy.get(this.elements.cartContainer).should('be.visible')
    cy.get(this.elements.checkoutButton).should('be.visible')
    
    return this
  }

  // 🎭 Factory methods for different scenarios
  static createWithItems() {
    return new CartPage()
      .isLoaded()
      .hasItems()
  }

  static createEmpty() {
    return new CartPage()
      .isLoaded()
      .isEmpty()
  }

  static createForCheckout() {
    return new CartPage()
      .isLoaded()
      .hasItems()
      .completeCartReview({ proceedToCheckout: false })
  }
}

export default CartPage