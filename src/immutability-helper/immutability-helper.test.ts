import { describe, it, expect } from 'vitest'
import update, { Command } from './immutability-helper'

describe('immutability-helper', () => {
  describe('$push command', () => {
    it('should push items onto the target array', () => {
      const initial = [1]
      const expected = [1, 2, 3]
      const result = update([1], { $push: [2, 3] })
      expect(result).toEqual(expected)
      expect(result).not.toBe(initial) // Should return a new array
    })

    it('should push items onto a nested array', () => {
      const initial = { a: [1] }
      const expected = { a: [1, 2, 3] }
      const result = update({ a: [1] }, { a: { $push: [2, 3] } })
      expect(result).toEqual(expected)
      expect(result).not.toBe(initial) // Should return a new object
      expect(result.a).not.toBe(initial.a) // Should return a new nested array
    })

    it('should throw an error when trying to $push on a non-array', () => {
      expect(() => update({ a: 1 }, { a: { $push: [2, 3] } })).toThrow()
    })
  })

  describe('$set command', () => {
    it('should set a value in an array by index', () => {
      const initial = [1, 2, 3]
      const expected = [1, 4, 3]
      const result = update([1, 2, 3], { 1: { $set: 4 } })
      expect(result).toEqual(expected)
      expect(result).not.toBe(initial) // Should return a new array
    })

    it('should set a deeply nested value', () => {
      const initial = { a: { b: 1 } }
      const expected = { a: { b: 2 } }
      const result = update({ a: { b: 1 } }, { a: { b: { $set: 2 } } })
      expect(result).toEqual(expected)
      expect(result).not.toBe(initial) // Should return a new object
      expect(result.a).not.toBe(initial.a) // Should return a new nested object
    })

    it('should replace an entire property', () => {
      const initial = { a: { b: 1 } }
      const expected = { a: 2 }
      const result = update({ a: { b: 1 } }, { a: { $set: 2 } })
      expect(result).toEqual(expected)
      expect(result).not.toBe(initial) // Should return a new object
    })
  })

  describe('$merge command', () => {
    it('should merge objects', () => {
      const initial = { a: { b: 1 } }
      const expected = { a: { b: 1, c: 3 } }
      const result = update({ a: { b: 1 } }, { a: { $merge: { c: 3 } } })
      expect(result).toEqual(expected)
      expect(result).not.toBe(initial) // Should return a new object
      expect(result.a).not.toBe(initial.a) // Should return a new nested object
    })

    it('should override existing properties when merging', () => {
      const initial = { a: { c: 1 } }
      const expected = { a: { c: 3 } }
      const result = update({ a: { c: 1 } }, { a: { $merge: { c: 3 } } })
      expect(result).toEqual(expected)
      expect(result).not.toBe(initial) // Should return a new object
      expect(result.a).not.toBe(initial.a) // Should return a new nested object
    })

    it('should throw an error when trying to $merge on a non-object', () => {
      expect(() => update({ a: 1 }, { a: { $merge: { b: 2 } } })).toThrow()
    })
  })

  describe('$apply command', () => {
    it('should apply a function to an array item', () => {
      const initial = [1, 2, 3]
      const expected = [2, 2, 3]
      const result = update([1, 2, 3], { 0: { $apply: (n: number) => n * 2 } })
      expect(result).toEqual(expected)
      expect(result).not.toBe(initial) // Should return a new array
    })

    it('should apply a function to a nested value', () => {
      const initial = { a: { b: 2 } }
      const expected = { a: { b: 4 } }
      const result = update(
        { a: { b: 2 } },
        { a: { b: { $apply: (n: number) => n * 2 } } }
      )
      expect(result).toEqual(expected)
      expect(result).not.toBe(initial) // Should return a new object
      expect(result.a).not.toBe(initial.a) // Should return a new nested object
    })
  })

  describe('edge cases and complex scenarios', () => {
    it('should handle deeply nested updates', () => {
      const initial = { a: { b: { c: { d: 1 } } } }
      const expected = { a: { b: { c: { d: 2 } } } }
      const result = update(
        { a: { b: { c: { d: 1 } } } },
        { a: { b: { c: { d: { $set: 2 } } } } }
      )
      expect(result).toEqual(expected)
      expect(result).not.toBe(initial) // Should return a new object
      expect(result.a).not.toBe(initial.a) // All parent objects should be new
      expect(result.a.b).not.toBe(initial.a.b)
      expect(result.a.b.c).not.toBe(initial.a.b.c)
    })

    it('should handle multiple commands in one update', () => {
      const initial = { a: [1], b: { c: 3 } }
      const expected = { a: [1, 2], b: { c: 3, d: 4 } }
      const result = update(
        { a: [1], b: { c: 3 } },
        { a: { $push: [2] }, b: { $merge: { d: 4 } } }
      )
      expect(result).toEqual(expected)
      expect(result).not.toBe(initial) // Should return a new object
      expect(result.a).not.toBe(initial.a)
      expect(result.b).not.toBe(initial.b)
    })

    it('should return a new reference if data is updated', () => {
      const initial = { a: 1, b: 2 }
      const result = update({ a: 1, b: 2 }, { a: { $set: 3 } })
      expect(result).toEqual({ a: 3, b: 2 })
      expect(result).not.toBe(initial) // Should return a new object
    })

    it('should return the same reference if nothing is updated', () => {
      const initial = { a: 1, b: 2 }
      const result = update({ a: 1, b: 2 }, {} as Command)
      expect(result).toEqual({ a: 1, b: 2 })
      expect(result).toStrictEqual(initial) // Should return the same object
    })

    it('should handle empty arrays and objects', () => {
      expect(update([], { $push: [1] })).toEqual([1])
      expect(update({}, { a: { $set: 1 } })).toEqual({ a: 1 })
    })

    it('should not mutate the original data', () => {
      const initial = { a: { b: [1, 2, 3] } }
      const initialClone = JSON.parse(JSON.stringify(initial))
      update(initial, { a: { b: { $push: [4] } } })
      expect(initial).toEqual(initialClone) // Original should remain unchanged
    })
  })
})
