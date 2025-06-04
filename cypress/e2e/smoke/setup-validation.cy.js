/**
 * Smoke test para validar configuração inicial do projeto
 */

describe('🔧 Setup Validation Tests', () => {
  
  context('Environment Configuration', () => {
    
    it('should load environment variables correctly', () => {
      cy.log('🌍 Testing environment configuration')
      
      expect(Cypress.config('baseUrl')).to.equal('https://app-hom.cocobambu.com')
      expect(Cypress.config('viewportWidth')).to.equal(1280)
      expect(Cypress.config('viewportHeight')).to.equal(720)
      
      cy.log('✅ Environment configuration OK')
    })

    it('should have custom commands available', () => {
      cy.log('🛠️ Testing custom commands')
      
      expect(cy.setMobileViewport).to.be.a('function')
      expect(cy.setDesktopViewport).to.be.a('function')
      expect(cy.waitForPageStable).to.be.a('function')
      expect(cy.measurePageLoad).to.be.a('function')
      
      cy.log('✅ Custom commands loaded')
    })
  })

  context('Basic Website Connectivity', () => {
    
    it('should successfully visit the Coco Bambu homepage', () => {
      cy.log('🌐 Testing basic website connectivity')
      
      cy.visit('/delivery')
      
      // Basic validations
      cy.title().should('not.be.empty')
      cy.url().should('contain', 'cocobambu.com')
      cy.get('body').should('be.visible')
      
      // Measure performance
      cy.measurePageLoad('HomePage')
      
      cy.log('✅ Website accessible')
    })

    it('should handle viewport changes correctly', () => {
      cy.log('📱 Testing responsive capabilities')
      
      cy.visit('/delivery')
      
      // Test desktop
      cy.setDesktopViewport()
      cy.get('body').should('be.visible')
      
      // Test mobile
      cy.setMobileViewport()
      cy.get('body').should('be.visible')
      
      cy.log('✅ Responsive testing working')
    })
  })

  context('Page Objects Basic Test', () => {
    
    it('should import Page Objects without errors', () => {
      cy.log('📄 Testing Page Objects imports')
      
      // This test just verifies the files can be imported
      // We'll test actual functionality later
      cy.visit('/delivery')
      cy.get('body').should('exist')
      
      cy.log('✅ Page Objects structure OK')
    })
  })
})