import {defineConfig} from 'tsup'
import {readFileSync, writeFileSync} from 'fs'

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
  async onSuccess() {
    for (const file of ['dist/index.js', 'dist/index.cjs']) {
      const content = readFileSync(file, 'utf8')
      writeFileSync(file, '"use client";\n' + content)
    }

  },
})
