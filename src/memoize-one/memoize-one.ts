const isEqual = (val1: any, val2: any) => {
  if (val1 === val2) return true

  if (Number.isNaN(val1) && Number.isNaN(val2)) {
    return true
  }

  return false
}

const areInputsEqual = (newInput: any[], prevInput: any[]) => {
  if (newInput.length !== prevInput.length) {
    return false
  }
  for (let i = 0; i < newInput.length; i++) {
    if (!isEqual(newInput[i], prevInput[i])) {
      return false
    }
  }
  return true
}

/**
 * @param {Function} func
 * @param {(args: any[], newInput: any[]) => boolean} [isEqual]
 * @returns {any}
 */
function memoizeOne<TFunc extends (this: any, ...newArgs: any[]) => any>(
  func: TFunc,
  isEqual = areInputsEqual
): TFunc {
  let cache: any | null = null

  return function memoized(...newArgs) {
    if (cache && cache.prevThis === this && isEqual(newArgs, cache.prevArgs)) {
      return cache.prevResult
    }

    const result = func.apply(this, newArgs)
    cache = {
      prevThis: this,
      prevArgs: newArgs,
      prevResult: result
    }
    return result
  } as TFunc
}

export default memoizeOne
