export interface KeepUnmockArgs {
  property: string;
  descriptor: PropertyDescriptor;
  original: object;
  mock: object;
}

export type KeepUnmockCallback = (args: KeepUnmockArgs) => boolean;
export type MockMethodFactory = () => (...args: unknown[]) => unknown;

type AbstractConstructor<T = object> = abstract new (...args: unknown[]) => T;
type Constructor<T = object> = new (...args: unknown[]) => T;
type AnyClass = AbstractConstructor | Constructor;

export function toMock<T extends AnyClass>(
  arg: T,
  keepUnmock?: KeepUnmockCallback,
): T;
export function toMock<T extends object>(
  arg: T,
  keepUnmock?: KeepUnmockCallback,
): T;

export function toMockedInstance<T extends Constructor>(
  arg: T,
  overrides?: Partial<InstanceType<T>>,
  keepUnmock?: KeepUnmockCallback,
): InstanceType<T>;
export function toMockedInstance<T extends object>(
  arg: T,
  overrides?: Partial<T>,
  keepUnmock?: KeepUnmockCallback,
): T;

export function mockClass<T extends AnyClass>(
  ClassConstructor: T,
  keepUnmock?: KeepUnmockCallback,
): T;

export function mockObject<T extends object>(
  object: T,
  keepUnmock?: KeepUnmockCallback,
): T;

export function mockStatic(
  ClassConstructor: AnyClass,
  Mock: AnyClass,
  keepUnmock?: KeepUnmockCallback,
): void;

export function mockPrototypeChain(
  prototype: object,
  keepUnmock?: KeepUnmockCallback,
): void;

export function mockOwnProperties(
  original: object,
  mock: object,
  keepUnmock?: KeepUnmockCallback,
): void;

export function setGlobalKeepUnmock(
  callback?: KeepUnmockCallback | null,
): void;

export function setGlobalMockMethod(mockMethod: MockMethodFactory): void;

export function objectKeepUnmock(args: KeepUnmockArgs): boolean;

export function functionKeepUnmock(args: KeepUnmockArgs): boolean;
