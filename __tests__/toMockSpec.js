import test from 'ava';
import toMock, {
  toMockedInstance,
  setGlobalKeepUnmock,
  setGlobalMockMethod,
  objectKeepUnmock,
  functionKeepUnmock
} from '../toMock';

let shouldBeUndefined;

test.beforeEach(t => {
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

  t.context.myObject = {
    method(array) {
      array.slice();
    }
  };

  setGlobalKeepUnmock(objectKeepUnmock);

  t.context.MyClass = MyClass;
  t.context.Dummy = Dummy;
  shouldBeUndefined = undefined;
});

test('the mocked class is not throw error for creating new instance of it', t => {
  t.notThrows(() => {
    Reflect.construct(toMock(t.context.MyClass), []);
  });
});

test('the mocked class is instance of provided class', t => {
  const instance = Reflect.construct(toMock(t.context.MyClass), []);

  t.truthy(instance instanceof t.context.MyClass);
  t.truthy(instance instanceof t.context.Dummy);
});

test('the original prototype chain is not modified', t => {
  toMock(t.context.MyClass, functionKeepUnmock);

  t.truthy(t.context.MyClass.prototype.method.name === 'method');
});

test('the original class is not modified', t => {
  toMock(t.context.MyClass, functionKeepUnmock);

  t.snapshot(t.context.MyClass.prototype.constructor.toString());
});

test('the mocked prototype chain is modified', t => {
  t.truthy(toMock(t.context.MyClass).prototype.method.name === 'mockMethod');
});

test('the mocked class method is not throw error', t => {
  const instance = Reflect.construct(toMock(t.context.MyClass), []);

  t.notThrows(() => {
    instance.method();
  });
});

test('the mocked class is not throw error for static method', t => {
  t.notThrows(() => {
    toMock(t.context.MyClass).staticMethod();
  });
});

test('the mocked class is not throw error for extended static method', t => {
  t.notThrows(() => {
    toMock(t.context.MyClass).staticDummyMethod();
  });
});

test('Date mocked static method return undefined', t => {
  t.truthy(toMock(Date).now() === undefined);
});

test('Date mocked static method return 1', t => {
  let MockedDate = toMock(Date);
  MockedDate.now = () => 1;

  t.truthy(MockedDate.now() === 1);
});

test('RegExp can be mocked with his methods', t => {
  const regexp = Reflect.construct(toMock(RegExp), []);

  t.truthy(regexp.test() === undefined);
});

test('the mocked class is not throw error for static getter', t => {
  t.truthy(toMock(t.context.MyClass).black !== 'black');
});

test('object mocked method is not throw error', t => {
  t.notThrows(() => {
    toMock(t.context.myObject).method();
  });
});

test('throw error for unsupported type', t => {
  t.throws(() => {
    toMock(1);
  }, TypeError);
});

test('create mocked instance from MyClass', t => {
  const mockedInstance = toMockedInstance(t.context.MyClass);

  t.truthy(mockedInstance instanceof t.context.MyClass);
});

test('create mocked instance from MyClass with overrides and without throwing error', t => {
  const mockedInstance = toMockedInstance(t.context.MyClass, {
    method: () => 1
  });

  t.truthy(mockedInstance instanceof t.context.MyClass);
  t.notThrows(() => {
    mockedInstance.dummyMethod();
  });
});

test('create mocked instance from MyClass with overrides', t => {
  const mockedInstance = toMockedInstance(t.context.MyClass, {
    method: () => 1
  });

  t.truthy(mockedInstance instanceof t.context.MyClass);
  t.truthy(mockedInstance.method() === 1);
});

test('create mocked instance from MyClass with overrides getter', t => {
  const mockedInstance = toMockedInstance(t.context.MyClass, {
    isEmpty: false
  });

  t.truthy(mockedInstance.isEmpty === false);
});

test('return mocked object with overrides', t => {
  const mockedObject = toMockedInstance(t.context.myObject, {
    method: () => 1
  });

  t.truthy(mockedObject.method() === 1);
});

test('the mocked instance is not throw error for getter', t => {
  const mockedInstance = toMockedInstance(t.context.MyClass);

  t.notThrows(() => {
    mockedInstance.count;
  });
});

test('the mocked instance should not call getters', t => {
  toMockedInstance(t.context.MyClass);

  t.truthy(shouldBeUndefined === undefined);
});

test('the mocked instance should unmock Object.prototype methods', t => {
  setGlobalKeepUnmock();
  class SampleClass {}

  t.is(SampleClass.toString(), 'class SampleClass {}');
  toMock(class AnotherClass {}, objectKeepUnmock);
  t.is(SampleClass.toString(), 'class SampleClass {}');
});

test('the mocked instance should unmock Date.prototype.getDay method', t => {
  function keepUnmock({ property }) {
    return property === 'getDay';
  }

  const dateInstanceWithDefault = toMockedInstance(
    Date,
    { getTime: () => 1 },
    keepUnmock
  );

  t.truthy(dateInstanceWithDefault.getTime() === 1);
  t.truthy(
    Reflect.apply(dateInstanceWithDefault.getDay, new Date(), []) ===
      new Date().getDay()
  );
});

test('the class methods should be updated with globalMockMethod', t => {
  function mockMethod() {}
  let getMockMethod = () => mockMethod;
  class SampleClass {
    sampleClassMethod() {}
  }

  setGlobalMockMethod(getMockMethod);
  let instance = toMockedInstance(SampleClass);

  t.truthy(instance.sampleClassMethod === mockMethod);
});
