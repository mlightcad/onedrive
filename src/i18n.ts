export const LOCALE_STORAGE_KEY = 'mlightcad-locale'

export const LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'pt', 'ru', 'cs'] as const

export type Locale = (typeof LOCALES)[number]

export const HTML_LANG: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-CN',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  pt: 'pt-BR',
  ru: 'ru',
  cs: 'cs'
}

export type Copy = {
  title: string
  description: string
  eyebrow: string
  heading: string
  lead: string
  loading: string
  signInContinue: string
  signInPreview: string
  signInDemo: string
  signInMicrosoft: string
  privacyPolicy: string
  privacy: string
  noFile: string
  loadingStatus: string
  chooseFile: string
  overlayLoading: string
  retry: string
  pickFile: string
  signOut: string
  downloadError: string
  pickerFailed: string
  popupBlocked: string
  signingIn: string
  openingOneDrive: string
  authFailed: string
  previewFailed: string
  noFileToPreview: string
  deepLinkFailed: string
  demoBoot: string
  demoNoFile: string
  demoFailed: string
  configMissing: string
}

const en: Copy = {
  title: 'OneDrive CAD Viewer — MLightCAD',
  description:
    'Open DWG and DXF drawings from OneDrive in your browser with MLightCAD. Per-file access only; drawings stay on your device.',
  eyebrow: 'MLightCAD · OneDrive',
  heading: 'OneDrive CAD Viewer',
  lead: 'Open DWG/DXF from OneDrive in your browser. Only files you choose; nothing is uploaded to our servers.',
  loading: 'Loading…',
  signInContinue: 'Sign in to continue',
  signInPreview: 'Sign in to preview this drawing',
  signInDemo: 'Sign in to test File Handler preview',
  signInMicrosoft: 'Sign in with Microsoft',
  privacyPolicy: 'Privacy Policy',
  privacy: 'Privacy',
  noFile: 'No file selected',
  loadingStatus: 'Loading…',
  chooseFile: 'Choose a DWG or DXF file from OneDrive.',
  overlayLoading: 'Loading file from OneDrive…',
  retry: 'Retry',
  pickFile: 'Choose from OneDrive',
  signOut: 'Sign Out',
  downloadError: 'Could not download this OneDrive file',
  pickerFailed: 'Failed to open file picker',
  popupBlocked: 'Popup blocked. Allow popups for this site and try again.',
  signingIn: 'Signing in…',
  openingOneDrive: 'Opening OneDrive…',
  authFailed: 'Microsoft authorization failed',
  previewFailed: 'Failed to preview OneDrive file',
  noFileToPreview: 'OneDrive did not send a file to preview',
  deepLinkFailed: 'Failed to open OneDrive file',
  demoBoot: 'Looking for a DWG or DXF in OneDrive…',
  demoNoFile: 'No DWG/DXF found automatically. Choose one to continue the File Handler test.',
  demoFailed: 'Failed to start File Handler demo',
  configMissing:
    'Microsoft credentials are missing. For local dev, copy <code>env.example</code> to <code>.env.local</code> and set <code>VITE_MSAL_CLIENT_ID</code>. For GitHub Pages, set repository secret <code>MSAL_CLIENT_ID</code>, then redeploy.'
}

const zh: Copy = {
  title: 'OneDrive CAD 查看器 — MLightCAD',
  description: '在浏览器中用 MLightCAD 打开 OneDrive 里的 DWG/DXF。仅访问你选择的文件，图纸留在本机。',
  eyebrow: 'MLightCAD · OneDrive',
  heading: 'OneDrive CAD 查看器',
  lead: '在浏览器中打开 OneDrive 上的 DWG/DXF。只访问你选择的文件，不会上传到我们的服务器。',
  loading: '加载中…',
  signInContinue: '请先登录',
  signInPreview: '登录后预览此图纸',
  signInDemo: '登录以测试 File Handler 预览',
  signInMicrosoft: '使用 Microsoft 帐户登录',
  privacyPolicy: '隐私政策',
  privacy: '隐私',
  noFile: '未选择文件',
  loadingStatus: '加载中…',
  chooseFile: '请从 OneDrive 选择 DWG 或 DXF 文件。',
  overlayLoading: '正在从 OneDrive 加载文件…',
  retry: '重试',
  pickFile: '从 OneDrive 选择',
  signOut: '退出',
  downloadError: '无法下载该 OneDrive 文件',
  pickerFailed: '无法打开文件选择器',
  popupBlocked: '弹出窗口被拦截。请允许本站弹出窗口后重试。',
  signingIn: '正在登录…',
  openingOneDrive: '正在打开 OneDrive…',
  authFailed: 'Microsoft 授权失败',
  previewFailed: '无法预览 OneDrive 文件',
  noFileToPreview: 'OneDrive 未提供要预览的文件',
  deepLinkFailed: '无法打开 OneDrive 文件',
  demoBoot: '正在 OneDrive 中查找 DWG 或 DXF…',
  demoNoFile: '未能自动找到 DWG/DXF。请选择一个文件以继续 File Handler 测试。',
  demoFailed: '无法启动 File Handler 演示',
  configMissing:
    '缺少 Microsoft 凭据。本地开发请将 <code>env.example</code> 复制为 <code>.env.local</code> 并设置 <code>VITE_MSAL_CLIENT_ID</code>。GitHub Pages 请设置仓库密钥 <code>MSAL_CLIENT_ID</code> 后重新部署。'
}

const ja: Copy = {
  title: 'OneDrive CAD ビューア — MLightCAD',
  description:
    'MLightCAD で OneDrive の DWG/DXF をブラウザで開きます。選択したファイルのみにアクセスし、図面は端末に留まります。',
  eyebrow: 'MLightCAD · OneDrive',
  heading: 'OneDrive CAD ビューア',
  lead: 'ブラウザで OneDrive の DWG/DXF を開きます。選んだファイルだけにアクセスし、サーバーへはアップロードしません。',
  loading: '読み込み中…',
  signInContinue: '続行するにはサインインしてください',
  signInPreview: 'この図面をプレビューするにはサインインしてください',
  signInDemo: 'File Handler プレビューを試すにはサインインしてください',
  signInMicrosoft: 'Microsoft でサインイン',
  privacyPolicy: 'プライバシーポリシー',
  privacy: 'プライバシー',
  noFile: 'ファイル未選択',
  loadingStatus: '読み込み中…',
  chooseFile: 'OneDrive から DWG または DXF を選択してください。',
  overlayLoading: 'OneDrive からファイルを読み込んでいます…',
  retry: '再試行',
  pickFile: 'OneDrive から選択',
  signOut: 'サインアウト',
  downloadError: 'この OneDrive ファイルをダウンロードできませんでした',
  pickerFailed: 'ファイルピッカーを開けませんでした',
  popupBlocked: 'ポップアップがブロックされました。このサイトのポップアップを許可して再試行してください。',
  signingIn: 'サインイン中…',
  openingOneDrive: 'OneDrive を開いています…',
  authFailed: 'Microsoft の承認に失敗しました',
  previewFailed: 'OneDrive ファイルをプレビューできませんでした',
  noFileToPreview: 'OneDrive からプレビューするファイルが送られていません',
  deepLinkFailed: 'OneDrive ファイルを開けませんでした',
  demoBoot: 'OneDrive で DWG / DXF を探しています…',
  demoNoFile: '自動では見つかりませんでした。File Handler テストを続けるにはファイルを選択してください。',
  demoFailed: 'File Handler デモを開始できませんでした',
  configMissing:
    'Microsoft の資格情報がありません。ローカルでは <code>env.example</code> を <code>.env.local</code> にコピーし <code>VITE_MSAL_CLIENT_ID</code> を設定してください。GitHub Pages ではリポジトリシークレット <code>MSAL_CLIENT_ID</code> を設定して再デプロイしてください。'
}

const ko: Copy = {
  title: 'OneDrive CAD 뷰어 — MLightCAD',
  description:
    '브라우저에서 MLightCAD로 OneDrive의 DWG/DXF를 엽니다. 선택한 파일만 접근하며 도면은 기기에 남습니다.',
  eyebrow: 'MLightCAD · OneDrive',
  heading: 'OneDrive CAD 뷰어',
  lead: '브라우저에서 OneDrive의 DWG/DXF를 엽니다. 선택한 파일만 사용하며 서버로 업로드하지 않습니다.',
  loading: '불러오는 중…',
  signInContinue: '계속하려면 로그인하세요',
  signInPreview: '이 도면을 미리 보려면 로그인하세요',
  signInDemo: 'File Handler 미리 보기를 테스트하려면 로그인하세요',
  signInMicrosoft: 'Microsoft 계정으로 로그인',
  privacyPolicy: '개인정보 처리방침',
  privacy: '개인정보',
  noFile: '선택된 파일 없음',
  loadingStatus: '불러오는 중…',
  chooseFile: 'OneDrive에서 DWG 또는 DXF 파일을 선택하세요.',
  overlayLoading: 'OneDrive에서 파일을 불러오는 중…',
  retry: '다시 시도',
  pickFile: 'OneDrive에서 선택',
  signOut: '로그아웃',
  downloadError: '이 OneDrive 파일을 다운로드할 수 없습니다',
  pickerFailed: '파일 선택기를 열 수 없습니다',
  popupBlocked: '팝업이 차단되었습니다. 이 사이트의 팝업을 허용한 뒤 다시 시도하세요.',
  signingIn: '로그인 중…',
  openingOneDrive: 'OneDrive 여는 중…',
  authFailed: 'Microsoft 인증에 실패했습니다',
  previewFailed: 'OneDrive 파일을 미리 볼 수 없습니다',
  noFileToPreview: 'OneDrive가 미리 볼 파일을 보내지 않았습니다',
  deepLinkFailed: 'OneDrive 파일을 열 수 없습니다',
  demoBoot: 'OneDrive에서 DWG 또는 DXF를 찾는 중…',
  demoNoFile: '자동으로 DWG/DXF를 찾지 못했습니다. File Handler 테스트를 계속하려면 파일을 선택하세요.',
  demoFailed: 'File Handler 데모를 시작할 수 없습니다',
  configMissing:
    'Microsoft 자격 증명이 없습니다. 로컬에서는 <code>env.example</code>을 <code>.env.local</code>로 복사하고 <code>VITE_MSAL_CLIENT_ID</code>를 설정하세요. GitHub Pages에서는 리포지토리 비밀 <code>MSAL_CLIENT_ID</code>를 설정한 뒤 다시 배포하세요.'
}

const es: Copy = {
  title: 'Visor CAD de OneDrive — MLightCAD',
  description:
    'Abre dibujos DWG y DXF de OneDrive en el navegador con MLightCAD. Solo el archivo que eliges; el dibujo permanece en tu dispositivo.',
  eyebrow: 'MLightCAD · OneDrive',
  heading: 'Visor CAD de OneDrive',
  lead: 'Abre DWG/DXF de OneDrive en el navegador. Solo los archivos que elijas; no se suben a nuestros servidores.',
  loading: 'Cargando…',
  signInContinue: 'Inicia sesión para continuar',
  signInPreview: 'Inicia sesión para previsualizar este dibujo',
  signInDemo: 'Inicia sesión para probar la vista previa de File Handler',
  signInMicrosoft: 'Iniciar sesión con Microsoft',
  privacyPolicy: 'Política de privacidad',
  privacy: 'Privacidad',
  noFile: 'Ningún archivo seleccionado',
  loadingStatus: 'Cargando…',
  chooseFile: 'Elige un archivo DWG o DXF de OneDrive.',
  overlayLoading: 'Cargando archivo desde OneDrive…',
  retry: 'Reintentar',
  pickFile: 'Elegir de OneDrive',
  signOut: 'Cerrar sesión',
  downloadError: 'No se pudo descargar este archivo de OneDrive',
  pickerFailed: 'No se pudo abrir el selector de archivos',
  popupBlocked: 'Ventana emergente bloqueada. Permite ventanas emergentes para este sitio e inténtalo de nuevo.',
  signingIn: 'Iniciando sesión…',
  openingOneDrive: 'Abriendo OneDrive…',
  authFailed: 'La autorización de Microsoft falló',
  previewFailed: 'No se pudo previsualizar el archivo de OneDrive',
  noFileToPreview: 'OneDrive no envió un archivo para previsualizar',
  deepLinkFailed: 'No se pudo abrir el archivo de OneDrive',
  demoBoot: 'Buscando un DWG o DXF en OneDrive…',
  demoNoFile: 'No se encontró un DWG/DXF automáticamente. Elige uno para continuar la prueba de File Handler.',
  demoFailed: 'No se pudo iniciar la demostración de File Handler',
  configMissing:
    'Faltan las credenciales de Microsoft. En local, copia <code>env.example</code> a <code>.env.local</code> y define <code>VITE_MSAL_CLIENT_ID</code>. En GitHub Pages, configura el secreto <code>MSAL_CLIENT_ID</code> y vuelve a desplegar.'
}

const pt: Copy = {
  title: 'Visualizador CAD do OneDrive — MLightCAD',
  description:
    'Abra desenhos DWG e DXF do OneDrive no navegador com o MLightCAD. Só o arquivo que você escolher; o desenho permanece no dispositivo.',
  eyebrow: 'MLightCAD · OneDrive',
  heading: 'Visualizador CAD do OneDrive',
  lead: 'Abra DWG/DXF do OneDrive no navegador. Só os arquivos que você escolher; nada é enviado aos nossos servidores.',
  loading: 'Carregando…',
  signInContinue: 'Entre para continuar',
  signInPreview: 'Entre para visualizar este desenho',
  signInDemo: 'Entre para testar a pré-visualização do File Handler',
  signInMicrosoft: 'Entrar com a Microsoft',
  privacyPolicy: 'Política de privacidade',
  privacy: 'Privacidade',
  noFile: 'Nenhum arquivo selecionado',
  loadingStatus: 'Carregando…',
  chooseFile: 'Escolha um arquivo DWG ou DXF no OneDrive.',
  overlayLoading: 'Carregando arquivo do OneDrive…',
  retry: 'Tentar novamente',
  pickFile: 'Escolher no OneDrive',
  signOut: 'Sair',
  downloadError: 'Não foi possível baixar este arquivo do OneDrive',
  pickerFailed: 'Falha ao abrir o seletor de arquivos',
  popupBlocked: 'Pop-up bloqueado. Permita pop-ups neste site e tente de novo.',
  signingIn: 'Entrando…',
  openingOneDrive: 'Abrindo o OneDrive…',
  authFailed: 'A autorização da Microsoft falhou',
  previewFailed: 'Falha ao visualizar o arquivo do OneDrive',
  noFileToPreview: 'O OneDrive não enviou um arquivo para visualizar',
  deepLinkFailed: 'Falha ao abrir o arquivo do OneDrive',
  demoBoot: 'Procurando um DWG ou DXF no OneDrive…',
  demoNoFile: 'Nenhum DWG/DXF encontrado automaticamente. Escolha um para continuar o teste do File Handler.',
  demoFailed: 'Falha ao iniciar a demonstração do File Handler',
  configMissing:
    'Faltam as credenciais da Microsoft. No desenvolvimento local, copie <code>env.example</code> para <code>.env.local</code> e defina <code>VITE_MSAL_CLIENT_ID</code>. No GitHub Pages, configure o segredo <code>MSAL_CLIENT_ID</code> e implante de novo.'
}

const ru: Copy = {
  title: 'Просмотр CAD в OneDrive — MLightCAD',
  description:
    'Открывайте DWG и DXF из OneDrive в браузере с MLightCAD. Доступ только к выбранному файлу; чертёж остаётся на устройстве.',
  eyebrow: 'MLightCAD · OneDrive',
  heading: 'Просмотр CAD в OneDrive',
  lead: 'Открывайте DWG/DXF из OneDrive в браузере. Только выбранные файлы; на наши серверы ничего не загружается.',
  loading: 'Загрузка…',
  signInContinue: 'Войдите, чтобы продолжить',
  signInPreview: 'Войдите, чтобы просмотреть этот чертёж',
  signInDemo: 'Войдите, чтобы проверить предпросмотр File Handler',
  signInMicrosoft: 'Войти через Microsoft',
  privacyPolicy: 'Политика конфиденциальности',
  privacy: 'Конфиденциальность',
  noFile: 'Файл не выбран',
  loadingStatus: 'Загрузка…',
  chooseFile: 'Выберите файл DWG или DXF в OneDrive.',
  overlayLoading: 'Загрузка файла из OneDrive…',
  retry: 'Повторить',
  pickFile: 'Выбрать в OneDrive',
  signOut: 'Выйти',
  downloadError: 'Не удалось скачать этот файл OneDrive',
  pickerFailed: 'Не удалось открыть выбор файла',
  popupBlocked: 'Всплывающее окно заблокировано. Разрешите всплывающие окна для этого сайта и повторите попытку.',
  signingIn: 'Вход…',
  openingOneDrive: 'Открытие OneDrive…',
  authFailed: 'Авторизация Microsoft не удалась',
  previewFailed: 'Не удалось открыть файл OneDrive для просмотра',
  noFileToPreview: 'OneDrive не отправил файл для просмотра',
  deepLinkFailed: 'Не удалось открыть файл OneDrive',
  demoBoot: 'Поиск DWG или DXF в OneDrive…',
  demoNoFile: 'DWG/DXF не найден автоматически. Выберите файл, чтобы продолжить тест File Handler.',
  demoFailed: 'Не удалось запустить демонстрацию File Handler',
  configMissing:
    'Нет учётных данных Microsoft. Для локальной разработки скопируйте <code>env.example</code> в <code>.env.local</code> и задайте <code>VITE_MSAL_CLIENT_ID</code>. Для GitHub Pages задайте секрет репозитория <code>MSAL_CLIENT_ID</code> и задеплойте снова.'
}

const cs: Copy = {
  title: 'OneDrive CAD prohlížeč — MLightCAD',
  description:
    'Otevřete výkresy DWG a DXF z OneDrive v prohlížeči pomocí MLightCAD. Přístup jen k vybranému souboru; výkres zůstane na zařízení.',
  eyebrow: 'MLightCAD · OneDrive',
  heading: 'OneDrive CAD prohlížeč',
  lead: 'Otevřete DWG/DXF z OneDrive v prohlížeči. Pouze soubory, které vyberete; nic se na naše servery nenahrává.',
  loading: 'Načítání…',
  signInContinue: 'Pro pokračování se přihlaste',
  signInPreview: 'Pro náhled tohoto výkresu se přihlaste',
  signInDemo: 'Pro test náhledu File Handler se přihlaste',
  signInMicrosoft: 'Přihlásit se účtem Microsoft',
  privacyPolicy: 'Zásady ochrany soukromí',
  privacy: 'Soukromí',
  noFile: 'Není vybrán soubor',
  loadingStatus: 'Načítání…',
  chooseFile: 'Vyberte soubor DWG nebo DXF z OneDrive.',
  overlayLoading: 'Načítání souboru z OneDrive…',
  retry: 'Zkusit znovu',
  pickFile: 'Vybrat z OneDrive',
  signOut: 'Odhlásit se',
  downloadError: 'Tento soubor z OneDrive se nepodařilo stáhnout',
  pickerFailed: 'Nepodařilo se otevřít výběr souboru',
  popupBlocked: 'Vyskakovací okno bylo zablokováno. Povolte vyskakovací okna pro tento web a zkuste to znovu.',
  signingIn: 'Přihlašování…',
  openingOneDrive: 'Otevírání OneDrive…',
  authFailed: 'Autorizace Microsoft selhala',
  previewFailed: 'Náhled souboru OneDrive se nezdařil',
  noFileToPreview: 'OneDrive neodeslal soubor k náhledu',
  deepLinkFailed: 'Soubor OneDrive se nepodařilo otevřít',
  demoBoot: 'Hledání DWG nebo DXF v OneDrive…',
  demoNoFile: 'DWG/DXF se nenašel automaticky. Vyberte soubor a pokračujte v testu File Handler.',
  demoFailed: 'Nepodařilo se spustit ukázku File Handler',
  configMissing:
    'Chybí přihlašovací údaje Microsoft. Pro místní vývoj zkopírujte <code>env.example</code> do <code>.env.local</code> a nastavte <code>VITE_MSAL_CLIENT_ID</code>. Pro GitHub Pages nastavte tajemství <code>MSAL_CLIENT_ID</code> a znovu nasaďte.'
}

const dictionaries: Record<Locale, Copy> = { en, zh, ja, ko, es, pt, ru, cs }

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value)
}

export function matchLocale(tag: string): Locale | null {
  const lower = tag.toLowerCase().replace(/_/g, '-')
  const primary = lower.split('-')[0] ?? ''
  if (primary === 'zh') return 'zh'
  if (isLocale(primary)) return primary
  return null
}

export function detectSiteLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    /* ignore */
  }

  const htmlLang = document.documentElement.lang
  if (htmlLang) {
    const fromHtml = matchLocale(htmlLang)
    if (fromHtml) return fromHtml
  }

  const candidates = [...(navigator.languages ?? []), navigator.language]
  for (const tag of candidates) {
    if (!tag) continue
    const matched = matchLocale(tag)
    if (matched) return matched
  }
  return 'en'
}

export function t(locale: Locale): Copy {
  return dictionaries[locale]
}

export function embedLocale(locale: Locale): string {
  if (locale === 'zh' || locale === 'cs') return locale
  return 'en'
}

export function subscribeSiteLocale(onChange: (locale: Locale) => void): void {
  const notify = () => onChange(detectSiteLocale())
  window.addEventListener('mlightcad:localechange', notify as EventListener)
  window.addEventListener('storage', event => {
    if (event.key === LOCALE_STORAGE_KEY) notify()
  })
  new MutationObserver(notify).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
  })
}
