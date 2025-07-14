import './my-map'
import { describe, it, expect } from 'vitest'

describe('Array.prototype.myMap', () => {
  it('should map an array of numbers to their doubles', () => {
    const numbers = [1, 2, 3, 4, 5]
    const doubled = numbers.myMap(x => x * 2)
    expect(doubled).toEqual([2, 4, 6, 8, 10])
  })

  it('should map an array of strings to their lengths', () => {
    const strings = ['a', 'ab', 'abc', 'abcd']
    const lengths = strings.myMap(s => s.length)
    expect(lengths).toEqual([1, 2, 3, 4])
  })

  it('should provide the correct index and array arguments to the callback', () => {
    const arr = ['a', 'b', 'c']
    const result = arr.myMap((val, index, array) => {
      expect(array).toBe(arr)
      return `${val}-${index}`
    })
    expect(result).toEqual(['a-0', 'b-1', 'c-2'])
  })

  it('should use the provided thisArg', () => {
    const obj = { multiplier: 2 }
    const numbers = [1, 2, 3]
    const result = numbers.myMap(function (num) {
      return num * this.multiplier
    }, obj)
    expect(result).toEqual([2, 4, 6])
  })

  it('should handle sparse arrays', () => {
    // eslint-disable-next-line no-sparse-arrays
    const sparse = [1, , 3]
    const result = sparse.myMap(x => x * 2)
    expect(result[0]).toBe(2)
    expect(1 in result).toBe(false)
    expect(result[2]).toBe(6)
    expect(result.length).toBe(3)
  })

  it('should return an empty array when called on an empty array', () => {
    const empty: number[] = []
    const result = empty.myMap(x => x * 2)
    expect(result).toEqual([])
  })

  it('should handle arrays with different types', () => {
    const mixed = [1, 'a', true, { key: 'value' }]
    const result = mixed.myMap(x => typeof x)
    expect(result).toEqual(['number', 'string', 'boolean', 'object'])
  })

  it('should behave like the native map method', () => {
    const arr = [1, 2, 3, 4, 5]
    const nativeResult = arr.map(x => x * 3)
    const customResult = arr.myMap(x => x * 3)
    expect(customResult).toEqual(nativeResult)
  })

  it('should work with object-like arrays', () => {
    const arrayLike = {
      0: 'a',
      1: 'b',
      2: 'c',
      length: 3
    }

    // Need to use call since arrayLike is not an actual array
    const result = Array.prototype.myMap.call(arrayLike, x => x.toUpperCase())
    expect(result).toEqual(['A', 'B', 'C'])
  })

  it('should handle null and undefined values', () => {
    const array = [1, null, undefined, 4]
    const result = array.myMap(x =>
      x === null || x === undefined ? 'empty' : x * 2
    )
    expect(result).toEqual([2, 'empty', 'empty', 8])
  })

  it('should not modify the original array', () => {
    const original = [1, 2, 3]
    original.myMap(x => x * 10)
    expect(original).toEqual([1, 2, 3])
  })

  it('should handle callback that modifies the original array', () => {
    const original = [1, 2, 3]
    const result = original.myMap((x, i, arr) => {
      arr[i] = x * 10
      return x * 2
    })
    expect(result).toEqual([2, 4, 6])
    expect(original).toEqual([10, 20, 30])
  })

  it('should handle array elements added during mapping', () => {
    const array = [1, 2, 3]
    const result = array.myMap((x, i, arr) => {
      if (i === 0) arr.push(4, 5)
      return x * 2
    })
    // Map only processes elements that existed at the start
    expect(result).toEqual([2, 4, 6])
  })

  it('should handle large arrays efficiently', () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => i)
    const result = largeArray.myMap(x => x * 2)
    expect(result.length).toBe(10000)
    expect(result[0]).toBe(0)
    expect(result[9999]).toBe(19998)
  })

  it('should work with nested arrays', () => {
    const nested = [
      [1, 2],
      [3, 4],
      [5, 6]
    ]
    const result = nested.myMap(arr => arr.reduce((sum, val) => sum + val, 0))
    expect(result).toEqual([3, 7, 11])
  })

  it('should preserve the same behavior when callback throws an error', () => {
    const array = [1, 2, 3, 4]
    expect(() => {
      array.myMap((x, i) => {
        if (i === 2) throw new Error('Test error')
        return x * 2
      })
    }).toThrow('Test error')
  })

  it('should throw a TypeError for non-function callbacks', () => {
    const array = [1, 2, 3]
    // @ts-expect-error Testing invalid parameter
    expect(() => array.myMap('not a function')).toThrow(TypeError)
    // @ts-expect-error Testing invalid parameter
    expect(() => array.myMap(null)).toThrow(TypeError)
  })
})
