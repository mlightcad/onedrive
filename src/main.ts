import './styles.css'

import { CadEmbedViewer } from './cadEmbed'
import {
  FileHandlerActivation,
  isInFrame,
  isLocalFileHandlerDemo,
  postLocalFileHandlerPreview,
  takeFileHandlerActivation
} from './fileHandler'
import {
  type Copy,
  detectSiteLocale,
  HTML_LANG,
  type Locale,
  subscribeSiteLocale,
  t
} from './i18n'
import { DriveFile, isConfigured, OneDriveClient } from './oneDrive'
import { loadSiteChrome } from './siteChrome'

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
const fileHandlerDemo = isLocalFileHandlerDemo()
let locale: Locale = 'en'
let authTitleKey: keyof Copy = 'signInContinue'
let welcomeKey: keyof Copy = 'chooseFile'
let bootKey: keyof Copy = 'loading'
let lastLoadState: FileLoadState = 'idle'
let lastLoadError = ''

function copy(): Copy {
  return t(locale)
}

function applyStaticI18n(): void {
  const dict = copy()
  document.title = dict.title
  document.documentElement.lang = HTML_LANG[locale]
  const meta = document.querySelector('meta[name="description"]')
  if (meta) meta.setAttribute('content', dict.description)

  authTitle.dataset.i18n = authTitleKey
  const welcomeCopy = welcome.querySelector('p')
  if (welcomeCopy) welcomeCopy.dataset.i18n = welcomeKey
  const bootCopy = bootPanel.querySelector('p')
  if (bootCopy) bootCopy.dataset.i18n = bootKey

  document.querySelectorAll<HTMLElement>('#app [data-i18n]').forEach(el => {
    if (el.closest('.nav, .footer')) return
    const key = el.dataset.i18n as keyof Copy | undefined
    if (!key) return
    const value = dict[key]
    if (typeof value === 'string') el.textContent = value
  })
}

function applyI18n(): void {
  applyStaticI18n()
  setFileLoadUi(lastLoadState, lastLoadError)
  if (!configWarning.hidden) updateConfigWarning()
}

function show(el: HTMLElement, visible: boolean): void {
  el.hidden = !visible
}

function setFileLoadUi(state: FileLoadState, errorMessage = ''): void {
  lastLoadState = state
  lastLoadError = errorMessage
  const dict = copy()
  const hasFile = Boolean(selectedFile)
  show(welcome, !hasFile && state === 'idle')

  if (selectedFile) {
    fileNameEl.textContent = selectedFile.name
    fileNameEl.title = selectedFile.name
  } else {
    fileNameEl.textContent = dict.noFile
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
    fileStatusEl.textContent = dict.loadingStatus
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
    configWarning.innerHTML = copy().configMissing
    show(configWarning, true)
    return
  }

  configWarning.textContent = ''
  show(configWarning, false)
}

function renderAuthState(): void {
  show(bootPanel, false)

  if (fileHandler) authTitleKey = 'signInPreview'
  else if (fileHandlerDemo) authTitleKey = 'signInDemo'
  else authTitleKey = 'signInContinue'
  applyStaticI18n()

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
    setFileLoadUi('error', copy().downloadError)
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
    if (fileHandlerDemo) {
      postLocalFileHandlerPreview(
        drive.graphItemUrl(file.driveId, file.id),
        drive.userInfo.email
      )
      return
    }
    await loadFileBuffer(file)
  } catch (error) {
    try {
      if (!popup.closed) popup.close()
    } catch {
      // The picker window may already be gone.
    }
    const message = error instanceof Error ? error.message : copy().pickerFailed
    if (message !== 'Picker cancelled') {
      console.error(error)
      alert(message)
    }
    if (!selectedFile) {
      welcomeKey = 'chooseFile'
      applyStaticI18n()
      setFileLoadUi('idle')
    }
  } finally {
    pickFileBtn.disabled = false
  }
}

async function openFileHandlerItem(): Promise<void> {
  const itemUrl = fileHandler?.items[0]
  if (!itemUrl) {
    throw new Error(copy().noFileToPreview)
  }
  show(pickFileBtn, false)
  const details = await drive.getFileFromGraphItemUrl(itemUrl)
  await loadFileBuffer(details)
}

function centeredPopupFeatures(width: number, height: number): string {
  const parentLeft = window.screenLeft ?? window.screenX
  const parentTop = window.screenTop ?? window.screenY
  const parentWidth = window.outerWidth || window.innerWidth
  const parentHeight = window.outerHeight || window.innerHeight
  const left = Math.round(parentLeft + (parentWidth - width) / 2)
  const top = Math.round(parentTop + (parentHeight - height) / 2)
  return `width=${width},height=${height},left=${left},top=${top}`
}

function openPickerPopup(message: string): Window | null {
  const popup = window.open('', 'OneDrivePicker', centeredPopupFeatures(1080, 680))
  if (!popup) return null
  popup.document.title = 'OneDrive'
  popup.document.body.textContent = message
  return popup
}

async function handleSignIn(popup?: Window): Promise<void> {
  signInBtn.disabled = true
  show(authLayout, true)
  show(bootPanel, true)
  show(authPanel, false)
  try {
    await drive.authenticate({
      loginHint: fileHandler?.userId || undefined,
      popup
    })
  } catch (error) {
    if (popup) {
      try {
        if (!popup.closed) popup.close()
      } catch {
        // The sign-in window may already be gone.
      }
    }
    console.error('Authentication failed:', error)
    alert(error instanceof Error ? error.message : copy().authFailed)
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
      alert(error instanceof Error ? error.message : copy().previewFailed)
      renderAuthState()
    }
    return
  }
  if (fileHandlerDemo) {
    await continueFileHandlerDemo()
    return
  }
  if (popup) {
    await handlePickFile(popup)
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
    alert(error instanceof Error ? error.message : copy().deepLinkFailed)
    renderAuthState()
  }
}

signInBtn.addEventListener('click', () => {
  if (fileHandler || fileHandlerDemo) {
    void handleSignIn()
    return
  }
  const popup = openPickerPopup(copy().signingIn)
  if (!popup) {
    alert(copy().popupBlocked)
    return
  }
  void handleSignIn(popup)
})
signOutBtn.addEventListener('click', handleSignOut)
pickFileBtn.addEventListener('click', () => {
  const popup = openPickerPopup(copy().openingOneDrive)
  if (!popup) {
    alert(copy().popupBlocked)
    return
  }
  void handlePickFile(popup)
})
retryBtn.addEventListener('click', () => {
  if (selectedFile) void loadFileBuffer(selectedFile)
})

async function handleFileHandlerEntry(): Promise<void> {
  if (isInFrame()) {
    document.documentElement.classList.add('is-embedded')
  }
  authTitleKey = 'signInPreview'
  applyStaticI18n()

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
    alert(error instanceof Error ? error.message : copy().previewFailed)
    renderAuthState()
  }
}

async function boot(): Promise<void> {
  await loadSiteChrome()
  locale = detectSiteLocale()
  applyI18n()
  subscribeSiteLocale(next => {
    if (next === locale) return
    locale = next
    applyI18n()
  })
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

  if (fileHandlerDemo) {
    await handleFileHandlerDemoEntry()
    return
  }

  renderAuthState()
}

async function handleFileHandlerDemoEntry(): Promise<void> {
  authTitleKey = 'signInDemo'
  applyStaticI18n()
  show(pickFileBtn, false)
  show(authLayout, true)
  show(bootPanel, true)
  show(authPanel, false)
  show(workspacePanel, false)

  if (!drive.isAuthenticated) {
    renderAuthState()
    show(pickFileBtn, false)
    return
  }

  await continueFileHandlerDemo()
}

async function continueFileHandlerDemo(): Promise<void> {
  show(authLayout, true)
  show(bootPanel, true)
  show(authPanel, false)
  bootKey = 'demoBoot'
  applyStaticI18n()

  try {
    const itemUrl = await drive.findCadPreviewItemUrl()
    if (itemUrl) {
      postLocalFileHandlerPreview(itemUrl, drive.userInfo.email)
      return
    }
    renderAuthState()
    show(pickFileBtn, true)
    welcomeKey = 'demoNoFile'
    applyStaticI18n()
    setFileLoadUi('idle')
  } catch (error) {
    console.error('File Handler demo failed:', error)
    alert(error instanceof Error ? error.message : copy().demoFailed)
    renderAuthState()
  }
}

void boot()
