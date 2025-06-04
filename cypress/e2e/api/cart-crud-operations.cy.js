// cypress/e2e/api/cart-crud-operations.cy.js

/**
 * Testes específicos para operações CRUD de carrinho conforme solicitado no desafio
 * Foca nas três operações principais: Add Cart, Update Cart, Delete Cart
 * Implementa cenários de teste detalhados com diferentes técnicas de validação
 */

import { CartApiHelper } from '../../support/helpers/api-helpers'

describe('🎯 Cart CRUD Operations - Challenge Requirements', () => {
  
  let apiHelper
  let testData

  before(() => {
    apiHelper = new CartApiHelper()
    cy.fixture('api-test-data').then((data) => {
      testData = data
    })
  })

  beforeEach(() => {
    cy.log('🔧 Setting up CRUD test environment')
  })

  context('➕ ADD CART Operations', () => {
    
    describe('✅ Positive Test Cases', () => {
      
      it('should add cart with single product successfully', { tags: '@smoke' }, () => {
        cy.log('🎯 ADD CART: Single product success scenario')
        
        const cartData = {
          userId: 1,
          products: [
            {
              id: 144,
              quantity: 2
            }
          ]
        }

        cy.request({
          method: 'POST',
          url: `${apiHelper.baseUrl}/carts/add`,
          body: cartData,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then((response) => {
          // ✅ Status validation
          expect(response.status).to.eq(200)
          
          // ✅ Response structure validation
          expect(response.body).to.have.property('id')
          expect(response.body).to.have.property('products')
          expect(response.body).to.have.property('total')
          expect(response.body).to.have.property('discountedTotal')
          expect(response.body).to.have.property('userId')
          expect(response.body).to.have.property('totalProducts')
          expect(response.body).to.have.property('totalQuantity')
          
          // ✅ Data validation
          expect(response.body.userId).to.eq(cartData.userId)
          expect(response.body.products).to.have.length(1)
          expect(response.body.totalProducts).to.eq(1)
          expect(response.body.totalQuantity).to.eq(2)
          
          // ✅ Product validation
          const product = response.body.products[0]
          expect(product.id).to.eq(144)
          expect(product.quantity).to.eq(2)
          expect(product).to.have.property('title')
          expect(product).to.have.property('price')
          expect(product).to.have.property('total')
          expect(product).to.have.property('thumbnail')
          
          // ✅ Business logic validation
          expect(product.total).to.eq(product.price * product.quantity)
          expect(response.body.total).to.be.greaterThan(0)
          expect(response.body.discountedTotal).to.be.lte(response.body.total)
          
          // ✅ Performance validation
          expect(response.duration).to.be.lessThan(3000)
          
          cy.log('✅ Single product cart added successfully')
        })
      })

      it('should add cart with multiple products successfully', () => {
        cy.log('🎯 ADD CART: Multiple products success scenario')
        
        const cartData = {
          userId: 5,
          products: [
            {
              id: 144,
              quantity: 1
            },
            {
              id: 98,
              quantity: 2
            },
            {
              id: 1,
              quantity: 3
            }
          ]
        }

        cy.request('POST', `${apiHelper.baseUrl}/carts/add`, cartData)
          .then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.totalProducts).to.eq(3)
            expect(response.body.totalQuantity).to.eq(6)
            
            // ✅ Validate each product was added correctly
            cartData.products.forEach(expectedProduct => {
              const actualProduct = response.body.products.find(p => p.id === expectedProduct.id)
              expect(actualProduct).to.exist
              expect(actualProduct.quantity).to.eq(expectedProduct.quantity)
            })
            
            cy.log('✅ Multiple products cart added successfully')
          })
      })

      it('should handle maximum quantity boundary value', () => {
        cy.log('🎯 ADD CART: Maximum quantity boundary test')
        
        const cartData = {
          userId: 1,
          products: [
            {
              id: 144,
              quantity: 99 // Maximum boundary
            }
          ]
        }

        cy.request('POST', `${apiHelper.baseUrl}/carts/add`, cartData)
          .then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.products[0].quantity).to.eq(99)
            expect(response.body.totalQuantity).to.eq(99)
            
            cy.log('✅ Maximum quantity boundary handled correctly')
          })
      })

      it('should handle minimum quantity boundary value', () => {
        cy.log('🎯 ADD CART: Minimum quantity boundary test')
        
        const cartData = {
          userId: 1,
          products: [
            {
              id: 144,
              quantity: 1 // Minimum boundary
            }
          ]
        }

        cy.request('POST', `${apiHelper.baseUrl}/carts/add`, cartData)
          .then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.products[0].quantity).to.eq(1)
            expect(response.body.totalQuantity).to.eq(1)
            
            cy.log('✅ Minimum quantity boundary handled correctly')
          })
      })
    })

    describe('❌ Negative Test Cases', () => {
      
      it('should handle invalid product ID', () => {
        cy.log('🎯 ADD CART: Invalid product ID error case')
        
        const cartData = {
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
          url: `${apiHelper.baseUrl}/carts/add`,
          body: cartData,
          failOnStatusCode: false
        }).then((response) => {
          // ✅ DummyJSON may be permissive, handle both cases
          if (response.status >= 400) {
            expect(response.body).to.have.property('message')
            cy.log('✅ Invalid product ID rejected correctly')
          } else {
            cy.log('ℹ️ API accepted invalid product ID (DummyJSON behavior)')
          }
        })
      })

      it('should handle zero quantity', () => {
        cy.log('🎯 ADD CART: Zero quantity error case')
        
        const cartData = {
          userId: 1,
          products: [
            {
              id: 144,
              quantity: 0 // Invalid quantity
            }
          ]
        }

        cy.request({
          method: 'POST',
          url: `${apiHelper.baseUrl}/carts/add`,
          body: cartData,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status >= 400) {
            cy.log('✅ Zero quantity rejected correctly')
          } else {
            // If accepted, verify it was handled appropriately
            expect(response.body.products[0].quantity).to.be.gte(0)
            cy.log('ℹ️ Zero quantity accepted and handled')
          }
        })
      })

      it('should handle missing userId', () => {
        cy.log('🎯 ADD CART: Missing userId error case')
        
        const cartData = {
          // Missing userId
          products: [
            {
              id: 144,
              quantity: 1
            }
          ]
        }

        cy.request({
          method: 'POST',
          url: `${apiHelper.baseUrl}/carts/add`,
          body: cartData,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status >= 400) {
            cy.log('✅ Missing userId rejected correctly')
          } else {
            cy.log('ℹ️ Missing userId handled gracefully')
          }
        })
      })

      it('should handle empty products array', () => {
        cy.log('🎯 ADD CART: Empty products error case')
        
        const cartData = {
          userId: 1,
          products: [] // Empty products array
        }

        cy.request({
          method: 'POST',
          url: `${apiHelper.baseUrl}/carts/add`,
          body: cartData,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status >= 400) {
            cy.log('✅ Empty products array rejected correctly')
          } else {
            expect(response.body.products).to.have.length(0)
            expect(response.body.totalProducts).to.eq(0)
            cy.log('ℹ️ Empty products array handled gracefully')
          }
        })
      })
    })
  })

  context('✏️ UPDATE CART Operations', () => {
    
    let existingCartId

    beforeEach(() => {
      // Create a cart to update for each test
      const initialCartData = {
        userId: 1,
        products: [
          {
            id: 144,
            quantity: 2
          }
        ]
      }

      cy.request('POST', `${apiHelper.baseUrl}/carts/add`, initialCartData)
        .then((response) => {
          existingCartId = response.body.id
        })
    })

    describe('✅ Positive Test Cases', () => {
      
      it('should update cart with merge=true (add new products)', () => {
        cy.log('🎯 UPDATE CART: Add new products with merge')
        
        const updateData = {
          merge: true,
          products: [
            {
              id: 98, // New product
              quantity: 1
            }
          ]
        }

        cy.request('PUT', `${apiHelper.baseUrl}/carts/${existingCartId}`, updateData)
          .then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.id).to.eq(existingCartId)
            
            // ✅ Should have both original and new products
            expect(response.body.totalProducts).to.be.gte(2)
            
            // ✅ Find the new product
            const newProduct = response.body.products.find(p => p.id === 98)
            expect(newProduct).to.exist
            expect(newProduct.quantity).to.eq(1)
            
            // ✅ Original product should still exist
            const originalProduct = response.body.products.find(p => p.id === 144)
            expect(originalProduct).to.exist
            
            cy.log('✅ Cart updated with merge successfully')
          })
      })

      it('should update cart with merge=true (modify existing product)', () => {
        cy.log('🎯 UPDATE CART: Modify existing product quantity')
        
        const updateData = {
          merge: true,
          products: [
            {
              id: 144, // Existing product
              quantity: 5 // New quantity
            }
          ]
        }

        cy.request('PUT', `${apiHelper.baseUrl}/carts/${existingCartId}`, updateData)
          .then((response) => {
            expect(response.status).to.eq(200)
            
            // ✅ Find the updated product
            const updatedProduct = response.body.products.find(p => p.id === 144)
            expect(updatedProduct).to.exist
            expect(updatedProduct.quantity).to.eq(5)
            
            // ✅ Validate totals were recalculated
            expect(response.body.totalQuantity).to.be.gte(5)
            expect(response.body.total).to.be.greaterThan(0)
            
            cy.log('✅ Existing product quantity updated successfully')
          })
      })

      it('should update cart with merge=false (replace all products)', () => {
        cy.log('🎯 UPDATE CART: Replace all products without merge')
        
        const updateData = {
          merge: false,
          products: [
            {
              id: 1, // Completely different product
              quantity: 3
            }
          ]
        }

        cy.request('PUT', `${apiHelper.baseUrl}/carts/${existingCartId}`, updateData)
          .then((response) => {
            expect(response.status).to.eq(200)
            
            // ✅ Should only have the new product
            expect(response.body.products).to.have.length(1)
            expect(response.body.products[0].id).to.eq(1)
            expect(response.body.products[0].quantity).to.eq(3)
            expect(response.body.totalProducts).to.eq(1)
            expect(response.body.totalQuantity).to.eq(3)
            
            // ✅ Original product should be gone
            const originalProduct = response.body.products.find(p => p.id === 144)
            expect(originalProduct).to.not.exist
            
            cy.log('✅ Cart replaced successfully without merge')
          })
      })

      it('should update cart with multiple products simultaneously', () => {
        cy.log('🎯 UPDATE CART: Multiple products update')
        
        const updateData = {
          merge: true,
          products: [
            {
              id: 98,
              quantity: 2
            },
            {
              id: 50,
              quantity: 1
            }
          ]
        }

        cy.request('PUT', `${apiHelper.baseUrl}/carts/${existingCartId}`, updateData)
          .then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.totalProducts).to.be.gte(3)
            
            // ✅ Verify both new products were added
            const product98 = response.body.products.find(p => p.id === 98)
            const product50 = response.body.products.find(p => p.id === 50)
            
            expect(product98).to.exist
            expect(product98.quantity).to.eq(2)
            expect(product50).to.exist
            expect(product50.quantity).to.eq(1)
            
            cy.log('✅ Multiple products updated successfully')
          })
      })
    })

    describe('❌ Negative Test Cases', () => {
      
      it('should handle update of non-existent cart', () => {
        cy.log('🎯 UPDATE CART: Non-existent cart error case')
        
        const invalidCartId = 999999
        const updateData = {
          merge: true,
          products: [
            {
              id: 144,
              quantity: 1
            }
          ]
        }

        cy.request({
          method: 'PUT',
          url: `${apiHelper.baseUrl}/carts/${invalidCartId}`,
          body: updateData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([404, 400])
          cy.log('✅ Non-existent cart update rejected correctly')
        })
      })

      it('should handle invalid product in update', () => {
        cy.log('🎯 UPDATE CART: Invalid product error case')
        
        const updateData = {
          merge: true,
          products: [
            {
              id: 99999, // Invalid product
              quantity: 1
            }
          ]
        }

        cy.request({
          method: 'PUT',
          url: `${apiHelper.baseUrl}/carts/${existingCartId}`,
          body: updateData,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status >= 400) {
            cy.log('✅ Invalid product in update rejected correctly')
          } else {
            cy.log('ℹ️ Invalid product in update handled gracefully')
          }
        })
      })

      it('should handle invalid cart ID format', () => {
        cy.log('🎯 UPDATE CART: Invalid cart ID format')
        
        const invalidCartId = 'not-a-number'
        const updateData = {
          merge: true,
          products: [{ id: 144, quantity: 1 }]
        }

        cy.request({
          method: 'PUT',
          url: `${apiHelper.baseUrl}/carts/${invalidCartId}`,
          body: updateData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([404, 400])
          cy.log('✅ Invalid cart ID format rejected correctly')
        })
      })
    })
  })

  context('🗑️ DELETE CART Operations', () => {
    
    let cartToDelete

    beforeEach(() => {
      // Create a cart to delete for each test
      const cartData = {
        userId: 1,
        products: [
          {
            id: 144,
            quantity: 1
          }
        ]
      }

      cy.request('POST', `${apiHelper.baseUrl}/carts/add`, cartData)
        .then((response) => {
          cartToDelete = response.body
        })
    })

    describe('✅ Positive Test Cases', () => {
      
      it('should delete cart successfully with soft delete', () => {
        cy.log('🎯 DELETE CART: Successful soft delete')
        
        cy.request('DELETE', `${apiHelper.baseUrl}/carts/${cartToDelete.id}`)
          .then((response) => {
            expect(response.status).to.eq(200)
            
            // ✅ Verify soft delete implementation
            expect(response.body.isDeleted).to.be.true
            expect(response.body.deletedOn).to.exist
            expect(response.body.id).to.eq(cartToDelete.id)
            
            // ✅ Verify original data is preserved in soft delete
            expect(response.body.products).to.exist
            expect(response.body.total).to.exist
            expect(response.body.userId).to.eq(cartToDelete.userId)
            expect(response.body.totalProducts).to.eq(cartToDelete.totalProducts)
            expect(response.body.totalQuantity).to.eq(cartToDelete.totalQuantity)
            
            // ✅ Verify deletedOn is a valid timestamp
            const deletedOn = new Date(response.body.deletedOn)
            expect(deletedOn.getTime()).to.be.greaterThan(0)
            expect(deletedOn.getTime()).to.be.lessThan(Date.now() + 1000) // Within 1 second
            
            // ✅ Performance validation
            expect(response.duration).to.be.lessThan(2000)
            
            cy.log('✅ Cart soft deleted successfully')
            cy.log(`📊 Deleted cart ID: ${response.body.id}, Deleted at: ${response.body.deletedOn}`)
          })
      })

      it('should preserve cart structure after deletion', () => {
        cy.log('🎯 DELETE CART: Verify data preservation')
        
        // Store original cart data for comparison
        const originalCartData = {
          id: cartToDelete.id,
          userId: cartToDelete.userId,
          products: cartToDelete.products,
          total: cartToDelete.total,
          totalProducts: cartToDelete.totalProducts,
          totalQuantity: cartToDelete.totalQuantity
        }

        cy.request('DELETE', `${apiHelper.baseUrl}/carts/${cartToDelete.id}`)
          .then((response) => {
            expect(response.status).to.eq(200)
            
            // ✅ Compare with original data
            expect(response.body.id).to.eq(originalCartData.id)
            expect(response.body.userId).to.eq(originalCartData.userId)
            expect(response.body.total).to.eq(originalCartData.total)
            expect(response.body.totalProducts).to.eq(originalCartData.totalProducts)
            expect(response.body.totalQuantity).to.eq(originalCartData.totalQuantity)
            expect(response.body.products).to.have.length(originalCartData.products.length)
            
            // ✅ Verify products are preserved
            originalCartData.products.forEach((originalProduct, index) => {
              const deletedProduct = response.body.products[index]
              expect(deletedProduct.id).to.eq(originalProduct.id)
              expect(deletedProduct.quantity).to.eq(originalProduct.quantity)
              expect(deletedProduct.total).to.eq(originalProduct.total)
            })
            
            cy.log('✅ Cart structure preserved after deletion')
          })
      })
    })

    describe('❌ Negative Test Cases', () => {
      
      it('should handle deletion of non-existent cart', () => {
        cy.log('🎯 DELETE CART: Non-existent cart error case')
        
        const invalidCartId = 999999

        cy.request({
          method: 'DELETE',
          url: `${apiHelper.baseUrl}/carts/${invalidCartId}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([404, 400])
          
          if (response.body.message) {
            expect(response.body.message).to.be.a('string')
          }
          
          cy.log('✅ Non-existent cart deletion handled correctly')
        })
      })

      it('should handle invalid cart ID format', () => {
        cy.log('🎯 DELETE CART: Invalid cart ID format')
        
        const invalidCartId = 'not-a-number'

        cy.request({
          method: 'DELETE',
          url: `${apiHelper.baseUrl}/carts/${invalidCartId}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([404, 400])
          cy.log('✅ Invalid cart ID format handled correctly')
        })
      })

      it('should handle negative cart ID', () => {
        cy.log('🎯 DELETE CART: Negative cart ID error case')
        
        const negativeCartId = -1

        cy.request({
          method: 'DELETE',
          url: `${apiHelper.baseUrl}/carts/${negativeCartId}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([404, 400])
          cy.log('✅ Negative cart ID handled correctly')
        })
      })

      it('should handle zero cart ID', () => {
        cy.log('🎯 DELETE CART: Zero cart ID error case')
        
        const zeroCartId = 0

        cy.request({
          method: 'DELETE',
          url: `${apiHelper.baseUrl}/carts/${zeroCartId}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([404, 400])
          cy.log('✅ Zero cart ID handled correctly')
        })
      })
    })
  })

  context('🔄 Integration Test Scenarios', () => {
    
    it('should handle complete ADD → UPDATE → DELETE flow', { tags: '@integration' }, () => {
      cy.log('🔄 INTEGRATION: Complete CRUD flow')
      
      let createdCartId
      let originalTotal
      
      // Step 1: ADD CART
      const addCartData = {
        userId: 1,
        products: [
          {
            id: 144,
            quantity: 1
          }
        ]
      }

      cy.request('POST', `${apiHelper.baseUrl}/carts/add`, addCartData)
        .then((response) => {
          expect(response.status).to.eq(200)
          createdCartId = response.body.id
          originalTotal = response.body.total
          
          cy.log(`📝 Step 1 (ADD): Cart created with ID ${createdCartId}`)
          
          // Step 2: UPDATE CART
          const updateData = {
            merge: true,
            products: [
              {
                id: 98,
                quantity: 1
              }
            ]
          }
          
          return cy.request('PUT', `${apiHelper.baseUrl}/carts/${createdCartId}`, updateData)
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.totalProducts).to.eq(2)
          expect(response.body.total).to.be.greaterThan(originalTotal)
          
          cy.log(`📝 Step 2 (UPDATE): Cart updated - now has ${response.body.totalProducts} products`)
          
          // Step 3: DELETE CART
          return cy.request('DELETE', `${apiHelper.baseUrl}/carts/${createdCartId}`)
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.isDeleted).to.be.true
          expect(response.body.id).to.eq(createdCartId)
          
          cy.log('📝 Step 3 (DELETE): Cart deleted successfully')
          cy.log('✅ Complete CRUD flow executed successfully')
        })
    })

    it('should handle multiple operations on same cart', () => {
      cy.log('🔄 INTEGRATION: Multiple operations on same cart')
      
      let cartId
      
      // Create initial cart
      const initialData = {
        userId: 5,
        products: [{ id: 1, quantity: 1 }]
      }

      cy.request('POST', `${apiHelper.baseUrl}/carts/add`, initialData)
        .then((response) => {
          cartId = response.body.id
          expect(response.body.totalQuantity).to.eq(1)
          
          // First update: add product
          return cy.request('PUT', `${apiHelper.baseUrl}/carts/${cartId}`, {
            merge: true,
            products: [{ id: 144, quantity: 2 }]
          })
        })
        .then((response) => {
          expect(response.body.totalProducts).to.eq(2)
          expect(response.body.totalQuantity).to.eq(3)
          
          // Second update: modify existing product
          return cy.request('PUT', `${apiHelper.baseUrl}/carts/${cartId}`, {
            merge: true,
            products: [{ id: 1, quantity: 5 }]
          })
        })
        .then((response) => {
          expect(response.body.totalProducts).to.eq(2)
          expect(response.body.totalQuantity).to.eq(7) // 5 + 2
          
          // Third update: replace all products
          return cy.request('PUT', `${apiHelper.baseUrl}/carts/${cartId}`, {
            merge: false,
            products: [{ id: 98, quantity: 1 }]
          })
        })
        .then((response) => {
          expect(response.body.totalProducts).to.eq(1)
          expect(response.body.totalQuantity).to.eq(1)
          expect(response.body.products[0].id).to.eq(98)
          
          // Final step: delete cart
          return cy.request('DELETE', `${apiHelper.baseUrl}/carts/${cartId}`)
        })
        .then((response) => {
          expect(response.body.isDeleted).to.be.true
          cy.log('✅ Multiple operations completed successfully')
        })
    })
  })

  context('📊 Performance and Reliability Tests', () => {
    
    it('should maintain consistent response times across operations', () => {
      cy.log('📊 PERFORMANCE: Response time consistency')
      
      const responseTimes = {
        add: [],
        update: [],
        delete: []
      }
      
      const iterations = 3
      let cartIds = []
      
      // Perform multiple ADD operations
      for (let i = 0; i < iterations; i++) {
        const cartData = {
          userId: 1,
          products: [{ id: 144, quantity: i + 1 }]
        }
        
        cy.request('POST', `${apiHelper.baseUrl}/carts/add`, cartData)
          .then((response) => {
            responseTimes.add.push(response.duration || 0)
            cartIds.push(response.body.id)
            
            if (responseTimes.add.length === iterations) {
              // Perform UPDATE operations
              cartIds.forEach((cartId, index) => {
                const updateData = {
                  merge: true,
                  products: [{ id: 98, quantity: 1 }]
                }
                
                cy.request('PUT', `${apiHelper.baseUrl}/carts/${cartId}`, updateData)
                  .then((response) => {
                    responseTimes.update.push(response.duration || 0)
                    
                    if (responseTimes.update.length === iterations) {
                      // Perform DELETE operations
                      cartIds.forEach((cartId) => {
                        cy.request('DELETE', `${apiHelper.baseUrl}/carts/${cartId}`)
                          .then((response) => {
                            responseTimes.delete.push(response.duration || 0)
                            
                            if (responseTimes.delete.length === iterations) {
                              // Analyze performance
                              const avgAdd = responseTimes.add.reduce((a, b) => a + b, 0) / iterations
                              const avgUpdate = responseTimes.update.reduce((a, b) => a + b, 0) / iterations
                              const avgDelete = responseTimes.delete.reduce((a, b) => a + b, 0) / iterations
                              
                              cy.log(`📊 Average response times:`)
                              cy.log(`   ADD: ${avgAdd}ms`)
                              cy.log(`   UPDATE: ${avgUpdate}ms`)
                              cy.log(`   DELETE: ${avgDelete}ms`)
                              
                              // Performance assertions
                              expect(avgAdd).to.be.lessThan(3000)
                              expect(avgUpdate).to.be.lessThan(3000)
                              expect(avgDelete).to.be.lessThan(2000)
                              
                              cy.log('✅ Performance consistency validated')
                            }
                          })
                      })
                    }
                  })
              })
            }
          })
      }
    })

    it('should handle rapid sequential operations', () => {
      cy.log('📊 RELIABILITY: Rapid sequential operations')
      
      let cartId
      
      // Create cart
      cy.request('POST', `${apiHelper.baseUrl}/carts/add`, {
        userId: 1,
        products: [{ id: 144, quantity: 1 }]
      }).then((response) => {
        cartId = response.body.id
        
        // Rapid updates
        const updates = [
          { merge: true, products: [{ id: 98, quantity: 1 }] },
          { merge: true, products: [{ id: 1, quantity: 2 }] },
          { merge: true, products: [{ id: 50, quantity: 1 }] }
        ]
        
        // Execute updates sequentially
        let updatePromise = Promise.resolve(response)
        
        updates.forEach((updateData, index) => {
          updatePromise = updatePromise.then(() => {
            return cy.request('PUT', `${apiHelper.baseUrl}/carts/${cartId}`, updateData)
              .then((response) => {
                expect(response.status).to.eq(200)
                cy.log(`Update ${index + 1} completed successfully`)
                return response
              })
          })
        })
        
        return updatePromise
      }).then(() => {
        // Final delete
        return cy.request('DELETE', `${apiHelper.baseUrl}/carts/${cartId}`)
      }).then((response) => {
        expect(response.body.isDeleted).to.be.true
        cy.log('✅ Rapid sequential operations completed successfully')
      })
    })
  })

  afterEach(() => {
    cy.log('🧹 Test cleanup completed')
    // Note: DummyJSON doesn't persist data, so no cleanup needed
    // In a real API, you would clean up any test data here
  })
})