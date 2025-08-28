import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge } from "electron";

import store from "../store";
import { getFingerprint } from "./fingerprint";

// Custom APIs for renderer
const api = {
  getFingerprint,
  store: {
    get: (key: string) => store.get(key),
    set: (key: string, value: unknown) => store.set(key, value),
    has: (key: string) => store.has(key),
  },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  type ElectronWindow = Window &
    typeof globalThis & { electron: typeof electronAPI; api: typeof api };
  (window as ElectronWindow).electron = electronAPI;
  (window as ElectronWindow).api = api;
}
