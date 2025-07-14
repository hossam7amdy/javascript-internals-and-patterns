export type PromiseState = 'pending' | 'fulfilled' | 'rejected'

export type Executor<T> = (
  resolve: (value: T | Thenable<T>) => void,
  reject: (reason?: any) => void
) => void

export type OnFulfilled<T, R> = (value: T) => R | Thenable<R>
export type OnRejected<R> = (reason: any) => R | Thenable<R>
export type OnFinally = () => void | Thenable<void>

export interface Thenable<T> {
  then<R1 = T, R2 = never>(
    onFulfilled?: OnFulfilled<T, R1> | null,
    onRejected?: OnRejected<R2> | null
  ): Thenable<R1 | R2>
}

class MyPromise<T> {
  #state: PromiseState = 'pending'
  #value: T | undefined = undefined
  #reason: any = undefined
  #onFulfilledCallbacks: Array<(value: T) => void> = []
  #onRejectedCallbacks: Array<(reason: any) => void> = []

  constructor(executor: Executor<T>) {
    const resolve = (value: T | Thenable<T>): void => {
      if (this.#state !== 'pending') {
        return // Ignore if already resolved/rejected
      }

      // Handle thenable values (promises)
      if (value && typeof (value as any).then === 'function') {
        try {
          ;(value as Thenable<T>).then(resolve, reject)
        } catch (error) {
          reject(error)
        }
        return
      }

      this.#state = 'fulfilled'
      this.#value = value as T
      this.#onFulfilledCallbacks.forEach(callback => callback(value as T))
      this.#onFulfilledCallbacks = [] // Clear callbacks after execution
    }

    const reject = (reason?: any): void => {
      if (this.#state !== 'pending') {
        return // Ignore if already resolved/rejected
      }

      this.#state = 'rejected'
      this.#reason = reason
      this.#onRejectedCallbacks.forEach(callback => callback(reason))
      this.#onRejectedCallbacks = [] // Clear callbacks after execution
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then<R1 = T, R2 = never>(
    onFulfilled?: OnFulfilled<T, R1> | null,
    onRejected?: OnRejected<R2> | null
  ): MyPromise<R1 | R2> {
    return new MyPromise<R1 | R2>((resolve, reject) => {
      const handleFulfilled = (value: T): void => {
        try {
          if (typeof onFulfilled === 'function') {
            const result = onFulfilled(value)
            resolve(result as R1 | R2)
          } else {
            resolve(value as any)
          }
        } catch (error) {
          reject(error)
        }
      }

      const handleRejected = (reason: any): void => {
        try {
          if (typeof onRejected === 'function') {
            const result = onRejected(reason)
            resolve(result as R1 | R2)
          } else {
            reject(reason)
          }
        } catch (error) {
          reject(error)
        }
      }

      if (this.#state === 'fulfilled') {
        // Use setTimeout to ensure asynchronous execution
        setTimeout(() => handleFulfilled(this.#value!), 0)
      } else if (this.#state === 'rejected') {
        setTimeout(() => handleRejected(this.#reason), 0)
      } else {
        // Pending state - add callbacks
        this.#onFulfilledCallbacks.push(handleFulfilled)
        this.#onRejectedCallbacks.push(handleRejected)
      }
    })
  }

  catch<R = never>(onRejected?: OnRejected<R> | null): MyPromise<T | R> {
    return this.then(null, onRejected)
  }

  finally(onFinally?: OnFinally | null): MyPromise<T> {
    return this.then(
      (value: T) => {
        return MyPromise.resolve(
          typeof onFinally === 'function' ? onFinally() : undefined
        ).then(() => value)
      },
      (reason: any) => {
        return MyPromise.resolve(
          typeof onFinally === 'function' ? onFinally() : undefined
        ).then(() => {
          throw reason
        })
      }
    )
  }

  static resolve<U>(value: U | Thenable<U>): MyPromise<U> {
    if (value instanceof MyPromise) {
      return value
    }

    return new MyPromise<U>(resolve => {
      resolve(value)
    })
  }

  static reject<U = never>(reason?: any): MyPromise<U> {
    return new MyPromise<U>((_, reject) => {
      reject(reason)
    })
  }
}

export default MyPromise
