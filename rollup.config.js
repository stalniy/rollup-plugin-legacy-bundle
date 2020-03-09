import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const config = ({ format, file }) => ({
  input: 'src/index.ts',
  external: 'rollup',
  output: {
    format,
    file,
    sourcemap: true
  },
  plugins: [
    resolve({
      extensions: ['.js', '.mjs', '.ts'],
    }),
    babel({
      rootMode: 'upward',
      extensions: ['.js', '.mjs', '.ts'],
      caller: {
        output: format
      },
    })
  ]
})

export default [
  config({
    format: 'es',
    file: 'dist/es6/index.js'
  }),
  config({
    format: 'cjs',
    file: 'dist/cjs/index.js'
  })
];
