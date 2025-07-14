type Request = object

type NextFunc = (error?: any) => void

type MiddlewareFunc = (req: Request, next: NextFunc) => void

type ErrorHandler = (error: Error, req: Request, next: NextFunc) => void

class Middleware {
  #middlewares: (MiddlewareFunc | ErrorHandler)[]

  constructor() {
    this.#middlewares = []
  }

  use(func: MiddlewareFunc | ErrorHandler) {
    this.#middlewares.push(func)
  }

  start(req: Request) {
    let index = 0

    const next = (error?: any) => {
      const middleware = this.#middlewares[index++]
      if (!middleware) {
        return
      }

      try {
        if (error) {
          if (middleware.length === 3) {
            // @ts-expect-error
            middleware(error, req, next)
          } else {
            next(error)
          }
        } else {
          // @ts-expect-error
          middleware(req, next)
        }
      } catch (e) {
        next(e)
      }
    }

    next()
  }
}

export default Middleware
