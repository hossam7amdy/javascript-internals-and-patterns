import { describe, it, expect } from 'vitest'

import { detectType } from './detectType'

describe('detectType', () => {
  // Primitive types
  it('should detect string type', () => {
    expect(detectType('hello')).toBe('string')
    expect(detectType(String('world'))).toBe('string')
    expect(detectType('')).toBe('string')
  })

  it('should detect number type', () => {
    expect(detectType(42)).toBe('number')
    expect(detectType(3.14)).toBe('number')
    expect(detectType(Number(100))).toBe('number')
    expect(detectType(0)).toBe('number')
    expect(detectType(Infinity)).toBe('number')
    expect(detectType(NaN)).toBe('number')
  })

  it('should detect boolean type', () => {
    expect(detectType(true)).toBe('boolean')
    expect(detectType(false)).toBe('boolean')
    expect(detectType(Boolean(1))).toBe('boolean')
  })

  it('should detect undefined type', () => {
    expect(detectType(undefined)).toBe('undefined')
    let undef
    expect(detectType(undef)).toBe('undefined')
  })

  it('should detect null type', () => {
    expect(detectType(null)).toBe('null')
  })

  it('should detect symbol type', () => {
    expect(detectType(Symbol())).toBe('symbol')
    expect(detectType(Symbol('description'))).toBe('symbol')
  })

  it('should detect bigint type', () => {
    expect(detectType(BigInt(123))).toBe('bigint')
    expect(detectType(123n)).toBe('bigint')
  })

  // Reference types
  it('should detect object type', () => {
    expect(detectType({})).toBe('object')
    expect(detectType({ name: 'test' })).toBe('object')
    expect(detectType(Object.create(null))).toBe('object')
  })

  it('should detect array type', () => {
    expect(detectType([])).toBe('array')
    expect(detectType([1, 2, 3])).toBe('array')
    expect(detectType(Array.from([1, 2, 3]))).toBe('array')
  })

  it('should detect function type', () => {
    expect(detectType(() => {})).toBe('function')
    expect(detectType(function () {})).toBe('function')
    expect(detectType(Math.max)).toBe('function')
  })

  it('should detect date type', () => {
    expect(detectType(new Date())).toBe('date')
  })

  it('should detect regexp type', () => {
    expect(detectType(/test/)).toBe('regexp')
    expect(detectType(new RegExp('test'))).toBe('regexp')
  })

  it('should detect error type', () => {
    expect(detectType(new Error())).toBe('error')
    expect(detectType(new TypeError())).toBe('typeerror')
    expect(detectType(new SyntaxError())).toBe('syntaxerror')
  })

  it('should detect map type', () => {
    expect(detectType(new Map())).toBe('map')
  })

  it('should detect set type', () => {
    expect(detectType(new Set())).toBe('set')
  })

  it('should detect weakmap type', () => {
    expect(detectType(new WeakMap())).toBe('weakmap')
  })

  it('should detect weakset type', () => {
    expect(detectType(new WeakSet())).toBe('weakset')
  })

  it('should detect typed array types', () => {
    expect(detectType(new Int8Array())).toBe('int8array')
    expect(detectType(new Uint8Array())).toBe('uint8array')
    expect(detectType(new Uint8ClampedArray())).toBe('uint8clampedarray')
    expect(detectType(new Int16Array())).toBe('int16array')
    expect(detectType(new Uint16Array())).toBe('uint16array')
    expect(detectType(new Int32Array())).toBe('int32array')
    expect(detectType(new Uint32Array())).toBe('uint32array')
    expect(detectType(new Float32Array())).toBe('float32array')
    expect(detectType(new Float64Array())).toBe('float64array')
    expect(detectType(new BigInt64Array())).toBe('bigint64array')
    expect(detectType(new BigUint64Array())).toBe('biguint64array')
  })

  it('should detect arraybuffer type', () => {
    expect(detectType(new ArrayBuffer(8))).toBe('arraybuffer')
  })

  it('should detect dataview type', () => {
    const buffer = new ArrayBuffer(8)
    expect(detectType(new DataView(buffer))).toBe('dataview')
  })

  it('should detect promise type', () => {
    expect(detectType(Promise.resolve())).toBe('promise')
    expect(detectType(new Promise(() => {}))).toBe('promise')
  })

  // Special cases
  it('should detect class instances with their constructor names', () => {
    class TestClass {}
    expect(detectType(new TestClass())).toBe('testclass')
  })

  it('should detect class instances with their constructor names', () => {
    function FunctionClass() {}
    expect(detectType(new FunctionClass())).toBe('functionclass')
  })

  // Buffer type
  it('should detect buffer type', () => {
    expect(detectType(Buffer.from('test'))).toBe('buffer')
    expect(detectType(Buffer.alloc(10))).toBe('buffer')
    expect(detectType(new Buffer('deprecated'))).toBe('buffer')
  })

  // AsyncFunction type
  it('should detect async function type', () => {
    expect(detectType(async function () {})).toBe('asyncfunction')
    expect(detectType(async () => {})).toBe('asyncfunction')
    const asyncFn = async function namedAsyncFn() {}
    expect(detectType(asyncFn)).toBe('asyncfunction')
  })

  // Symbol.toStringTag
  it('should handle objects with custom [Symbol.toStringTag]', () => {
    const customObj = {
      [Symbol.toStringTag]: 'CustomType'
    }
    expect(detectType(customObj)).toBe('object')

    class CustomClass {
      get [Symbol.toStringTag]() {
        return 'CustomTaggedClass'
      }
    }
    expect(detectType(new CustomClass())).toBe('customclass')
  })

  // Edge cases
  it('should handle edge cases', () => {
    const obj = Object.create(null)
    expect(detectType(obj)).toBe('object')
  })
})
