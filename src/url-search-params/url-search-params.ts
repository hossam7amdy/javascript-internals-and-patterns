export class MyURLSearchParams {
  #store: Array<{ name: string; value: string }> = []

  #fromString(init: string = ''): void {
    const [part1, part2] = init.split('?')
    init = part2 || part1!
    init.split('&').forEach(entry => {
      const [name, value = ''] = entry.split('=')
      if (name) this.append(name, value)
    })
  }
  #fromRecord(record: Record<string, string>): void {
    Object.entries(record).forEach(([name, value]) => {
      this.append(name, value)
    })
  }
  #fromPairs(pairs: [string, string][]): void {
    pairs.forEach(([name, value]) => {
      this.append(name, value)
    })
  }

  #parseName(name: string): string {
    const [name1, name2] = name.split('?')
    return name2 || name1!
  }

  #decodeValue(value: string) {
    try {
      return decodeURIComponent(value.replaceAll('+', ' '))
    } catch {
      return value.replace('+', ' ')
    }
  }
  #encodeValue(value: string) {
    return value.replaceAll(' ', '+')
  }

  constructor(init: string | Record<string, string> | [string, string][] = '') {
    if (Array.isArray(init)) {
      this.#fromPairs(init)
    } else if (typeof init === 'object') {
      this.#fromRecord(init)
    } else {
      this.#fromString(init)
    }
  }

  append(name: string, value: string): void {
    value = String(value)
    this.#store.push({ name, value: this.#decodeValue(value) })
  }

  delete(name: string): void {
    this.#store = this.#store.filter(entry => entry.name !== name)
  }

  *entries(): IterableIterator<[string, string]> {
    for (const { name, value } of this.#store) {
      yield [name, value]
    }
  }

  forEach(callback: (value: string, key: string) => void): void {
    this.#store.forEach(({ name, value }) => {
      callback(value, name)
    })
  }

  get(name: string): string | null {
    name = this.#parseName(name)
    const entry = this.#store.find(entry => entry.name === name)
    return entry?.value === undefined ? null : entry.value
  }

  getAll(name: string): string[] {
    name = this.#parseName(name)
    return this.#store
      .filter(entry => entry.name === name)
      .map(entry => entry.value)
  }

  has(name: string): boolean {
    return this.#store.some(entry => entry.name === name)
  }

  *keys(): IterableIterator<string> {
    for (const { name } of this.#store) {
      yield name
    }
  }

  set(name: string, value: string): void {
    this.delete(name)
    this.append(name, value)
  }

  sort(): void {
    this.#store.sort((a, b) => a.name.localeCompare(b.name))
  }

  toString(): string {
    const params: string[] = []
    this.#store.forEach(({ name, value }) => {
      params.push(`${name}=${this.#encodeValue(value)}`)
    })
    return params.join('&')
  }

  *values(): IterableIterator<string> {
    for (const { value } of this.#store) {
      yield value
    }
  }

  *[Symbol.iterator](): IterableIterator<[string, string]> {
    yield* this.entries()
  }
}

export default MyURLSearchParams
