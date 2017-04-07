# to-mock

[![Build Status](https://travis-ci.org/mjancarik/to-mock.svg?branch=master)](https://travis-ci.org/mjancarik/to-mock) [![Dependency Status](https://david-dm.org/mjancarik/to-mock.svg)](https://david-dm.org/mjancarik/to-mock) [![Coverage Status](https://coveralls.io/repos/github/mjancarik/to-mock/badge.svg?branch=master)](https://coveralls.io/github/mjancarik/to-mock?branch=master)

The to-mock module help you with creating mocked classes and objects. So your tests are up to date with your defined classes because you don't have to keep mocks or interface for your tests. Then you can creating the unit tests for interface and not for implementation detail, your tests are more isolated and you can easy creating real unit tests.

The javascript to-mock module can be used with any test framework like [jest](https://facebook.github.io/jest/), [ava](https://github.com/avajs/ava), [jasmine](https://jasmine.github.io/) or [mocha](https://mochajs.org/). This is other benefit for your unit tests because you can change test framework.

## Usage

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
