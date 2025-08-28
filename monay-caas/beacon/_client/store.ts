import Store from "electron-store";

const store = new Store({ fileExtension: "json", name: "B34C0N" });

export const appSettingsStore = new Store({
  fileExtension: "beaconrc.json",
  name: ".main",
});

export default store;
