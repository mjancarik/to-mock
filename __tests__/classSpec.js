import test from 'ava';
import toMock from '../toMock';

test('creates mock of a class and does not affect other classes', t => {
  class SampleClass {};

  t.is(SampleClass.toString(), 'class SampleClass {}');

  toMock(class AnotherClass {});

  t.is(SampleClass.toString(), 'class SampleClass {}');
});
