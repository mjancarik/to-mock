# to-mock

[![Build Status](https://travis-ci.org/mjancarik/to-mock.svg?branch=master)](https://travis-ci.org/mjancarik/to-mock) [![Dependency Status](https://david-dm.org/mjancarik/to-mock.svg)](https://david-dm.org/mjancarik/to-mock) [![Coverage Status](https://coveralls.io/repos/github/mjancarik/to-mock/badge.svg?branch=master)](https://coveralls.io/github/mjancarik/to-mock?branch=master)

The to-mock module help you with creating mocked classes and objects. So your tests are up to date with your defined classes because you don't have to keep mocks or interface for your tests. Then you can creating the unit tests for interface and not for implementation detail, your tests are more isolated and you can easy creating real unit tests.

## Usage

```
// MyArray.js
class MyArray {
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
	const MockedMyArray = toMock(MyArray);

	it('is instance of MyArray', () => {
		expect(new MockedMyArray() instanceof MyArray).toBeTruthy();
	});
});

```
