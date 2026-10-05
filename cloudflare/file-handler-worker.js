/**
 * OneDrive File Handler 2.0 POST receiver (Cloudflare Worker).
 *
 * GitHub Pages cannot accept POST. Point the Entra File Handler preview URL
 * at this Worker. It reads the form body and sends the browser to the static
 * viewer with the payload in the URL hash (not sent to GitHub Pages).
 *
 * VIEWER_URL default: https://mlightcad.com/onedrive/
 * Hash key must match FILE_HANDLER_HASH_KEY in src/fileHandler.ts.
 */

const VIEWER_URL = 'https://mlightcad.com/onedrive/'
const HASH_KEY = 'fileHandler'
const MAX_BODY_BYTES = 64 * 1024

const FRAME_ANCESTORS = [
  "frame-ancestors 'self'",
  'https://*.sharepoint.com',
  'https://*.sharepoint-df.com',
  'https://*.onedrive.com',
  'https://*.office.com',
  'https://*.office365.com'
].join(' ')

function htmlHeaders(extra = {}) {
  return {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Security-Policy': FRAME_ANCESTORS,
    ...extra
  }
}

function page(title, body) {
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

function errorPage(message) {
  const safe = String(message)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return page('File Handler', `<p>${safe}</p>`)
}

function parseActivation(body) {
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
    action: 'preview',
    cultureName: params.get('cultureName') || '',
    client: params.get('client') || '',
    userId: params.get('userId') || '',
    domainHint: params.get('domainHint') || '',
    items
  }
}

function viewerBase(env) {
  const raw = env?.VIEWER_URL || VIEWER_URL
  return raw.endsWith('/') ? raw : `${raw}/`
}

function handoffPage(env, activation) {
  const target = new URL(viewerBase(env))
  target.hash = `${HASH_KEY}=${encodeURIComponent(JSON.stringify(activation))}`
  const href = JSON.stringify(target.href)
  return page(
    'Opening drawing',
    `<p>Opening drawing...</p>
<script>location.replace(${href})</script>`
  )
}

export default {
  async fetch(request, env) {
    if (request.method === 'GET' || request.method === 'HEAD') {
      return Response.redirect(viewerBase(env), 302)
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: {
          Allow: 'GET, HEAD, POST',
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Security-Policy': FRAME_ANCESTORS
        }
      })
    }

    const length = Number(request.headers.get('content-length') || '0')
    if (length > MAX_BODY_BYTES) {
      return new Response(errorPage('File Handler request body is too large'), {
        status: 400,
        headers: htmlHeaders()
      })
    }

    try {
      const body = await request.text()
      if (body.length > MAX_BODY_BYTES) {
        throw new Error('File Handler request body is too large')
      }
      const activation = parseActivation(body)
      if (activation.items.length === 0) {
        return new Response(errorPage('OneDrive did not include a file to open.'), {
          status: 400,
          headers: htmlHeaders()
        })
      }
      return new Response(handoffPage(env, activation), {
        status: 200,
        headers: htmlHeaders()
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid File Handler request'
      return new Response(errorPage(message), {
        status: 400,
        headers: htmlHeaders()
      })
    }
  }
}
