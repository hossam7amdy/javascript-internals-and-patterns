Array.prototype.myMap = function (callbackFn, thisArg) {
  let index = 0
  const result = []
  const length = this.length
  while (index < length) {
    if (Object.prototype.hasOwnProperty.call(this, index)) {
      result[index] = callbackFn.call(thisArg, this[index], index, this)
    }
    index++
  }
  return result
}
