// import { isElectron } from "#client/utils/platform";
import { isE } from "#client/utils/platform";

const kvStore = {
  get: (key: string) =>
    isE ? window.api.store.get(key) : window.localStorage.getItem(key),
  set: (key: string, value: unknown) =>
    isE
      ? window.api.store.set(key, value)
      : window.localStorage.setItem(key, JSON.stringify(value)),
  has: (k: string) =>
    isE ? window.api.store.has(k) : !!window.localStorage.getItem(k),
};

export enum EPHEMERAL_KEYS {
  PREV_SESSION = "SIGN",
  ONBOARDING = "ONB_CMP",
  NOAUTH_DATA = "NOAU_D",
}
export const getEphData = (key: EPHEMERAL_KEYS) =>
  window.localStorage.getItem(key);
export const setEphData = (key: EPHEMERAL_KEYS, data: unknown) =>
  window.localStorage.setItem(key, JSON.stringify(data));

const modelName = (model: string) =>
  `${import.meta.env.VITE_ROOT_KEY}:${model}`;
export const getModelData = (model: string) => kvStore.get(modelName(model));
export const setModelData = (model: string, data: unknown) =>
  kvStore.set(modelName(model), data);

export default kvStore;
