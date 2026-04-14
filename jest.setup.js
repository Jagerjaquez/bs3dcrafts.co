// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js Request/Response for API tests
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, options = {}) {
      this.url = url
      this.method = options.method || 'GET'
      this.headers = new Map()
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          this.headers.set(key, value)
        })
      }
      this.body = options.body
    }
    
    get(name) {
      return this.headers.get(name)
    }
  }
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, options = {}) {
      this.body = body
      this.status = options.status || 200
      this.headers = new Map()
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          this.headers.set(key, value)
        })
      }
    }
    
    json() {
      return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body)
    }
    
    text() {
      return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body))
    }
  }
}

// Mock TextEncoder/TextDecoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder
}

// Mock fetch for tests
global.fetch = global.fetch || jest.fn()

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_URL = 'file:./test.db'
