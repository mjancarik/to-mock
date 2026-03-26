# to-mock

[![NPM package version](https://img.shields.io/npm/v/to-mock/latest.svg)](https://www.npmjs.com/package/to-mock)

The to-mock module helps you create mocked classes and objects. Your tests stay up to date with your defined classes automatically — no need to maintain separate mocks or interfaces. This lets you write unit tests against a contract rather than an implementation detail, keeping your tests isolated and easy to maintain.

Works with any test framework: [jest](https://jestjs.io/), [vitest](https://vitest.dev/), [node:test](https://nodejs.org/api/test.html), [tape](https://www.npmjs.com/package/tape), [jasmine](https://jasmine.github.io/), [mocha](https://mochajs.org/) and others. Includes [TypeScript](https://www.typescriptlang.org/) type declarations out of the box.

You can mock [Date, RegExp and other native objects](#mock-native-object).

## Installation

```shell
npm i to-mock --save-dev
```

## Examples

1. [Jasmine](https://codesandbox.io/s/j3l8k6wlr5?fontsize=14) - example with jasmine and toMockedInstance
2. [Jest/Typescript](https://github.com/mjancarik/idle-tasks/blob/master/src/__tests__/IdleQueueSpec.ts) - example with jest and typescript
3. [Best practice](#best-practice) - example with setting to-mock module for jest framework

## API

1. [toMock](#tomock)
2. [toMockedInstance](#tomockedinstance)
3. [setGlobalKeepUnmock](#setglobalkeepunmock)
4. [setGlobalMockMethod](#setglobalmockmethod)
5. [objectKeepUnmock](#objectkeepunmock)
6. [functionKeepUnmock](#functionkeepunmock)

## toMock

The library ships as both ESM (`dist/index.mjs`) and CommonJS (`dist/index.cjs`) with bundled TypeScript declarations (`dist/index.d.ts`).

```javascript
// MyArray.js
export default class MyArray {
  constructor(array) {
    this.array = array.slice();
  }

  clone() {
    return this.array.slice();
  }
}

// MyArray.test.js
import MyArray from './MyArray.js';
import { toMock } from 'to-mock';

describe('Your spec', () => {
  // MyArray is not modified — a new mocked subclass is returned
  const MockedMyArray = toMock(MyArray);
  const mockedInstance = new MockedMyArray();

  it('is instance of MyArray', () => {
    expect(mockedInstance instanceof MyArray).toBeTruthy();
  });

  it('method does not throw', () => {
    expect(() => mockedInstance.clone()).not.toThrow();
  });
});
```

### Mock native object

```javascript
// MyDate.test.js
import { toMock } from 'to-mock';

describe('Your spec', () => {
  const MockedDate = toMock(Date);
  const RealDate = Date;

  beforeEach(() => {
    Date = MockedDate;
  });

  afterEach(() => {
    Date = RealDate;
  });

  it('you can mock date', () => {
    jest.spyOn(MockedDate, 'now').mockReturnValue(1);

    expect(Date.now()).toEqual(1);
  });
});
```

### toMockedInstance

Creates a mocked instance directly, with optional property overrides applied on top. Equivalent to calling `toMock`, constructing an instance, and applying `Object.assign` — but in one step.

```javascript
import { toMockedInstance } from 'to-mock';

describe('Your spec', () => {
  it('creates a mocked Date instance with a default getTime', () => {
    const dateWithDefault = toMockedInstance(Date, { getTime: () => 1 });

    expect(dateWithDefault.getTime()).toEqual(1);
  });
});
```

### setGlobalKeepUnmock

Sets a global predicate applied to every `toMock` / `toMockedInstance` call that does not supply its own `keepUnmock` argument. Return `true` from the predicate to leave a property unmocked.

In v2, [`objectKeepUnmock`](#objectkeepunmock) is active by default — you only need to call this to override or clear the global predicate.

Two built-in predicates are provided: [`objectKeepUnmock`](#objectkeepunmock) and [`functionKeepUnmock`](#functionkeepunmock).

```javascript
import { toMockedInstance, setGlobalKeepUnmock, objectKeepUnmock } from 'to-mock';

// Preserve Object.prototype methods (toString, hasOwnProperty, …) globally
setGlobalKeepUnmock(objectKeepUnmock);

// Per-call keepUnmock — keep getDay unmocked on this instance only
function keepGetDay({ property }) {
  return property === 'getDay';
}

const dateWithDefault = toMockedInstance(
  Date,
  { getTime: () => 1 },
  keepGetDay,
);

const dayFromMock = Reflect.apply(dateWithDefault.getDay, new Date(), []);
const dayFromDate = new Date().getDay();

expect(dateWithDefault.getTime()).toEqual(1);
expect(dayFromMock === dayFromDate).toEqual(true);
```

### setGlobalMockMethod

Overrides the factory used to produce mock functions. The factory is called once per mocked method and must return a function. Defaults to `() => function mockMethod() {}`.

Use this to integrate with your testing framework's spy/mock system:

```javascript
import { toMockedInstance, setGlobalMockMethod } from 'to-mock';

setGlobalMockMethod(jest.fn);

test('tracks calls', () => {
  const date = toMockedInstance(Date);
  date.getTime();

  // All jest.fn() methods are available
  expect(date.getTime).toHaveBeenCalled();
});
```

### objectKeepUnmock

Built-in predicate that preserves all properties inherited from `Object.prototype` (e.g. `toString`, `hasOwnProperty`). This is the **default global predicate in v2** — it is active without any setup.

Pass it as the `keepUnmock` argument for per-call use, or call `setGlobalKeepUnmock(objectKeepUnmock)` to restore it after clearing.

```javascript
import { toMock, objectKeepUnmock } from 'to-mock';

// per-call:
const Mocked = toMock(MyClass, objectKeepUnmock);
```

### functionKeepUnmock

Built-in predicate that preserves all properties inherited from `Function.prototype` (e.g. `call`, `apply`, `bind`). Useful when you need the constructor chain to remain functional.

```javascript
import { toMock, functionKeepUnmock } from 'to-mock';

const Mocked = toMock(MyClass, functionKeepUnmock);
```

### TypeScript

The package ships with TypeScript declarations — no additional `@types` package needed.

```typescript
import { setGlobalMockMethod, toMockedInstance } from 'to-mock';
import * as utils from '../utils.js';

jest.mock('../utils', () => {
  const original = jest.requireActual('../utils');

  setGlobalMockMethod(jest.fn);

  return toMockedInstance(
    original,
    { __original__: original },
    ({ property }) => property === 'once',
  );
});
```

### Best practice

Recommended setup file for jest (configured via [setupFiles](https://jestjs.io/docs/configuration#setupfiles-array)). The same pattern works for vitest with its [`setupFiles`](https://vitest.dev/config/#setupfiles) option. For `node:test`, call the setup file manually before running tests.

```javascript
// setupJest.js
import { setGlobalMockMethod } from 'to-mock';

// Replace every mocked method with jest.fn()
setGlobalMockMethod(jest.fn);
```

```javascript
// *Spec.js
import { toMockedInstance } from 'to-mock';

// Use toMockedInstance everywhere — no need to call new
```

## Migration to v2

### Named exports only — default export removed

v1 exported `toMock` as the default export. v2 removes the default export; use the named export instead.

```javascript
// v1
import toMock from 'to-mock';

// v2
import { toMock } from 'to-mock';
```

### `objectKeepUnmock` is now the default global predicate

In v1, `Object.prototype` methods (e.g. `toString`, `hasOwnProperty`) were mocked by default. In v2, `objectKeepUnmock` is applied globally out of the box — `Object.prototype` methods are preserved without any setup.

If you need the v1 behaviour (mock everything including `Object.prototype`), call:

```javascript
import { setGlobalKeepUnmock } from 'to-mock';

setGlobalKeepUnmock(null);
```

## Contributing

Contributing to this repository is done via [Pull-Requests](https://github.com/mjancarik/to-mock/pulls).
Any commit must follow these rules (validated automatically on commit):

1. **type** (`build`, `ci`, `chore`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`)
2. **scope** in brackets — one-word description of the changed area
3. **colon** `:`
4. **message** (lower-case)

Examples: `fix(mock): handle null prototype`, `feat(types): add keepUnmock overload`

Use `npm run commit` for an interactive prompt that validates and formats the message automatically. See [commitizen/cz-cli](https://github.com/commitizen/cz-cli) for details.
