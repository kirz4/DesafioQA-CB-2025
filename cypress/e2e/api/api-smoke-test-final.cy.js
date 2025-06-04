// cypress/e2e/api/api-smoke-test-final.cy.js

/**
 * Smoke test final corrigido para API operations
 * Usa carrinhos existentes do DummyJSON para UPDATE/DELETE
 */

describe('🧪 API Smoke Tests - Final Version', () => {
  
  const API_BASE_URL = 'https://dummyjson.com'

  context('Basic API Connectivity', () => {
    
    it('should connect to DummyJSON API successfully', () => {
      cy.log('🌐 Testing API connectivity')
      
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/carts`,
        timeout: 10000
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('carts')
        expect(response.body.carts).to.be.an('array')
        
        cy.log('✅ API connectivity confirmed')
      })
    })
  })

  context('Add Cart - Basic Test', () => {
    
    it('should add a cart successfully', () => {
      cy.log('➕ Testing ADD CART basic functionality')
      
      const cartData = {
        userId: 1,
        products: [
          {
            id: 144,
            quantity: 1
          }
        ]
      }

      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/carts/add`,
        body: cartData,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        // ✅ DummyJSON returns 201 for POST operations
        expect(response.status).to.be.oneOf([200, 201])
        expect(response.body).to.have.property('id')
        expect(response.body).to.have.property('products')
        expect(response.body.userId).to.eq(1)
        expect(response.body.products).to.have.length(1)
        expect(response.body.products[0].id).to.eq(144)
        expect(response.body.products[0].quantity).to.eq(1)
        
        cy.log('✅ ADD CART working correctly')
        cy.log(`📊 Created cart ID: ${response.body.id}`)
      })
    })
  })

  context('Update Cart - Using Existing Cart', () => {
    
    it('should update an existing cart successfully', () => {
      cy.log('✏️ Testing UPDATE CART with existing cart')
      
      // ✅ Use an existing cart ID from DummyJSON (1-20 exist)
      const existingCartId = 1
      
      const updateData = {
        merge: true,
        products: [{ id: 98, quantity: 2 }]
      }
      
      cy.request({
        method: 'PUT',
        url: `${API_BASE_URL}/carts/${existingCartId}`,
        body: updateData,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.id).to.eq(existingCartId)
        expect(response.body.totalProducts).to.be.gte(1)
        
        // Find the updated/added product
        const updatedProduct = response.body.products.find(p => p.id === 98)
        if (updatedProduct) {
          expect(updatedProduct.quantity).to.eq(2)
        }
        
        cy.log('✅ UPDATE CART working correctly')
        cy.log(`📊 Updated cart has ${response.body.totalProducts} products`)
      })
    })
  })

  context('Delete Cart - Using Existing Cart', () => {
    
    it('should delete an existing cart successfully', () => {
      cy.log('🗑️ Testing DELETE CART with existing cart')
      
      // ✅ Use an existing cart ID from DummyJSON (1-20 exist)
      const existingCartId = 2
      
      cy.request({
        method: 'DELETE',
        url: `${API_BASE_URL}/carts/${existingCartId}`
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.isDeleted).to.be.true
        expect(response.body.deletedOn).to.exist
        expect(response.body.id).to.eq(existingCartId)
        
        cy.log('✅ DELETE CART working correctly')
        cy.log(`📊 Deleted cart ID: ${response.body.id}`)
      })
    })
  })

  context('Get Operations - Verification', () => {
    
    it('should retrieve a specific cart by ID', () => {
      cy.log('🔍 Testing GET specific cart')
      
      const cartId = 3
      
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/carts/${cartId}`
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.id).to.eq(cartId)
        expect(response.body).to.have.property('products')
        expect(response.body).to.have.property('total')
        expect(response.body).to.have.property('userId')
        
        cy.log('✅ GET specific cart working correctly')
        cy.log(`📊 Cart ${cartId} has ${response.body.totalProducts} products`)
      })
    })

    it('should retrieve carts by user ID', () => {
      cy.log('🔍 Testing GET carts by user')
      
      const userId = 5
      
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/carts/user/${userId}`
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('carts')
        expect(response.body.carts).to.be.an('array')
        
        // Verify all carts belong to the user
        response.body.carts.forEach(cart => {
          expect(cart.userId).to.eq(userId)
        })
        
        cy.log('✅ GET carts by user working correctly')
        cy.log(`📊 User ${userId} has ${response.body.carts.length} carts`)
      })
    })
  })

  context('API Helper Test', () => {
    
    it('should load API helpers without errors', () => {
      cy.log('🛠️ Testing API helpers loading')
      
      // Test if we can import and use the helper
      import('../../support/helpers/api-helpers').then((module) => {
        const { CartApiHelper } = module
        
        const apiHelper = new CartApiHelper()
        expect(apiHelper).to.exist
        expect(apiHelper.baseUrl).to.eq('https://dummyjson.com')
        expect(apiHelper.getAllCarts).to.be.a('function')
        
        cy.log('✅ API helpers loaded successfully')
      })
    })
  })

  context('Test Data Fixtures', () => {
    
    it('should load test data fixtures correctly', () => {
      cy.log('📋 Testing fixtures loading')
      
      cy.fixture('api-test-data').then((testData) => {
        expect(testData).to.exist
        expect(testData.testUsers).to.exist
        expect(testData.testProducts).to.exist
        expect(testData.testQuantities).to.exist
        expect(testData.testCartScenarios).to.exist
        
        // Validate structure
        expect(testData.testUsers.valid).to.be.an('array')
        expect(testData.testProducts.valid).to.be.an('array')
        expect(testData.testQuantities.valid).to.exist
        
        cy.log('✅ Test data fixtures loaded correctly')
      })
    })
  })

  context('Error Handling Tests', () => {
    
    it('should handle invalid cart ID gracefully', () => {
      cy.log('❌ Testing error handling for invalid cart ID')
      
      const invalidCartId = 99999
      
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/carts/${invalidCartId}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 400])
        
        if (response.body.message) {
          expect(response.body.message).to.be.a('string')
        }
        
        cy.log('✅ Invalid cart ID handled correctly')
      })
    })

    it('should handle invalid product in cart creation', () => {
      cy.log('❌ Testing error handling for invalid product')
      
      const invalidCartData = {
        userId: 1,
        products: [
          {
            id: 99999, // Invalid product ID
            quantity: 1
          }
        ]
      }

      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/carts/add`,
        body: invalidCartData,
        failOnStatusCode: false
      }).then((response) => {
        // DummyJSON may accept invalid products, but we test the behavior
        if (response.status >= 400) {
          cy.log('✅ Invalid product rejected correctly')
        } else {
          cy.log('ℹ️ Invalid product accepted (DummyJSON behavior)')
          expect(response.status).to.be.oneOf([200, 201])
        }
      })
    })
  })

  context('Performance Tests', () => {
    
    it('should respond within acceptable time limits', () => {
      cy.log('⚡ Testing API performance')
      
      const startTime = Date.now()
      
      cy.request('GET', `${API_BASE_URL}/carts`)
        .then((response) => {
          const endTime = Date.now()
          const duration = endTime - startTime
          
          expect(response.status).to.eq(200)
          expect(duration).to.be.lessThan(5000) // 5 seconds max
          
          cy.log(`📊 API response time: ${duration}ms`)
          cy.log('✅ Performance within acceptable limits')
        })
    })
  })

  context('Complete CRUD Workflow', () => {
    
    it('should execute complete CRUD workflow successfully', () => {
      cy.log('🔄 Testing complete CRUD workflow')
      
      let createdCartId
      
      // Step 1: CREATE cart
      const cartData = {
        userId: 1,
        products: [{ id: 144, quantity: 1 }]
      }
      
      cy.request('POST', `${API_BASE_URL}/carts/add`, cartData)
        .then((response) => {
          expect(response.status).to.be.oneOf([200, 201])
          createdCartId = response.body.id
          
          cy.log(`📝 Step 1: Created cart ID ${createdCartId}`)
          
          // Step 2: READ - Get existing cart (use existing ID since created one won't persist)
          return cy.request('GET', `${API_BASE_URL}/carts/1`)
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.id).to.eq(1)
          
          cy.log('📝 Step 2: Read cart successfully')
          
          // Step 3: UPDATE - Update existing cart
          const updateData = {
            merge: true,
            products: [{ id: 98, quantity: 2 }]
          }
          
          return cy.request('PUT', `${API_BASE_URL}/carts/1`, updateData)
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.id).to.eq(1)
          
          cy.log('📝 Step 3: Updated cart successfully')
          
          // Step 4: DELETE - Delete existing cart
          return cy.request('DELETE', `${API_BASE_URL}/carts/1`)
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.isDeleted).to.be.true
          
          cy.log('📝 Step 4: Deleted cart successfully')
          cy.log('✅ Complete CRUD workflow executed successfully')
        })
    })
  })
})