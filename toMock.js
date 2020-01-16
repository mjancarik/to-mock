Object.defineProperty(exports, '__esModule', {
  value: true
});

let globalKeepUnmock = null;
let globalMockMethod = () => {
  return function mockMethod() {};
};
const MOCKED_PROTOTYPE_CHAIN = Symbol('mockedPrototypeChain');

function toMock(arg, keepUnmock) {
  if (typeof arg === 'function') {
    return mockClass(arg, keepUnmock);
  }

  if (typeof arg === 'object') {
    return mockObject(arg, keepUnmock);
  }

  throw new TypeError(
    `The toMock method support object and ES6 class.` +
      ` You give ${typeof arg}. You may add other types and send pull request.`
  );
}

function toMockedInstance(arg, overrides = {}, keepUnmock) {
  let mockedArg = toMock(arg, keepUnmock);

  if (typeof mockedArg === 'function') {
    let instance = Reflect.construct(mockedArg, []);

    return Object.assign(instance, overrides);
  }

  return Object.assign(mockedArg, overrides);
}

function mockClass(ClassConstructor, keepUnmock) {
  class Mock {}

  Reflect.setPrototypeOf(
    Mock.prototype,
    Object.create(ClassConstructor.prototype)
  );
  Reflect.setPrototypeOf(Mock, Object.create(ClassConstructor));

  mockPrototypeChain(Mock.prototype, keepUnmock);
  mockStatic(ClassConstructor, Mock, keepUnmock);

  return Mock;
}

function mockObject(object, keepUnmock) {
  let newObject = Object.create(object);
  mockPrototypeChain(newObject, keepUnmock);

  return newObject;
}

function mockStatic(ClassConstructor, Mock, keepUnmock) {
  while (ClassConstructor && Mock) {
    mockOwnProperties(ClassConstructor, Mock, keepUnmock);

    ClassConstructor = Reflect.getPrototypeOf(ClassConstructor);
    Mock = Reflect.getPrototypeOf(Mock);
  }
}

function mockPrototypeChain(prototype, keepUnmock) {
  let originalPrototype = prototype;

  while (prototype) {
    let clonePrototype = Object.create(prototype, {
      [MOCKED_PROTOTYPE_CHAIN]: {
        value: true,
        enumerable: false
      }
    });

    mockOwnProperties(prototype, clonePrototype, keepUnmock);

    Reflect.setPrototypeOf(originalPrototype, clonePrototype);

    if (
      originalPrototype[MOCKED_PROTOTYPE_CHAIN] &&
      prototype[MOCKED_PROTOTYPE_CHAIN] &&
      originalPrototype !== prototype
    ) {
      return;
    }

    originalPrototype = prototype;
    prototype = Reflect.getPrototypeOf(prototype);
  }
}

function mockOwnProperties(original, mock, keepUnmock) {
  const isKeepUnMockDefined = keepUnmock && typeof keepUnmock === 'function';
  const isGlobalKeepUnMockDefined =
    globalKeepUnmock && typeof globalKeepUnmock === 'function';

  Object.entries(Object.getOwnPropertyDescriptors(original)).forEach(
    ([property, descriptor]) => {
      try {
        const keepUnmockArgs = { property, descriptor, original, mock };

        if (
          (isKeepUnMockDefined && keepUnmock(keepUnmockArgs)) ||
          (isGlobalKeepUnMockDefined && globalKeepUnmock(keepUnmockArgs))
        ) {
          return;
        }

        if (
          typeof descriptor.get === 'function' ||
          typeof descriptor.set === 'function'
        ) {
          let _mockedValue = undefined;

          Object.defineProperty(
            mock,
            property,
            Object.assign({}, descriptor, {
              get: () => _mockedValue,
              set: value => {
                _mockedValue = value;
              }
            })
          );
        } else if (typeof original[property] === 'function') {
          mock[property] = globalMockMethod();
        }
      } catch (_) {} // eslint-disable-line no-empty
    }
  );
}

function setGlobalKeepUnmock(callback) {
  globalKeepUnmock = callback;
}

function setGlobalMockMethod(mockMethod) {
  globalMockMethod = mockMethod;
}

function objectKeepUnmock({ original }) {
  return original === Object.prototype;
}

function functionKeepUnmock({ original }) {
  return original === Function.prototype;
}

exports.default = toMock;
exports.toMock = toMock;
exports.toMockedInstance = toMockedInstance;
exports.mockClass = mockClass;
exports.mockObject = mockObject;
exports.mockPrototypeChain = mockPrototypeChain;
exports.mockOwnProperties = mockOwnProperties;
exports.setGlobalKeepUnmock = setGlobalKeepUnmock;
exports.setGlobalMockMethod = setGlobalMockMethod;
exports.objectKeepUnmock = objectKeepUnmock;
exports.functionKeepUnmock = functionKeepUnmock;
