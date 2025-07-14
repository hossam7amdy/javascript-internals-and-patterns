const check = (value: string): string => {
  const regex = /^(0|[1-9][0-9]*)$/
  if (!regex.test(value)) {
    throw TypeError(`Invalid value "${value}"`)
  }
  return value
}

export class MyBigInt {
  #value: string

  constructor(value: string) {
    this.#value = check(value)
  }

  add(value: string): MyBigInt {
    const input = check(value)
    const stored = this.#value

    let carry = 0
    const result: string[] = []
    let i = input.length - 1
    let j = stored.length - 1

    while (i >= 0 || j >= 0 || carry) {
      const digit1 = i >= 0 ? parseInt(input[i--]!) : 0
      const digit2 = j >= 0 ? parseInt(stored[j--]!) : 0
      const sum = digit1 + digit2 + carry
      result.push((sum % 10).toString())
      carry = Math.floor(sum / 10)
    }

    return new MyBigInt(result.reverse().join(''))
  }

  // @ts-expect-error TODO:
  subtract(value: string): MyBigInt {}

  // @ts-expect-error TODO:
  multiply(value: string): MyBigInt {}

  // @ts-expect-error TODO:
  divide(value: string): MyBigInt {}

  valueOf(): string {
    return this.#value
  }

  toString(): string {
    return this.#value
  }
}

export default MyBigInt
