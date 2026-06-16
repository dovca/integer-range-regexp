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

## Options

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
