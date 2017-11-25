Object.defineProperty(exports, '__esModule', {
  value: true
});

const MOCKED_PROTOTYPE_CHAIN = Symbol('mockedPrototypeChain');

function toMock(arg) {
  if (typeof arg === 'function') {
    return mockClass(arg);
  }

  if (typeof arg === 'object') {
    return mockObject(arg);
  }

  throw new TypeError(
    `The toMock method support object and ES6 class.` +
      ` You give ${typeof arg}. You may add other types and send pull request.`
  );
}

function toMockedInstance(arg, overrides = {}) {
  let mockedArg = toMock(arg);

  if (typeof mockedArg === 'function') {
    let instance = Reflect.construct(mockedArg, []);

    return Object.assign(instance, overrides);
  }

  return Object.assign(mockedArg, overrides);
}

function mockClass(ClassConstructor) {
  class Mock {}

  Reflect.setPrototypeOf(Mock.prototype, ClassConstructor.prototype);
  Reflect.setPrototypeOf(Mock, ClassConstructor);

  mockPrototypeChain(Mock.prototype);
  mockStatic(ClassConstructor, Mock);

  return Mock;
}

function mockObject(object) {
  let newObject = Object.create(object);
  mockPrototypeChain(newObject);

  return newObject;
}

function mockStatic(ClassConstructor, Mock) {
  while (ClassConstructor && Mock) {
    mockOwnProperties(ClassConstructor, Mock);

    ClassConstructor = Reflect.getPrototypeOf(ClassConstructor);
    Mock = Reflect.getPrototypeOf(Mock);
  }
}

function mockPrototypeChain(prototype) {
  let originalPrototype = prototype;

  while (prototype) {
    let clonePrototype = Object.create(prototype, {
      [MOCKED_PROTOTYPE_CHAIN]: {
        value: true,
        enumerable: false
      }
    });

    mockOwnProperties(prototype, clonePrototype);

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

function mockOwnProperties(original, mock) {
  Object.entries(Object.getOwnPropertyDescriptors(original)).forEach(
    ([property, descriptor]) => {
      try {
        if (
          (descriptor.get && typeof descriptor.get === 'function') ||
          (descriptor.set && typeof descriptor.set === 'function')
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
        }

        if (original[property] && typeof original[property] === 'function') {
          mock[property] = function mockMethod() {};
        }
      } catch (_) {} // eslint-disable-line no-empty
    }
  );
}

exports.default = toMock;
exports.toMock = toMock;
exports.toMockedInstance = toMockedInstance;
exports.mockClass = mockClass;
exports.mockObject = mockObject;
exports.mockPrototypeChain = mockPrototypeChain;
exports.mockOwnProperties = mockOwnProperties;
