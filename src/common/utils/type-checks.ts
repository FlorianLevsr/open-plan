export const checkDefined = <T = unknown>(
  item?: T,
  errorMessage?: string
): T => {
  if (typeof item === 'undefined') {
    throw new Error(errorMessage || 'A variable should not be undefined.')
  }

  return item
}

export const checkDefinedNotNull = <T = unknown>(
  item?: T | null,
  errorMessage?: string
): T => {
  const definedItem = checkDefined(item)
  if (definedItem === null) {
    throw new Error(errorMessage || 'A variable should not be null.')
  }

  return definedItem
}
