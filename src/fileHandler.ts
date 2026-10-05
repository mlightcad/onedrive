/** Must match FILE_HANDLER_STORAGE_KEY in server/fileHandler.mjs. */
export const FILE_HANDLER_STORAGE_KEY = 'mlightcad-file-handler'

/** Must match HASH_KEY in cloudflare/file-handler-worker.js. */
export const FILE_HANDLER_HASH_KEY = 'fileHandler'

export interface FileHandlerActivation {
  action: 'preview' | 'open'
  cultureName: string
  client: string
  userId: string
  domainHint: string
  items: string[]
}

function isActivation(value: unknown): value is FileHandlerActivation {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    (record.action === 'preview' || record.action === 'open') &&
    typeof record.cultureName === 'string' &&
    typeof record.client === 'string' &&
    typeof record.userId === 'string' &&
    typeof record.domainHint === 'string' &&
    Array.isArray(record.items) &&
    record.items.every(item => typeof item === 'string')
  )
}

function parseActivationJson(raw: string): FileHandlerActivation | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isActivation(parsed) || parsed.items.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

function takeFileHandlerActivationFromStorage(): FileHandlerActivation | null {
  const raw = sessionStorage.getItem(FILE_HANDLER_STORAGE_KEY)
  if (!raw) return null
  sessionStorage.removeItem(FILE_HANDLER_STORAGE_KEY)
  return parseActivationJson(raw)
}

/**
 * Cloudflare Worker (and similar POST hops) send the payload in the hash so
 * GitHub Pages only sees a GET. The fragment is not uploaded to the static host.
 */
function takeFileHandlerActivationFromHash(): FileHandlerActivation | null {
  const fragment = window.location.hash.replace(/^#/, '')
  if (!fragment) return null
  const raw = new URLSearchParams(fragment).get(FILE_HANDLER_HASH_KEY)
  if (!raw) return null
  const activation = parseActivationJson(raw)
  if (!activation) return null
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  return activation
}

/** Read and clear the payload left by the File Handler POST handoff. */
export function takeFileHandlerActivation(): FileHandlerActivation | null {
  return takeFileHandlerActivationFromStorage() || takeFileHandlerActivationFromHash()
}

export function isInFrame(): boolean {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

const FILE_HANDLER_DEMO_PARAM = 'fileHandlerDemo'

/** Local-only helper used by `pnpm demo:file-handler`. Never runs on GitHub Pages. */
export function isLocalFileHandlerDemo(): boolean {
  const host = window.location.hostname
  if (host !== 'localhost' && host !== '127.0.0.1' && host !== '[::1]') {
    return false
  }
  return new URLSearchParams(window.location.search).get(FILE_HANDLER_DEMO_PARAM) === '1'
}

/** Same POST OneDrive sends to the File Handler preview URL. */
export function postLocalFileHandlerPreview(itemUrl: string, userId = ''): void {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = `${import.meta.env.BASE_URL}preview`
  form.style.display = 'none'

  const fields: Record<string, string> = {
    items: JSON.stringify([itemUrl]),
    userId,
    cultureName: navigator.language || '',
    client: 'OneDrive',
    domainHint: ''
  }
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
}
