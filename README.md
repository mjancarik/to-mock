# to-mock

[![Build Status](https://travis-ci.org/mjancarik/to-mock.svg?branch=master)](https://travis-ci.org/mjancarik/to-mock) [![Dependency Status](https://david-dm.org/mjancarik/to-mock.svg)](https://david-dm.org/mjancarik/to-mock) [![Coverage Status](https://coveralls.io/repos/github/mjancarik/to-mock/badge.svg?branch=master)](https://coveralls.io/github/mjancarik/to-mock?branch=master)
[![NPM package version](https://img.shields.io/npm/v/to-mock/latest.svg)](https://www.npmjs.com/package/to-mock)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/to-mock.svg)

The to-mock module help you with creating mocked classes and objects. So your tests are up to date with your defined classes because you don't have to keep mocks or interface for your tests. Then you can creating the unit tests for interface and not for implementation detail, your tests are more isolated and you can easy creating real unit tests.

The javascript to-mock module can be used with any test framework like [jest](https://facebook.github.io/jest/), [ava](https://github.com/avajs/ava), [tape](https://www.npmjs.com/package/tape), [jasmine](https://jasmine.github.io/), [mocha](https://mochajs.org/) and others. Even you may use it for mocking in [typescript](https://www.typescriptlang.org/). Those are other benefits for your unit tests because you can change test framework or language.

You can mock [Date, RegExp and other native object](#mock-native-object).

## Installation

You can add the to-mock to your project or testing tools using npm:

``` shell
npm i to-mock --save-dev
```

## Examples

1. [Jasmine](https://codesandbox.io/s/j3l8k6wlr5?fontsize=14) - example with jasmine and toMockedInstance
2. [Jest/Typescript](https://github.com/mjancarik/idle-tasks/blob/master/src/__tests__/IdleQueueSpec.ts) - example with jest and typescript
3. [AVA](https://github.com/mjancarik/to-mock/blob/master/__tests__/toMockSpec.js) - example with ava and self testing
4. [Best practice](#best-practice) - example with setting to-mock module for jest framework

## API

1. [toMock](#usage)
2. [toMockedInstance](#tomockedinstance)
3. [setGlobalKeepUnmock](#setglobalkeepunmock)
4. [setGlobalMockMethod](#setglobalmockmethod)

## Usage

The library is designed to be used in ES2015 environment. For older node <6 you must use [babel](https://babeljs.io/) and for older browser use [browserify](http://browserify.org/) with  [babel](https://babeljs.io/).

``` javascript
// MyArray.js
export default class MyArray {
  constructor(array) {
    this.array = array.slice();
  }

  clone() {
    return this.array.slice();
  }
}

//MyArraySpec.js
import MyArray from './MyArray';
import toMock from 'to-mock';

describe('Your spec', () => {

  // The MyArray class is not modified
  const MockedMyArray = toMock(MyArray);
  //class MockedMyArray {
  //	constructor() {}
  //	clone() {}
  //}
  const mockedInstance = new MockedMyArray();

  it('is instance of MyArray', () => {
    expect(mockedInstance instanceof MyArray).toBeTruthy();
  });

  it('method not throw Error', () => {
    expect(() => mockedInstance.clone()).not.toThrow();
  });
});
```

### Mock native object

Example with overriding native Date object.

``` javascript
//MyDateSpec.js
import toMock from 'to-mock';

describe('Your spec', () => {

  const MockedDate = toMock(Date);
  const RealDate = Date;

  beforeEach(() => {
    Date = MockedDate;
  });

  afterEach(() => {
    Date = RealDate;
  };)

  it('you can mock date', () => {
    spyOn(MockedDate, 'now').and.returnValue(1);

    expect(Date.now()).toEqual(1);
  });
});
```

### toMockedInstance

Sometimes you want to working with mocked instance which will be defined some default values. You can use of course toMock function for that but better solution is use toMockedInstance function.

``` javascript
//MyDateSpec.js
import toMock, { toMockedInstance } from 'to-mock';

describe('Your spec', () => {

  it('you can create mocked instance of date', () => {
    //let MockedDate = toMock(Date);
    //let date = new MockedDate();
    //let dateWithDefault = Object.assign(
    //  date,
    //  { getTime: () => 1 }
    //);

    const dateWithDefault = toMockedInstance(
      Date,
      { getTime: () => 1 }
    );

    expect(dateWithDefault.getTime()).toEqual(1);
  });
});
```

### setGlobalKeepUnmock

You want to working with unmocked methods and properties in very rare use case. For that case you can used globalKeepUnmock method or defined keepUnmock callback as other argument.

``` javascript
//MyDateSpec.js
import toMock, { toMockedInstance, setGlobalKeepUnmock } from 'to-mock';

describe('Your spec', () => {

  it('you can create mocked instance of date', () => {
    function keepUnmock({ property, descriptor, original, mock }) {
      return property === 'getDay';
    }

    //let MockedDate = toMock(Date, keepUnmock);
    //or    
    //let MockedDate = toMock(Date);
    //setGlobalKeepUnmock(keepUnmock);

    //let date = new MockedDate();
    //let dateWithDefault = Object.assign(
    //  date,
    //  { getTime: () => 1 }
    //);

    let dateWithDefault = toMockedInstance(
      Date,
      { getTime: () => 1 },
      keepUnmock
    );

    let dayFromMock = Reflect.apply(
      dateWithDefault.getDay,
      new Date(),
      []
    );
    let dayFromDate = new Date().getDay();


    expect(dateWithDefault.getTime()).toEqual(1);
    expect(dayFromMock === dateFromDate).toEqual(true);
  });
});
```

### setGlobalMockMethod

You can define a specific mock function used for all method mocks. This way, you can replace all these methods with jest.fn, or any other mock method, depending on your testing framework.

```javascript
//MyDateSpec.js
import { toMockedInstance, setGlobalMockMethod } from 'to-mock';

describe('Your spec', () => {

  it('you can create mocked instance of date', () => {
    setGlobalMockMethod(jest.fn);

    let date = toMockedInstance(Date);
    date.getTime();

    // You can use all jest.fn() related methods now
    expect(date.getTime).toHaveBeenCalled();
  });
});
```

### Typescript

Sometimes you need mock all methods in file and sometimes you need original method for some use cases. For example: Jest have method [mockFn.mockRestore](https://jestjs.io/docs/en/mock-function-api.html#mockfnmockrestore) for restoring original method but it throws error for typescript. Luckily to-mock module will help you. You can see [source code](https://github.com/mjancarik/idle-tasks/blob/master/src/__tests__/IdleQueueSpec.ts)

``` javascript
//indexSpec.ts

import { setGlobalMockMethod, toMockedInstance } from 'to-mock';
import * as utils from '../utils';

//jest.mock('../utils');
//utils.once.mockRestore(); // throw Error in Typescript

jest.mock('../utils', () => {
  const original = jest.requireActual('../utils');

  setGlobalMockMethod(jest.fn);

  return toMockedInstance(
    original,
    { __original__: original },
    ({ property }) => property === 'once'
  );
});
```

### Best practice

We use to-mock module for unit tests and integration tests in large applications. We share you our setup file for jest framework which you can configure through [setupFiles](https://jestjs.io/docs/en/configuration#setupfiles-array).

``` javascript
// setupJest.js

import {
  objectKeepUnmock,
  setGlobalKeepUnmock,
  setGlobalMockMethod
} from 'to-mock';

// every method is replaced to jest.fn()
setGlobalMockMethod(jest.fn);
// native object method keep unmock
setGlobalKeepUnmock(objectKeepUnmock);


// *Spec.js
import { toMockedInstance } from 'to-mock';

// we use toMockedInstance almost everywhere
```

## Contributing

Contributing to this repository is done via [Pull-Requests](https://github.com/mjancarik/to-mock/pulls).
Any commit that you make must follow simple rules that are automatically validated upon committing.
1. type of change (`build`, `ci`, `chore`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`)
2. scope of change in brackets `( ... )`. This should be one-word description of what part of the repository you've changed.
3. colon `:`
4. message (lower-case)

`fix(iframe): message`

`feat(loader): message`

To simplify this process you can use `npm run commit` command that will interactively prompt for details and will also run linter before you commit. For more information see [commitizen/cz-cli](https://github.com/commitizen/cz-cli) repository.
