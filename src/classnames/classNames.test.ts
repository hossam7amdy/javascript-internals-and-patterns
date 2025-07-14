import { describe, it, expect } from 'vitest'

import { classNames } from './classNames'

describe('classNames', () => {
  it('should process string and number directly', () => {
    expect(classNames('BFE', 'dev', 100)).toBe('BFE dev 100')
  })

  it("should handle array's truthy values", () => {
    expect(classNames(['BFE', 'dev', 100, false, '', 0])).toBe('BFE dev 100')
  })

  it('should ignore non-(string or number) primitives', () => {
    // @ts-expect-error not supported type
    expect(classNames(null, undefined, Symbol(), 1n, true, false)).toBe('')
  })

  it("should keep object's enumerable property keys if the key is string and value is truthy", () => {
    const obj = new Map()
    // @ts-expect-error not supported type
    obj.cool = '!'

    expect(classNames({ BFE: [], dev: true, is: 3 }, obj)).toBe(
      'BFE dev is cool'
    )
  })

  it('should flatten array and pick truthy values', () => {
    const obj = { cool: '!' }

    expect(classNames(['BFE', [{ dev: true }, ['is', [obj]]]])).toBe(
      'BFE dev is cool'
    )
  })
})
