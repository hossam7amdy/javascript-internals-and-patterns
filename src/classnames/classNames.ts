export type Argument =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, any>
  | Array<Argument>

const concatClass = (classes: string, newClass: string): string => {
  if (!classes) {
    return newClass
  }

  return newClass ? classes.concat(' ', newClass) : classes
}

const parseArg = (arg: Argument): string => {
  if (typeof arg === 'string' || typeof arg === 'number') {
    return arg.toString()
  }

  if (arg === null || typeof arg !== 'object') {
    return ''
  }

  if (Array.isArray(arg)) {
    return classNames(...arg)
  }

  let classes = ''
  for (const key in arg) {
    if (Object.hasOwn(arg, key) && !!arg[key]) {
      classes = concatClass(classes, key)
    }
  }

  return classes
}

export const classNames = (...args: Argument[]): string => {
  let classes = ''

  for (let i = 0; i < args.length; i++) {
    if (args[i]) {
      classes = concatClass(classes, parseArg(args[i]))
    }
  }

  return classes
}

export default classNames
