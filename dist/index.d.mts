interface KeepUnmockArgs {
  property: string;
  descriptor: PropertyDescriptor;
  original: object;
  mock: object;
}

type KeepUnmockCallback = (args: KeepUnmockArgs) => boolean;
type MockMethodFactory = () => (...args: unknown[]) => unknown;

type AbstractConstructor<T = object> = abstract new (...args: unknown[]) => T;
type Constructor<T = object> = new (...args: unknown[]) => T;
type AnyClass = AbstractConstructor | Constructor;

declare function toMock<T extends AnyClass>(
  arg: T,
  keepUnmock?: KeepUnmockCallback,
): T;
declare function toMock<T extends object>(
  arg: T,
  keepUnmock?: KeepUnmockCallback,
): T;

declare function toMockedInstance<T extends Constructor>(
  arg: T,
  overrides?: Partial<InstanceType<T>>,
  keepUnmock?: KeepUnmockCallback,
): InstanceType<T>;
declare function toMockedInstance<T extends object>(
  arg: T,
  overrides?: Partial<T>,
  keepUnmock?: KeepUnmockCallback,
): T;

declare function mockClass<T extends AnyClass>(
  ClassConstructor: T,
  keepUnmock?: KeepUnmockCallback,
): T;

declare function mockObject<T extends object>(
  object: T,
  keepUnmock?: KeepUnmockCallback,
): T;

declare function mockStatic(
  ClassConstructor: AnyClass,
  Mock: AnyClass,
  keepUnmock?: KeepUnmockCallback,
): void;

declare function mockPrototypeChain(
  prototype: object,
  keepUnmock?: KeepUnmockCallback,
): void;

declare function mockOwnProperties(
  original: object,
  mock: object,
  keepUnmock?: KeepUnmockCallback,
): void;

declare function setGlobalKeepUnmock(
  callback?: KeepUnmockCallback | null,
): void;

declare function setGlobalMockMethod(mockMethod: MockMethodFactory): void;

declare function objectKeepUnmock(args: KeepUnmockArgs): boolean;

declare function functionKeepUnmock(args: KeepUnmockArgs): boolean;

export { type KeepUnmockArgs, type KeepUnmockCallback, type MockMethodFactory, toMock as default, functionKeepUnmock, mockClass, mockObject, mockOwnProperties, mockPrototypeChain, mockStatic, objectKeepUnmock, setGlobalKeepUnmock, setGlobalMockMethod, toMock, toMockedInstance };
