/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JSON_BIN_API_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_JSON_BIN_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
