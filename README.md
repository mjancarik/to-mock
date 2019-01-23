# to-mock

[![Build Status](https://travis-ci.org/mjancarik/to-mock.svg?branch=master)](https://travis-ci.org/mjancarik/to-mock) [![Dependency Status](https://david-dm.org/mjancarik/to-mock.svg)](https://david-dm.org/mjancarik/to-mock) [![Coverage Status](https://coveralls.io/repos/github/mjancarik/to-mock/badge.svg?branch=master)](https://coveralls.io/github/mjancarik/to-mock?branch=master)
[![NPM package version](https://img.shields.io/npm/v/to-mock/latest.svg)](https://www.npmjs.com/package/to-mock)

The to-mock module help you with creating mocked classes and objects. So your tests are up to date with your defined classes because you don't have to keep mocks or interface for your tests. Then you can creating the unit tests for interface and not for implementation detail, your tests are more isolated and you can easy creating real unit tests.

The javascript to-mock module can be used with any test framework like [jest](https://facebook.github.io/jest/), [ava](https://github.com/avajs/ava), [jasmine](https://jasmine.github.io/) or [mocha](https://mochajs.org/). This is other benefit for your unit tests because you can change test framework.

You can mock Date, RegExp and other native object.

## Installation

You can add the to-mock to your project or testing tools using npm:

```
npm i to-mock --save-dev
```

## Usage

The library is designed to be used in ES2015 environment. For older node <6 you must use [babel](https://babeljs.io/) and for older browser use [browserify](http://browserify.org/) with  [babel](https://babeljs.io/).

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

//MyArraySpec.js
import MyArray from './MyArray';
import toMock from 'to-mock';

describe('Your spec', () => {

    //class MockedMyArray {
    //	constructor() {}
    //	clone() {}
    //}
    // The MyArray class is not modified
    const MockedMyArray = toMock(MyArray);
    let mockedInstance = new MockedMyArray();

    it('is instance of MyArray', () => {
    expect(new MockedMyArray() instanceof MyArray).toBeTruthy();
    });

    it('method not throw Error', () => {
    expect(() => mockedInstance.clone()).not.toThrow();
    });
});
```

Example with overriding native Date object.

```javascript
//MyDateSpec.js
import toMock from 'to-mock';

describe('Your spec', () => {

    let MockedDate = toMock(Date);
    let RealDate = Date;

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

Sometimes you want to working with mocked instance which will be defined some default values. You can use of course toMock function for that but better solution is use toMockedInstance function.

```javascript
//MyDateSpec.js
import toMock, { toMockedInstance } from 'to-mock';

describe('Your spec', () => {

    it('you can create mocked instance of date', () => {
    //let MockedDate = toMock(Date);
    //let dateInstance = new MockedDate();
    //let dateInstanceWithDefault = Object.assign(dateInstance, { getTime: () => 1 });

    let dateInstanceWithDefault = toMockedInstance(Date, { getTime: () => 1 });

    expect(dateInstanceWithDefault.getTime()).toEqual(1);
    });
});

```

You want to working with unmocked methods and properties in very rare use case. For that case you can used globalKeepUnmock method or defined keepUnmock callback as other argument.

```javascript
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

        //let dateInstance = new MockedDate();
        //let dateInstanceWithDefault = Object.assign(dateInstance, { getTime: () => 1 });

        let dateInstanceWithDefault = toMockedInstance(Date, { getTime: () => 1 }, keepUnmock);

        expect(dateInstanceWithDefault.getTime()).toEqual(1);
        expect(Reflect.apply(dateInstanceWithDefault.getDay, new Date(), []) === new Date().getDay()).toEqual(true);
    });
});

```

You can define a specific mock function used for all method mocks. This way, you can replace all these methods with jest.fn, or any other mock method, depending on your testing framework.

```javascript
//MyDateSpec.js
import toMock, { toMockedInstance, setGlobalMockMethod } from 'to-mock';

describe('Your spec', () => {

    it('you can create mocked instance of date', () => {
        setGlobalMockMethod(jest.fn);

        let dateInstance = toMockedInstance(Date);
        let time = dateInstance.getTime();

        expect(time).toEqual(1);
        // You can use all jest.fn() related methods now
        expect(dateInstance.getTime).toHaveBeenCalled();
    });
});

```
