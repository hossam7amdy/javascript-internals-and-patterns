import { describe, it, expect, vi } from 'vitest'
import { EventEmitter } from './event-emitter'

describe('EventEmitter', () => {
  it('EventEmitter.prototype.subscribe should exist', () => {
    const emitter = new EventEmitter()
    expect(typeof emitter.subscribe).toBe('function')
  })

  it('EventEmitter.prototype.emit should exist', () => {
    const emitter = new EventEmitter()
    expect(typeof emitter.emit).toBe('function')
  })

  it('EventEmitter.prototype.emit should trigger the callback', () => {
    const emitter = new EventEmitter()
    const mockFn = vi.fn()
    emitter.subscribe('test', mockFn)
    emitter.emit('test')
    expect(mockFn).toHaveBeenCalled()
  })

  it('same callback could subscribe for same event multiple times', () => {
    const emitter = new EventEmitter()
    const mockFn = vi.fn()
    emitter.subscribe('test', mockFn)
    emitter.subscribe('test', mockFn)
    emitter.emit('test')
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('emit should relay parameters', () => {
    const emitter = new EventEmitter()
    const mockFn = vi.fn()
    emitter.subscribe('test', mockFn)
    emitter.emit('test', 'param1', 42, { key: 'value' })
    expect(mockFn).toHaveBeenCalledWith('param1', 42, { key: 'value' })
  })

  it('release() should work', () => {
    const emitter = new EventEmitter()
    const mockFn = vi.fn()
    const subscription = emitter.subscribe('test', mockFn)
    subscription.release()
    emitter.emit('test')
    expect(mockFn).not.toHaveBeenCalled()
  })

  it('release() should work for multiple listener on same event', () => {
    const emitter = new EventEmitter()
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()
    const subscription1 = emitter.subscribe('test', mockFn1)
    emitter.subscribe('test', mockFn2)
    subscription1.release()
    emitter.emit('test')
    expect(mockFn1).not.toHaveBeenCalled()
    expect(mockFn2).toHaveBeenCalled()
  })
})
