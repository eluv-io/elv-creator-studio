import {flow, makeAutoObservable, configure} from "mobx";
import {Utils} from "@eluvio/elv-client-js";
import {ElvClient} from "@eluvio/elv-client-js";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import LiveConfig from "@eluvio/elv-client-js/src/walletClient/Configuration";
import {StorageHandler} from "@/helpers/Misc.js";

import UIStore from "@/stores/UIStore.js";
import DatabaseStore from "@/stores/DatabaseStore.js";
import EditStore from "@/stores/EditStore";
import FileBrowserStore from "@/stores/FileBrowserStore.js";
import FabricBrowserStore from "@/stores/FabricBrowserStore.js";
import TenantStore from "@/stores/TenantStore.js";
import MarketplaceStore from "@/stores/MarketplaceStore.js";
import SiteStore from "@/stores/SiteStore.js";
import ItemTemplateStore from "@/stores/ItemTemplateStore.js";

import LocalizationEN from "@/assets/localization/en/en.js";

configure({
  enforceActions: "always",
  disableErrorBoundaries: window.location.hostname === "localhost"
});

class RootStore {
  config;

  loaded = false;

  libraryIds = {};

  client;
  address;
  network;
  signedToken;
  publicToken;
  l10n = LocalizationEN;



  debugLevel = parseInt(StorageHandler.get({type: "local", key: "debug-level"}) || 0);

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
    this.fabricBrowserStore = new FabricBrowserStore(this);
    this.databaseStore = new DatabaseStore(this);
    this.editStore = new EditStore(this);
    this.tenantStore = new TenantStore(this);
    this.marketplaceStore = new MarketplaceStore(this);
    this.siteStore = new SiteStore(this);
    this.itemTemplateStore = new ItemTemplateStore(this);

    this.Initialize();
  }

  get tenantInfo() {
    return StorageHandler.get({type: "local", key: `${this.address}-tenant-info`, json: true, b64: true});
  }

  get tenantId() {
    return this.tenantInfo?.tenantId;
  }

  get utils() {
    return Utils;
  }

  Initialize = flow(function * () {
    this.DebugTimeStart({key: "Root store initialization", level: this.logLevels.DEBUG_LEVEL_INFO});

    this.uiStore.SetLoadingMessage(this.l10n.stores.initialization.loading.initializing);
    this.uiStore.SetLoading(true);

    if(window.top !== window.self) {
      this.client = new FrameClient({timeout: 60});
    } else {
      this.client = yield ElvClient.FromNetworkName({networkName: "demo"});
      const privateKey = StorageHandler.get({type: "local", key: "pk"});
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
    yield this.editStore.Initialize();

    this.uiStore.SetLoading(false);

    this.loaded = true;

    this.DebugTimeEnd({key: "Root store initialization", level: this.logLevels.DEBUG_LEVEL_INFO});
  });

  LibraryId = flow(function * ({objectId, versionHash}) {
    if(!objectId && !versionHash) { return; }

    if(versionHash) {
      objectId = this.utils.DecodeVersionHash(versionHash).objectId;
    }

    if(!this.libraryIds[objectId]) {
      this.libraryIds[objectId] = yield this.client.ContentObjectLibraryId({objectId});
    }

    return this.libraryIds[objectId];
  });

  SetTenantInfo(tenantInfo) {
    StorageHandler.set({type: "local", key: `${this.address}-tenant-info`, value: tenantInfo, json: true, b64: true});
  }

  DebugLog({message, error, level=this.logLevels.DEBUG_LEVEL_INFO}) {
    if(this.debugLevel < level) { return; }

    if(message) {
      // eslint-disable-next-line no-console
      console.warn(message);
    }

    if(error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  DebugTimeStart({key, level=this.logLevels.DEBUG_LEVEL_INFO}) {
    if(this.debugLevel < level) { return; }

    // eslint-disable-next-line no-console
    console.time(key);
  }

  DebugTimeEnd({key, level=this.logLevels.DEBUG_LEVEL_INFO}) {
    if(this.debugLevel < level) { return; }

    // eslint-disable-next-line no-console
    console.timeEnd(key);
  }

  SetDebugLevel(level) {
    this.debugLevel = level;

    StorageHandler.set({type: "local", key: "debug-level", value: level?.toString()});
  }
}

export const rootStore = new RootStore();
export const uiStore = rootStore.uiStore;
export const fileBrowserStore = rootStore.fileBrowserStore;
export const fabricBrowserStore = rootStore.fabricBrowserStore;
export const editStore = rootStore.editStore;
export const databaseStore = rootStore.databaseStore;
export const tenantStore = rootStore.tenantStore;
export const marketplaceStore = rootStore.marketplaceStore;
export const siteStore = rootStore.siteStore;
export const itemTemplateStore = rootStore.itemTemplateStore;

window.rootStore = rootStore;
