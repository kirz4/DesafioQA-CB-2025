const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // 🌐 URLs base para os testes
    baseUrl: 'https://app-hom.cocobambu.com',
    
    // ⚙️ Configurações de viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // 📹 Configurações de mídia
    video: true,
    videoUploadOnPasses: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // ⏱️ Timeouts
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // 🔄 Retry configuration
    retries: {
      runMode: 2,    // CI/CD environment
      openMode: 0    // Local development
    },
    
    // 📊 Reporter configuration
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      charts: true,
      reportPageTitle: 'Coco Bambu QA Test Report',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
      reportDir: 'cypress/reports',
      reportFilename: 'report-[datetime]'
    },
    
    // 🌍 Environment variables
    env: {
      // API Configuration
      apiUrl: 'https://dummyjson.com',
      apiTimeout: 10000,
      
      // Test Data
      testUser: {
        email: 'test@cocobambu.com',
        password: 'Test123!'
      },
      
      // Feature Flags
      enableApiTests: true,
      enablePerformanceTests: true,
      enableVisualTests: false,
      
      // Test Configuration
      maxRetries: 3,
      slowTestThreshold: 5000,
      
      // Browser Configuration
      chromeWebSecurity: false,
      modifyObstructiveCode: false
    },
    
    // 📁 Spec patterns
    specPattern: [
      'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}'
    ],
    
    // 🚫 Exclude patterns
    excludeSpecPattern: [
      'cypress/e2e/examples/*',
      '**/__snapshots__/*',
      '**/__image_snapshots__/*'
    ],
    
    // 📦 Support file
    supportFile: 'cypress/support/e2e.js',
    
    // 🗂️ Fixtures folder
    fixturesFolder: 'cypress/fixtures',
    
    // ⚡ Experimental features
    experimentalStudio: true,
    experimentalWebKitSupport: false,
    
    // 🔧 Node events setup
    setupNodeEvents(on, config) {
      // Cypress Mochawesome Reporter plugin
      require('cypress-mochawesome-reporter/plugin')(on)
      
      // Grep plugin for test filtering
      require('@cypress/grep/src/plugin')(config)
      
      // Custom tasks
      on('task', {
        // 📝 Log custom messages
        log(message) {
          console.log(message)
          return null
        },
        
        // 📊 Generate test data
        generateTestData() {
          const faker = require('faker')
          return {
            user: {
              name: faker.name.findName(),
              email: faker.internet.email(),
              phone: faker.phone.phoneNumber(),
              address: {
                street: faker.address.streetAddress(),
                city: faker.address.city(),
                zipCode: faker.address.zipCode()
              }
            },
            product: {
              name: faker.commerce.productName(),
              price: faker.commerce.price(),
              description: faker.commerce.productDescription()
            }
          }
        },
        
        // 🧹 Clean up test data
        cleanupTestData() {
          // Implementation for cleaning up test data
          console.log('Cleaning up test data...')
          return null
        }
      })
      
      // 🔍 Browser launch options
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--disable-gpu')
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-web-security')
          launchOptions.args.push('--allow-running-insecure-content')
        }
        
        if (browser.name === 'firefox') {
          launchOptions.preferences['dom.webnotifications.enabled'] = false
          launchOptions.preferences['dom.push.enabled'] = false
        }
        
        return launchOptions
      })
      
      // 📈 Performance monitoring
      on('after:spec', (spec, results) => {
        console.log('Test completed:', spec.relative)
        console.log('Duration:', results.stats.duration, 'ms')
        
        if (results.stats.failures > 0) {
          console.log('❌ Failed tests:', results.stats.failures)
        } else {
          console.log('✅ All tests passed!')
        }
      })
      
      return config
    }
  },
  
  // 🧩 Component testing configuration (for future use)
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  }
})