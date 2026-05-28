/// <reference types="vitest" />

import { defineConfig/* , loadEnv */ } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'

export default (/* { mode } */) => {
  // process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  // const envTheme = process.env.VITE_VUE_APP_THEME

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  return defineConfig({
    plugins: [
      vue(),
    ],
    esbuild: {
      tsconfigRaw: {
        compilerOptions: {
          baseUrl: '.',
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'Node',
          resolveJsonModule: true,
          types: ['node', 'vitest/globals'],
        },
      },
    },
    resolve: {
      alias: {
        '~': resolve(__dirname, '.'),
        '@': resolve(__dirname, '.'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
    },
    css: {
      preprocessorOptions: {
        scss: {
          // besure to mirror theses imports in the nuxt.config.ts
          additionalData: '@import "~/assets/wnyc-app/variables.scss"; @import "~/assets/wnyc-app/_mixins.scss"; @import "~/assets/wnyc-app/typography.scss"; @import "~/assets/scss/global.scss";',
        },
      },
    },
  })
}




