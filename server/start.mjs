/**
 * Production host for the File Handler preview.
 * GitHub Pages cannot accept the OneDrive POST or be embedded, so run this
 * at https://mlightcad.com/onedrive/ (the registered File Handler preview).
 *
 *   pnpm build && pnpm start
 */
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { applyFrameHeaders, fileHandlerMiddleware, onedriveBaseMiddleware } from './fileHandler.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const port = Number(process.env.PORT || 4173)
const host = process.env.HOST || '127.0.0.1'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
}

function resolveFile(pathname) {
  const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.replace(/^\/+/, ''))
  const file = path.resolve(root, rel)
  const relative = path.relative(root, file)
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null
  return file
}

function serveStatic(req, res) {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname
  const file = resolveFile(pathname)
  if (!file) {
    res.statusCode = 400
    res.end('Bad path')
    return
  }

  stat(file)
    .then(info => {
      if (!info.isFile()) {
        res.statusCode = 404
        res.end('Not found')
        return
      }
      const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream'
      res.statusCode = 200
      res.setHeader('Content-Type', type)
      applyFrameHeaders(res)
      if (req.method === 'HEAD') {
        res.end()
        return
      }
      createReadStream(file).pipe(res)
    })
    .catch(() => {
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('Not found')
    })
}

const server = createServer((req, res) => {
  fileHandlerMiddleware(req, res, () => {
    onedriveBaseMiddleware(req, res, () => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.statusCode = 405
        res.setHeader('Allow', 'GET, HEAD')
        res.end('Method not allowed')
        return
      }
      serveStatic(req, res)
    })
  })
})

server.listen(port, host, () => {
  console.log(`OneDrive CAD Viewer listening on http://${host}:${port}`)
  console.log(`File Handler preview: http://${host}:${port}/onedrive/preview`)
})
