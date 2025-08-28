import { type Agent, load } from "@fingerprintjs/fingerprintjs";
import { UAParser } from "ua-parser-js";

let fingerprintAgent: Agent;
export const getFingerprintAgent = async () => {
  if (!fingerprintAgent) {
    fingerprintAgent = await load();
  }
  return fingerprintAgent;
};

// https://github.com/cheton/is-electron/blob/master/index.js
// https://github.com/electron/electron/issues/2288
export const isElectron = () => {
  // Renderer process
  if (
    typeof window !== "undefined" &&
    typeof window.process === "object" &&
    window.process.type === "renderer"
  ) {
    return true;
  }

  // Easiest: detect if the extra window objects have been injected via our preload
  if ("electron" in window) {
    return true;
  }

  // Main process
  if (
    typeof process !== "undefined" &&
    typeof process.versions === "object" &&
    !!process.versions.electron
  ) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to false
  if (
    typeof navigator === "object" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.indexOf("Electron") >= 0
  ) {
    return true;
  }

  return false;
};
export const isE = isElectron();

// FIXME: make this less bad. just find and use something off SO that does NOT use navigator.platform. this api is deprecated and can be removed whenever
const getWebOs = () =>
  navigator.userAgent.includes("Mac OS") ? "darwin" : "win";

export const platform = () => {
  if (isElectron()) {
    return window.electron.process.platform;
  }
  return getWebOs;
};

export const ua = () => UAParser(navigator.userAgent);

export const device = () => ua().device;

export const browser = () => ua().browser;

export const os = () => ua().os;

export const deviceInfo = () => ({
  timezone: new Date().getTimezoneOffset().toString(),
  deviceId: window?.api?.fingerprint ?? navigator.userAgent,
  platform: "DESKTOP" as const,
  osVersion: `${os().name} (${os().version})`,
  appVersion: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
});
