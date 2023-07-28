import {flow, makeAutoObservable} from "mobx";
import {Capitalize} from "Helpers/Misc.js";

class MarketplaceStore {
  allMarketplaces = [];
  marketplaces = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  LoadMarketplaces = flow(function * () {
    if(this.allMarketplaces.length > 0) { return; }

    this.allMarketplaces = yield this.rootStore.databaseStore.GetCollection({collection: "marketplaces"});
  });

  LoadMarketplace = flow(function * ({marketplaceId, force=false}) {
    if(this.marketplaces[marketplaceId] && !force) { return; }

    yield this.LoadMarketplaces();

    const info = this.allMarketplaces.find(marketplace => marketplace.objectId === marketplaceId);

    const libraryId = yield this.client.ContentObjectLibraryId({objectId: marketplaceId});

    this.marketplaces[marketplaceId] = {
      ...info,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: marketplaceId,
          metadataSubtree: "public"
        }))
      }
    };
  });

  DeployedHash({environment, marketplaceId}) {
    return this.rootStore.tenantStore[`tenant${Capitalize(environment)}`]?.marketplaces?.[marketplaceId]?.versionHash;
  }

  IsMarketplaceDeployed({environment="latest", marketplaceId}) {
    return !!this.rootStore.tenantStore[`tenant${Capitalize(environment)}`]?.marketplaces?.[marketplaceId];
  }

  IsLatestMarketplaceDeployed({environment, marketplaceId}) {
    return this.DeployedHash({environment: "latest", marketplaceId}) === this.DeployedHash({environment, marketplaceId});
  }


  get client() {
    return this.rootStore.client;
  }

  get utils() {
    return this.rootStore.utils;
  }

  get l10n() {
    return this.rootStore.l10n;
  }

  get logLevels() {
    return this.rootStore.logLevels;
  }

  DebugLog() {
    this.rootStore.DebugLog(...arguments);
  }
}

export default MarketplaceStore;

