/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECT_NAME: string;
  readonly VITE_MAPBOX_KEY: string;
  readonly VITE_GOOGLEMAP_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
