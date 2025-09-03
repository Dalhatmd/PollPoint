import '@testing-library/jest-dom'

// Polyfill for TextEncoder and TextDecoder
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill for Web APIs needed by Next.js Server Actions
// Create comprehensive polyfills for Request, Response, and Headers
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers);
      this.body = init.body;
      this.bodyUsed = false;
    }
    
    async text() {
      this.bodyUsed = true;
      return this.body ? String(this.body) : '';
    }
    
    async json() {
      this.bodyUsed = true;
      return this.body ? JSON.parse(String(this.body)) : {};
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new Headers(init.headers);
      this.ok = this.status >= 200 && this.status < 300;
    }
    
    async text() {
      return this.body ? String(this.body) : '';
    }
    
    async json() {
      return this.body ? JSON.parse(String(this.body)) : {};
    }
  };
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = new Map();
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else if (typeof init === 'object') {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }
    
    set(name, value) {
      this._headers.set(name.toLowerCase(), String(value));
    }
    
    get(name) {
      return this._headers.get(name.toLowerCase()) || null;
    }
    
    has(name) {
      return this._headers.has(name.toLowerCase());
    }
    
    delete(name) {
      return this._headers.delete(name.toLowerCase());
    }
    
    forEach(callback) {
      this._headers.forEach((value, key) => callback(value, key, this));
    }
    
    *[Symbol.iterator]() {
      for (const [key, value] of this._headers) {
        yield [key, value];
      }
    }
  };
}

// Polyfill for other Web APIs that might be needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
