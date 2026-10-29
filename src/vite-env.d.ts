/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Form endpoint that accepts a JSON POST (e.g. a Formspree form URL). */
  readonly VITE_CONTACT_ENDPOINT?: string;
  /** "browser" (default), "hash" for static hosts without rewrites, or "memory". */
  readonly VITE_ROUTER?: 'browser' | 'hash' | 'memory';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
