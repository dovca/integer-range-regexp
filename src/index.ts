import {
  getRegexCharRange,
  getRegexQuantifier,
  getSubRangeSuffix,
  makeSourceExact,
  makeSourceNegative,
  makeSourceUnion,
  prefixWithoutLeadingZeroes,
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

// This function can only work with non-negative ranges
function getNonNegativeRangeRegExpSource(minValue: number, maxValue: number): string {
  // Ensure correct input and non-negative values
  validateRangeInput(0, minValue)
  validateRangeInput(minValue, maxValue)

  const maxStr = maxValue.toString()

  if (minValue === maxValue) {
    return maxStr
  }

  const minStrRaw = minValue.toString()
  const minStr = minStrRaw.padStart(maxStr.length, '0')
  const digitCount = maxStr.length

  let firstDiffPos = 0

  // Skip to the first differing digit
  while (firstDiffPos < digitCount && minStr[firstDiffPos] === maxStr[firstDiffPos]) {
    firstDiffPos++
  }

  // firstDiffPos is the first index where minStr and maxStr differ; all earlier digits are equal.
  // minStr[firstDiffPos] < maxStr[firstDiffPos] by construction.
  // Let T = maxStr[firstDiffPos+1] followed by (digitCount - firstDiffPos - 1) zeros.
  // The range splits into: minStrRaw, [minStrRaw+1, T-1], [T, maxStr-1], maxStr —
  // the middle two parts are covered by the two loops below.

  const partialRanges: string[] = []

  const addPartialRange = (str: string, index: number, middleChunk: string): void => {
    partialRanges.push(prefixWithoutLeadingZeroes(str, index) + middleChunk + getSubRangeSuffix(index, digitCount))
  }

  // First partial range: [minStrRaw+1, T-1].
  // For example if minStrRaw='127' and maxStr='6413', this covers 128 -> 5999.
  for (let j = digitCount - 1; j >= firstDiffPos; j--) {
    // Short-circuit: when j is in the leading-zero region of minStr, emit a compact
    // from-to repetition pattern instead of a long list of alternatives.
    // j > 1 prevents emitting \d{n,m} with n > m (invalid quantifier) when j reaches 0.
    if (j < digitCount - minStrRaw.length && j > 1) {
      const quant = getRegexQuantifier(digitCount - 1 - j, digitCount - 2)
      partialRanges.push(`[1-9]\\d${quant}`)

      // Skip to processing the firstDiffPos after which the loop ends
      j = firstDiffPos
    }

    const min = Number(minStr[j])
    const max = Number(maxStr[j])

    const lo = min + 1
    const hi = firstDiffPos === j ? max - 1 : 9

    if (lo <= hi) {
      addPartialRange(minStr, j, getRegexCharRange(lo, hi))
    }
  }

  // Second partial range: [T, maxStr-1].
  // For example if maxStr='6413', this covers 6000 -> 6412.
  for (let j = firstDiffPos + 1; j < digitCount; j++) {
    const max = Number(maxStr[j])

    if (max > 0) {
      addPartialRange(maxStr, j, getRegexCharRange(0, max - 1))
    }
  }

  // We can combine the partial ranges into a single regex.
  return makeSourceUnion(minStrRaw, ...partialRanges, maxStr)
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

  let source = getRangeRegExpSource(min, max)

  if (options.exact) {
    source = makeSourceExact(source)
  }

  return new RegExp(source)
}
