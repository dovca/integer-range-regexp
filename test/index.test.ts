import {expect, test} from 'vitest'
import {createIntegerRangeRegExp} from '../src'

test('Invalid input', () => {
  expect(() => createIntegerRangeRegExp(1, 0)).toThrowErrorMatchingSnapshot()
})

test('Primitive cases', () => {
  expect(createIntegerRangeRegExp(0, 0)).toMatchSnapshot()
  expect(createIntegerRangeRegExp(0, 1)).toMatchSnapshot()
  expect(createIntegerRangeRegExp(-1, 0)).toMatchSnapshot()
  expect(createIntegerRangeRegExp(-1, 1)).toMatchSnapshot()
  expect(createIntegerRangeRegExp(-1, -1)).toMatchSnapshot()
  expect(createIntegerRangeRegExp(1, 1)).toMatchSnapshot()
})

test('Interesting edge cases', () => {
  expect(createIntegerRangeRegExp(0, 1000000)).toMatchSnapshot()
  expect(createIntegerRangeRegExp(999, 1000)).toMatchSnapshot()
  expect(createIntegerRangeRegExp(1000, 99999)).toMatchSnapshot()
  expect(createIntegerRangeRegExp(12345, 12346)).toMatchSnapshot()
  expect(createIntegerRangeRegExp(23456, 34567)).toMatchSnapshot()
  expect(createIntegerRangeRegExp(34567, 83456)).toMatchSnapshot()
})

test('Options', () => {
  expect(createIntegerRangeRegExp(0, 100, {exact: true})).toMatchSnapshot()
})

test('Brute force', { tags: 'slow', timeout: 600000 }, () => {
  for (let min = -150; min <= 50; min++) {
    for (let diff = 0; diff < 100; diff++) {
      const max = min + diff
      const regExp = createIntegerRangeRegExp(min, max, {exact: true})
      for (let val = -1000; val <= 1000; val++) {
        const shouldMatch = val >= min && val <= max
        expect(
          regExp.test(val.toString()),
          `expect ${val} to ${shouldMatch ? 'match' : 'not match'} between ${min} and ${max} with regex ${regExp.source}`
        ).toBe(shouldMatch)
      }
    }
  }
})
