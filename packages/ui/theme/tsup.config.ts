import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  tsconfig: 'tsconfig.tsup.json',
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false, // Dev: false, Prod: true
  external: [
    'react',
    'react-dom',
    '@mui/material',
    '@emotion/react',
    '@emotion/styled',
  ],
})
