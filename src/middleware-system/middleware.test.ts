import { describe, expect, it, vi } from 'vitest'
import Middleware from './middleware'

describe('Middleware', () => {
  // Helper function to create a request object
  const createRequest = () => ({ data: 'test' })

  describe('Chaining functions', () => {
    it('should be able to chain sync functions', () => {
      const middleware = new Middleware()
      const spy1 = vi.fn()
      const spy2 = vi.fn()

      middleware.use((req, next) => {
        spy1()
        next()
      })

      middleware.use((req, next) => {
        spy2()
        next()
      })

      middleware.start(createRequest())

      expect(spy1).toHaveBeenCalledTimes(1)
      expect(spy2).toHaveBeenCalledTimes(1)
    })

    it('should be able to chain async functions', async () => {
      const middleware = new Middleware()
      const results: number[] = []

      middleware.use(async (req, next) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        results.push(1)
        next()
      })

      middleware.use(async (req, next) => {
        await new Promise(resolve => setTimeout(resolve, 5))
        results.push(2)
        next()
      })

      middleware.start(createRequest())

      // Wait for all async operations to complete
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(results).toEqual([1, 2])
    })

    it('should run functions in order', () => {
      const middleware = new Middleware()
      const results: number[] = []

      middleware.use((req, next) => {
        results.push(1)
        next()
      })

      middleware.use((req, next) => {
        results.push(2)
        next()
      })

      middleware.use((req, next) => {
        results.push(3)
        next()
      })

      middleware.start(createRequest())

      expect(results).toEqual([1, 2, 3])
    })
  })

  describe('Error handling', () => {
    it('should catch errors using next(error)', () => {
      const middleware = new Middleware()
      const errorSpy = vi.fn()
      const error = new Error('Test error')

      middleware.use((req, next) => {
        next(error)
      })

      middleware.use((req, next) => {
        // This should be skipped
        vi.fn()()
        next()
      })

      middleware.use((err, req, next) => {
        errorSpy(err)
        next()
      })

      middleware.start(createRequest())

      expect(errorSpy).toHaveBeenCalledWith(error)
    })

    it('should catch thrown errors', () => {
      const middleware = new Middleware()
      const errorSpy = vi.fn()
      const error = new Error('Thrown error')

      middleware.use((req, next) => {
        throw error
      })

      middleware.use((req, next) => {
        // This should be skipped
        vi.fn()()
        next()
      })

      middleware.use((err, req, next) => {
        errorSpy(err)
        next()
      })

      middleware.start(createRequest())

      expect(errorSpy).toHaveBeenCalledWith(error)
    })

    it('should handle errors in error handlers', () => {
      const middleware = new Middleware()
      const errorSpy1 = vi.fn()
      const errorSpy2 = vi.fn()
      const error1 = new Error('First error')
      const error2 = new Error('Error handler error')

      middleware.use((req, next) => {
        next(error1)
      })

      middleware.use((err, req, next) => {
        errorSpy1(err)
        next(error2)
      })

      middleware.use((err, req, next) => {
        errorSpy2(err)
        next()
      })

      middleware.start(createRequest())

      expect(errorSpy1).toHaveBeenCalledWith(error1)
      expect(errorSpy2).toHaveBeenCalledWith(error2)
    })

    it('should handle thrown errors in error handlers', () => {
      const middleware = new Middleware()
      const errorSpy1 = vi.fn()
      const errorSpy2 = vi.fn()
      const error1 = new Error('First error')
      const error2 = new Error('Error handler error')

      middleware.use((req, next) => {
        next(error1)
      })

      middleware.use((err, req, next) => {
        errorSpy1(err)
        throw error2
      })

      middleware.use((err, req, next) => {
        errorSpy2(err)
        next()
      })

      middleware.start(createRequest())

      expect(errorSpy1).toHaveBeenCalledWith(error1)
      expect(errorSpy2).toHaveBeenCalledWith(error2)
    })
  })

  it('should skip middleware if next is not called', () => {
    const middleware = new Middleware()
    const spy1 = vi.fn()
    const spy2 = vi.fn()

    middleware.use((req, next) => {
      spy1()
      // No next() call, so the chain stops here
    })

    middleware.use((req, next) => {
      spy2()
      next()
    })

    middleware.start(createRequest())

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).not.toHaveBeenCalled()
  })

  it('should pass the request object to each middleware', () => {
    const middleware = new Middleware()
    const request = createRequest()
    const spy = vi.fn()

    middleware.use((req, next) => {
      spy(req)
      next()
    })

    middleware.start(request)

    expect(spy).toHaveBeenCalledWith(request)
  })
})
