/**
 * OneDrive / SharePoint File Handler 2.0 POST receiver.
 *
 * Office 365 POSTs application/x-www-form-urlencoded activation parameters
 * into an iframe. This handler does not store them: it hands the payload to
 * the viewer page through sessionStorage, then loads this app.
 *
 * The storage key must match FILE_HANDLER_STORAGE_KEY in src/fileHandler.ts.
 */

export const FILE_HANDLER_STORAGE_KEY = 'mlightcad-file-handler'

const MAX_BODY_BYTES = 64 * 1024

export const FRAME_ANCESTORS = [
  "frame-ancestors 'self'",
  'http://localhost:*',
  'http://127.0.0.1:*',
  'https://localhost:*',
  'https://127.0.0.1:*',
  'https://*.sharepoint.com',
  'https://*.sharepoint-df.com',
  'https://*.onedrive.com',
  'https://*.office.com',
  'https://*.office365.com'
].join(' ')

/** Public preview URL: https://mlightcad.com/onedrive/preview */
const ACTIONS = {
  '/onedrive/preview': 'preview',
  '/preview': 'preview'
}

export function fileHandlerAction(pathname) {
  return ACTIONS[pathname] || null
}

export function applyFrameHeaders(res) {
  res.removeHeader('X-Frame-Options')
  res.setHeader('Content-Security-Policy', FRAME_ANCESTORS)
}

function allowFraming(res) {
  const writeHead = res.writeHead
  res.writeHead = function patchedWriteHead(statusCode, reason, headers) {
    let message = reason
    let hdrs = headers
    if (reason && typeof reason === 'object') {
      hdrs = reason
      message = undefined
    }
    if (hdrs && typeof hdrs === 'object' && !Array.isArray(hdrs)) {
      for (const key of Object.keys(hdrs)) {
        const lower = key.toLowerCase()
        if (lower === 'x-frame-options' || lower === 'content-security-policy') {
          delete hdrs[key]
        }
      }
    }
    applyFrameHeaders(res)
    if (message === undefined) return writeHead.call(this, statusCode, hdrs)
    return writeHead.call(this, statusCode, message, hdrs)
  }
}

export async function readFormBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buf.length
    if (size > MAX_BODY_BYTES) {
      throw new Error('File Handler request body is too large')
    }
    chunks.push(buf)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export function parseActivation(body, action) {
  const params = new URLSearchParams(body)
  const rawItems = params.get('items') || '[]'
  let items = []
  try {
    const parsed = JSON.parse(rawItems)
    if (!Array.isArray(parsed) || parsed.some(item => typeof item !== 'string')) {
      throw new Error('items must be a JSON array of strings')
    }
    items = parsed
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid items'
    throw new Error(`File Handler items could not be read (${message})`)
  }

  return {
    action,
    cultureName: params.get('cultureName') || '',
    client: params.get('client') || '',
    userId: params.get('userId') || '',
    domainHint: params.get('domainHint') || '',
    items
  }
}

function htmlPage(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body>
${body}
</body>
</html>`
}

export function handoffDocument(activation) {
  const stored = JSON.stringify(activation).replace(/</g, '\\u003c')
  const script = `sessionStorage.setItem(${JSON.stringify(FILE_HANDLER_STORAGE_KEY)}, ${JSON.stringify(stored)});location.replace("/onedrive/");`
  return htmlPage(
    'Opening drawing',
    `<p>Opening drawing...</p>
<script>${script}</script>`
  )
}

function errorDocument(message) {
  const safe = String(message)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return htmlPage('File Handler', `<p>${safe}</p>`)
}

function sendHtml(res, status, html) {
  res.statusCode = status
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  applyFrameHeaders(res)
  res.end(html)
}

/** Serve the viewer at /onedrive/ when the host does not strip that prefix. */
export function onedriveBaseMiddleware(req, res, next) {
  let pathname = '/'
  let search = ''
  try {
    const url = new URL(req.url || '/', 'http://localhost')
    pathname = url.pathname
    search = url.search
  } catch {
    next()
    return
  }

  if (pathname === '/onedrive') {
    res.statusCode = 308
    res.setHeader('Location', `/onedrive/${search}`)
    applyFrameHeaders(res)
    res.end()
    return
  }

  if (pathname.startsWith('/onedrive/') && !fileHandlerAction(pathname)) {
    const stripped = pathname.slice('/onedrive'.length) || '/'
    req.url = stripped + search
  }
  next()
}

export function fileHandlerMiddleware(req, res, next) {
  allowFraming(res)

  let pathname = '/'
  try {
    pathname = new URL(req.url || '/', 'http://localhost').pathname
  } catch {
    next()
    return
  }

  const action = fileHandlerAction(pathname)
  if (!action) {
    next()
    return
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    const url = new URL(req.url || '/', 'http://localhost')
    url.pathname = '/onedrive/'
    req.url = `${url.pathname}${url.search}`
    next()
    return
  }

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD, POST')
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    applyFrameHeaders(res)
    res.end('Method not allowed')
    return
  }

  readFormBody(req)
    .then(body => {
      const activation = parseActivation(body, action)
      if (activation.items.length === 0) {
        sendHtml(res, 400, errorDocument('OneDrive did not include a file to open.'))
        return
      }
      sendHtml(res, 200, handoffDocument(activation))
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : 'Invalid File Handler request'
      sendHtml(res, 400, errorDocument(message))
    })
}
