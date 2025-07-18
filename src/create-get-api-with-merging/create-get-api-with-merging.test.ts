import { createGetAPIWithMerging } from './create-get-api-with-merging'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('createGetAPIWithMerging', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Basic functionality tests
  describe('Basic functionality', () => {
    it('should pass through API calls correctly', async () => {
      const mockResponse = { data: 'test data' }
      const mockGetAPI = vi.fn().mockResolvedValue(mockResponse)
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI)
      const path = '/test'
      const config = { headers: { 'Content-Type': 'application/json' } }

      const result = await getAPIWithCache(path, config)

      expect(mockGetAPI).toHaveBeenCalledWith(path, config)
      expect(result).toEqual(mockResponse)
    })

    it('should cache responses', async () => {
      const mockResponse = { data: 'test data' }
      const mockGetAPI = vi.fn().mockResolvedValue(mockResponse)
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI)
      const path = '/test'
      const config = { headers: { 'Content-Type': 'application/json' } }

      await getAPIWithCache(path, config)
      await getAPIWithCache(path, config)

      expect(mockGetAPI).toHaveBeenCalledTimes(1)
    })

    it('should clear cache when clearCache is called', async () => {
      const mockResponse = { data: 'test data' }
      const mockGetAPI = vi.fn().mockResolvedValue(mockResponse)
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI)
      const path = '/test'
      const config = { headers: { 'Content-Type': 'application/json' } }

      await getAPIWithCache(path, config)
      getAPIWithCache.clearCache()
      await getAPIWithCache(path, config)

      expect(mockGetAPI).toHaveBeenCalledTimes(2)
    })
  })

  // Cache expiration tests
  describe('Cache expiration', () => {
    it('should expire cache entries after TTL', async () => {
      const ttl = 1000 // 1 second
      const mockResponse = { data: 'test data' }
      const mockGetAPI = vi.fn().mockResolvedValue(mockResponse)
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI, {
        ttl,
        maxEntries: 5
      })
      const path = '/test'
      const config = { headers: { 'Content-Type': 'application/json' } }

      await getAPIWithCache(path, config)

      // Move time forward just before expiration
      vi.advanceTimersByTime(ttl - 1)
      await getAPIWithCache(path, config)

      // Move time forward past expiration
      vi.advanceTimersByTime(2)
      await getAPIWithCache(path, config)

      expect(mockGetAPI).toHaveBeenCalledTimes(2)
    })

    it('should handle multiple cache entries with different expirations', async () => {
      const ttl = 1000 // 1 second
      const mockGetAPI = vi
        .fn()
        .mockImplementation(path =>
          Promise.resolve({ data: `response for ${path}` })
        )
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI, {
        ttl,
        maxEntries: 5
      })

      await getAPIWithCache('/test1', {})
      await getAPIWithCache('/test2', {})
      await getAPIWithCache('/test3', {})
      await getAPIWithCache('/test4', {})
      await getAPIWithCache('/test5', {})

      // Move time forward just before expiration
      vi.advanceTimersByTime(ttl - 1)

      await getAPIWithCache('/test1', {})

      // Move time forward past expiration for '/test1'
      vi.advanceTimersByTime(2)
      await getAPIWithCache('/test1', {})

      expect(mockGetAPI).toHaveBeenCalledTimes(6) // 5 initial calls + 1 for '/test1' after expiration
    })
  })

  // Cache size limit tests
  describe('Cache size limits', () => {
    it('should remove oldest entries when cache size exceeds maxEntries', async () => {
      const maxEntries = 3
      const mockGetAPI = vi
        .fn()
        .mockImplementation(path =>
          Promise.resolve({ data: `response for ${path}` })
        )
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI, {
        ttl: 10000,
        maxEntries
      })

      await getAPIWithCache('/test1', {})
      await getAPIWithCache('/test2', {})
      await getAPIWithCache('/test3', {})

      // This should cause /test1 to be removed
      await getAPIWithCache('/test4', {})

      // Check if /test1 is gone from cache and needs to be fetched again
      await getAPIWithCache('/test1', {})

      // These should still be in cache
      await getAPIWithCache('/test3', {})
      await getAPIWithCache('/test4', {})

      expect(mockGetAPI).toHaveBeenCalledTimes(5)
    })
  })

  // Edge cases
  describe('Edge cases', () => {
    it('should handle API rejection correctly', async () => {
      const error = new Error('API failure')
      const mockGetAPI = vi.fn().mockRejectedValue(error)
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI)

      await expect(getAPIWithCache('/test', {})).rejects.toThrow('API failure')
    })

    it('should handle complex config objects correctly', async () => {
      const mockResponse = { data: 'test data' }
      const mockGetAPI = vi.fn().mockResolvedValue(mockResponse)
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI)
      const complexConfig = {
        headers: { 'Content-Type': 'application/json' },
        params: { id: 123, filters: ['active', 'recent'] },
        auth: { username: 'user', password: 'pass' },
        timeout: 5000,
        nestedObject: { a: { b: { c: 'd' } } }
      }

      await getAPIWithCache('/test', complexConfig)
      await getAPIWithCache('/test', complexConfig)

      expect(mockGetAPI).toHaveBeenCalledTimes(1)
    })

    it('should differentiate between identical paths with different configs', async () => {
      const mockGetAPI = vi
        .fn()
        .mockImplementation((path, config) =>
          Promise.resolve({ data: `response for ${path} with ${config.param}` })
        )
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI)
      const path = '/test'

      await getAPIWithCache(path, { param: 'value1' })
      await getAPIWithCache(path, { param: 'value2' })

      // Call again with same configs
      await getAPIWithCache(path, { param: 'value1' })
      await getAPIWithCache(path, { param: 'value2' })

      expect(mockGetAPI).toHaveBeenCalledTimes(2)
    })

    it('should handle concurrent requests for the same resource', async () => {
      let resolveAPI: (value: any) => void
      const apiPromise = new Promise(resolve => {
        resolveAPI = resolve
      })

      const mockGetAPI = vi.fn().mockImplementation(() => apiPromise)
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI)
      const path = '/test'
      const config = {}

      const promise1 = getAPIWithCache(path, config)
      const promise2 = getAPIWithCache(path, config)

      // Resolve the API call
      resolveAPI!({ data: 'test data' })

      // Wait for both promises to resolve
      const [result1, result2] = await Promise.all([promise1, promise2])

      expect(mockGetAPI).toHaveBeenCalledTimes(1)
      expect(result1).toEqual(result2)
    })

    it('should handle zero TTL and maxEntries', async () => {
      const mockGetAPI = vi.fn().mockResolvedValue({ data: 'test data' })
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI, {
        ttl: 0,
        maxEntries: 0
      })

      await getAPIWithCache('/test', {})
      await getAPIWithCache('/test', {})

      expect(mockGetAPI).toHaveBeenCalledTimes(2)
    })

    it('should handle synchronous getAPI functions', async () => {
      // Create a sync function that returns a value directly (not a Promise)
      const mockGetAPI = vi.fn((path, config) => ({
        data: `sync response for ${path}`
      }))
      // @ts-expect-error
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI)
      const path = '/test-sync'
      const config = { param: 'value' }

      const result1 = await getAPIWithCache(path, config)
      const result2 = await getAPIWithCache(path, config)

      expect(mockGetAPI).toHaveBeenCalledTimes(1) // Should be called only once due to caching
      expect(result1).toEqual({ data: 'sync response for /test-sync' })
      expect(result2).toEqual({ data: 'sync response for /test-sync' })
      expect(result1).toBe(result2) // Should return the exact same Promise result
    })

    it('should handle synchronous getAPI functions that throw errors', async () => {
      const mockGetAPI = vi.fn(() => {
        throw new Error('Sync API failure')
      })

      const getAPIWithCache = createGetAPIWithMerging(() => mockGetAPI())

      await expect(() => getAPIWithCache('/test-error', {})).rejects.toThrow(
        'Sync API failure'
      )

      // Try again to ensure it's not cached
      await expect(() => getAPIWithCache('/test-error', {})).rejects.toThrow(
        'Sync API failure'
      )
      expect(mockGetAPI).toHaveBeenCalledTimes(2)
    })
  })

  // Performance tests
  describe('Performance', () => {
    it('should handle a large number of different requests', async () => {
      const mockGetAPI = vi
        .fn()
        .mockImplementation(path =>
          Promise.resolve({ data: `response for ${path}` })
        )
      const getAPIWithCache = createGetAPIWithMerging(mockGetAPI, {
        ttl: 10000,
        maxEntries: 100
      })

      const promises = []
      for (let i = 0; i < 200; i++) {
        // @ts-expect-error
        promises.push(getAPIWithCache(`/test${i}`, {}))
      }

      await Promise.all(promises)

      expect(mockGetAPI).toHaveBeenCalledTimes(200)
    })
  })
})
