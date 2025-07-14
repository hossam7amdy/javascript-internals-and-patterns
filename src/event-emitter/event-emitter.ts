type EventName = string | symbol
type Callback = (...args: any) => void

export class EventEmitter {
  #eventsMap = new Map<EventName, Callback[]>()

  subscribe(eventName: EventName, callback: Callback) {
    const callbacks = this.#eventsMap.get(eventName) || []
    callbacks.push(callback)
    this.#eventsMap.set(eventName, callbacks)

    return {
      release: () => {
        const index = callbacks.findIndex(cb => cb === callback)
        callbacks.splice(index, 1)
      }
    }
  }

  emit(eventName: EventName, ...args: any) {
    const callbacks = this.#eventsMap.get(eventName) || []
    callbacks.forEach(cb => cb(...args))
  }
}

export default EventEmitter
