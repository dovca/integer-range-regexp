import { expect, test } from 'vitest'
import { createIntegerRangeRegExp } from '../src'

test('Invalid input', () => {
  expect(() => createIntegerRangeRegExp(1, 0)).toThrowErrorMatchingInlineSnapshot('[Error: Min must not be greater than max]')
})

test('Primitive cases', () => {
  expect(createIntegerRangeRegExp(0, 0).source).toMatchInlineSnapshot('"0"')
  expect(createIntegerRangeRegExp(0, 1).source).toMatchInlineSnapshot('"[01]"')
  expect(createIntegerRangeRegExp(1, 1).source).toMatchInlineSnapshot('"1"')
  expect(createIntegerRangeRegExp(-1, 0).source).toMatchInlineSnapshot('"(?:-1|0)"')
  expect(createIntegerRangeRegExp(-1, -1).source).toMatchInlineSnapshot('"-1"')
  expect(createIntegerRangeRegExp(-1, 1).source).toMatchInlineSnapshot('"(?:-1|[01])"')
})

test('Interesting edge cases', () => {
  expect(createIntegerRangeRegExp(0, 100).source).toMatchInlineSnapshot('"(?:0|[1-9]\\d?|100)"')
  expect(createIntegerRangeRegExp(0, 1000000).source).toMatchInlineSnapshot('"(?:0|[1-9]\\d{0,5}|1000000)"')
  expect(createIntegerRangeRegExp(1, 2222).source).toMatchInlineSnapshot('"(?:1|[2-9]|[1-9]\\d{1,2}|1\\d{3}|2[01]\\d{2}|22[01]\\d|222[01]|2222)"')
  expect(createIntegerRangeRegExp(1, 9999).source).toMatchInlineSnapshot('"(?:1|[2-9]|[1-9]\\d{1,2}|[1-8]\\d{3}|9[0-8]\\d{2}|99[0-8]\\d|999[0-8]|9999)"')
  expect(createIntegerRangeRegExp(1, 999999).source).toMatchInlineSnapshot('"(?:1|[2-9]|[1-9]\\d{1,4}|[1-8]\\d{5}|9[0-8]\\d{4}|99[0-8]\\d{3}|999[0-8]\\d{2}|9999[0-8]\\d|99999[0-8]|999999)"')
  expect(createIntegerRangeRegExp(999, 1000).source).toMatchInlineSnapshot('"(?:999|1000)"')
  expect(createIntegerRangeRegExp(1000, 99999).source).toMatchInlineSnapshot('"(?:1000|100[1-9]|10[1-9]\\d|1[1-9]\\d{2}|[2-9]\\d{3}|[1-8]\\d{4}|9[0-8]\\d{3}|99[0-8]\\d{2}|999[0-8]\\d|9999[0-8]|99999)"')
  expect(createIntegerRangeRegExp(7777, 22222).source).toMatchInlineSnapshot('"(?:7777|777[89]|77[89]\\d|7[89]\\d{2}|[89]\\d{3}|1\\d{4}|2[01]\\d{3}|22[01]\\d{2}|222[01]\\d|2222[01]|22222)"')
  expect(createIntegerRangeRegExp(12345, 12346).source).toMatchInlineSnapshot('"1234[56]"')
  expect(createIntegerRangeRegExp(12345, 12399).source).toMatchInlineSnapshot('"123(?:45|4[6-9]|[5-8]\\d|9[0-8]|99)"')
  expect(createIntegerRangeRegExp(12345, 56789).source).toMatchInlineSnapshot('"(?:12345|1234[6-9]|123[5-9]\\d|12[4-9]\\d{2}|1[3-9]\\d{3}|[2-4]\\d{4}|5[0-5]\\d{3}|56[0-6]\\d{2}|567[0-7]\\d|5678[0-8]|56789)"')
  expect(createIntegerRangeRegExp(100000, 111111).source).toMatchInlineSnapshot('"1(?:00000|0000[1-9]|000[1-9]\\d|00[1-9]\\d{2}|0[1-9]\\d{3}|10\\d{3}|110\\d{2}|1110\\d|11110|11111)"')
})

test('Options', () => {
  expect(createIntegerRangeRegExp(0, 100, { exact: true }).source).toMatchInlineSnapshot('"^(?:0|[1-9]\\d?|100)$"')
})

test('Brute force', { tags: 'slow', timeout: 600000 }, () => {
  for (let min = -150; min <= 50; min++) {
    for (let diff = 0; diff < 100; diff++) {
      const max = min + diff
      const regExp = createIntegerRangeRegExp(min, max, { exact: true })
      for (let val = -1000; val <= 1000; val++) {
        const shouldMatch = val >= min && val <= max
        expect(
          regExp.test(val.toString()),
          `expect ${val} to ${shouldMatch ? 'match' : 'not match'} between ${min} and ${max} with regex ${regExp.source}`,
        ).toBe(shouldMatch)
      }
    }
  }
})
