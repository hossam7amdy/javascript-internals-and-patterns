export const wrap = <T = any[]>(arr: T[]): T[] => {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && /^-[0-9]+$/.test(prop)) {
        const index = parseInt(prop)
        prop = (arr.length + index).toString()
      }
      return Reflect.get(target, prop, receiver)
    },
    set(target, prop, receiver) {
      if (typeof prop === 'string' && /^-[0-9]+$/.test(prop)) {
        const index = arr.length + parseInt(prop)
        if (index < 0) {
          throw Error('Negative array index is not allowed')
        }
        prop = index.toString()
      }
      return Reflect.set(target, prop, receiver)
    }
  })
}

export default wrap
