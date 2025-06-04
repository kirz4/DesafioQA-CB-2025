// cypress/e2e/api/cart-operations.cy.js

/**
 * Testes de API para operações básicas de carrinho usando DummyJSON
 * Implementa técnicas de teste: Boundary Value Analysis, Equivalence Partitioning
 * e Error Handling para validar as rotas críticas de carrinho
 */

import { CartApiHelper } from '../../support/helpers/api-helpers'

describe('🛒 Cart API Operations Tests', () => {
  
  let apiHelper
  let testData

  before(() => {
    apiHelper = new CartApiHelper()
    cy.fixture('api-test-data').then((data) => {
      testData = data
    })
  })

  beforeEach(() => {
    cy.log('🔧 Setting up API test environment')
    
    // Setup API intercepts for monitoring
    cy.intercept('GET', '**/carts/**').as('getCartRequest')
    cy.intercept('POST', '**/carts/add').as('addCartRequest') 
    cy.intercept('PUT', '**/carts/**').as('updateCartRequest')
    cy.intercept('DELETE', '**/carts/**').as('deleteCartRequest')
  })

  context('📋 GET Operations - Retrieve Cart Data', () => {
    
    it('should retrieve all carts with proper pagination', () => {
      cy.log('🔍 Testing GET /carts - retrieve all carts')
      
      apiHelper.getAllCarts({ limit: 10, skip: 0 })
        .then((response) => {
          // ✅ Basic response validation
          expect(response.status).to.eq(200)
          expect(response.body.carts).to.have.length.at.most(10)
          
          // ✅ Performance validation
          apiHelper.validateResponseTime(response, testData.performanceExpectations.maxResponseTime.getAll)
          
          // ✅ Business logic validation
          response.body.carts.forEach(cart => {
            apiHelper.validateCartTotals(cart)
          })
          
          cy.log('✅ All carts retrieved successfully')
        })
    })

    it('should retrieve a specific cart by ID', () => {
      cy.log('🔍 Testing GET /carts/{id} - retrieve single cart')
      
      const cartId = 1
      
      apiHelper.getCartById(cartId)
        .then((response) => {
          expect(response.status).to.eq(200)
          apiHelper.validateSingleCartSchema(response.body)
          
          // ✅ Verify correct cart returned
          expect(response.body.id).to.eq(cartId)
          
          // ✅ Validate business logic
          apiHelper.validateCartTotals(response.body)
          apiHelper.logCartDetails(response.body)
          
          cy.log('✅ Single cart retrieved successfully')
        })
    })

    it('should handle invalid cart ID gracefully', () => {
      cy.log('🔍 Testing GET /carts/{id} - invalid ID error handling')
      
      const invalidCartId = testData.testUsers.invalid[0].id
      
      apiHelper.getCartById(invalidCartId)
        .then((response) => {
          // ✅ Should handle error gracefully
          expect(response.status).to.be.oneOf([404, 400])
          
          if (response.status === 404) {
            apiHelper.validateErrorResponse(response.body)
          }
          
          cy.log('✅ Invalid cart ID handled correctly')
        })
    })

    it('should retrieve carts by user ID', () => {
      cy.log('🔍 Testing GET /carts/user/{userId} - user-specific carts')
      
      const testUser = testData.testUsers.valid[1] // User ID 5
      
      apiHelper.getCartsByUser(testUser.id)
        .then((response) => {
          expect(response.status).to.eq(200)
          apiHelper.validateCartListSchema(response.body)
          
          // ✅ Verify all carts belong to the user
          response.body.carts.forEach(cart => {
            expect(cart.userId).to.eq(testUser.id)
          })
          
          cy.log(`✅ Retrieved ${response.body.carts.length} carts for user ${testUser.id}`)
        })
    })
  })

  context('➕ POST Operations - Add New Cart', () => {
    
    it('should create cart with single product successfully', () => {
      cy.log('🛒 Testing POST /carts/add - single product')
      
      const cartData = testData.testCartScenarios.singleProduct
      
      apiHelper.createCartWithProducts(cartData.userId, cartData.products)
        .then((response) => {
          expect(response.status).to.eq(200)
          
          // ✅ Validate cart structure
          expect(response.body).to.have.property('id')
          expect(response.body.userId).to.eq(cartData.userId)
          expect(response.body.totalProducts).to.eq(cartData.expectedProducts)
          expect(response.body.totalQuantity).to.eq(cartData.expectedQuantity)
          
          // ✅ Validate product enrichment
          expect(response.body.products[0]).to.have.property('title')
          expect(response.body.products[0]).to.have.property('price')
          expect(response.body.products[0]).to.have.property('thumbnail')
          
          apiHelper.logCartDetails(response.body)
          cy.log('✅ Single product cart created successfully')
        })
    })

    it('should create cart with multiple products successfully', () => {
      cy.log('🛒 Testing POST /carts/add - multiple products')
      
      const cartData = testData.testCartScenarios.multipleProducts
      
      apiHelper.createCartWithProducts(cartData.userId, cartData.products)
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.totalProducts).to.eq(cartData.expectedProducts)
          expect(response.body.totalQuantity).to.eq(cartData.expectedQuantity)
          
          // ✅ Validate each product in cart
          cartData.products.forEach((expectedProduct, index) => {
            const actualProduct = response.body.products.find(p => p.id === expectedProduct.id)
            expect(actualProduct).to.exist
            expect(actualProduct.quantity).to.eq(expectedProduct.quantity)
          })
          
          cy.log('✅ Multiple products cart created successfully')
        })
    })

    // 🔬 Boundary Value Testing
    testData.testQuantities.valid.boundary.forEach(quantity => {
      it(`should handle boundary quantity value: ${quantity}`, () => {
        cy.log(`🔬 Testing boundary value: ${quantity}`)
        
        const cartData = {
          userId: testData.testUsers.valid[0].id,
          products: [{
            id: testData.testProducts.valid[0].id,
            quantity: quantity
          }]
        }

        apiHelper.addCart(cartData)
          .then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.products[0].quantity).to.eq(quantity)
            expect(response.body.totalQuantity).to.eq(quantity)
            
            cy.log(`✅ Boundary value ${quantity} handled correctly`)
          })
      })
    })

    // ❌ Negative Testing - Invalid Data
    it('should handle invalid product ID', () => {
      cy.log('❌ Testing invalid product ID')
      
      const invalidCartData = testData.errorTestCases.invalidProductId
      
      apiHelper.addCart(invalidCartData)
        .then((response) => {
          // ✅ DummyJSON is permissive, but in real API this should fail
          if (response.status >= 400) {
            apiHelper.validateErrorResponse(response.body)
            cy.log('✅ Invalid product ID rejected correctly')
          } else {
            cy.log('ℹ️ API accepted invalid product ID (DummyJSON behavior)')
          }
        })
    })

    testData.testQuantities.invalid.nonNumeric.slice(0, 3).forEach(invalidQuantity => {
      it(`should handle invalid quantity: ${invalidQuantity}`, () => {
        cy.log(`❌ Testing invalid quantity: ${invalidQuantity}`)
        
        const cartData = {
          userId: testData.testUsers.valid[0].id,
          products: [{
            id: testData.testProducts.valid[0].id,
            quantity: invalidQuantity
          }]
        }

        apiHelper.addCart(cartData)
          .then((response) => {
            // ✅ Should either reject or sanitize
            if (response.status >= 400) {
              apiHelper.validateErrorResponse(response.body)
            } else {
              // If accepted, quantity should be sanitized
              expect(response.body.products[0].quantity).to.be.a('number')
              expect(response.body.products[0].quantity).to.be.gte(0)
            }
          })
      })
    })
  })

  context('✏️ PUT Operations - Update Cart', () => {
    
    let existingCartId

    beforeEach(() => {
      // Create a cart to update
      const cartData = testData.testCartScenarios.singleProduct
      
      apiHelper.createCartWithProducts(cartData.userId, cartData.products)
        .then((response) => {
          existingCartId = response.body.id
        })
    })

    it('should update cart with merge option', () => {
      cy.log('✏️ Testing PUT /carts/{id} - merge update')
      
      const updateData = testData.updateScenarios.addNewProduct
      
      apiHelper.updateCartProducts(existingCartId, updateData.products, true)
        .then((response) => {
          expect(response.status).to.eq(200)
          
          // ✅ Should have original + new products
          expect(response.body.totalProducts).to.be.gte(2)
          
          // ✅ Find the added product
          const addedProduct = response.body.products.find(p => p.id === updateData.products[0].id)
          expect(addedProduct).to.exist
          expect(addedProduct.quantity).to.eq(updateData.products[0].quantity)
          
          cy.log('✅ Cart updated with merge successfully')
        })
    })

    it('should replace cart without merge option', () => {
      cy.log('✏️ Testing PUT /carts/{id} - replace update')
      
      const updateData = testData.updateScenarios.replaceAllProducts
      
      apiHelper.updateCartProducts(existingCartId, updateData.products, false)
        .then((response) => {
          expect(response.status).to.eq(200)
          
          // ✅ Should only have the new products
          expect(response.body.products).to.have.length(updateData.products.length)
          expect(response.body.products[0].id).to.eq(updateData.products[0].id)
          
          cy.log('✅ Cart replaced successfully')
        })
    })

    it('should handle update of non-existent cart', () => {
      cy.log('❌ Testing update non-existent cart')
      
      const invalidCartId = 999999
      const updateData = testData.updateScenarios.addNewProduct
      
      apiHelper.updateCart(invalidCartId, updateData)
        .then((response) => {
          expect(response.status).to.be.oneOf([404, 400])
          cy.log('✅ Non-existent cart update handled correctly')
        })
    })
  })

  context('🗑️ DELETE Operations - Remove Cart', () => {
    
    let cartToDelete

    beforeEach(() => {
      // Create a cart to delete
      const cartData = testData.testCartScenarios.singleProduct
      
      apiHelper.createCartWithProducts(cartData.userId, cartData.products)
        .then((response) => {
          cartToDelete = response.body
        })
    })

    it('should delete cart successfully with soft delete', () => {
      cy.log('🗑️ Testing DELETE /carts/{id} - soft delete')
      
      apiHelper.deleteCart(cartToDelete.id)
        .then((response) => {
          expect(response.status).to.eq(200)
          
          // ✅ Verify soft delete implementation
          expect(response.body.isDeleted).to.be.true
          expect(response.body.deletedOn).to.exist
          expect(response.body.id).to.eq(cartToDelete.id)
          
          // ✅ Verify cart data is still present (soft delete)
          expect(response.body.products).to.exist
          expect(response.body.total).to.exist
          expect(response.body.userId).to.eq(cartToDelete.userId)
          
          cy.log('✅ Cart soft deleted successfully')
        })
    })

    it('should handle deletion of non-existent cart', () => {
      cy.log('❌ Testing delete non-existent cart')
      
      const invalidCartId = 999999
      
      apiHelper.deleteCart(invalidCartId)
        .then((response) => {
          expect(response.status).to.be.oneOf([404, 400])
          cy.log('✅ Non-existent cart deletion handled correctly')
        })
    })
  })

  context('🔄 End-to-End Cart Lifecycle', () => {
    
    it('should complete full cart lifecycle successfully', () => {
      cy.log('🔄 Testing complete cart lifecycle')
      
      let createdCart
      
      // Step 1: Create cart
      const initialCartData = testData.testCartScenarios.singleProduct
      
      apiHelper.createCartWithProducts(initialCartData.userId, initialCartData.products)
        .then((response) => {
          expect(response.status).to.eq(200)
          createdCart = response.body
          expect(createdCart.totalQuantity).to.eq(1)
          
          cy.log(`📝 Step 1: Cart created with ID ${createdCart.id}`)
          
          // Step 2: Update cart (add product)
          const updateData = testData.updateScenarios.addNewProduct
          return apiHelper.updateCartProducts(createdCart.id, updateData.products, true)
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.totalProducts).to.be.gte(2)
          
          cy.log(`📝 Step 2: Cart updated - now has ${response.body.totalProducts} products`)
          apiHelper.compareCartStates(createdCart, response.body)
          
          // Step 3: Update existing product quantity
          const quantityUpdate = {
            merge: true,
            products: [{
              id: initialCartData.products[0].id,
              quantity: 5
            }]
          }
          
          return apiHelper.updateCart(createdCart.id, quantityUpdate)
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          
          // Find updated product
          const updatedProduct = response.body.products.find(p => p.id === initialCartData.products[0].id)
          expect(updatedProduct.quantity).to.eq(5)
          
          cy.log(`📝 Step 3: Product quantity updated to ${updatedProduct.quantity}`)
          
          // Step 4: Delete cart
          return apiHelper.deleteCart(createdCart.id)
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.isDeleted).to.be.true
          
          cy.log('📝 Step 4: Cart deleted successfully')
          cy.log('✅ Complete cart lifecycle completed successfully')
        })
    })

    it('should handle complex cart operations with multiple products', () => {
      cy.log('🔄 Testing complex cart operations')
      
      const complexCartData = testData.testCartScenarios.multipleProducts
      let complexCart
      
      // Create complex cart
      apiHelper.createCartWithProducts(complexCartData.userId, complexCartData.products)
        .then((response) => {
          complexCart = response.body
          expect(complexCart.totalProducts).to.eq(3)
          expect(complexCart.totalQuantity).to.eq(6)
          
          // Verify individual products
          complexCartData.products.forEach(expectedProduct => {
            const actualProduct = complexCart.products.find(p => p.id === expectedProduct.id)
            expect(actualProduct).to.exist
            expect(actualProduct.quantity).to.eq(expectedProduct.quantity)
          })
          
          // Replace entire cart
          const replacementData = testData.updateScenarios.removeAllAddNew
          return apiHelper.updateCart(complexCart.id, replacementData)
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.products).to.have.length(2)
          
          // Verify new products
          const newProducts = response.body.products
          expect(newProducts.find(p => p.id === 98)).to.exist
          expect(newProducts.find(p => p.id === 50)).to.exist
          
          cy.log('✅ Complex cart operations completed successfully')
        })
    })
  })

  context('⚡ Performance and Load Testing', () => {
    
    it('should handle multiple concurrent requests', () => {
      cy.log('⚡ Testing concurrent API requests')
      
      const requests = []
      const numberOfRequests = 5
      
      // Create multiple requests simultaneously
      for (let i = 0; i < numberOfRequests; i++) {
        const cartData = {
          userId: testData.testUsers.valid[i % testData.testUsers.valid.length].id,
          products: [{
            id: testData.testProducts.valid[i % testData.testProducts.valid.length].id,
            quantity: i + 1
          }]
        }
        
        requests.push(apiHelper.addCart(cartData))
      }
      
      // Wait for all requests to complete
      Promise.all(requests).then((responses) => {
        responses.forEach((response, index) => {
          expect(response.status).to.eq(200)
          apiHelper.validateResponseTime(response, 5000) // Allow extra time for concurrent requests
          cy.log(`✅ Request ${index + 1} completed successfully`)
        })
        
        cy.log('✅ All concurrent requests completed successfully')
      })
    })

    it('should maintain performance under repeated operations', () => {
      cy.log('⚡ Testing repeated operations performance')
      
      const testUser = testData.testUsers.valid[0]
      let totalTime = 0
      const iterations = 3
      
      // Perform repeated cart operations
      for (let i = 0; i < iterations; i++) {
        const cartData = {
          userId: testUser.id,
          products: [{
            id: testData.testProducts.valid[i % testData.testProducts.valid.length].id,
            quantity: 1
          }]
        }
        
        apiHelper.addCart(cartData)
          .then((response) => {
            expect(response.status).to.eq(200)
            totalTime += response.duration || 0
            
            if (i === iterations - 1) {
              const averageTime = totalTime / iterations
              cy.log(`📊 Average response time: ${averageTime}ms`)
              expect(averageTime).to.be.lessThan(3000)
            }
          })
      }
    })
  })

  context('🛡️ Security and Data Validation', () => {
    
    it('should validate data types and constraints', () => {
      cy.log('🛡️ Testing data validation')
      
      const cartData = testData.testCartScenarios.singleProduct
      
      apiHelper.createCartWithProducts(cartData.userId, cartData.products)
        .then((response) => {
          const cart = response.body
          
          // ✅ Validate data types
          expect(cart.id).to.be.a('number')
          expect(cart.userId).to.be.a('number')
          expect(cart.total).to.be.a('number')
          expect(cart.discountedTotal).to.be.a('number')
          expect(cart.totalProducts).to.be.a('number')
          expect(cart.totalQuantity).to.be.a('number')
          expect(cart.products).to.be.an('array')
          
          // ✅ Validate constraints
          expect(cart.total).to.be.gte(0)
          expect(cart.discountedTotal).to.be.gte(0)
          expect(cart.discountedTotal).to.be.lte(cart.total)
          expect(cart.totalProducts).to.be.gte(0)
          expect(cart.totalQuantity).to.be.gte(0)
          
          cy.log('✅ Data validation passed')
        })
    })

    it('should handle malformed requests gracefully', () => {
      cy.log('🛡️ Testing malformed request handling')
      
      const malformedData = {
        userId: "not-a-number",
        products: "not-an-array"
      }
      
      apiHelper.addCart(malformedData)
        .then((response) => {
          // ✅ Should either reject or sanitize
          if (response.status >= 400) {
            apiHelper.validateErrorResponse(response.body)
            cy.log('✅ Malformed request rejected correctly')
          } else {
            cy.log('ℹ️ API accepted malformed data (may have sanitization)')
          }
        })
    })
  })

  context('📊 Business Logic Validation', () => {
    
    it('should calculate totals correctly with discounts', () => {
      cy.log('📊 Testing discount calculations')
      
      const cartData = testData.testCartScenarios.multipleProducts
      
      apiHelper.createCartWithProducts(cartData.userId, cartData.products)
        .then((response) => {
          const cart = response.body
          
          // ✅ Validate total calculations
          let calculatedTotal = 0
          cart.products.forEach(product => {
            calculatedTotal += product.total
            
            // Individual product total should match price * quantity
            const expectedProductTotal = product.price * product.quantity
            expect(product.total).to.be.closeTo(expectedProductTotal, 0.01)
            
            // Discounted price should be less than or equal to original price
            expect(product.discountedTotal).to.be.lte(product.total)
          })
          
          // Cart total should match sum of product totals
          expect(cart.total).to.be.closeTo(calculatedTotal, 0.01)
          
          cy.log('✅ Discount calculations validated')
        })
    })

    it('should maintain data consistency across operations', () => {
      cy.log('📊 Testing data consistency')
      
      const cartData = testData.testCartScenarios.singleProduct
      let originalCart
      
      apiHelper.createCartWithProducts(cartData.userId, cartData.products)
        .then((response) => {
          originalCart = response.body
          
          // Get the same cart again
          return apiHelper.getCartById(originalCart.id)
        })
        .then((response) => {
          const retrievedCart = response.body
          
          // ✅ Data should be consistent
          expect(retrievedCart.id).to.eq(originalCart.id)
          expect(retrievedCart.userId).to.eq(originalCart.userId)
          expect(retrievedCart.total).to.eq(originalCart.total)
          expect(retrievedCart.totalProducts).to.eq(originalCart.totalProducts)
          expect(retrievedCart.totalQuantity).to.eq(originalCart.totalQuantity)
          
          cy.log('✅ Data consistency maintained')
        })
    })
  })

  afterEach(() => {
    cy.log('🧹 Cleaning up test data')
    // Note: DummyJSON doesn't persist data, so no cleanup needed
    // In real API, you would clean up test data here
  })
})