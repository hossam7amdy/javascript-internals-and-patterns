export class FakeTimer {
  private originalDateNow!: typeof Date.now
  private originalSetTimeout!: typeof setTimeout
  private originalClearTimeout!: typeof clearTimeout

  private now = 0
  private timeoutId = 1
  private queue: Array<{
    timeoutId: number
    scheduledTime: number
    callback: (...args: any) => void
  }> = []

  install() {
    this.originalDateNow = Date.now
    Date.now = this.nowFn.bind(this)

    this.originalSetTimeout = setTimeout
    // @ts-expect-error
    globalThis.setTimeout = this.setTimeout.bind(this)

    this.originalClearTimeout = clearTimeout
    // @ts-expect-error
    globalThis.clearTimeout = this.clearTimeout.bind(this)
  }

  uninstall() {
    Date.now = this.originalDateNow
    globalThis.setTimeout = this.originalSetTimeout
    globalThis.clearTimeout = this.originalClearTimeout
  }

  setTimeout(callback: () => void, delay: number = 0): number {
    const timeoutId = this.timeoutId++
    const scheduledTime = this.now + delay
    this.queue.push({ timeoutId, scheduledTime, callback })
    this.queue.sort((a, b) => a.scheduledTime - b.scheduledTime)
    return timeoutId
  }

  clearTimeout(timeoutId: number): void {
    this.queue = this.queue.filter(task => task.timeoutId !== timeoutId)
  }

  nowFn(): number {
    return this.now
  }

  tick() {
    while (this.queue.length > 0) {
      const { callback, scheduledTime } = this.queue.shift()!
      this.now = scheduledTime
      callback()
    }
  }
}

export default FakeTimer
