import { copyFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

import { defineConfig, type Plugin } from 'vite'
import { fileHandlerMiddleware } from './server/fileHandler.mjs'

function fileHandlerPlugin(): Plugin {
  return {
    name: 'onedrive-file-handler',
    configureServer(server) {
      server.middlewares.use(fileHandlerMiddleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(fileHandlerMiddleware)
    }
  }
}

/** GitHub project Pages serves this repo at https://mlightcad.com/onedrive/ */
function githubPagesRoutes(): Plugin {
  return {
    name: 'github-pages-routes',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const index = resolve(dist, 'index.html')
      mkdirSync(resolve(dist, 'preview'), { recursive: true })
      copyFileSync(index, resolve(dist, 'preview/index.html'))
      copyFileSync(index, resolve(dist, '404.html'))
    }
  }
}

export default defineConfig({
  base: '/onedrive/',
  plugins: [fileHandlerPlugin(), githubPagesRoutes()],
  build: {
    outDir: 'dist',
    modulePreload: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})
