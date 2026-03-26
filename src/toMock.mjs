const MOCKED_PROTOTYPE_CHAIN = Symbol('mockedPrototypeChain');

globalThis.__toMock__ ??= {
  keepUnmock: objectKeepUnmock,
  mockMethod: () => function mockMethod() {},
};
const _globals = globalThis.__toMock__;

/**
 * Returns a mocked version of the given class or object.
 * All methods are replaced with no-op mock functions and getters/setters
 * are replaced with simple value holders. The original is not modified.
 *
 * @template T
 * @param {T} arg - The class constructor or object to mock.
 * @param {import('./toMock.d.ts').KeepUnmockCallback} [keepUnmock] - Optional
 *   per-call predicate. Return `true` to leave a property unmocked.
 * @returns {T} A mocked class or object with the same prototype chain.
 * @throws {TypeError} When `arg` is neither a function nor an object.
 */
export function toMock(arg, keepUnmock) {
  if (typeof arg === 'function') {
    return mockClass(arg, keepUnmock);
  }

  if (typeof arg === 'object') {
    return mockObject(arg, keepUnmock);
  }

  throw new TypeError(
    `The toMock method support object and ES6 class. You give ${typeof arg}. You may add other types and send pull request.`,
  );
}

/**
 * Creates a mocked instance of the given class or object and applies
 * optional property overrides on top.
 *
 * @template T
 * @param {T} arg - The class constructor or object to mock.
 * @param {Partial<T extends new (...args: any[]) => infer I ? I : T>} [overrides]
 *   - Properties to assign directly onto the mocked instance.
 * @param {import('./toMock.d.ts').KeepUnmockCallback} [keepUnmock] - Optional
 *   per-call predicate. Return `true` to leave a property unmocked.
 * @returns {T extends new (...args: any[]) => infer I ? I : T} The mocked instance.
 */
export function toMockedInstance(arg, overrides, keepUnmock) {
  const mockedArg = toMock(arg, keepUnmock);

  if (typeof mockedArg === 'function') {
    const instance = Reflect.construct(mockedArg, []);

    return Object.assign(instance, overrides);
  }

  return Object.assign(mockedArg, overrides);
}

/**
 * Creates a mocked subclass of the given class constructor.
 * All prototype and static methods are replaced with mock functions.
 * The original class is not modified.
 *
 * @template T
 * @param {T} ClassConstructor - The class to mock.
 * @param {import('./toMock.d.ts').KeepUnmockCallback} [keepUnmock] - Optional
 *   predicate to skip mocking individual properties.
 * @returns {T} A new class that extends `ClassConstructor` with mocked methods.
 */
export function mockClass(ClassConstructor, keepUnmock) {
  class Mock {}

  Reflect.setPrototypeOf(Mock.prototype, ClassConstructor.prototype);
  Reflect.setPrototypeOf(Mock, ClassConstructor);

  mockPrototypeChain(Mock.prototype, keepUnmock);
  mockStatic(ClassConstructor, Mock, keepUnmock);

  return Mock;
}

/**
 * Creates a mocked copy of a plain object.
 * All methods in the prototype chain are replaced with mock functions.
 * The original object is not modified.
 *
 * @template T
 * @param {T} object - The object to mock.
 * @param {import('./toMock.d.ts').KeepUnmockCallback} [keepUnmock] - Optional
 *   predicate to skip mocking individual properties.
 * @returns {T} A new object inheriting from `object` with mocked methods.
 */
export function mockObject(object, keepUnmock) {
  const newObject = Object.create(object);
  mockPrototypeChain(newObject, keepUnmock);

  return newObject;
}

/**
 * Mocks own static properties on `Mock` by walking the constructor chain
 * of `ClassConstructor`, replacing functions with mock functions.
 *
 * @param {Function} ClassConstructor - The original class whose static chain is walked.
 * @param {Function} Mock - The mock class to apply static mocks onto.
 * @param {import('./toMock.d.ts').KeepUnmockCallback} [keepUnmock] - Optional
 *   predicate to skip mocking individual properties.
 */
export function mockStatic(ClassConstructor, Mock, keepUnmock) {
  while (ClassConstructor && Mock) {
    mockOwnProperties(ClassConstructor, Mock, keepUnmock);

    ClassConstructor = Reflect.getPrototypeOf(ClassConstructor);
    Mock = Reflect.getPrototypeOf(Mock);
  }
}

/**
 * Walks the prototype chain of `prototype`, replacing each level with a
 * cloned version that has its own properties mocked. Stops when it reaches
 * a prototype that was already processed (performance optimisation for
 * repeated `toMockedInstance` calls on the same class).
 *
 * @param {object} prototype - The prototype object to start mocking from.
 * @param {import('./toMock.d.ts').KeepUnmockCallback} [keepUnmock] - Optional
 *   predicate to skip mocking individual properties.
 */
export function mockPrototypeChain(prototype, keepUnmock) {
  let originalPrototype = prototype;

  while (prototype) {
    const clonePrototype = Object.create(prototype, {
      [MOCKED_PROTOTYPE_CHAIN]: {
        value: true,
        enumerable: false,
      },
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

/**
 * Iterates over the own property descriptors of `original` and mocks each
 * eligible property onto `mock`.
 * - Accessor properties (get/set) are replaced with a simple value holder.
 * - Method properties are replaced with the result of `_globals.mockMethod()`.
 * - Non-function value properties are left untouched.
 *
 * @param {object} original - The source object whose properties are inspected.
 * @param {object} mock - The target object to write mocked properties onto.
 * @param {import('./toMock.d.ts').KeepUnmockCallback} [keepUnmock] - Optional
 *   predicate to skip mocking individual properties.
 */
export function mockOwnProperties(original, mock, keepUnmock) {
  const isKeepUnMockDefined = keepUnmock && typeof keepUnmock === 'function';
  const isGlobalKeepUnMockDefined =
    _globals.keepUnmock && typeof _globals.keepUnmock === 'function';

  Object.entries(Object.getOwnPropertyDescriptors(original)).forEach(
    ([property, descriptor]) => {
      try {
        const keepUnmockArgs = { property, descriptor, original, mock };

        if (
          (isKeepUnMockDefined && keepUnmock(keepUnmockArgs)) ||
          (isGlobalKeepUnMockDefined && _globals.keepUnmock(keepUnmockArgs))
        ) {
          return;
        }

        if (
          typeof descriptor.get === 'function' ||
          typeof descriptor.set === 'function'
        ) {
          let _mockedValue;

          Object.defineProperty(
            mock,
            property,
            Object.assign({}, descriptor, {
              get: () => _mockedValue,
              set: (value) => {
                _mockedValue = value;
              },
            }),
          );
        } else if (typeof original[property] === 'function') {
          mock[property] = _globals.mockMethod();
        }
      } catch (_) {} // eslint-disable-line no-empty
    },
  );
}

/**
 * Sets the global keep-unmock predicate applied to every `toMock` /
 * `toMockedInstance` call that does not supply its own `keepUnmock` argument.
 * Pass `null` or `undefined` to clear the global predicate.
 *
 * @param {import('./toMock.d.ts').KeepUnmockCallback | null | undefined} callback
 *   - Predicate that receives `{ property, descriptor, original, mock }` and
 *     returns `true` to leave the property unmocked.
 */
export function setGlobalKeepUnmock(callback) {
  _globals.keepUnmock = callback;
}

/**
 * Overrides the factory used to create mock functions. The factory is called
 * once per mocked method and must return a function.
 * Defaults to `() => function mockMethod() {}`.
 *
 * @param {import('./toMock.d.ts').MockMethodFactory} mockMethod
 *   - A factory function that returns the mock function to assign.
 */
export function setGlobalMockMethod(mockMethod) {
  _globals.mockMethod = mockMethod;
}

/**
 * Built-in keep-unmock predicate that preserves all properties inherited
 * from `Object.prototype` (e.g. `toString`, `hasOwnProperty`).
 * Pass this to `setGlobalKeepUnmock` or as the `keepUnmock` argument.
 *
 * @param {import('./toMock.d.ts').KeepUnmockArgs} args
 * @returns {boolean}
 */
export function objectKeepUnmock({ original }) {
  return original === Object.prototype;
}

/**
 * Built-in keep-unmock predicate that preserves all properties inherited
 * from `Function.prototype` (e.g. `call`, `apply`, `bind`).
 * Pass this to `setGlobalKeepUnmock` or as the `keepUnmock` argument.
 *
 * @param {import('./toMock.d.ts').KeepUnmockArgs} args
 * @returns {boolean}
 */
export function functionKeepUnmock({ original }) {
  return original === Function.prototype;
}
