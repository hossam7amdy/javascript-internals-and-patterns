import { describe, it, expect } from 'vitest'
import { wrap } from './negative-array-index-decorator'

describe('wrap', () => {
  it('should allow accessing elements with negative indices', () => {
    const arr = wrap([1, 2, 3, 4, 5])
    expect(arr[-1]).toBe(5)
    expect(arr[-2]).toBe(4)
    expect(arr[-3]).toBe(3)
  })

  it('should allow accessing the first element with a negative index', () => {
    const arr = wrap([1, 2, 3, 4, 5])
    expect(arr[-5]).toBe(1)
  })

  it('should return undefined for negative indices out of bounds', () => {
    const arr = wrap([1, 2, 3, 4, 5])
    expect(arr[-6]).toBeUndefined()
  })

  it('should keep positive indices working normally', () => {
    const arr = wrap([1, 2, 3, 4, 5])
    expect(arr[0]).toBe(1)
    expect(arr[2]).toBe(3)
    expect(arr[4]).toBe(5)
  })

  it('should handle non-numeric properties correctly', () => {
    const arr = wrap([1, 2, 3])
    expect(arr.length).toBe(3)
  })

  it('should preserve array methods', () => {
    const arr = wrap([1, 2, 3])
    arr.push(4)
    expect(arr.length).toBe(4)
    expect(arr[3]).toBe(4)

    const popped = arr.pop()
    expect(popped).toBe(4)
    expect(arr.length).toBe(3)
  })

  it('should keep the wrapped array in sync with the original', () => {
    const original = [1, 2, 3]
    const wrapped = wrap(original)

    // Modifying original reflects in wrapped
    original.push(4)
    expect(wrapped.length).toBe(4)
    expect(wrapped[-1]).toBe(4)

    // Modifying wrapped reflects in original
    wrapped.push(5)
    expect(original.length).toBe(5)
    expect(original[4]).toBe(5)
  })

  it('should allow setting elements with negative indices', () => {
    const arr = wrap([1, 2, 3, 4, 5])
    arr[-1] = 10
    expect(arr[4]).toBe(10)

    arr[-3] = 20
    expect(arr[2]).toBe(20)

    // Check that original array was modified too
    const original = [1, 2, 3]
    const wrapped = wrap(original)
    wrapped[-1] = 99
    expect(original[2]).toBe(99)
  })

  it('should throw setting negative index that overflows the array', () => {
    const arr = wrap([1, 2, 3, 4, 5])
    expect(() => {
      arr[-6] = 100
    }).toThrow()
  })
})
