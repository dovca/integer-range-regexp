import {
  getCommonPrefix,
  getLeadingZeroCount,
  getPartialRangeSuffix,
  getRegexCharRange,
  getRegexQuantifier,
  makeSourceExact,
  makeSourceNegative,
  makeSourceUnion,
  trimLeadingZeroes,
} from './utils'

export interface IntegerRangeRegExpOptions {
  /** Should the RegExp be surrounded by `^` and `$`? */
  exact?: boolean,
}

// Validates that the range boundaries are in correct order
function validateRangeInput(min: number, max: number): void {
  if (min > max) {
    throw new Error('Min must not be greater than max')
  }
}

function getPartialRanges(minStr: string, maxStr: string, prefixLength: number): string[] {
  const digitCount = maxStr.length
  const leadingZeroCount = getLeadingZeroCount(minStr)
  const trimLeadingZeroes = prefixLength === 0

  // Let T = maxStr[0] followed by digitCount-1 zeros.
  // The range splits into: minStrRaw, [minStrRaw+1, T-1], [T, maxStr-1], maxStr.
  // The middle two parts are covered by the two loops below.

  const partialRanges: string[] = []

  const addPartialRange = (str: string, index: number, middleChunk: string): void => {
    const rawPrefix = str.slice(0, index)
    const prefix = trimLeadingZeroes ? rawPrefix.replace(/^0+/, '') : rawPrefix
    const suffix = getPartialRangeSuffix(index, digitCount)

    partialRanges.push(prefix + middleChunk + suffix)
  }

  // First partial range: [minStrRaw+1, T-1].
  // For example if minStrRaw='127' and maxStr='6413', this covers 128 -> 5999.
  for (let j = digitCount - 1; j >= 0; j--) {
    // Short-circuit: when j is in the leading-zero region of minStr and
    // there is no prefix before them, emit a compact from-to repetition pattern
    // instead of a long list of alternatives.
    // j > 1 prevents emitting \d{n,m} with n > m (invalid quantifier) when j reaches 0.
    if (j < leadingZeroCount && j > 1 && prefixLength === 0) {
      const quant = getRegexQuantifier(digitCount - 1 - j, digitCount - 2)
      partialRanges.push(`[1-9]\\d${quant}`)

      // Skip to processing the left-most digit after which the loop ends
      j = 0
    }

    const min = Number(minStr[j])
    const max = Number(maxStr[j])

    const lo = min + 1
    const hi = j === 0 ? max - 1 : 9

    if (lo <= hi) {
      addPartialRange(minStr, j, getRegexCharRange(lo, hi))
    }
  }

  // Second partial range: [T, maxStr-1].
  // For example if maxStr='6413', this covers 6000 -> 6412.
  for (let j = 1; j < digitCount; j++) {
    const max = Number(maxStr[j])

    if (max > 0) {
      addPartialRange(maxStr, j, getRegexCharRange(0, max - 1))
    }
  }

  return partialRanges
}

// This function can only work with non-negative ranges
function getNonNegativeRangeRegExpSource(min: number, max: number): string {
  const maxStr = max.toString()

  if (min === max) return maxStr

  const minStrRaw = min.toString()
  const minStr = minStrRaw.padStart(maxStr.length, '0')
  const prefix = getCommonPrefix(minStr, maxStr)
  const minSuffix = minStr.slice(prefix.length)
  const maxSuffix = maxStr.slice(prefix.length)
  const partialRanges = getPartialRanges(minSuffix, maxSuffix, prefix.length)

  return prefix + makeSourceUnion(trimLeadingZeroes(minSuffix), ...partialRanges, maxSuffix)
}

// This function can resolve ranges that can include negative numbers
function getRangeRegExpSource(min: number, max: number): string {
  if (min >= 0) {
    // Completely non-negative range
    return getNonNegativeRangeRegExpSource(min, max)
  } else if (max < 0) {
    // Completely negative range
    return makeSourceNegative(getNonNegativeRangeRegExpSource(-max, -min))
  } else {
    // Range spans negative and positive numbers
    const negativeSource = makeSourceNegative(getNonNegativeRangeRegExpSource(1, -min))
    const positiveSource = getNonNegativeRangeRegExpSource(0, max)

    return makeSourceUnion(negativeSource, positiveSource)
  }
}

/**
 * Generate a RegExp instance that can match strings containing integers
 * between `min` and `max` inclusive.
 * @param min The smallest value that will match
 * @param max The largest value that will match
 * @param [options]
 *  - `exact` (false): Should the RegExp be surrounded by `^` and `$`?
 */
export function createIntegerRangeRegExp(
  min: number,
  max: number,
  options: IntegerRangeRegExpOptions = {},
): RegExp {
  validateRangeInput(min, max)

  const source = getRangeRegExpSource(min, max)

  return options.exact
    ? new RegExp(makeSourceExact(source))
    : new RegExp(source)
}
