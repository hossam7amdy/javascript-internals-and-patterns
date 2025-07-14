import { describe, expect, it, vi } from 'vitest'
import MyPromise from './my-promise.js'

const DEFAULT_VALUE = 'default'

describe('constructor', () => {
  it('instances should inherit from MyPromise.prototype', () => {
    // @ts-expect-error
    expect(new MyPromise(() => {}).__proto__).toBe(MyPromise.prototype)
  })
})

describe('then', () => {
  it('with no chaining', async () => {
    const v = await promise()
    return expect(v).toEqual(DEFAULT_VALUE)
  })
  it('with multiple thens for same promise', () => {
    const checkFunc = (v: string) => expect(v).toEqual(DEFAULT_VALUE)
    const mainPromise = promise()
    const promise1 = mainPromise.then(checkFunc)
    const promise2 = mainPromise.then(checkFunc)
    return Promise.allSettled([promise1, promise2])
  })
  it('with then and catch', () => {
    const checkFunc = (v: string) => expect(v).toEqual(DEFAULT_VALUE)
    const failFunc = (v: unknown) => expect(v).toEqual(DEFAULT_VALUE)
    const resolvePromise = promise().then(checkFunc, failFunc)
    const rejectPromise = promise<string>({ fail: true }).then(
      failFunc,
      checkFunc as any
    )
    return Promise.allSettled([resolvePromise, rejectPromise])
  })
  it('with chaining', async () => {
    const v = await promise<number>({ value: 3 }).then(v => v * 4)
    return expect(v).toEqual(12)
  })
  // TODO: fix this test case
  it.skip('should only be resolved once and ignore later resolve/reject', async () => {
    const spy = vi.fn()

    const mp1 = new MyPromise((resolve, reject) => {
      setTimeout(() => resolve(1), 100)
    })
    const mp2 = MyPromise.resolve(2)
    new MyPromise((resolve, reject) => {
      resolve(mp1)
      resolve(mp2)
      reject(3)
    }).then(
      data => spy('resolve', data),
      reason => spy('reject', reason)
    )
    await new Promise(resolve => setTimeout(resolve, 150)) // wait for mp1 to resolve

    expect(spy.mock.calls).toEqual([['resolve', 1]])
  })

  it('should resolve a promise chained to the promise(fulfilled) from callback', async () => {
    const spy = vi.fn()

    const mp = new MyPromise((resolve, reject) => {
      resolve(1)
    })
    const mp2 = new MyPromise((resolve, reject) => {
      spy()
      resolve(2)
    })
    const result = await mp.then(() => mp2)

    expect(result).toBe(2)
    expect(spy).toHaveBeenCalled()
  })
})

describe('catch', () => {
  it('with no chaining', () => {
    expect(promise({ fail: true })).to.rejects.toEqual(DEFAULT_VALUE)
  })

  it('with multiple catches for same promise', () => {
    const checkFunc = (v: string) => expect(v).toEqual(DEFAULT_VALUE)
    const mainPromise = promise<string>({ fail: true })
    const promise1 = mainPromise.catch(checkFunc as any)
    const promise2 = mainPromise.catch(checkFunc as any)
    return Promise.allSettled([promise1, promise2])
  })

  it('with chaining', async () => {
    expect(
      promise<number>({ value: 3 }).then(v => {
        throw v * 4
      })
    ).to.rejects.toEqual(12)
  })

  it('should reject a promise chained to the promise(rejected) from callback', async () => {
    const spy = vi.fn()

    const mp = new MyPromise((resolve, reject) => {
      resolve(1)
    })

    const mp2 = new MyPromise((resolve, reject) => {
      spy()
      reject(2)
    })

    try {
      await mp.then(() => mp2)
      // If it gets here, it's a failure
      const spy = vi.fn()
      spy()
      expect(spy).not.toHaveBeenCalled() // this will fail if rejection didn't happen
    } catch (error) {
      expect(error).toBe(2)
      expect(spy).toHaveBeenCalled()
    }
  })
})

describe('finally', () => {
  it('with no chaining', () => {
    const checkFunc = (v: void) => expect(v).toBeUndefined()
    const successPromise = promise().finally(checkFunc)
    const failPromise = promise({ fail: true }).finally(checkFunc)
    return Promise.allSettled([successPromise, failPromise])
  })

  it('with multiple finally for same promise', () => {
    const checkFunc = (v: void) => expect(v).toBeUndefined()
    const mainPromise = promise()
    const promise1 = mainPromise.finally(checkFunc)
    const promise2 = mainPromise.finally(checkFunc)
    return Promise.allSettled([promise1, promise2])
  })

  it('with chaining', () => {
    const checkFunc = (v: void) => expect(v).toBeUndefined()
    const successPromise = promise()
      .then(v => v)
      .finally(checkFunc)
    const failPromise = promise({ fail: true })
      .then(v => v)
      .finally(checkFunc)
    return Promise.allSettled([successPromise, failPromise])
  })
})

describe('static methods', () => {
  it('resolve', () => {
    expect(MyPromise.resolve(DEFAULT_VALUE)).to.resolves.toEqual(DEFAULT_VALUE)
  })

  it('reject', () => {
    const error = new Error(DEFAULT_VALUE)

    expect(MyPromise.reject(error)).to.rejects.toThrow(DEFAULT_VALUE)
    expect(MyPromise.reject(error)).to.rejects.toBeInstanceOf(Error)
  })
})

function promise<T extends string | number = string>({
  value = DEFAULT_VALUE as T,
  fail = false
} = {}) {
  return new MyPromise<T>((resolve, reject) => {
    fail ? reject(value) : resolve(value)
  })
}
