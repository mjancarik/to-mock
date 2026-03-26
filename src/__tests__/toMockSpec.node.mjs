import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import {
  functionKeepUnmock,
  objectKeepUnmock,
  setGlobalKeepUnmock,
  setGlobalMockMethod,
  toMock,
  toMockedInstance,
} from '../toMock.mjs';

let shouldBeUndefined;
const ctx = {};

beforeEach(() => {
  class Dummy {
    constructor(array) {
      array.slice();
    }

    dummyMethod() {
      throw new Error('Dummy method');
    }

    static staticDummyMethod() {
      throw new Error('Static dummy method');
    }
  }

  class MyClass extends Dummy {
    constructor(array) {
      super(array);
      this.array = array.slice();
    }

    static get black() {
      return 'black';
    }

    get isEmpty() {
      shouldBeUndefined = 1;

      return this.array.length === 0;
    }

    get count() {
      return this.array.length;
    }

    set count(value) {
      this.array = new Array(value);
    }

    static staticMethod(array) {
      array.slice();
    }

    method() {
      this.array.slice();
    }
  }

  ctx.myObject = {
    method(array) {
      array.slice();
    },
  };

  setGlobalMockMethod(() => {
    return function mockMethod() {};
  });

  ctx.MyClass = MyClass;
  ctx.Dummy = Dummy;
  shouldBeUndefined = undefined;
});

test('the mocked class is not throw error for creating new instance of it', () => {
  assert.doesNotThrow(() => {
    Reflect.construct(toMock(ctx.MyClass), []);
  });
});

test('the mocked class is instance of provided class', () => {
  const instance = Reflect.construct(toMock(ctx.MyClass), []);

  assert.ok(instance instanceof ctx.MyClass);
  assert.ok(instance instanceof ctx.Dummy);
});

test('the original prototype chain is not modified', () => {
  toMock(ctx.MyClass, functionKeepUnmock);

  assert.ok(ctx.MyClass.prototype.method.name === 'method');
});

test('the original class is not modified', (t) => {
  toMock(ctx.MyClass, functionKeepUnmock);

  t.assert.snapshot(ctx.MyClass.prototype.constructor.toString());
});

test('the mocked prototype chain is modified', () => {
  assert.ok(toMock(ctx.MyClass).prototype.method.name === 'mockMethod');
});

test('the mocked class method is not throw error', () => {
  const instance = Reflect.construct(toMock(ctx.MyClass), []);

  assert.doesNotThrow(() => {
    instance.method();
  });
});

test('the mocked class is not throw error for static method', () => {
  assert.doesNotThrow(() => {
    toMock(ctx.MyClass).staticMethod();
  });
});

test('the mocked class is not throw error for extended static method', () => {
  assert.doesNotThrow(() => {
    toMock(ctx.MyClass).staticDummyMethod();
  });
});

test('Date mocked static method return undefined', () => {
  assert.ok(toMock(Date).now() === undefined);
});

test('Date mocked static method return 1', () => {
  const MockedDate = toMock(Date);
  MockedDate.now = () => 1;

  assert.ok(MockedDate.now() === 1);
});

test('RegExp can be mocked with his methods', () => {
  const regexp = Reflect.construct(toMock(RegExp), []);

  assert.ok(regexp.test() === undefined);
});

test('the mocked class is not throw error for static getter', () => {
  assert.ok(toMock(ctx.MyClass).black !== 'black');
});

test('object mocked method is not throw error', () => {
  assert.doesNotThrow(() => {
    toMock(ctx.myObject).method();
  });
});

test('throw error for unsupported type', () => {
  assert.throws(() => {
    toMock(1);
  }, TypeError);
});

test('create mocked instance from MyClass', () => {
  const mockedInstance = toMockedInstance(ctx.MyClass);

  assert.ok(mockedInstance instanceof ctx.MyClass);
});

test('create mocked instance from MyClass with overrides and without throwing error', () => {
  const mockedInstance = toMockedInstance(ctx.MyClass, {
    method: () => 1,
  });

  assert.ok(mockedInstance instanceof ctx.MyClass);
  assert.doesNotThrow(() => {
    mockedInstance.dummyMethod();
  });
});

test('create mocked instance from MyClass with overrides', () => {
  const mockedInstance = toMockedInstance(ctx.MyClass, {
    method: () => 1,
  });

  assert.ok(mockedInstance instanceof ctx.MyClass);
  assert.ok(mockedInstance.method() === 1);
});

test('create mocked instance from MyClass with overrides getter', () => {
  const mockedInstance = toMockedInstance(ctx.MyClass, {
    isEmpty: false,
  });

  assert.ok(mockedInstance.isEmpty === false);
});

test('return mocked object with overrides', () => {
  const mockedObject = toMockedInstance(ctx.myObject, {
    method: () => 1,
  });

  assert.ok(mockedObject.method() === 1);
});

test('the mocked instance is not throw error for getter', () => {
  const mockedInstance = toMockedInstance(ctx.MyClass);

  assert.doesNotThrow(() => {
    mockedInstance.count;
  });
});

test('the mocked instance should not call getters', () => {
  toMockedInstance(ctx.MyClass);

  assert.ok(shouldBeUndefined === undefined);
});

test('the mocked instance should unmock Object.prototype methods', () => {
  setGlobalKeepUnmock();
  class SampleClass {}

  assert.strictEqual(SampleClass.toString(), 'class SampleClass {}');
  toMock(class AnotherClass {}, objectKeepUnmock);
  assert.strictEqual(SampleClass.toString(), 'class SampleClass {}');
});

test('the mocked instance should unmock Date.prototype.getDay method', () => {
  function keepUnmock({ property }) {
    return property === 'getDay';
  }

  const dateInstanceWithDefault = toMockedInstance(
    Date,
    { getTime: () => 1 },
    keepUnmock,
  );

  assert.ok(dateInstanceWithDefault.getTime() === 1);
  assert.ok(
    Reflect.apply(dateInstanceWithDefault.getDay, new Date(), []) ===
      new Date().getDay(),
  );
});

test('the class methods should be updated with globalMockMethod', () => {
  function mockMethod() {}
  const getMockMethod = () => mockMethod;
  class SampleClass {
    sampleClassMethod() {}
  }

  setGlobalMockMethod(getMockMethod);
  const instance = toMockedInstance(SampleClass);

  assert.ok(instance.sampleClassMethod === mockMethod);
});

test('the class methods should be mocked for all mock created from toMockedInstance method', () => {
  class SampleClass {
    sampleClassMethod() {
      throw new Error('');
    }
  }

  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  const instance = toMockedInstance(SampleClass);

  assert.doesNotThrow(() => {
    instance.sampleClassMethod();
  });
});

test('the class methods should be mocked for all mock created from toMockedInstance method with performance optimization', () => {
  class SampleClass {
    sampleClassMethod() {
      throw new Error('');
    }
  }

  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  toMockedInstance(SampleClass);
  const instance = toMockedInstance(SampleClass);

  assert.doesNotThrow(() => {
    instance.sampleClassMethod();
  });
});
