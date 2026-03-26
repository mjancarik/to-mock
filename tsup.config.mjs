import { defineConfig } from 'tsup';

export default [
  defineConfig({
    entry: { index: 'src/toMock.mjs' },
    clean: true,
    minify: true,
    target: 'es2022',
    format: ['esm', 'cjs'],
    treeshake: true,
    shims: false,
    dts: { entry: { index: 'src/toMock.d.ts' } },
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.cjs' : '.mjs',
      };
    },
  }),
];
