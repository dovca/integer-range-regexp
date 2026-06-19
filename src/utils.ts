export function getRegexCharRange(from: number, to: number): string {
  if (from === to) return from.toString()
  if (from === to - 1) return `[${from}${to}]`
  if (from === 0 && to === 9) return '\\d'
  return `[${from}-${to}]`
}

export function getRegexQuantifier(from: number, to: number = from): string {
  if (from === to) return from === 1 ? '' : `{${from}}`
  return `{${from},${to}}`
}

export function getSubRangeSuffix(index: number, length: number): string {
  const n = length - 1 - index
  return n === 0 ? '' : `\\d${getRegexQuantifier(n)}`
}

export function makeSourceExact(source: string): string {
  return `^${source}$`
}

export function makeSourceNegative(source: string): string {
  return `-${source}`
}

export function makeSourceUnion(...sources: string[]): string {
  return sources.length === 1
    ? sources[0]
    : sources.every((s) => s.length === 1)
      ? `[${sources.join('')}]`
      : `(?:${sources.join('|')})`
}

export function prefixWithoutLeadingZeroes(str: string, index: number): string {
  return str.slice(0, index).replace(/^0+/, '')
}
