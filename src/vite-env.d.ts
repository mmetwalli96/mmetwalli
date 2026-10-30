/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_ENDPOINT?: string;
  readonly VITE_ROUTER?: 'browser' | 'hash' | 'memory';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
