# My Set Interval

You are asked to create a new mySetInterval(a, b) which has a different behavior from window.setInterval, the time between calls is a linear function, growing larger and larger period = a + b \* count.

## Description

`mySetInterval` is a utility function that executes a callback repeatedly with a growing time interval between executions. Unlike the standard `setInterval` which maintains a constant delay, `mySetInterval` increases the delay linearly after each execution.

## Usage

```javascript
const intervalId = mySetInterval(callback, initialDelay, increment)

// To stop the interval:
myClearInterval(intervalId)
```

## Parameters

- `callback`: Function to be executed repeatedly
- `initialDelay` (a): Initial delay in milliseconds before the first execution
- `increment` (b): Amount in milliseconds to increase the delay after each execution

## How It Works

The time between executions follows the formula:

```
period = a + b * count
```

Where:

- `a` is the initial delay
- `b` is the increment value
- `count` is the number of times the function has been called (starting at 0)

## Example

```javascript
// Execute a function initially after 1000ms,
// then with increasing delays: 1000ms, 1200ms, 1400ms, etc.
const id = mySetInterval(
  () => {
    console.log('Executed at:', new Date())
  },
  1000,
  200
)

// Stop after some time
setTimeout(() => {
  myClearInterval(id)
  console.log('Interval stopped')
}, 10000)
```

## Implementation Notes

Unlike the standard `setInterval`, this implementation uses a series of chained `setTimeout` calls with recalculated delays to achieve the growing interval behavior.

## Reference

- [BFE - create an interval](https://bigfrontend.dev/problem/create-an-interval)
