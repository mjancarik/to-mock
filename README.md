# to-mock

[![Build Status](https://travis-ci.org/mjancarik/to-mock.svg?branch=master)](https://travis-ci.org/mjancarik/to-mock) [![Dependency Status](https://david-dm.org/mjancarik/to-mock.svg)](https://david-dm.org/mjancarik/to-mock) [![Coverage Status](https://coveralls.io/repos/github/mjancarik/to-mock/badge.svg?branch=master)](https://coveralls.io/github/mjancarik/to-mock?branch=master)

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

```
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

```
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

Sometimes you want to working with mocked instance which has got defined some default values. You can use of course toMock function for that but better solution is use toMockedInstance function.

```
//MyDateSpec.js
import toMock, { toMockedInstance } from 'to-mock';

describe('Your spec', () => {

	it('you can create mocked instance of date', () => {
		//let MockedDate = toMock(Date);
		//let dateInstance = new MockedDate();
		//let dateInstanceWithDefault = Object.assign(dateInstance, { now: () => 1 });

		let dateInstanceWithDefault = toMockedInstance(Date, { now: () => 1 })

		expect(Date.now()).toEqual(1);
	});
});

```
