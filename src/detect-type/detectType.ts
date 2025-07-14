export const detectType = (data: any): string => {
  if (data === null) return 'null'

  const primitive = typeof data

  if (primitive === 'function' && data.constructor.name === 'AsyncFunction') {
    return 'asyncfunction'
  }

  if (primitive !== 'object') {
    return primitive
  }

  if (data.constructor && typeof data.constructor.name === 'string') {
    return data.constructor.name.toLowerCase()
  }

  return 'object'
}

export default detectType
