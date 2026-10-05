/** Must match FILE_HANDLER_STORAGE_KEY in server/fileHandler.mjs. */
export const FILE_HANDLER_STORAGE_KEY = 'mlightcad-file-handler'

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

/** Read and clear the payload left by the File Handler POST handoff. */
export function takeFileHandlerActivation(): FileHandlerActivation | null {
  const raw = sessionStorage.getItem(FILE_HANDLER_STORAGE_KEY)
  if (!raw) return null
  sessionStorage.removeItem(FILE_HANDLER_STORAGE_KEY)
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isActivation(parsed) || parsed.items.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

export function isInFrame(): boolean {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}
