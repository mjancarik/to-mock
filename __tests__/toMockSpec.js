import test from 'ava';
import sinon from 'sinon'
import toMock, { toMockedInstance, mockPrototypeChain } from '../toMock';

class Dummy {
	constructor(array) {
		array.slice();
	}

	dummyMethod() {
		throw new Error('Dummy method');
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
	t.context.MyClass = MyClass;
	t.context.myObject = myObject;
	t.context.MockedMyClass = toMock(MyClass);
	t.context.MockedDate = toMock(Date);
	t.context.MockedRegExp = toMock(RegExp);
	t.context.mockedMyObject = toMock(myObject);
})

test('the mocked class is not throw error for creating new instance of it', t => {
	t.notThrows(() => {
		Reflect.construct(t.context.MockedMyClass, []);
	});
});

test('the mocked class is instance of provided class', t => {
	const instance = Reflect.construct(t.context.MockedMyClass, []);

	t.truthy(instance instanceof MyClass);
	t.truthy(instance instanceof Dummy);
});

test('The original prototype chain is not modified', t => {
	t.truthy(t.context.MyClass.prototype.method.name === 'method');
});

test('The mocked prototype chain is modified', t => {
	t.truthy(t.context.MockedMyClass.prototype.method.name === 'mockMethod');
});

test('the mocked class method is not throw error', t => {
	const instance = Reflect.construct(t.context.MockedMyClass, []);

	t.notThrows(() => {
		instance.method();
	});
});

test('the mocked class static method is not throw error', t => {
	t.notThrows(() => {
		t.context.MockedMyClass.staticMethod();
	});
});

test('date mocked static method return undefined', t => {
	t.truthy(t.context.MockedDate.now() === undefined);
});

test('date mocked static method return undefined', t => {
	t.context.MockedDate.now = sinon.stub().withArgs().returns(1);

	t.truthy(t.context.MockedDate.now() === 1);
});

test('RegExp can be mocked with his methods', t => {
	const regexp = Reflect.construct(t.context.MockedRegExp, []);

	t.truthy(regexp.test() === undefined);
});

test('object mocked method is not throw error', t => {
	t.notThrows(() => {
		t.context.mockedMyObject.method();
	});
});

test('throw error for unsupported type', t => {
	t.throws(() => {
		toMock(1);
	}, TypeError);
});

test('create mocked instance from MyClass', t => {
	const mockedInstance = toMockedInstance(MyClass);

	t.truthy(mockedInstance instanceof MyClass);
});

test('create mocked instance from MyClass with overrides', t => {
	const mockedInstance = toMockedInstance(MyClass, { method: () => 1 });

	t.truthy(mockedInstance instanceof MyClass);
	t.notThrows(() => {
		mockedInstance.dummyMethod();
	})
});

test('create mocked instance from MyClass with overrides', t => {
	const mockedInstance = toMockedInstance(MyClass, { method: () => 1 });

	t.truthy(mockedInstance instanceof MyClass);
	t.truthy(mockedInstance.method() === 1);
});

test('return mocked object with overrides', t => {
	const mockedObject = toMockedInstance(myObject, { method: () => 1 });

	t.truthy(mockedObject.method() === 1);
});
