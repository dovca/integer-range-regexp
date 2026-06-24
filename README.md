# Integer range RegExp

Regular expressions can match integers, but only as an unspecific series of digits.
Non-regex post-processing is required to make other assertions about the actual
numeric values. This library provides a way to generate regular expressions that
match integers within a specified range.

## Installation

```sh
npm install @dovca/integer-range-regexp
```

## Usage

```ts
import { createIntegerRangeRegExp } from '@dovca/integer-range-regexp';

// This regex will match '10', '11', ..., '99', '100', but not '9' or '101'.
const regExp = createIntegerRangeRegExp(10, 100, { exact: true });
```

The generated regular expression matches all integers between `min` and `max`
inclusive. It contains no capturing groups, so it can be used in larger patterns
without worrying about group numbering.

### Options

- `exact` (default: `false`): If `true`, the generated regular expression will
  be surrounded by `^` and `$`. This is useful when the input string is just
  the number. For scenarios where the number is part of a larger string,
  you can set this to `false` and then use the regex's `source` property to
  integrate it into a larger pattern.

  ```ts
  const regExp = createIntegerRangeRegExp(1, 6);
  // -> /(?:1|[2-5]|6)/, but this will also match '1000'

  const regExpExact = createIntegerRangeRegExp(1, 6, { exact: true });
  // -> /^(?:1|[2-5]|6)$/, which will only match '1', '2', '3', '4', '5', or '6'
  
  const prefixedRegExp = new RegExp(`^A${regExp.source}$`);
  // This will match 'A1', 'A2', ..., 'A6', but not 'A10' or 'B1'.
  ```

## How it works

The algorithm to generate the regular expression works on the string
representations of the `min` and `max` values. It identifies the common prefix
of the two numbers and then constructs parts that account for the varying digits
in the suffix. The resulting regex is optimized to be as concise as possible
while still matching all integers in the specified range.

For example, for the range `123` to `45678`:

1. The `min` number is zero-padded to `00123`.
2. No common prefix is identified.
3. The range is divided into sub-ranges based on the digits of the numbers.
   First, `min` is processed:

   | 10000's digit | 1000's digit | 100's digit | 10's digit | 1's digit | Covered range |
   |---------------|--------------|-------------|------------|-----------|---------------|
   | 0             | 0            | 1           | 2          | 3         | 123           |
   | 0             | 0            | 1           | 2          | 4-9       | 124-129       |
   | 0             | 0            | 1           | 3-9        | *         | 130-199       |
   | 0             | 0            | 2-9         | *          | *         | 200-999       |
   | 0             | 1-9          | *           | *          | *         | 1000-9999     |
   | 1-3           | *            | *           | *          | *         | 10000-39999   |

4. Then, `max` is processed in a similar manner:

   | 10000's digit | 1000's digit | 100's digit | 10's digit | 1's digit | Covered range |
   |---------------|--------------|-------------|------------|-----------|---------------|
   | 4             | 0-4          | *           | *          | *         | 40000-44999   |
   | 4             | 5            | 0-5         | *          | *         | 45000-45599   |
   | 4             | 5            | 6           | 0-6        | *         | 45600-45669   |
   | 4             | 5            | 6           | 7          | 0-7       | 45670-45677   |
   | 4             | 5            | 6           | 7          | 8         | 45678         |

5. The final regex is constructed by combining all sub-ranges. Digit ranges are
   expressed using character classes, wildcards are expressed by the `\d` token.
   Optimizations are applied to reduce the length of the regex string.

The sub-ranges are disjoint, each continuous on their own, and together they
cover the entire range from `min` to `max`. 
