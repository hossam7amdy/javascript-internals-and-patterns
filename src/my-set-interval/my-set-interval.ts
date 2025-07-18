let intervalId = 0
const map = new Map<number, NodeJS.Timeout>()

const mySetInterval = (
  callback: () => void,
  delay: number,
  period: number
): number => {
  const myIntervalId = intervalId++

  const start = (count: number) => {
    const timeoutId = setTimeout(
      () => {
        callback()
        start(count + 1)
      },
      delay + period * count
    )
    map.set(myIntervalId, timeoutId)
  }

  start(0)
  return myIntervalId
}

const myClearInterval = (id: number) => {
  const intervalId = map.get(id)
  clearTimeout(intervalId)
}

export { mySetInterval, myClearInterval }
