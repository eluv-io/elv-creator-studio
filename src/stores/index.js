import {flow, makeAutoObservable, configure} from "mobx";
import {ElvWalletClient, Utils} from "@eluvio/elv-client-js";
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
import MediaCatalogStore from "@/stores/MediaCatalogStore.js";
import MediaPropertyStore from "@/stores/MediaPropertyStore.js";

import LocalizationEN from "@/assets/localization/en/en.js";
import PermissionSetStore from "@/stores/PermissionSetStore.js";
import UrlJoin from "url-join";

configure({
  enforceActions: "always",
  disableErrorBoundaries: window.location.hostname === "localhost"
});

class RootStore {
  localhost = window.location.hostname === "localhost";
  loaded = false;

  libraryIds = {};

  client;
  address;
  network;
  liveConfig;
  signedToken;
  publicToken;
  l10n = LocalizationEN;

  tenantId;
  tenantInfo;
  typeInfo;

  versionHashes = {};

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
    this.mediaCatalogStore = new MediaCatalogStore(this);
    this.mediaPropertyStore = new MediaPropertyStore(this);
    this.permissionSetStore = new PermissionSetStore(this);

    this.Initialize();
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
      // eslint-disable-next-line no-undef
      this.client = yield ElvClient.FromConfigurationUrl({configUrl: EluvioConfiguration["config-url"]});
      const privateKey = StorageHandler.get({type: "local", key: "pk"});
      const wallet = this.client.GenerateWallet();
      const signer = wallet.AddAccount({privateKey});
      this.client.SetSigner({signer});

      this.client.walletClient = yield ElvWalletClient.Initialize({
        client: this.client,
        appId: "default",
        network: (yield this.client.NetworkInfo()).name,
        skipMarketplaceLoad: true,
        storeAuthToken: false
      });
    }

    this.address = yield this.client.CurrentAccountAddress();
    this.network = (yield this.client.NetworkInfo()).name;
    this.publicToken = this.utils.B64(JSON.stringify({qspace_id: yield this.client.ContentSpaceId()}));
    this.signedToken = yield this.client.CreateFabricToken();
    this.liveConfig = LiveConfig[this.network];

    this.tenantId = yield this.client.userProfileClient.TenantContractId();

    if(!this.tenantId) {
      this.uiStore.SetLoadingMessage(this.l10n.stores.initialization.errors.tenant_id_missing);

      this.DebugLog({
        error: this.l10n.stores.initialization.errors.tenant_id_missing,
        level: this.logLevels.DEBUG_LEVEL_ERROR
      });

      return;
    }

    yield this.databaseStore.Initialize();
    yield this.tenantStore.Initialize();
    yield this.editStore.Initialize();

    this.tenantInfo = yield this.databaseStore.GetDocument({collection: "tenant", document: "info"});
    this.typeInfo = yield this.databaseStore.GetDocument({collection: "tenant", document: "types"});

    this.uiStore.SetLoading(false);

    this.loaded = true;

    this.DebugTimeEnd({key: "Root store initialization", level: this.logLevels.DEBUG_LEVEL_INFO});

    let lastPath;
    setInterval(() => {
      if(window.location.pathname === lastPath) {
        return;
      }

      lastPath = window.location.pathname;
      this.client?.SendMessage({
        options: {
          operation: "SetFramePath",
          path: UrlJoin("#", window.location.pathname)
        }
      });
    }, 500);
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

  VersionHash = flow(function * ({objectId, versionHash, force}) {
    if(versionHash) {
      objectId = this.utils.DecodeVersionHash(versionHash).objectId;
    }

    if(force || !this.versionHashes[objectId] || Date.now() - this.versionHashes[objectId].retrievedAt > 30000) {
      this.versionHashes[objectId] = {
        versionHash: yield this.client.LatestVersionHash({objectId}),
        retrievedAt: Date.now()
      };
    }

    return this.versionHashes[objectId].versionHash;
  });

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
export const mediaCatalogStore = rootStore.mediaCatalogStore;
export const mediaPropertyStore = rootStore.mediaPropertyStore;
export const permissionSetStore = rootStore.permissionSetStore;

window.rootStore = rootStore;
