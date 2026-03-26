import { describe, it, afterAll } from 'vitest';
import { toMock } from '../toMock.mjs';


describe('toMock', () => {
  // Defining `afterAll` leads to `TypeError: Cannot read properties of undefined (reading 'length')`
  afterAll(() => {});

  it('should not affect class prototype', () => {
    toMock(class { });
  });
});
