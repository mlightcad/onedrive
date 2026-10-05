/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MSAL_CLIENT_ID: string
  readonly VITE_MSAL_TENANT_ID?: string
  readonly VITE_MSAL_REDIRECT_URI?: string
  readonly VITE_MLIGHTCAD_EMBED_URL?: string
  readonly VITE_SITE_CHROME_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
