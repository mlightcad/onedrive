import type {
  AccountInfo,
  AuthenticationResult,
  Configuration,
  PublicClientApplication
} from '@azure/msal-browser'

export interface UserInfo {
  name: string
  email: string
  picture: string
}

export interface DriveFile {
  id: string
  name: string
  size: string
  modifiedTime: string
  mimeType: string
  driveId: string
  /** Picker `@sharePoint.endpoint` — needed to resolve consumer download URLs. */
  sharePointEndpoint?: string
  /** Short-lived preauthenticated URL, if already known. */
  downloadUrl?: string
}

type DriveKind = 'personal' | 'business'

interface PickedItem {
  id?: string
  name?: string
  size?: number
  parentReference?: { driveId?: string }
  '@sharePoint.endpoint'?: string
  '@microsoft.graph.downloadUrl'?: string
  '@content.downloadUrl'?: string
}

type DriveItemMeta = {
  id?: string
  name?: string
  size?: number
  lastModifiedDateTime?: string
  file?: { mimeType?: string }
  parentReference?: { driveId?: string }
  '@microsoft.graph.downloadUrl'?: string
  '@content.downloadUrl'?: string
}

interface AuthenticateCommand {
  command: 'authenticate'
  type: string
  resource: string
}

const GRAPH_SCOPES = ['User.Read', 'Files.Read.All']
/** Consumer File Picker v8 requires Live/OneDrive scopes, not Graph tokens. */
const CONSUMER_PICKER_SCOPES = ['OneDrive.ReadOnly']
const CAD_EXTENSIONS = ['.dwg', '.dxf']
const CONSUMER_PICKER_BASE = 'https://onedrive.live.com/picker'
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

const isPlaceholder = (value: string) =>
  !value ||
  value.includes('your_client_id_here') ||
  value.includes('your_msal_client_id_here')

function getClientId(): string {
  return import.meta.env.VITE_MSAL_CLIENT_ID || ''
}

function getTenantId(): string {
  return import.meta.env.VITE_MSAL_TENANT_ID || 'common'
}

function getRedirectUri(): string {
  if (import.meta.env.VITE_MSAL_REDIRECT_URI) {
    return import.meta.env.VITE_MSAL_REDIRECT_URI
  }
  if (typeof window === 'undefined') return ''
  return new URL(import.meta.env.BASE_URL || '/', window.location.origin).href
}

/** Azure SPA client ID must be set. */
export function isConfigured(): boolean {
  return !isPlaceholder(getClientId())
}

function isCadFileName(name: string): boolean {
  const lower = name.toLowerCase()
  return CAD_EXTENSIONS.some(ext => lower.endsWith(ext))
}

function combineUrl(...parts: string[]): string {
  return parts
    .map(part => part.replace(/^[\\/]+/, '').replace(/[\\/]+$/, ''))
    .filter(Boolean)
    .join('/')
    .replace(/\\/g, '/')
}

function newChannelId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `picker-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function isGraphHost(hostname: string): boolean {
  return /(^|\.)graph\.microsoft\.(com|us)$/i.test(hostname)
}

function isConsumerHost(value: string): boolean {
  try {
    const host = value.startsWith('http') ? new URL(value).hostname : value
    return (
      /(?:^|\.)onedrive\.live\.com$/i.test(host) ||
      /(?:^|\.)live\.net$/i.test(host) ||
      /(?:^|\.)microsoftpersonalcontent\.com$/i.test(host) ||
      /(?:^|\.)1drv\.com$/i.test(host) ||
      /^api\.onedrive\.com$/i.test(host)
    )
  } catch {
    return /onedrive\.live\.com|live\.net|microsoftpersonalcontent\.com|api\.onedrive\.com/i.test(
      value
    )
  }
}

function extractDownloadUrl(meta: DriveItemMeta | PickedItem): string | undefined {
  const url = meta['@microsoft.graph.downloadUrl'] || meta['@content.downloadUrl']
  return url || undefined
}

const PICKER_DOWNLOAD_COMMANDS = {
  pick: {
    action: 'select',
    select: {
      urls: { download: true }
    }
  }
} as const

function classifyDrive(driveType?: string, webUrl?: string): DriveKind {
  if (driveType === 'personal' || (webUrl && isConsumerHost(webUrl))) {
    return 'personal'
  }
  return 'business'
}

/**
 * FilePicker.aspx must be hosted on the user's OneDrive/SharePoint web, not the
 * tenant root. Graph `webUrl` looks like
 * `https://contoso-my.sharepoint.com/personal/user_contoso_com/Documents`.
 */
function sharePointPickerBaseUrl(driveWebUrl: string): string {
  const url = new URL(driveWebUrl)
  const segments = url.pathname.split('/').filter(Boolean)
  const root = segments[0]?.toLowerCase()
  if (
    segments.length >= 2 &&
    (root === 'personal' || root === 'sites' || root === 'teams')
  ) {
    return `${url.origin}/${segments[0]}/${segments[1]}`
  }
  return url.origin
}

/** Always emit the MSAL chunk (avoids Vite DCE when VITE_MSAL_* are unset at build). */
const msalModulePromise = import('@azure/msal-browser')

function buildMsalConfig(): Configuration {
  return {
    auth: {
      clientId: getClientId(),
      authority: `https://login.microsoftonline.com/${getTenantId()}`,
      redirectUri: getRedirectUri(),
      navigateToLoginRequestUrl: false
    },
    cache: {
      cacheLocation: 'sessionStorage'
    }
  }
}

export class OneDriveClient {
  private msal: PublicClientApplication | null = null
  private account: AccountInfo | null = null
  private driveKind: DriveKind | null = null
  private driveWebUrl = ''
  private ready = false

  isAuthenticated = false
  userInfo: UserInfo = { name: '', email: '', picture: '' }

  async initialize(): Promise<void> {
    if (this.ready) return
    if (!isConfigured()) {
      throw new Error(
        'Microsoft credentials not configured. Set VITE_MSAL_CLIENT_ID in .env.local.'
      )
    }

    // Dynamic import keeps @azure/msal-browser in the build even when local
    // builds omit VITE_MSAL_* (static imports are otherwise tree-shaken away).
    const { PublicClientApplication: MsalApp } = await msalModulePromise
    this.msal = new MsalApp(buildMsalConfig())
    await this.msal.initialize()

    const redirect = await this.msal.handleRedirectPromise()
    if (redirect?.account) {
      this.setAccount(redirect.account)
      await this.loadProfileAndDrive()
    } else {
      const accounts = this.msal.getAllAccounts()
      if (accounts[0]) {
        this.setAccount(accounts[0])
        await this.loadProfileAndDrive()
      }
    }

    this.ready = true
  }

  private setAccount(account: AccountInfo): void {
    this.account = account
    this.msal?.setActiveAccount(account)
    this.isAuthenticated = true
  }

  private ensureMsal(): PublicClientApplication {
    if (!this.msal) {
      throw new Error('MSAL is not initialized')
    }
    return this.msal
  }

  private async acquireToken(scopes: string[]): Promise<string> {
    const msal = this.ensureMsal()
    if (!this.account) {
      throw new Error('Not authenticated')
    }

    const request = {
      account: this.account,
      scopes,
      ...(scopes[0]?.startsWith('OneDrive.')
        ? { authority: 'https://login.microsoftonline.com/consumers' }
        : {})
    }

    try {
      const silent = await msal.acquireTokenSilent(request)
      return silent.accessToken
    } catch {
      const popup = await msal.acquireTokenPopup(request)
      if (popup.account) this.setAccount(popup.account)
      return popup.accessToken
    }
  }

  private pickerScopes(command: AuthenticateCommand): string[] {
    const resource = (command.resource || '').replace(/\/$/, '')
    const consumerPicker =
      this.driveKind === 'personal' || isConsumerHost(resource)

    if (consumerPicker || command.type === 'Graph') {
      return CONSUMER_PICKER_SCOPES
    }

    if (
      command.type === 'SharePoint' ||
      command.type === 'SharePoint_SelfIssued'
    ) {
      if (!resource) {
        throw new Error('Picker authenticate command is missing a resource')
      }
      const sharePointOrigin = resource.startsWith('http')
        ? new URL(resource).origin
        : resource
      return [`${sharePointOrigin}/.default`]
    }

    return GRAPH_SCOPES
  }

  private async getTokenForCommand(
    command: AuthenticateCommand
  ): Promise<string> {
    return this.acquireToken(this.pickerScopes(command))
  }

  private async graphGet<T>(path: string): Promise<T> {
    const token = await this.acquireToken(GRAPH_SCOPES)
    const response = await fetch(`${GRAPH_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) {
      throw new Error(`Microsoft Graph request failed (${response.status})`)
    }
    return (await response.json()) as T
  }

  private async loadProfileAndDrive(): Promise<void> {
    const me = await this.graphGet<{
      displayName?: string
      mail?: string
      userPrincipalName?: string
    }>('/me')

    this.userInfo = {
      name: me.displayName || me.mail || me.userPrincipalName || '',
      email: me.mail || me.userPrincipalName || '',
      picture: ''
    }

    try {
      const photo = await fetch(`${GRAPH_BASE}/me/photo/$value`, {
        headers: {
          Authorization: `Bearer ${await this.acquireToken(GRAPH_SCOPES)}`
        }
      })
      if (photo.ok) {
        const blob = await photo.blob()
        this.userInfo.picture = URL.createObjectURL(blob)
      }
    } catch {
      // Photo is optional
    }

    const drive = await this.graphGet<{
      driveType?: string
      webUrl?: string
    }>('/me/drive')

    this.driveWebUrl = drive.webUrl || ''
    this.driveKind = classifyDrive(drive.driveType, this.driveWebUrl)
  }

  async authenticate(options?: { loginHint?: string; popup?: Window }): Promise<void> {
    if (!isConfigured()) {
      throw new Error(
        'Microsoft credentials not configured. Set VITE_MSAL_CLIENT_ID in .env.local.'
      )
    }

    await this.initialize()
    const msal = this.ensureMsal()
    const loginHint = options?.loginHint || undefined
    const useAccountPicker = !loginHint && !this.isAuthenticated
    const request = {
      scopes: GRAPH_SCOPES,
      loginHint,
      prompt: useAccountPicker ? ('select_account' as const) : undefined
    }

    const result: AuthenticationResult = options?.popup
      ? await this.loginInExistingPopup(msal, request, options.popup)
      : await msal.loginPopup(request)

    if (!result.account) {
      throw new Error('Microsoft sign-in did not return an account')
    }

    this.setAccount(result.account)
    await this.loadProfileAndDrive()
  }

  /**
   * MSAL opens its own popup and closes it when sign-in finishes. Reuse the
   * picker window instead, so the click only creates one popup and the file
   * picker can continue in it after authentication.
   */
  private async loginInExistingPopup(
    msal: PublicClientApplication,
    request: {
      scopes: string[]
      loginHint?: string
      prompt?: 'select_account'
    },
    popup: Window
  ): Promise<AuthenticationResult> {
    if (popup.closed) {
      throw new Error('Popup blocked. Allow popups for this site and try again.')
    }

    const originalOpen = window.open.bind(window)
    const originalClose = Window.prototype.close
    window.open = ((url?: string | URL) => {
      const href = url == null ? '' : String(url)
      if (href && href !== 'about:blank') {
        popup.location.assign(href)
      }
      return popup
    }) as typeof window.open
    Window.prototype.close = function (this: Window) {
      if (this === popup || this.name === 'OneDrivePicker') return
      return originalClose.call(this)
    }

    try {
      return await msal.loginPopup(request)
    } finally {
      window.open = originalOpen
      Window.prototype.close = originalClose
    }
  }

  signOut(): void {
    const msal = this.msal
    const account = this.account
    const picture = this.userInfo.picture

    this.account = null
    this.isAuthenticated = false
    this.userInfo = { name: '', email: '', picture: '' }
    this.driveKind = null
    this.driveWebUrl = ''

    if (picture.startsWith('blob:')) {
      URL.revokeObjectURL(picture)
    }

    if (msal && account) {
      void msal.logoutPopup({ account }).catch(() => {
        // Ignore logout popup blockers / cancel
      })
    }
  }

  /**
   * Resolve a File Handler activation URL
   * (`https://graph.microsoft.com/v1.0/.../items/{id}`) to a drive file.
   */
  async getFileFromGraphItemUrl(itemUrl: string): Promise<DriveFile> {
    const url = new URL(itemUrl)
    if (url.protocol !== 'https:' || !isGraphHost(url.hostname)) {
      throw new Error('File Handler did not provide a Microsoft Graph item URL')
    }

    let meta = await this.fetchDriveItem(url.toString(), GRAPH_SCOPES)
    if (!meta.id || !meta.name || !meta.parentReference?.driveId) {
      const selected = new URL(url.toString())
      selected.searchParams.set(
        '$select',
        'id,name,size,lastModifiedDateTime,file,parentReference'
      )
      meta = await this.fetchDriveItem(selected.toString(), GRAPH_SCOPES)
    }

    const driveId = meta.parentReference?.driveId
    if (!meta.id || !meta.name || !driveId) {
      throw new Error('Incomplete file from File Handler')
    }
    if (!isCadFileName(meta.name)) {
      throw new Error('File Handler preview only opens DWG and DXF files')
    }

    return {
      id: meta.id,
      driveId,
      name: meta.name,
      size: String(meta.size ?? 0),
      modifiedTime: meta.lastModifiedDateTime || new Date().toISOString(),
      mimeType: meta.file?.mimeType || 'application/octet-stream',
      downloadUrl: extractDownloadUrl(meta)
    }
  }

  graphItemUrl(driveId: string, itemId: string): string {
    return this.itemApiUrl(driveId, itemId)
  }

  /**
   * Find a DWG/DXF in the signed-in user's drive for the local File Handler demo.
   */
  async findCadPreviewItemUrl(): Promise<string | null> {
    const queries = ['.dwg', 'dwg', '.dxf', 'dxf']
    for (const query of queries) {
      const found = await this.searchCadItem(query)
      if (found) return found
    }
    return this.firstRecentCadItem()
  }

  private cadItemUrl(item: DriveItemMeta): string | null {
    if (!item.id || !item.name || !isCadFileName(item.name)) return null
    const driveId = item.parentReference?.driveId
    if (!driveId) return null
    return this.itemApiUrl(driveId, item.id)
  }

  private async searchCadItem(query: string): Promise<string | null> {
    if (!/^[.a-z0-9]+$/i.test(query)) return null
    try {
      const result = await this.graphGet<{ value?: DriveItemMeta[] }>(
        `/me/drive/root/search(q='${query}')?$top=25&$select=id,name,file,parentReference`
      )
      for (const item of result.value || []) {
        const url = this.cadItemUrl(item)
        if (url) return url
      }
    } catch {
      // Search is unavailable for some account types; fall through.
    }
    return null
  }

  private async firstRecentCadItem(): Promise<string | null> {
    try {
      const result = await this.graphGet<{ value?: DriveItemMeta[] }>(
        '/me/drive/recent?$top=25&$select=id,name,file,parentReference'
      )
      for (const item of result.value || []) {
        const url = this.cadItemUrl(item)
        if (url) return url
      }
    } catch {
      // Recent is optional.
    }
    return null
  }

  async getFileDetails(driveId: string, itemId: string): Promise<DriveFile> {
    const item = await this.graphGet<DriveItemMeta>(
      `/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}`
    )

    if (!item.id || !item.name) {
      throw new Error('Incomplete OneDrive file metadata')
    }

    return {
      id: item.id,
      driveId,
      name: item.name,
      size: String(item.size ?? 0),
      modifiedTime: item.lastModifiedDateTime || new Date().toISOString(),
      mimeType: item.file?.mimeType || 'application/octet-stream',
      downloadUrl: extractDownloadUrl(item)
    }
  }

  async getFileContent(file: DriveFile): Promise<ArrayBuffer> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated')
    }

    const tryDownload = async (url: string): Promise<ArrayBuffer> => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to download OneDrive file (${response.status})`)
      }
      return response.arrayBuffer()
    }

    if (file.downloadUrl) {
      try {
        return await tryDownload(file.downloadUrl)
      } catch {
        // Picker/Graph download URLs expire in about an hour.
      }
    }

    return tryDownload(await this.resolveDownloadUrl(file))
  }

  private itemApiUrl(driveId: string, itemId: string, endpoint = GRAPH_BASE): string {
    return `${endpoint.replace(/\/$/, '')}/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}`
  }

  private scopesForEndpoint(endpoint?: string): string[] {
    if (!endpoint || /graph\.microsoft\.com/i.test(endpoint)) {
      return GRAPH_SCOPES
    }
    if (this.driveKind === 'personal' || isConsumerHost(endpoint)) {
      return CONSUMER_PICKER_SCOPES
    }
    const origin = new URL(endpoint).origin
    return [`${origin}/.default`]
  }

  private async fetchDriveItem(url: string, scopes: string[]): Promise<DriveItemMeta> {
    const token = await this.acquireToken(scopes)
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) {
      throw new Error(`Failed to resolve OneDrive download URL (${response.status})`)
    }
    return (await response.json()) as DriveItemMeta
  }

  /**
   * Graph `$select=@microsoft.graph.downloadUrl` often returns only `id` (the `@`
   * annotation is dropped). Personal picks need the picker SharePoint endpoint and
   * `@content.downloadUrl` with an OneDrive.ReadOnly token.
   */
  private async resolveDownloadUrl(file: DriveFile): Promise<string> {
    const attempts: { url: string; scopes: string[] }[] = []

    attempts.push({
      url: this.itemApiUrl(file.driveId, file.id),
      scopes: GRAPH_SCOPES
    })

    const graphSelect = new URL(this.itemApiUrl(file.driveId, file.id))
    graphSelect.searchParams.set('$select', 'id,@microsoft.graph.downloadUrl')
    attempts.push({ url: graphSelect.toString(), scopes: GRAPH_SCOPES })

    if (file.sharePointEndpoint) {
      attempts.push({
        url: this.itemApiUrl(file.driveId, file.id, file.sharePointEndpoint),
        scopes: this.scopesForEndpoint(file.sharePointEndpoint)
      })
    }

    let lastStatusError: Error | null = null
    let gotMetadata = false

    for (const attempt of attempts) {
      try {
        const meta = await this.fetchDriveItem(attempt.url, attempt.scopes)
        gotMetadata = true
        const url = extractDownloadUrl(meta)
        if (url) return url
      } catch (error) {
        lastStatusError = error instanceof Error ? error : new Error(String(error))
      }
    }

    if (gotMetadata || !lastStatusError) {
      throw new Error('OneDrive did not return a download URL')
    }
    throw lastStatusError
  }

  private driveFileFromPickedItem(item: PickedItem): DriveFile {
    return {
      id: item.id!,
      driveId: item.parentReference!.driveId!,
      name: item.name!,
      size: String(item.size ?? 0),
      modifiedTime: new Date().toISOString(),
      mimeType: 'application/octet-stream',
      sharePointEndpoint: item['@sharePoint.endpoint'],
      downloadUrl: extractDownloadUrl(item)
    }
  }

  /**
   * Opens Microsoft’s OneDrive / SharePoint File Picker v8 and resolves with the chosen CAD file.
   */
  openFilePicker(win: Window): Promise<DriveFile> {
    return new Promise((resolve, reject) => {
      const closePopup = () => {
        try {
          if (!win.closed) win.close()
        } catch {
          // ignore
        }
      }

      if (win.closed) {
        reject(new Error('Popup blocked. Allow popups for this site and try again.'))
        return
      }

      void this.initialize()
        .then(async () => {
          if (!this.isAuthenticated) {
            await this.authenticate()
          }
          if (!this.driveKind) {
            await this.loadProfileAndDrive()
          }

          const channelId = newChannelId()

          let settled = false
          let port: MessagePort | null = null

          const settle = (fn: () => void) => {
            if (settled) return
            settled = true
            cleanup()
            fn()
          }

          const cleanup = () => {
            window.removeEventListener('message', onWindowMessage)
            if (port) {
              port.onmessage = null
              try {
                port.close()
              } catch {
                // ignore
              }
            }
            try {
              if (!win.closed) win.close()
            } catch {
              // ignore
            }
          }

          const messageListener = async (event: MessageEvent) => {
            const data = event.data as {
              type?: string
              id?: string
              data?: {
                command?: string
                type?: string
                resource?: string
                items?: PickedItem[]
              }
            }

            if (data?.type === 'notification') return

            if (data?.type !== 'command' || !port || data.id == null) return

            port.postMessage({ type: 'acknowledge', id: data.id })

            const command = data.data
            if (!command?.command) return

            switch (command.command) {
              case 'authenticate': {
                try {
                  const token = await this.getTokenForCommand({
                    command: 'authenticate',
                    type: command.type || 'SharePoint',
                    resource: command.resource || ''
                  })
                  port.postMessage({
                    type: 'result',
                    id: data.id,
                    data: { result: 'token', token }
                  })
                } catch (error) {
                  console.error('Picker authenticate failed:', error)
                  port.postMessage({
                    type: 'result',
                    id: data.id,
                    data: {
                      result: 'error',
                      error: {
                        code: 'tokenError',
                        message: error instanceof Error ? error.message : 'tokenError'
                      },
                      isExpected: true
                    }
                  })
                }
                break
              }
              case 'close': {
                port.postMessage({
                  type: 'result',
                  id: data.id,
                  data: { result: 'success' }
                })
                settle(() => reject(new Error('Picker cancelled')))
                break
              }
              case 'pick': {
                const item = command.items?.[0]
                port.postMessage({
                  type: 'result',
                  id: data.id,
                  data: { result: 'success' }
                })

                if (!item?.id || !item.name || !item.parentReference?.driveId) {
                  settle(() => reject(new Error('No file selected')))
                  return
                }
                if (!isCadFileName(item.name)) {
                  settle(() => reject(new Error('Please select a .dwg or .dxf file')))
                  return
                }

                settle(() => resolve(this.driveFileFromPickedItem(item)))
                break
              }
              default: {
                port.postMessage({
                  type: 'result',
                  id: data.id,
                  data: {
                    result: 'error',
                    error: {
                      code: 'unsupportedCommand',
                      message: command.command
                    },
                    isExpected: true
                  }
                })
              }
            }
          }

          const onWindowMessage = (event: MessageEvent) => {
            if (event.source !== win) return
            const message = event.data as { type?: string; channelId?: string }
            if (
              message?.type === 'initialize' &&
              message.channelId === channelId &&
              event.ports[0]
            ) {
              port = event.ports[0]
              port.addEventListener('message', messageListener)
              port.start()
              port.postMessage({ type: 'activate' })
            }
          }

          window.addEventListener('message', onWindowMessage)

          try {
            await this.launchPickerWindow(win, channelId)
          } catch (error) {
            settle(() =>
              reject(error instanceof Error ? error : new Error('Failed to open OneDrive picker'))
            )
          }
        })
        .catch(error => {
          closePopup()
          reject(error instanceof Error ? error : new Error('Failed to open OneDrive picker'))
        })
    })
  }

  private async launchPickerWindow(win: Window, channelId: string): Promise<void> {
    try {
      win.document.open()
      win.document.write(
        '<!DOCTYPE html><html><head><title>OneDrive</title></head><body></body></html>'
      )
      win.document.close()
    } catch {
      throw new Error('The sign-in window closed before OneDrive could open')
    }

    const messaging = {
      origin: window.location.origin,
      channelId
    }

    let pickerUrl: string
    let options: Record<string, unknown>
    let bootstrapToken: string

    if (this.driveKind === 'personal') {
      options = {
        sdk: '8.0',
        entry: {
          oneDrive: {}
        },
        authentication: {},
        messaging,
        typesAndSources: {
          mode: 'files',
          pivots: {
            oneDrive: true,
            recent: false
          }
        },
        selection: { mode: 'single' },
        search: { enabled: true },
        commands: PICKER_DOWNLOAD_COMMANDS
      }
      pickerUrl = `${CONSUMER_PICKER_BASE}?${new URLSearchParams({
        filePicker: JSON.stringify(options)
      })}`
      bootstrapToken = await this.getTokenForCommand({
        command: 'authenticate',
        type: 'Graph',
        resource: CONSUMER_PICKER_BASE
      })
    } else {
      if (!this.driveWebUrl) {
        throw new Error('Could not resolve OneDrive web URL for this account')
      }
      const origin = new URL(this.driveWebUrl).origin
      const pickerBase = sharePointPickerBaseUrl(this.driveWebUrl)
      options = {
        sdk: '8.0',
        entry: {
          oneDrive: {
            files: {}
          }
        },
        authentication: {},
        messaging,
        typesAndSources: {
          mode: 'files',
          pivots: {
            oneDrive: true,
            recent: true
          }
        },
        selection: { mode: 'single' },
        search: { enabled: true },
        commands: PICKER_DOWNLOAD_COMMANDS
      }
      pickerUrl = `${combineUrl(pickerBase, '_layouts/15/FilePicker.aspx')}?${new URLSearchParams({
        filePicker: JSON.stringify(options)
      })}`
      bootstrapToken = await this.getTokenForCommand({
        command: 'authenticate',
        type: 'SharePoint',
        resource: origin
      })
    }

    const form = win.document.createElement('form')
    form.setAttribute('action', pickerUrl)
    form.setAttribute('method', 'POST')
    win.document.body.appendChild(form)

    const input = win.document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', 'access_token')
    input.setAttribute('value', bootstrapToken)
    form.appendChild(input)

    form.submit()
  }

  /** Deep-link helper: ?driveId=&itemId= (optional open from another host). */
  parseOpenActionFromUrl(): { driveId: string; itemId: string } | null {
    const params = new URLSearchParams(window.location.search)
    const driveId = params.get('driveId')
    const itemId = params.get('itemId') || params.get('fileId')
    if (!driveId || !itemId) return null
    return { driveId, itemId }
  }
}
