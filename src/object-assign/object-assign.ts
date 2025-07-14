export const objectAssign = <T, U>(target: T, ...sources: U[]): T & U => {
  if (target === null || target === undefined) {
    throw new TypeError('Target is not valid')
  }
  if (typeof target !== 'object') {
    target = Object(target) as T
  }

  for (const source of sources) {
    if (source !== null && source !== undefined) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source))
    }
  }

  return target as T & U
}

export default objectAssign
