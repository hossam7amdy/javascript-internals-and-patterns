import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { FakeTimer } from './fake-timer'

describe('FakeTimer', () => {
  let fakeTimer: FakeTimer

  beforeEach(() => {
    fakeTimer = new FakeTimer()
  })

  afterEach(() => {
    // Ensure we clean up even if a test fails
    if (fakeTimer) {
      fakeTimer.uninstall()
    }
  })

  it('should have install and uninstall methods', () => {
    expect(typeof fakeTimer.install).toBe('function')
    expect(typeof fakeTimer.uninstall).toBe('function')
  })

  it('should handle setTimeout and clearTimeout correctly', () => {
    fakeTimer.install()

    const callback = vi.fn()
    setTimeout(callback, 1000)

    expect(callback).not.toBeCalled()

    fakeTimer.tick()

    expect(callback).toBeCalledTimes(1)
    expect(Date.now()).toBe(1000)
  })

  it('should clear timeout when clearTimeout is called', () => {
    fakeTimer.install()

    const callback = vi.fn()
    const timeoutId = setTimeout(callback, 1000)

    clearTimeout(timeoutId)
    fakeTimer.tick()

    expect(callback).not.toBeCalled()
  })

  it('should handle nested setTimeout calls', () => {
    fakeTimer.install()
    const callback = vi.fn()

    setTimeout(() => {
      setTimeout(() => {
        setTimeout(callback, 100)
      }, 100)
    }, 100)
    const b = setTimeout(callback, 300)
    setTimeout(() => {
      setTimeout(() => {
        clearTimeout(b)
      }, 40)
    }, 250)
    fakeTimer.tick()
    fakeTimer.uninstall()
    expect(callback).toHaveBeenCalledOnce()
  })

  it('should do nothing when clearTimeout is called with already timed out id', () => {
    fakeTimer.install()

    const callback = vi.fn()
    const timeoutId = setTimeout(callback, 1000)

    fakeTimer.tick() // Execute the timeout

    expect(callback).toBeCalledTimes(1)

    // This should not throw an error
    clearTimeout(timeoutId)
  })

  it('should restore original APIs when uninstalled', () => {
    const originalDateNow = Date.now
    const originalSetTimeout = setTimeout
    const originalClearTimeout = clearTimeout

    fakeTimer.install()

    // Verify APIs were replaced
    expect(Date.now).not.toBe(originalDateNow)
    expect(setTimeout).not.toBe(originalSetTimeout)
    expect(clearTimeout).not.toBe(originalClearTimeout)

    fakeTimer.uninstall()

    // Verify APIs were restored
    expect(Date.now).toBe(originalDateNow)
    expect(setTimeout).toBe(originalSetTimeout)
    expect(clearTimeout).toBe(originalClearTimeout)
  })
})
