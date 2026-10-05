#!/usr/bin/env node
/**
 * Starts the Vite dev server (if needed), opens the local File Handler demo,
 * and leaves the rest to a Microsoft sign-in in the browser.
 *
 *   pnpm demo:file-handler
 *
 * Stop with Ctrl+C when you started the server from this script.
 */

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_ORIGIN = 'http://localhost:5173'
const READY_RE = /Local:\s+(https?:\/\/[^\s]+)/
const START_MS = 45_000

function demoUrl(origin) {
  const base = origin.replace(/\/$/, '')
  return `${base}/onedrive/?fileHandlerDemo=1`
}

async function originReady(origin) {
  try {
    const res = await fetch(`${origin.replace(/\/$/, '')}/onedrive/`, {
      redirect: 'follow'
    })
    return res.ok
  } catch {
    return false
  }
}

function openBrowser(url) {
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

function stopChild(child) {
  if (!child?.pid) return
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    return
  }
  child.kill('SIGTERM')
}

function waitForVite(child) {
  return new Promise((resolveReady, reject) => {
    let buffer = ''
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error(`Dev server did not start within ${START_MS / 1000}s`))
    }, START_MS)

    const onExit = code => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(new Error(`Dev server exited before it was ready (code ${code})`))
    }

    const onData = chunk => {
      const text = chunk.toString()
      process.stdout.write(text)
      buffer += text
      const match = buffer.match(READY_RE)
      if (!match || settled) return
      settled = true
      clearTimeout(timer)
      child.off('exit', onExit)
      resolveReady(match[1].replace(/\/$/, ''))
    }

    child.stdout?.on('data', onData)
    child.stderr?.on('data', onData)
    child.once('exit', onExit)
  })
}

function startVite() {
  const child = spawn('pnpm', ['dev'], {
    cwd: root,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  })
  child.stdout?.setEncoding('utf8')
  child.stderr?.setEncoding('utf8')
  return child
}

function printNextSteps(url) {
  console.log('')
  console.log(`Opened ${url}`)
  console.log('In the browser:')
  console.log('  1. Sign in with Microsoft (only if you are not already signed in)')
  console.log('  2. The app finds a DWG/DXF, POSTs /onedrive/preview, then opens the drawing')
  console.log('  3. If none is found, choose a DWG/DXF from the picker')
  console.log('')
}

async function main() {
  let child = null

  const shutdown = () => {
    stopChild(child)
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  let origin = DEFAULT_ORIGIN
  if (await originReady(origin)) {
    console.log(`Using the dev server already running at ${origin}`)
  } else {
    console.log('Starting pnpm dev…')
    child = startVite()
    origin = await waitForVite(child)
    if (!(await originReady(origin))) {
      throw new Error(`Dev server reported ${origin} but /onedrive/ did not respond`)
    }
  }

  const url = demoUrl(origin)
  openBrowser(url)
  printNextSteps(url)

  if (!child) {
    return
  }

  console.log('Leave this terminal open. Press Ctrl+C to stop the dev server.')
  await new Promise(() => {
    // Keep the process alive until the user stops the script.
  })
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
