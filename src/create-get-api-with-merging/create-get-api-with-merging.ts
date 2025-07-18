type GetAPI = (path: string, config: any) => Promise<any>

type WithMerging = {
  clearCache: () => void
}

type CacheOptions = {
  ttl: number
  maxEntries: number
}

class LocalCache {
  private keysQueue: string[]
  private cache: Map<string, Promise<any>>

  constructor(readonly options: CacheOptions) {
    this.keysQueue = []
    this.cache = new Map()
  }

  get(key: string): any | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: any): void {
    this.cache.set(key, value)
    this.keysQueue.push(key)

    setTimeout(() => {
      this.delete(key)
    }, this.options.ttl)

    if (this.keysQueue.length > this.options.maxEntries) {
      const oldKey = this.keysQueue.shift()!
      this.cache.delete(oldKey)
    }
  }

  delete(key: string): boolean {
    this.keysQueue = this.keysQueue.filter(k => k !== key)
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.keysQueue = []
  }
}

const createCacheKey = (path: string, config: any): string => {
  const keyEntries: string[] = [path]
  const sortedKeys = Object.keys(config).sort()
  for (const key of sortedKeys) {
    keyEntries.push(config[key])
  }
  return keyEntries.join('-')
}

export const createGetAPIWithMerging = (
  getAPI: GetAPI,
  options: CacheOptions = {
    ttl: 1000,
    maxEntries: 5
  }
): GetAPI & WithMerging => {
  const cache = new LocalCache(options)

  const wrappedGetAPI: GetAPI & WithMerging = (path, config) => {
    const cacheKey = createCacheKey(path, config)

    let promise = cache.get(cacheKey)
    if (promise) {
      return promise
    }

    promise = new Promise((resolve, reject) => {
      try {
        resolve(getAPI(path, config))
      } catch (err) {
        reject(err)
      }
    }).catch(error => {
      cache.delete(cacheKey)
      throw error
    })

    cache.set(cacheKey, promise)
    return promise
  }

  wrappedGetAPI.clearCache = () => {
    cache.clear()
  }

  return wrappedGetAPI
}

export default createGetAPIWithMerging
