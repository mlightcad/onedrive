import './styles.css'

import { CadEmbedViewer } from './cadEmbed'
import { FileHandlerActivation, isInFrame, takeFileHandlerActivation } from './fileHandler'
import { DriveFile, isConfigured, OneDriveClient } from './oneDrive'
import { initSiteNav } from './siteNav'

type FileLoadState = 'idle' | 'loading' | 'ready' | 'error'

const drive = new OneDriveClient()

const authLayout = document.querySelector<HTMLElement>('#auth-layout')!
const bootPanel = document.querySelector<HTMLElement>('#boot-panel')!
const authPanel = document.querySelector<HTMLElement>('#auth-panel')!
const workspacePanel = document.querySelector<HTMLElement>('#workspace-panel')!
const configWarning = document.querySelector<HTMLElement>('#config-warning')!
const authTitle = document.querySelector<HTMLElement>('#auth-title')!
const signInBtn = document.querySelector<HTMLButtonElement>('#sign-in-btn')!
const signOutBtn = document.querySelector<HTMLButtonElement>('#sign-out-btn')!
const pickFileBtn = document.querySelector<HTMLButtonElement>('#pick-file-btn')!
const userChip = document.querySelector<HTMLElement>('#user-chip')!
const userAvatar = document.querySelector<HTMLImageElement>('#user-avatar')!
const userName = document.querySelector<HTMLElement>('#user-name')!
const fileNameEl = document.querySelector<HTMLElement>('#file-name')!
const fileStatusEl = document.querySelector<HTMLElement>('#file-status')!
const welcome = document.querySelector<HTMLElement>('#welcome')!
const viewerHost = document.querySelector<HTMLElement>('#viewer-host')!
const viewerOverlay = document.querySelector<HTMLElement>('#viewer-overlay')!
const overlayLoading = document.querySelector<HTMLElement>('#overlay-loading')!
const overlayError = document.querySelector<HTMLElement>('#overlay-error')!
const overlayErrorText = document.querySelector<HTMLElement>('#overlay-error-text')!
const retryBtn = document.querySelector<HTMLButtonElement>('#retry-btn')!

const viewer = new CadEmbedViewer(viewerHost)
viewer.mount()

let selectedFile: DriveFile | null = null
let loadGeneration = 0
let fileHandler: FileHandlerActivation | null = null

function show(el: HTMLElement, visible: boolean): void {
  el.hidden = !visible
}

function setFileLoadUi(state: FileLoadState, errorMessage = ''): void {
  const hasFile = Boolean(selectedFile)
  show(welcome, !hasFile && state === 'idle')

  if (selectedFile) {
    fileNameEl.textContent = selectedFile.name
    fileNameEl.title = selectedFile.name
  } else {
    fileNameEl.textContent = 'No file selected'
    fileNameEl.title = ''
  }

  if (state === 'ready') {
    show(fileStatusEl, false)
    fileStatusEl.textContent = ''
  } else if (state === 'error') {
    show(fileStatusEl, true)
    fileStatusEl.textContent = errorMessage
  } else if (state === 'loading') {
    show(fileStatusEl, true)
    fileStatusEl.textContent = 'Loading…'
  } else {
    show(fileStatusEl, false)
    fileStatusEl.textContent = ''
  }

  const showOverlay = hasFile && state !== 'ready'
  show(viewerOverlay, showOverlay)
  show(overlayLoading, showOverlay && state === 'loading')
  show(overlayError, showOverlay && state === 'error')
  if (state === 'error') {
    overlayErrorText.textContent = errorMessage
  }
}

function updateUserChip(): void {
  const { name, picture } = drive.userInfo
  if (name || picture) {
    show(userChip, true)
    userName.textContent = name
    if (picture) {
      userAvatar.src = picture
      userAvatar.alt = name
    } else {
      userAvatar.removeAttribute('src')
      userAvatar.alt = ''
    }
  } else {
    show(userChip, false)
  }
}

function updateConfigWarning(): void {
  if (!isConfigured()) {
    configWarning.innerHTML =
      'Microsoft credentials are missing. For local dev, copy <code>env.example</code> to ' +
      '<code>.env.local</code> and set <code>VITE_MSAL_CLIENT_ID</code>. For GitHub Pages, set ' +
      'repository secret <code>MSAL_CLIENT_ID</code>, then redeploy.'
    show(configWarning, true)
    return
  }

  configWarning.textContent = ''
  show(configWarning, false)
}

function renderAuthState(): void {
  show(bootPanel, false)

  if (!drive.isAuthenticated) {
    show(authLayout, true)
    show(authPanel, true)
    show(workspacePanel, false)
    updateConfigWarning()
    signInBtn.disabled = !isConfigured()
    return
  }

  show(authLayout, false)
  show(authPanel, false)
  show(workspacePanel, true)
  updateUserChip()
}

async function loadFileBuffer(file: DriveFile): Promise<void> {
  const generation = ++loadGeneration
  selectedFile = file
  viewer.clear()
  setFileLoadUi('loading')

  try {
    const buffer = await drive.getFileContent(file)
    if (generation !== loadGeneration) return
    viewer.open(file.name, buffer)
    setFileLoadUi('ready')
  } catch (error) {
    if (generation !== loadGeneration) return
    console.error('Error downloading file:', error)
    setFileLoadUi('error', 'Could not download this OneDrive file')
  }
}

async function refreshUserChipSoon(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    if (drive.userInfo.name || drive.userInfo.picture) {
      updateUserChip()
      return
    }
    await new Promise(r => setTimeout(r, 100))
  }
}

async function handlePickFile(popup: Window): Promise<void> {
  pickFileBtn.disabled = true
  try {
    const file = await drive.openFilePicker(popup)
    await loadFileBuffer(file)
  } catch (error) {
    try {
      if (!popup.closed) popup.close()
    } catch {
      // The picker window may already be gone.
    }
    const message = error instanceof Error ? error.message : 'Failed to open file picker'
    if (message !== 'Picker cancelled') {
      console.error(error)
      alert(message)
    }
    if (!selectedFile) {
      welcome.querySelector('p')!.textContent = 'Choose a DWG or DXF file from OneDrive.'
      setFileLoadUi('idle')
    }
  } finally {
    pickFileBtn.disabled = false
  }
}

async function openFileHandlerItem(): Promise<void> {
  const itemUrl = fileHandler?.items[0]
  if (!itemUrl) {
    throw new Error('OneDrive did not send a file to preview')
  }
  show(pickFileBtn, false)
  const details = await drive.getFileFromGraphItemUrl(itemUrl)
  await loadFileBuffer(details)
}

async function handleSignIn(): Promise<void> {
  signInBtn.disabled = true
  show(authLayout, true)
  show(bootPanel, true)
  show(authPanel, false)
  try {
    await drive.authenticate(
      fileHandler?.userId ? { loginHint: fileHandler.userId } : undefined
    )
  } catch (error) {
    console.error('Authentication failed:', error)
    alert(error instanceof Error ? error.message : 'Microsoft authorization failed')
    renderAuthState()
    return
  } finally {
    signInBtn.disabled = !isConfigured()
  }

  renderAuthState()
  void refreshUserChipSoon()
  if (fileHandler) {
    try {
      await openFileHandlerItem()
    } catch (error) {
      console.error('File Handler preview failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to preview OneDrive file')
      renderAuthState()
    }
  }
}

function handleSignOut(): void {
  loadGeneration += 1
  selectedFile = null
  viewer.clear()
  setFileLoadUi('idle')
  drive.signOut()
  renderAuthState()
}

async function handleDeepLinkOpen(): Promise<void> {
  const action = drive.parseOpenActionFromUrl()
  if (!action) return

  show(authLayout, true)
  show(bootPanel, true)
  show(authPanel, false)
  show(workspacePanel, false)

  try {
    if (!drive.isAuthenticated) {
      await drive.authenticate()
    }
    renderAuthState()
    void refreshUserChipSoon()

    const details = await drive.getFileDetails(action.driveId, action.itemId)
    await loadFileBuffer(details)
  } catch (error) {
    console.error('Deep-link open failed:', error)
    alert(error instanceof Error ? error.message : 'Failed to open OneDrive file')
    renderAuthState()
  }
}

signInBtn.addEventListener('click', () => {
  void handleSignIn()
})
signOutBtn.addEventListener('click', handleSignOut)
pickFileBtn.addEventListener('click', () => {
  const popup = window.open('', 'OneDrivePicker', 'width=1080,height=680')
  if (!popup) {
    alert('Popup blocked. Allow popups for this site and try again.')
    return
  }
  popup.document.title = 'OneDrive'
  popup.document.body.textContent = 'Opening OneDrive…'
  void handlePickFile(popup)
})
retryBtn.addEventListener('click', () => {
  if (selectedFile) void loadFileBuffer(selectedFile)
})

async function handleFileHandlerEntry(): Promise<void> {
  if (isInFrame()) {
    document.documentElement.classList.add('is-embedded')
  }
  authTitle.textContent = 'Sign in to preview this drawing'

  show(authLayout, true)
  show(bootPanel, true)
  show(authPanel, false)
  show(workspacePanel, false)

  try {
    if (!drive.isAuthenticated) {
      renderAuthState()
      return
    }
    renderAuthState()
    void refreshUserChipSoon()
    await openFileHandlerItem()
  } catch (error) {
    console.error('File Handler preview failed:', error)
    alert(error instanceof Error ? error.message : 'Failed to preview OneDrive file')
    renderAuthState()
  }
}

async function boot(): Promise<void> {
  initSiteNav()
  fileHandler = takeFileHandlerActivation()
  show(authLayout, true)
  show(bootPanel, true)
  show(authPanel, false)
  show(workspacePanel, false)
  setFileLoadUi('idle')

  if (!isConfigured()) {
    renderAuthState()
    return
  }

  try {
    await drive.initialize()
  } catch (error) {
    console.error('Failed to initialize Microsoft auth:', error)
  }

  if (fileHandler) {
    await handleFileHandlerEntry()
    return
  }

  const deepLink = drive.parseOpenActionFromUrl()
  if (deepLink) {
    await handleDeepLinkOpen()
    return
  }

  renderAuthState()
}

void boot()
