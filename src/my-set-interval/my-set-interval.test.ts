import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mySetInterval, myClearInterval } from './my-set-interval'

describe('mySetInterval and myClearInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('should return a unique ID for each interval', () => {
    const id1 = mySetInterval(() => {}, 100, 200)
    const id2 = mySetInterval(() => {}, 100, 200)
    expect(id2).toBe(id1 + 1)
  })

  it('should execute callback after initial delay', () => {
    const callback = vi.fn()
    mySetInterval(callback, 100, 200)

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should execute callback at correct intervals', () => {
    const callback = vi.fn()
    mySetInterval(callback, 100, 200)

    vi.advanceTimersByTime(100) // first call after delay
    expect(callback).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(300) // delay(100) + period(200) = 300ms for second call
    expect(callback).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(500) // delay(100) + period(200)*2 = 500ms for third call
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('should stop executing callback after calling myClearInterval', () => {
    const callback = vi.fn()
    const id = mySetInterval(callback, 100, 200)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)

    myClearInterval(id)
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1) // Still only called once
  })

  it('should handle multiple intervals independently', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    const id1 = mySetInterval(callback1, 100, 200)
    const id2 = mySetInterval(callback2, 150, 300)

    vi.advanceTimersByTime(100)
    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(0)

    vi.advanceTimersByTime(50)
    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(1)

    myClearInterval(id1)
    vi.advanceTimersByTime(750)
    expect(callback1).toHaveBeenCalledTimes(1) // Still only called once
    expect(callback2).toHaveBeenCalledTimes(2)

    myClearInterval(id2)
    vi.advanceTimersByTime(1000)
    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(2)
  })

  it('should work with zero delay', () => {
    const callback = vi.fn()
    mySetInterval(callback, 0, 100)

    vi.advanceTimersByTime(0)
    expect(callback).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should work with zero period', () => {
    const callback = vi.fn()
    mySetInterval(callback, 100, 0)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should properly clean up resources when cleared', () => {
    const callback = vi.fn()
    const id = mySetInterval(callback, 100, 200)

    myClearInterval(id)
    myClearInterval(id) // Should not throw error when clearing multiple times

    vi.advanceTimersByTime(1000)
    expect(callback).not.toHaveBeenCalled()
  })

  it('should execute with increasing intervals between calls', () => {
    const callback = vi.fn()
    mySetInterval(callback, 1000, 200)

    // First call after initial delay of 1000ms
    expect(callback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    // Second call after additional 1200ms (1000 + 200*1)
    vi.advanceTimersByTime(1200)
    expect(callback).toHaveBeenCalledTimes(2)

    // Third call after additional 1400ms (1000 + 200*2)
    vi.advanceTimersByTime(1400)
    expect(callback).toHaveBeenCalledTimes(3)
  })
})
