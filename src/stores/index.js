import {flow, makeAutoObservable} from "mobx";
import {Utils} from "@eluvio/elv-client-js";
import {ElvClient} from "@eluvio/elv-client-js";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import LiveConfig from "@eluvio/elv-client-js/src/walletClient/Configuration";
import {StorageHandler} from "Helpers/Misc.js";

import UIStore from "./UIStore.js";
import DatabaseStore from "./DatabaseStore.js";
import TenantStore from "./TenantStore.js";
import MarketplaceStore from "./MarketplaceStore.js";

import LocalizationEN from "Assets/localization/en.yml";
import FileBrowserStore from "./FileBrowserStore.js";

class RootStore {
  loaded = false;

  client;
  address;
  network;
  signedToken;
  publicToken;
  l10n = LocalizationEN;



  debugLevel = parseInt(StorageHandler({type: "local", mode: "get", key: "debug-level"}) || 0);

  logLevels = {
    DEBUG_LEVEL_ERROR: 0,
    DEBUG_LEVEL_CRITICAL: 1,
    DEBUG_LEVEL_HIGH: 2,
    DEBUG_LEVEL_MEDIUM: 3,
    DEBUG_LEVEL_LOW: 4,
    DEBUG_LEVEL_INFO: 5
  };

  constructor() {
    makeAutoObservable(this);

    this.uiStore = new UIStore(this);
    this.fileBrowserStore = new FileBrowserStore(this);
    this.databaseStore = new DatabaseStore(this);
    this.tenantStore = new TenantStore(this);
    this.marketplaceStore = new MarketplaceStore(this);

    this.Initialize();
  }

  get tenantInfo() {
    return StorageHandler({type: "local", mode: "get", key: `${this.address}-tenant-info`, json: true, b64: true});
  }

  get tenantId() {
    return this.tenantInfo?.tenantId;
  }

  get utils() {
    return Utils;
  }

  Initialize = flow(function * () {
    this.DebugTimeStart({key: "Root store initialization", level: this.logLevels.DEBUG_LEVEL_INFO});

    this.uiStore.SetLoadingMessage(this.l10n.initialization.loading.initializing);
    this.uiStore.SetLoading(true);

    if(window.top !== window.self) {
      this.client = new FrameClient({timeout: 60});
    } else {
      this.client = yield ElvClient.FromNetworkName({networkName: "demo"});
      const privateKey = StorageHandler({type: "local", mode: "get", key: "pk"});
      const wallet = this.client.GenerateWallet();
      const signer = wallet.AddAccount({privateKey});
      this.client.SetSigner({signer});
    }

    this.address = yield this.client.CurrentAccountAddress();
    this.network = (yield this.client.NetworkInfo()).name;
    this.publicToken = this.utils.B64(JSON.stringify({qspace_id: yield this.client.ContentSpaceId()}));
    this.signedToken = yield this.client.CreateFabricToken();
    this.liveConfig = LiveConfig[this.network];

    yield this.databaseStore.Initialize();
    yield this.tenantStore.Initialize();

    this.uiStore.SetLoading(false);

    this.loaded = true;

    this.DebugTimeEnd({key: "Root store initialization", level: this.logLevels.DEBUG_LEVEL_INFO});
  });

  SetTenantInfo(tenantInfo) {
    StorageHandler({type: "local", mode: "set", key: `${this.address}-tenant-info`, value: tenantInfo, json: true, b64: true});
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

    StorageHandler({type: "local", mode: "set", key: "debug-level", value: level?.toString()});
  }
}

export const rootStore = new RootStore();
export const uiStore = rootStore.uiStore;
export const fileBrowserStore = rootStore.fileBrowserStore;
export const databaseStore = rootStore.marketplaceStore;
export const tenantStore = rootStore.tenantStore;
export const marketplaceStore = rootStore.marketplaceStore;

window.rootStore = rootStore;
