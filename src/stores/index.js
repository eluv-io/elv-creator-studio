import {flow, makeAutoObservable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";

import MarketplaceStore from "./MarketplaceStore.js";
import UIStore from "./UIStore.js";
import DatabaseStore from "./DatabaseStore.js";

class RootStore {
  client;
  tenantId;

  constructor() {
    makeAutoObservable(this);

    this.uiStore = new UIStore(this);
    this.databaseStore = new DatabaseStore(this);
    this.marketplaceStore = new MarketplaceStore(this);

    this.Initialize();
  }

  Initialize = flow(function * () {
    this.client = new FrameClient({timeout: 60});

    this.databaseStore.Initialize();
  });

  SetTenantId(tenantId) {
    this.tenantId = tenantId;
  }

  Log({message, level="warn"}) {
    switch(level) {
      case "warn":
        // eslint-disable-next-line no-console
        console.warn(message);
        break;

      case "error":
        // eslint-disable-next-line no-console
        console.error(message);
        break;

      default:
        // eslint-disable-next-line no-console
        console.log(message);
        break;
    }
  }
}

export const rootStore = new RootStore();
export const uiStore = rootStore.uiStore;
export const databaseStore = rootStore.marketplaceStore;
export const marketplaceStore = rootStore.marketplaceStore;

window.rootStore = rootStore;
