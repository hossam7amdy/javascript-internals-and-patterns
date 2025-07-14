import { describe, it, expect } from 'vitest'

import { objectAssign } from './object-assign'

describe('objectAssign', () => {
  it('should assign properties from source to target', () => {
    const target = { a: 1 }
    const source = { b: 2, c: 3 }
    const result = objectAssign(target, source)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should not create a new object', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    const result = objectAssign(target, source)
    expect(result).toBe(target)
  })

  it('should only assign enumerable properties', () => {
    const target = {}
    const source = Object.create({ a: 1 })
    const result = objectAssign(target, source)
    expect(result).toEqual({})
  })

  it('should throw error when target is null or undefined', () => {
    expect(() => {
      objectAssign(null, { a: 1 })
    }).toThrow(TypeError)
    expect(() => {
      objectAssign(undefined, { a: 1 })
    }).toThrow(TypeError)
  })

  it('should support Symbol spec', () => {
    const key = Symbol('key')
    const a = {
      [key]: 3,
      b: 4
    }
    const target = {}
    objectAssign(target, a)
    expect(target[key]).toBe(3)
    // @ts-expect-error
    expect(target.b).toBe(4)
  })

  it('should ignore non-string primitives in source', () =>
    expect(
      // @ts-expect-error
      objectAssign({}, { a: 3 }, null, undefined, NaN, 1, true, 1n)
    ).toEqual({ a: 3 }))

  it('should convert string in source to object', () => {
    const target = {}
    const source = 'abc'
    const result = objectAssign(target, source)
    expect(result).toEqual({ 0: 'a', 1: 'b', 2: 'c' })
  })

  it('should wrap numbers in target', () => {
    const target = 3
    const source = { a: 3 }
    const result = objectAssign(target, source)
    expect(result).toEqual(Object.assign(target, source))
    expect(result).not.toBe(target)
  })

  it('should wrap strings in target', () => {
    const target = '3'
    const source = { a: 3 }
    const result = objectAssign(target, source)
    expect(result).toEqual(Object.assign(target, source))
    expect(result).not.toBe(target)
  })

  it('should wrap booleans in target', () => {
    const target = true
    const source = { a: 3 }
    const result = objectAssign(target, source)
    expect(result).toStrictEqual(Object.assign(target, source))
    expect(result).not.toStrictEqual(target)
  })

  it('should throw when trying to assign to read-only properties', () => {
    const target = Object.defineProperty({}, 'foo', {
      value: 1,
      writable: false
    }) // target.foo is a read-only property

    expect(() =>
      objectAssign(target, { bar: 2 }, { foo2: 3, foo: 3, foo3: 3 }, { baz: 4 })
    ).toThrow()
    expect(target).toEqual({ bar: 2, foo2: 3 })
  })

  it('should throw an error when source is non-object', () => {
    expect(() => {
      objectAssign(null, {})
    }).toThrow(TypeError)
    expect(() => {
      objectAssign(undefined, {})
    }).toThrow(TypeError)
  })

  it('should trigger getters in sources', () => {
    const target = {}
    const source = {
      get a() {
        return 1
      }
    }
    const result = objectAssign(target, source)
    expect(result.a).toBe(1)
  })

  it('should assign enumerable properties in non-primitive sources', () => {
    const target = {}
    const source = { a: 3 }
    const result = objectAssign(target, source)
    expect(result).toEqual({ a: 3 })
  })
})
