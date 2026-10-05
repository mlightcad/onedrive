#!/usr/bin/env node
/**
 * Automates the local File Handler handoff checks.
 *
 * Prerequisites: `pnpm dev` (or `pnpm start` after build) on the base URL.
 *
 * Examples:
 *   node scripts/verify-file-handler.mjs --drive-id ID --item-id ID
 *   node scripts/verify-file-handler.mjs --item-url "https://graph.microsoft.com/v1.0/drives/.../items/..."
 *   node scripts/verify-file-handler.mjs --drive-id ID --item-id ID --open
 *   node scripts/verify-file-handler.mjs --drive-id ID --item-id ID --worker https://mlightcad-onedrive-file-handler.mlightcad.workers.dev/
 */

import { spawn } from 'node:child_process'

import { FILE_HANDLER_STORAGE_KEY } from '../server/fileHandler.mjs'

const HASH_KEY = 'fileHandler'
const DEFAULT_BASE = 'http://localhost:5173'

function usage(exitCode = 1) {
  console.log(`Usage:
  node scripts/verify-file-handler.mjs --drive-id <id> --item-id <id> [options]
  node scripts/verify-file-handler.mjs --item-url <graph-item-url> [options]

Options:
  --base <url>     Local app origin (default: ${DEFAULT_BASE})
  --worker <url>   Also POST to a Cloudflare Worker URL
  --open           Open the hash handoff URL in the browser
  --help           Show this help
`)
  process.exit(exitCode)
}

function parseArgs(argv) {
  const out = {
    base: DEFAULT_BASE,
    driveId: '',
    itemId: '',
    itemUrl: '',
    worker: '',
    open: false
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const next = () => {
      const value = argv[++i]
      if (!value || value.startsWith('--')) usage()
      return value
    }
    switch (arg) {
      case '--help':
      case '-h':
        usage(0)
        break
      case '--base':
        out.base = next().replace(/\/$/, '')
        break
      case '--drive-id':
        out.driveId = next()
        break
      case '--item-id':
        out.itemId = next()
        break
      case '--item-url':
        out.itemUrl = next()
        break
      case '--worker':
        out.worker = next()
        break
      case '--open':
        out.open = true
        break
      default:
        console.error(`Unknown argument: ${arg}`)
        usage()
    }
  }

  return out
}

function resolveItemUrl(args) {
  if (args.itemUrl) {
    try {
      const url = new URL(args.itemUrl)
      if (url.protocol !== 'https:') throw new Error('must be https')
      return url.toString()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'invalid URL'
      throw new Error(`--item-url is not a valid Graph item URL (${message})`)
    }
  }
  if (args.driveId && args.itemId) {
    return `https://graph.microsoft.com/v1.0/drives/${encodeURIComponent(args.driveId)}/items/${encodeURIComponent(args.itemId)}`
  }
  throw new Error('Provide --item-url, or both --drive-id and --item-id')
}

function activationPayload(itemUrl) {
  return {
    action: 'preview',
    cultureName: 'zh-CN',
    client: 'OneDrive',
    userId: 'verify-file-handler',
    domainHint: '',
    items: [itemUrl]
  }
}

function formBody(itemUrl) {
  const params = new URLSearchParams()
  params.set('items', JSON.stringify([itemUrl]))
  params.set('userId', 'verify-file-handler')
  params.set('cultureName', 'zh-CN')
  params.set('client', 'OneDrive')
  params.set('domainHint', '')
  return params
}

function ok(label) {
  console.log(`  ✓ ${label}`)
}

function fail(label, detail) {
  console.error(`  ✗ ${label}`)
  if (detail) console.error(`    ${detail}`)
  throw new Error(label)
}

async function checkViewerUp(base) {
  const url = `${base}/onedrive/`
  let res
  try {
    res = await fetch(url, { redirect: 'follow' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    fail(
      `GET ${url}`,
      `${message}\n    Start the app first: pnpm dev  (expect ${DEFAULT_BASE})`
    )
  }
  if (!res.ok) fail(`GET ${url}`, `HTTP ${res.status}`)
  const html = await res.text()
  if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
    fail(`GET ${url}`, 'response does not look like HTML')
  }
  ok(`GET ${url} → ${res.status}`)
}

function assertHandoffHtml(html, itemUrl, mode) {
  if (mode === 'local') {
    if (!html.includes(FILE_HANDLER_STORAGE_KEY)) {
      fail('handoff HTML includes sessionStorage key', `missing ${FILE_HANDLER_STORAGE_KEY}`)
    }
    if (!html.includes('sessionStorage.setItem')) {
      fail('handoff HTML writes sessionStorage')
    }
    if (!html.includes('location.replace("/onedrive/")')) {
      fail('handoff HTML redirects to /onedrive/')
    }
  }

  if (mode === 'worker') {
    if (!html.includes('location.replace(')) {
      fail('Worker handoff HTML redirects with location.replace')
    }
    if (!html.includes(`#${HASH_KEY}=`)) {
      fail(`Worker handoff HTML includes #${HASH_KEY}=`)
    }
  }

  const encodedItem = encodeURIComponent(itemUrl)
  const encodedActivation = encodeURIComponent(JSON.stringify(activationPayload(itemUrl)))
  const hasItem =
    html.includes(itemUrl) ||
    html.includes(encodedItem) ||
    html.includes(JSON.stringify(itemUrl)) ||
    html.includes(encodedActivation)

  if (!hasItem) {
    fail('handoff HTML carries the Graph item URL')
  }
  ok(`handoff HTML looks valid (${mode})`)
}

async function postPreview(url, itemUrl, mode) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody(itemUrl)
  })
  const html = await res.text()
  if (res.status !== 200) {
    fail(`POST ${url}`, `HTTP ${res.status}\n${html.slice(0, 400)}`)
  }
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) {
    fail(`POST ${url} Content-Type`, contentType || '(missing)')
  }
  ok(`POST ${url} → ${res.status}`)
  assertHandoffHtml(html, itemUrl, mode)
}

function hashViewerUrl(base, itemUrl) {
  const activation = activationPayload(itemUrl)
  const target = new URL(`${base}/onedrive/`)
  target.hash = `${HASH_KEY}=${encodeURIComponent(JSON.stringify(activation))}`
  return target.href
}

function openUrl(url) {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref()
    return
  }
  if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref()
    return
  }
  spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref()
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  let itemUrl
  try {
    itemUrl = resolveItemUrl(args)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    usage()
  }

  console.log('File Handler verification')
  console.log(`  base:   ${args.base}`)
  console.log(`  item:   ${itemUrl}`)
  if (args.worker) console.log(`  worker: ${args.worker}`)
  console.log('')

  try {
    console.log('1) Local viewer is up')
    await checkViewerUp(args.base)

    console.log('2) Local POST /onedrive/preview handoff')
    await postPreview(`${args.base}/onedrive/preview`, itemUrl, 'local')

    const hashUrl = hashViewerUrl(args.base, itemUrl)
    console.log('3) Hash handoff URL (production Worker style)')
    ok(hashUrl)

    if (args.worker) {
      console.log('4) Worker POST handoff')
      const workerUrl = args.worker.endsWith('/') ? args.worker : `${args.worker}/`
      await postPreview(workerUrl, itemUrl, 'worker')
    }

    if (args.open) {
      console.log('Opening hash handoff URL in the browser…')
      openUrl(hashUrl)
      console.log('In the browser you should see “Sign in to preview this drawing”.')
    } else {
      console.log('')
      console.log('Manual next step: open the hash URL above (or add --open).')
      console.log('Expect “Sign in to preview this drawing”, then sign in to load the file.')
    }

    console.log('')
    console.log('All automated checks passed.')
  } catch {
    process.exitCode = 1
  }
}

await main()
