export function getRegexCharRange(from: number, to: number): string {
  if (from === to) return from.toString()
  if (from === to - 1) return `[${from}${to}]`
  if (from === 0 && to === 9) return '\\d'
  return `[${from}-${to}]`
}

export function getRegexQuantifier(from: number, to: number = from): string {
  if (from === to) return from === 1 ? '' : `{${from}}`
  if (from === 0 && to === 1) return '?'
  return `{${from},${to}}`
}

export function getPartialRangeSuffix(index: number, length: number): string {
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
      : `(?:${sources.filter((s) => s.length > 0).join('|')})`
}

export function getCommonPrefix(a: string, b: string): string {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++
  }
  return a.slice(0, i)
}

export function getLeadingZeroCount(str: string): number {
  let i = 0
  while (i < str.length && str[i] === '0') {
    i++
  }
  return i
}
