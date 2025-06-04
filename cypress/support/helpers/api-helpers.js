// cypress/support/helpers/api-helpers.js

/**
 * Helper class para operações de API do DummyJSON
 * Centraliza todas as operações de carrinho com validações robustas
 */

export class CartApiHelper {
  constructor() {
    this.baseUrl = 'https://dummyjson.com'
    this.timeout = 10000
  }

  // 🔍 Schema validation methods
  validateCartListSchema(responseBody) {
    expect(responseBody).to.have.property('carts')
    expect(responseBody).to.have.property('total')
    expect(responseBody).to.have.property('limit')
    expect(responseBody).to.have.property('skip')
    
    expect(responseBody.carts).to.be.an('array')
    expect(responseBody.total).to.be.a('number')
    expect(responseBody.limit).to.be.a('number')
    expect(responseBody.skip).to.be.a('number')
    
    // Validate each cart in the list
    if (responseBody.carts.length > 0) {
      responseBody.carts.forEach(cart => {
        this.validateSingleCartSchema(cart)
      })
    }
  }

  validateSingleCartSchema(cart) {
    expect(cart).to.have.property('id')
    expect(cart).to.have.property('products')
    expect(cart).to.have.property('total')
    expect(cart).to.have.property('discountedTotal')
    expect(cart).to.have.property('userId')
    expect(cart).to.have.property('totalProducts')
    expect(cart).to.have.property('totalQuantity')
    
    expect(cart.id).to.be.a('number')
    expect(cart.products).to.be.an('array')
    expect(cart.total).to.be.a('number')
    expect(cart.discountedTotal).to.be.a('number')
    expect(cart.userId).to.be.a('number')
    expect(cart.totalProducts).to.be.a('number')
    expect(cart.totalQuantity).to.be.a('number')
    
    // Validate products in cart
    cart.products.forEach(product => {
      this.validateProductInCartSchema(product)
    })
  }

  validateProductInCartSchema(product) {
    expect(product).to.have.property('id')
    expect(product).to.have.property('title')
    expect(product).to.have.property('price')
    expect(product).to.have.property('quantity')
    expect(product).to.have.property('total')
    expect(product).to.have.property('discountPercentage')
    expect(product).to.have.property('discountedTotal')
    expect(product).to.have.property('thumbnail')
    
    expect(product.id).to.be.a('number')
    expect(product.title).to.be.a('string')
    expect(product.price).to.be.a('number')
    expect(product.quantity).to.be.a('number')
    expect(product.total).to.be.a('number')
    expect(product.discountPercentage).to.be.a('number')
    expect(product.discountedTotal).to.be.a('number')
    expect(product.thumbnail).to.be.a('string')
  }

  validateErrorResponse(responseBody) {
    // DummyJSON may return different error formats
    // This is flexible validation for error responses
    expect(responseBody).to.exist
    
    if (responseBody.message) {
      expect(responseBody.message).to.be.a('string')
    }
    
    if (responseBody.error) {
      expect(responseBody.error).to.be.a('string')
    }
  }

  // 📊 Business logic validation methods
  validateCartTotals(cart) {
    cy.log('🧮 Validating cart totals calculation')
    
    // Calculate expected total from products
    let calculatedTotal = 0
    let calculatedQuantity = 0
    
    cart.products.forEach(product => {
      calculatedTotal += product.total
      calculatedQuantity += product.quantity
      
      // Validate individual product totals
      const expectedProductTotal = product.price * product.quantity
      expect(product.total).to.be.closeTo(expectedProductTotal, 0.01)
    })
    
    // Validate cart totals
    expect(cart.total).to.be.closeTo(calculatedTotal, 0.01)
    expect(cart.totalQuantity).to.equal(calculatedQuantity)
    expect(cart.totalProducts).to.equal(cart.products.length)
    
    // Validate discounted total is less than or equal to total
    expect(cart.discountedTotal).to.be.at.most(cart.total)
  }

  validateProductQuantities(cart, expectedQuantities = {}) {
    cy.log('🔢 Validating product quantities')
    
    cart.products.forEach(product => {
      expect(product.quantity).to.be.greaterThan(0)
      
      if (expectedQuantities[product.id]) {
        expect(product.quantity).to.equal(expectedQuantities[product.id])
      }
    })
  }

  // 🚀 Request helper methods
  getAllCarts(options = {}) {
    const { limit = 30, skip = 0 } = options
    
    return cy.request({
      method: 'GET',
      url: `${this.baseUrl}/carts`,
      qs: { limit, skip },
      timeout: this.timeout
    }).then(response => {
      expect(response.status).to.eq(200)
      this.validateCartListSchema(response.body)
      return response
    })
  }

  getCartById(cartId) {
    return cy.request({
      method: 'GET',
      url: `${this.baseUrl}/carts/${cartId}`,
      timeout: this.timeout,
      failOnStatusCode: false
    })
  }

  getCartsByUser(userId) {
    return cy.request({
      method: 'GET',
      url: `${this.baseUrl}/carts/user/${userId}`,
      timeout: this.timeout,
      failOnStatusCode: false
    })
  }

  addCart(cartData) {
    return cy.request({
      method: 'POST',
      url: `${this.baseUrl}/carts/add`,
      body: cartData,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: this.timeout,
      failOnStatusCode: false
    })
  }

  updateCart(cartId, updateData) {
    return cy.request({
      method: 'PUT',
      url: `${this.baseUrl}/carts/${cartId}`,
      body: updateData,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: this.timeout,
      failOnStatusCode: false
    })
  }

  deleteCart(cartId) {
    return cy.request({
      method: 'DELETE',
      url: `${this.baseUrl}/carts/${cartId}`,
      timeout: this.timeout,
      failOnStatusCode: false
    })
  }

  // 🔄 Flow helper methods
  createCartWithProducts(userId, products) {
    const cartData = {
      userId: userId,
      products: products
    }
    
    return this.addCart(cartData).then(response => {
      if (response.status === 200) {
        this.validateSingleCartSchema(response.body)
        this.validateCartTotals(response.body)
      }
      return response
    })
  }

  updateCartProducts(cartId, products, merge = true) {
    const updateData = {
      merge: merge,
      products: products
    }
    
    return this.updateCart(cartId, updateData).then(response => {
      if (response.status === 200) {
        this.validateSingleCartSchema(response.body)
        this.validateCartTotals(response.body)
      }
      return response
    })
  }

  // 📈 Performance validation methods
  validateResponseTime(response, maxTime = 3000) {
    const duration = response.duration || 0
    cy.log(`⚡ API Response Time: ${duration}ms`)
    expect(duration).to.be.lessThan(maxTime)
  }

  validateStatusCode(response, expectedCode) {
    expect(response.status).to.eq(expectedCode)
  }

  // 🎯 Test data generators
  generateValidCartData(userId = 1) {
    return {
      userId: userId,
      products: [
        {
          id: 144, // Cricket Helmet
          quantity: 2
        },
        {
          id: 98, // Rolex Watch
          quantity: 1
        }
      ]
    }
  }

  generateBoundaryTestData() {
    return {
      validQuantities: [1, 99],
      invalidQuantities: [0, -1, 100, 'abc', null, undefined],
      validProductIds: [1, 144, 98],
      invalidProductIds: [99999, -1, 'abc', null],
      validUserIds: [1, 5, 10],
      invalidUserIds: [99999, -1, 'abc', null]
    }
  }

  // 🔧 Utility methods
  logCartDetails(cart) {
    cy.log(`📊 Cart Details:`)
    cy.log(`   ID: ${cart.id}`)
    cy.log(`   User ID: ${cart.userId}`)
    cy.log(`   Products: ${cart.totalProducts}`)
    cy.log(`   Quantity: ${cart.totalQuantity}`)
    cy.log(`   Total: $${cart.total}`)
    cy.log(`   Discounted: $${cart.discountedTotal}`)
  }

  compareCartStates(originalCart, updatedCart) {
    cy.log('🔄 Comparing cart states')
    
    expect(updatedCart.id).to.equal(originalCart.id)
    expect(updatedCart.userId).to.equal(originalCart.userId)
    
    cy.log(`Products: ${originalCart.totalProducts} → ${updatedCart.totalProducts}`)
    cy.log(`Quantity: ${originalCart.totalQuantity} → ${updatedCart.totalQuantity}`)
    cy.log(`Total: $${originalCart.total} → $${updatedCart.total}`)
  }
}