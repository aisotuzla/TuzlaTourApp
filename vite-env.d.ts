/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_TONCONNECT_MANIFEST_URL?: string;
  readonly VITE_GEOCODING_API_KEY: string;
  readonly VITE_MAPILLARY_CLIENT_TOKEN: string;
  readonly VITE_VERCEL_BLOB_HERO_WEB?: string;
  readonly VITE_VERCEL_BLOB_HERO_ANDROID?: string;
  readonly VITE_GEOAPIFY_ROUTING_API: string;
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
