import { createContext, useContext } from "react";

import { computed } from "mobx";
import {
  Model,
  model,
  prop,
  registerRootStore,
  setGlobalConfig,
} from "mobx-keystone";

import {
  GlobalStateStore,
  createGlobalStateStore,
} from "#client/features/g-state";

import { setupDevTools } from "../_devtools";
import api from "../api";
import AuthStore, { createAuthStore } from "../features/auth/stores/auth";
import BeaconStore, { createBeaconStore } from "./_beacon";

setGlobalConfig({
  showDuplicateModelNameWarnings: import.meta.env.DEV,
});

@model("Root")
export class RootStore extends Model({
  auth: prop<AuthStore>(() => createAuthStore()),
  global: prop<GlobalStateStore>(() => createGlobalStateStore()),
  beacon: prop<BeaconStore | undefined>(),
}) {
  @computed
  get signedIn() {
    return this.auth.signedIn;
  }

  protected onAttachedToRootStore(rootStore: RootStore): void | (() => void) {
    if (this.signedIn) {
      this.beacon = createBeaconStore();
    }
  }
}

export const createRootStore = () => {
  const rootStore = registerRootStore(new RootStore({}));

  setupDevTools(rootStore);

  return rootStore;
};

export const hydrateRootStore = () => {
  api.hydrate.query().then((res) => {
    if (res) {
      const { organization } = res;
    }
  });
};

const RootStoreContext = createContext<RootStore | null>(null);
export const RootProvider = RootStoreContext.Provider;
export const useRootStore = () => useContext(RootStoreContext)!;
