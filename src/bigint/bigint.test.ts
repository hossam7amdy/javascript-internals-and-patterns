import { describe, it, expect } from 'vitest'

import { MyBigInt } from './bigint'

describe('MyBigInt', () => {
  describe('constructor', () => {
    it('should create a big integer with valid value', () => {
      const bigInt = new MyBigInt('12345')
      expect(bigInt.toString()).toBe('12345')
    })

    it('should accept zero', () => {
      const bigInt = new MyBigInt('0')
      expect(bigInt.toString()).toBe('0')
    })

    it('should throw error for invalid values', () => {
      expect(() => new MyBigInt('01234')).toThrow(TypeError)
      expect(() => new MyBigInt('-123')).toThrow(TypeError)
      expect(() => new MyBigInt('abc')).toThrow(TypeError)
      expect(() => new MyBigInt('12.34')).toThrow(TypeError)
    })
  })

  describe('add', () => {
    it('should add two numbers correctly', () => {
      const bigInt = new MyBigInt('123')
      expect(bigInt.add('456').toString()).toBe('579')
    })

    it('should handle carry', () => {
      const bigInt = new MyBigInt('999')
      expect(bigInt.add('1').toString()).toBe('1000')
    })

    it('should add numbers of different lengths', () => {
      const bigInt = new MyBigInt('123')
      expect(bigInt.add('7').toString()).toBe('130')

      const bigInt2 = new MyBigInt('7')
      expect(bigInt2.add('123').toString()).toBe('130')
    })

    it('should handle very large numbers', () => {
      const bigInt = new MyBigInt('9999999999999999')
      expect(bigInt.add('1').toString()).toBe('10000000000000000')
    })

    it('should throw error for invalid values', () => {
      const bigInt = new MyBigInt('123')
      expect(() => bigInt.add('01234')).toThrow(TypeError)
      expect(() => bigInt.add('-123')).toThrow(TypeError)
      expect(() => bigInt.add('abc')).toThrow(TypeError)
    })
  })

  describe('toString and valueOf', () => {
    it('should return the string representation', () => {
      const bigInt = new MyBigInt('12345')
      expect(bigInt.toString()).toBe('12345')
      expect(bigInt.valueOf()).toBe('12345')
    })
  })
})
