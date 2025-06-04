/**
 * Smoke test simples para validar se os testes de API estão funcionando
 * Testa as três operações principais de forma básica
 */

describe('🧪 API Smoke Tests - Quick Validation', () => {
  
  const API_BASE_URL = 'https://dummyjson.com'

  beforeEach(() => {
    cy.log('🔧 Setting up API smoke test')
  })

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
        // Basic validations
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('id')
        expect(response.body).to.have.property('products')
        expect(response.body.userId).to.eq(1)
        expect(response.body.products).to.have.length(1)
        expect(response.body.products[0].id).to.eq(144)
        expect(response.body.products[0].quantity).to.eq(1)
        
        cy.log('✅ ADD CART working correctly')
      })
    })
  })

  context('Update Cart - Basic Test', () => {
    
    it('should update a cart successfully', () => {
      cy.log('✏️ Testing UPDATE CART basic functionality')
      
      // First create a cart
      const initialCartData = {
        userId: 1,
        products: [{ id: 144, quantity: 1 }]
      }

      cy.request('POST', `${API_BASE_URL}/carts/add`, initialCartData)
        .then((response) => {
          const cartId = response.body.id
          
          // Now update it
          const updateData = {
            merge: true,
            products: [{ id: 98, quantity: 2 }]
          }
          
          return cy.request('PUT', `${API_BASE_URL}/carts/${cartId}`, updateData)
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.totalProducts).to.be.gte(2)
          
          // Should have both products
          const product98 = response.body.products.find(p => p.id === 98)
          const product144 = response.body.products.find(p => p.id === 144)
          
          expect(product98).to.exist
          expect(product98.quantity).to.eq(2)
          expect(product144).to.exist
          
          cy.log('✅ UPDATE CART working correctly')
        })
    })
  })

  context('Delete Cart - Basic Test', () => {
    
    it('should delete a cart successfully', () => {
      cy.log('🗑️ Testing DELETE CART basic functionality')
      
      // First create a cart
      const cartData = {
        userId: 1,
        products: [{ id: 144, quantity: 1 }]
      }

      cy.request('POST', `${API_BASE_URL}/carts/add`, cartData)
        .then((response) => {
          const cartId = response.body.id
          
          // Now delete it
          return cy.request('DELETE', `${API_BASE_URL}/carts/${cartId}`)
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.isDeleted).to.be.true
          expect(response.body.deletedOn).to.exist
          expect(response.body).to.have.property('id')
          
          cy.log('✅ DELETE CART working correctly')
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
})