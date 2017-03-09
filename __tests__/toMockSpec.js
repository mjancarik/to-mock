import test from 'ava';
import toMock from '../toMock';

class Dummy {
	constructor(array) {
		array.slice();
	}
}

class MyClass extends Dummy {
	constructor(array) {
		super(array);
		this.array = array.slice();
	}

	static staticMethod(array) {
		array.slice();
	}

	method() {
		this.array.slice();
	}
}

let myObject = {
	method(array) {
		array.slice();
	}
};

test.beforeEach((t) => {
	t.context.MockedMyClass = toMock(MyClass);
	t.context.MockedDate = toMock(Date);
	t.context.mockedMyObject = toMock(myObject);
})

test('mocked class is not throw error for creating new instance of it', t => {
	t.notThrows(() => {
		Reflect.construct(t.context.MockedMyClass, []);
	});
});

test('mocked class is instance of provided class', t => {
	let instance = Reflect.construct(t.context.MockedMyClass, []);

	t.truthy(instance instanceof MyClass);
	t.truthy(instance instanceof Dummy);
});

test('class mocked method is not throw error', t => {
	let instance = Reflect.construct(t.context.MockedMyClass, []);

	t.notThrows(() => {
		instance.method();
	});
});

test('class mocked static method is not throw error', t => {
	t.notThrows(() => {
		t.context.MockedMyClass.staticMethod();
	});
});

test('date mocked static method return undefined', t => {
	t.truthy(t.context.MockedDate.now() === undefined);
});

test('object mocked method is not throw error', t => {
	t.notThrows(() => {
		t.context.mockedMyObject.method();
	});
});

test('throw error for unsupported type', t => {
	t.throws(() => {
		toMock(1);
	});
});
