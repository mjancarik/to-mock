Object.defineProperty(exports, "__esModule", {
	value: true
});

function toMock(arg) {
	if (typeof arg === 'function') {
		return mockClass(arg);
	}

	if (typeof arg === 'object') {
		return mockObject(arg);
	}

	throw new Error(`The toMock method support object and ES6 class.` +
			` You give ${typeof arg}. You may add other types and send pull request.`
	);
}

function mockClass(ClassConstructor) {
	class Mock {}

	Reflect.setPrototypeOf(Mock.prototype, ClassConstructor.prototype);
	Reflect.setPrototypeOf(Mock, ClassConstructor);

	mockPrototypeChain(Mock.prototype);

	let staticMethods = Object.getOwnPropertyNames(ClassConstructor);
	staticMethods.forEach(staticMethod => {
		try {
			if (typeof ClassConstructor[staticMethod] === 'function') {
				Mock[staticMethod] = function mockStaticMethod() {};
			} else {
				Mock[staticMethod] = ClassConstructor[staticMethod];
			}
		} catch(_) {}
	});

	return Mock;
}

function mockObject(object) {
	let newObject = Object.create(object);
	mockPrototypeChain(newObject);

	return newObject;
}

function mockPrototypeChain(prototype) {
	let originalPrototype = prototype;

	while (prototype) {
		let clonePrototype = Object.create(prototype);
		let methods = Object.getOwnPropertyNames(prototype);

		methods.forEach(method => {
			if (typeof prototype[method] === 'function') {
				clonePrototype[method] = function mockMethod() {};
			}
		});

		Reflect.setPrototypeOf(originalPrototype, clonePrototype);

		originalPrototype = prototype;
		prototype = Reflect.getPrototypeOf(prototype);
	}
}


exports.default = toMock;
exports.mockClass = mockClass;
exports.mockObject = mockObject;
exports.mockPrototypeChain = mockPrototypeChain;
