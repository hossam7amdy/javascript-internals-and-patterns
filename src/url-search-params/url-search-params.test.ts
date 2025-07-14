import { describe, it, expect } from 'vitest'
import MyURLSearchParams from './url-search-params'

describe('MyURLSearchParams', () => {
  describe('constructor', () => {
    it('should initialize with no arguments', () => {
      const params = new MyURLSearchParams()
      expect(params.toString()).toBe('')
      expect(Array.from(params.entries())).toEqual([])
    })

    it('should initialize from a string', () => {
      const params = new MyURLSearchParams('a=1&b=2&c=3')
      expect(params.get('a')).toBe('1')
      expect(params.get('b')).toBe('2')
      expect(params.get('c')).toBe('3')
    })

    it('should initialize from a string with ? prefix', () => {
      const params = new MyURLSearchParams('?a=1&b=2&c=3')
      expect(params.get('a')).toBe('1')
      expect(params.get('b')).toBe('2')
      expect(params.get('c')).toBe('3')
    })

    it('should initialize from a record', () => {
      const params = new MyURLSearchParams({ a: '1', b: '2', c: '3' })
      expect(params.get('a')).toBe('1')
      expect(params.get('b')).toBe('2')
      expect(params.get('c')).toBe('3')
    })

    it('should initialize from an iterable of key-value pairs', () => {
      const pairs: [string, string][] = [
        ['a', '1'],
        ['b', '2'],
        ['c', '3']
      ]
      const params = new MyURLSearchParams(pairs)
      expect(params.get('a')).toBe('1')
      expect(params.get('b')).toBe('2')
      expect(params.get('c')).toBe('3')
    })

    it('should handle percent encoding in constructor', () => {
      const params = new MyURLSearchParams('a=hello%20world&b=%25')
      expect(params.get('a')).toBe('hello world')
      expect(params.get('b')).toBe('%')
    })

    it('should handle + as space in constructor', () => {
      const params = new MyURLSearchParams('a=hello+world')
      expect(params.get('a')).toBe('hello world')
    })

    it('should handle multiple values for same key in constructor', () => {
      const params = new MyURLSearchParams('a=1&a=2&a=3')
      expect(params.getAll('a')).toEqual(['1', '2', '3'])
    })

    it('should handle empty values', () => {
      const params = new MyURLSearchParams('a=&b&c=')
      expect(params.get('a')).toBe('')
      expect(params.get('b')).toBe('')
      expect(params.get('c')).toBe('')
      expect(params.has('a')).toBe(true)
      expect(params.has('b')).toBe(true)
      expect(params.has('c')).toBe(true)
    })
  })

  describe('append', () => {
    it('should append a new key-value pair', () => {
      const params = new MyURLSearchParams()
      params.append('a', '1')
      expect(params.get('a')).toBe('1')
    })

    it('should append a new value to an existing key', () => {
      const params = new MyURLSearchParams('a=1')
      params.append('a', '2')
      expect(params.getAll('a')).toEqual(['1', '2'])
    })

    it('should perform percent encoding when appending', () => {
      const params = new MyURLSearchParams()
      params.append('a', 'hello world')
      expect(params.toString()).toBe('a=hello+world')
    })
  })

  describe('delete', () => {
    it('should delete all values for a key', () => {
      const params = new MyURLSearchParams('a=1&a=2&b=3')
      params.delete('a')
      expect(params.has('a')).toBe(false)
      expect(params.get('b')).toBe('3')
    })

    it('should do nothing when deleting a non-existent key', () => {
      const params = new MyURLSearchParams('a=1')
      params.delete('b')
      expect(params.get('a')).toBe('1')
    })
  })

  describe('get', () => {
    it('should return the first value for a key', () => {
      const params = new MyURLSearchParams('a=1&a=2')
      expect(params.get('a')).toBe('1')
    })

    it('should return null for a non-existent key', () => {
      const params = new MyURLSearchParams()
      expect(params.get('a')).toBe(null)
    })

    it('should parse full url', () => {
      const params = new MyURLSearchParams('https://google.com?a=1&b=2')
      expect(params.get('https://google.com?a')).toBe('1')
      expect(params.get('b')).toBe('2')
    })
  })

  describe('getAll', () => {
    it('should return all values for a key', () => {
      const params = new MyURLSearchParams('a=1&a=2&a=3')
      expect(params.getAll('a')).toEqual(['1', '2', '3'])
    })

    it('should return an empty array for a non-existent key', () => {
      const params = new MyURLSearchParams()
      expect(params.getAll('a')).toEqual([])
    })
  })

  describe('has', () => {
    it('should return true for an existing key', () => {
      const params = new MyURLSearchParams('a=1')
      expect(params.has('a')).toBe(true)
    })

    it('should return false for a non-existent key', () => {
      const params = new MyURLSearchParams()
      expect(params.has('a')).toBe(false)
    })
  })

  describe('set', () => {
    it('should set a value for a new key', () => {
      const params = new MyURLSearchParams()
      params.set('a', '1')
      expect(params.get('a')).toBe('1')
    })

    it('should replace all values for an existing key', () => {
      const params = new MyURLSearchParams('a=1&a=2')
      params.set('a', '3')
      expect(params.getAll('a')).toEqual(['3'])
    })

    it('should perform percent encoding when setting', () => {
      const params = new MyURLSearchParams()
      params.set('a', 'hello world')
      expect(params.toString()).toBe('a=hello+world')
    })
  })

  describe('sort', () => {
    it('should sort the keys', () => {
      const params = new MyURLSearchParams('c=3&a=1&b=2')
      params.sort()
      expect(Array.from(params.keys())).toEqual(['a', 'b', 'c'])
      expect(params.toString()).toBe('a=1&b=2&c=3')
    })

    it('should maintain order of same-name keys', () => {
      const params = new MyURLSearchParams('c=3&a=1&b=2&a=4')
      params.sort()
      const entries = Array.from(params.entries())
      expect(entries).toEqual([
        ['a', '1'],
        ['a', '4'],
        ['b', '2'],
        ['c', '3']
      ])
    })
  })

  describe('toString', () => {
    it('should serialize to a string', () => {
      const params = new MyURLSearchParams()
      params.append('a', '1')
      params.append('b', '2')
      expect(params.toString()).toBe('a=1&b=2')
    })

    // TODO:
    it.skip('should encode special characters in output', () => {
      const params = new MyURLSearchParams()
      params.append('a', 'hello world')
      params.append('b', '50%')
      expect(params.toString()).toBe('a=hello+world&b=50%25')
    })

    it('should serialize multiple values for the same key', () => {
      const params = new MyURLSearchParams()
      params.append('a', '1')
      params.append('a', '2')
      expect(params.toString()).toBe('a=1&a=2')
    })

    it('should include keys with empty values', () => {
      const params = new MyURLSearchParams()
      params.append('a', '')
      expect(params.toString()).toBe('a=')
    })
  })

  describe('iterator methods', () => {
    it('should implement entries() iterator', () => {
      const params = new MyURLSearchParams('a=1&b=2&a=3')
      expect(Array.from(params.entries())).toEqual([
        ['a', '1'],
        ['b', '2'],
        ['a', '3']
      ])
    })

    it('should implement keys() iterator', () => {
      const params = new MyURLSearchParams('a=1&b=2&a=3')
      expect(Array.from(params.keys())).toEqual(['a', 'b', 'a'])
    })

    it('should implement values() iterator', () => {
      const params = new MyURLSearchParams('a=1&b=2&a=3')
      expect(Array.from(params.values())).toEqual(['1', '2', '3'])
    })

    it('should implement forEach', () => {
      const params = new MyURLSearchParams('a=1&b=2')
      const result: Array<[string, string]> = []
      params.forEach((value, key) => {
        result.push([key, value])
      })
      expect(result).toEqual([
        ['a', '1'],
        ['b', '2']
      ])
    })
  })
})
