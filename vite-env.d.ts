/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_TONCONNECT_MANIFEST_URL?: string;
  readonly VITE_GEOCODING_API_KEY: string;
  readonly VITE_MAPILLARY_CLIENT_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    readonly GEMINI_API_KEY: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
