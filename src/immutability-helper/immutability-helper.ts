export type Command = {
  $push?: any
  $set?: any
  $apply?: (arg: any) => any
  $merge?: any
  [key: string]: any
}

export const update = <T extends Record<string, any> = any>(
  data: T,
  command: Command
): T => {
  if (command.$push !== undefined) {
    return data.concat(...command.$push)
  }

  if (command.$set !== undefined) {
    return command.$set
  }

  if (command.$apply !== undefined) {
    if (typeof command.$apply !== 'function') {
      throw new TypeError('$apply is not a valid function')
    }
    return command.$apply?.(data)
  }

  if (command['$merge'] !== undefined) {
    if (typeof data !== 'object') {
      throw new TypeError('data is not a valid object')
    }
    return { ...data, ...command.$merge }
  }

  // Handle nested updates
  const result: any = Array.isArray(data) ? [...data] : { ...data }
  let hasChanged = false

  for (const key in command) {
    if (Object.prototype.hasOwnProperty.call(command, key)) {
      result[key] = update(result[key], command[key])
      hasChanged = data[key] !== result[key]
    }
  }

  return hasChanged ? result : data
}

export default update
