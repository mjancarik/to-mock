Object.defineProperty(exports, "__esModule", {
	value: true
});

const PROTOTYPE_CHAIN_MOCKED = Symbol('prototypeChainMocked');

function toMock(arg) {
	if (typeof arg === 'function') {
		return mockClass(arg);
	}

	if (typeof arg === 'object') {
		return mockObject(arg);
	}

	throw new TypeError(`The toMock method support object and ES6 class.` +
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
	while(ClassConstructor && Mock) {
		mockOwnProperties(ClassConstructor, Mock);

		ClassConstructor = Reflect.getPrototypeOf(ClassConstructor);
		Mock = Reflect.getPrototypeOf(Mock);
	}
}

function mockPrototypeChain(prototype) {
	let originalPrototype = prototype;

	while (prototype) {
		let clonePrototype = Object.create(prototype, {
			[PROTOTYPE_CHAIN_MOCKED]: {
				value: true,
				enumerable: false
			}
		});

		mockOwnProperties(prototype, clonePrototype);

		Reflect.setPrototypeOf(originalPrototype, clonePrototype);

		if (
			originalPrototype[PROTOTYPE_CHAIN_MOCKED] &&
			prototype[PROTOTYPE_CHAIN_MOCKED] &&
			originalPrototype !== prototype
		) {
			return;
		}

		originalPrototype = prototype;
		prototype = Reflect.getPrototypeOf(prototype);
	}
}

function mockOwnProperties(original, mock) {
	Object.entries(Object.getOwnPropertyDescriptors(original))
		.forEach(([key, descriptor]) => {
			try {
				if (
					(descriptor.get && typeof descriptor.get === 'function') ||
					(descriptor.set && typeof descriptor.set === 'function')
				) {
					Object.defineProperty(mock, key, Object.assign({}, descriptor, {
						get: () => {},
						set: () => {}
					}));
				}

				if (original[key] && typeof original[key] === 'function') {
					mock[key] = function mockMethod() {};
				}
			} catch(_) {}
		});
}

exports.default = toMock;
exports.toMock = toMock;
exports.toMockedInstance = toMockedInstance;
exports.mockClass = mockClass;
exports.mockObject = mockObject;
exports.mockPrototypeChain = mockPrototypeChain;
exports.mockOwnProperties = mockOwnProperties;
