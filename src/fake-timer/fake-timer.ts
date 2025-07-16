export class FakeTimer {
  private originalDateNow!: typeof Date.now
  private originalSetTimeout!: typeof setTimeout
  private originalSetInterval!: typeof setInterval
  private originalClearTimeout!: typeof clearTimeout
  private originalClearInterval!: typeof clearInterval

  private now = 0
  private timeoutId = 1
  private queue: Array<{
    type: 'timeout' | 'interval'
    timeoutId: number
    scheduledTime: number
    callback: (...args: any) => void
  }> = []

  install() {
    this.originalDateNow = Date.now
    Date.now = this.nowFn.bind(this)

    this.originalSetTimeout = globalThis.setTimeout
    // @ts-expect-error
    globalThis.setTimeout = this.setTimeout.bind(this)

    this.originalClearTimeout = globalThis.clearTimeout
    // @ts-expect-error
    globalThis.clearTimeout = this.clearTimeout.bind(this)

    this.originalSetInterval = globalThis.setInterval
    // @ts-expect-error
    globalThis.setInterval = this.setInterval.bind(this)

    this.originalClearInterval = globalThis.clearInterval
    // @ts-expect-error
    globalThis.clearInterval = this.clearInterval.bind(this)
  }

  uninstall() {
    Date.now = this.originalDateNow

    globalThis.setTimeout = this.originalSetTimeout
    globalThis.clearTimeout = this.originalClearTimeout

    globalThis.setInterval = this.originalSetInterval
    globalThis.clearInterval = this.originalClearInterval
  }

  setTimeout(callback: () => void, delay: number = 0): number {
    const timeoutId = this.timeoutId++
    const scheduledTime = this.now + delay
    this.queue.push({ type: 'timeout', timeoutId, scheduledTime, callback })
    this.queue.sort((a, b) => a.scheduledTime - b.scheduledTime)
    return timeoutId
  }

  clearTimeout(timeoutId: number): void {
    this.queue = this.queue.filter(task => task.timeoutId !== timeoutId)
  }

  setInterval(callback: () => void, interval: number = 0) {
    const timeoutId = this.timeoutId++
    const scheduledTime = this.now + interval
    this.queue.push({ type: 'interval', timeoutId, scheduledTime, callback })
    this.queue.sort((a, b) => a.scheduledTime - b.scheduledTime)
    return timeoutId
  }

  clearInterval(timeoutId: number) {
    this.clearTimeout(timeoutId)
  }

  nowFn(): number {
    return this.now
  }

  tick() {
    while (this.queue.length > 0) {
      const { timeoutId, type, callback, scheduledTime } = this.queue.shift()!
      this.now = scheduledTime

      if (type === 'interval') {
        this.queue.push({
          type: 'interval',
          timeoutId,
          scheduledTime: scheduledTime + this.now,
          callback
        })
      }

      callback()
    }
  }
}

export default FakeTimer
