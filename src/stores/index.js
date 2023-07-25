import {flow, makeAutoObservable} from "mobx";
import {Utils} from "@eluvio/elv-client-js";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";

import MarketplaceStore from "./MarketplaceStore.js";
import UIStore from "./UIStore.js";
import DatabaseStore from "./DatabaseStore.js";

import LocalizationEN from "Assets/localization/en.yml";

class RootStore {
  client;
  address;
  l10n = LocalizationEN;
  debugLevel = parseInt(this.StorageHandler({type: "local", mode: "get", key: "debug-level"}) || 0);

  logLevels = {
    DEBUG_LEVEL_ERROR: 0,
    DEBUG_LEVEL_CRITICAL: 1,
    DEBUG_LEVEL_HIGH: 2,
    DEBUG_LEVEL_MEDIUM: 3,
    DEBUG_LEVEL_LOW: 4,
    DEBUG_LEVEL_INFO: 5
  }

  constructor() {
    makeAutoObservable(this);

    this.uiStore = new UIStore(this);
    this.databaseStore = new DatabaseStore(this);
    this.marketplaceStore = new MarketplaceStore(this);

    this.Initialize();
  }

  get tenantInfo() {
    return this.StorageHandler({type: "local", mode: "get", key: `${this.address}-tenant-info`, json: true, b64: true});
  }

  get tenantId() {
    return this.tenantInfo?.tenantId;
  }

  get utils() {
    return Utils;
  }

  Initialize = flow(function * () {
    this.DebugTimeStart({key: "Root store initialization", level: this.logLevels.DEBUG_LEVEL_INFO});

    this.uiStore.SetLoading(true);
    this.uiStore.SetLoadingMessage(this.l10n.initialization.loading.initializing);

    this.client = new FrameClient({timeout: 60});
    this.address = yield this.client.CurrentAccountAddress();

    yield this.databaseStore.Initialize();

    this.uiStore.SetLoading(false);

    this.DebugTimeEnd({key: "Root store initialization", level: this.logLevels.DEBUG_LEVEL_INFO});
  });

  SetTenantInfo(tenantInfo) {
    this.StorageHandler({type: "local", mode: "set", key: `${this.address}-tenant-info`, value: tenantInfo, json: true, b64: true});
  }

  DebugLog({message, level}) {
    if(this.debugLevel < level) { return; }

    // eslint-disable-next-line no-console
    console.warn(message);
  }

  DebugTimeStart({key, level}) {
    if(this.debugLevel < level) { return; }

    // eslint-disable-next-line no-console
    console.time(key);
  }

  DebugTimeEnd({key, level}) {
    if(this.debugLevel < level) { return; }

    // eslint-disable-next-line no-console
    console.timeEnd(key);
  }

  SetDebugLevel(level) {
    this.debugLevel = level;

    this.StorageHandler({type: "local", mode: "set", key: "debug-level", value: level?.toString()});
  }

  StorageHandler({type, mode, key, value, json, b64}) {
    try {
      const storage = type === "session" ? sessionStorage : localStorage;

      if(mode === "remove") {
        storage.removeItem(key);
      } else if(mode === "set") {
        if(json) {
          value = JSON.stringify(value);
        }

        if(b64) {
          value = this.utils.B64(value);
        }

        storage.setItem(key, value);
      } else {
        value = storage.getItem(key);

        if(!value) { return; }

        if(b64) {
          value = this.utils.FromB64(value);
        }

        if(json) {
          value = JSON.parse(value);
        }

        return value;
      }
    } catch(error) {
      this.DebugLog({message: error, level: this.logLevels.DEBUG_LEVEL_INFO});
    }
  }
}

export const rootStore = new RootStore();
export const uiStore = rootStore.uiStore;
export const databaseStore = rootStore.marketplaceStore;
export const marketplaceStore = rootStore.marketplaceStore;

window.rootStore = rootStore;
