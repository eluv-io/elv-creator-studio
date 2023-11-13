import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";

class MarketplaceStore {
  allMarketplaces;
  marketplaces = {};

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  LoadMarketplaces = flow(function * () {
    if(this.allMarketplaces?.length > 0) { return; }

    this.allMarketplaces = yield this.rootStore.databaseStore.GetCollection({collection: "marketplaces"});
  });

  LoadMarketplace = flow(function * ({marketplaceId, force=false}) {
    if(this.marketplaces[marketplaceId] && !force) { return; }

    yield this.LoadMarketplaces();

    const info = this.allMarketplaces.find(marketplace => marketplace.objectId === marketplaceId);

    const libraryId = yield this.rootStore.LibraryId({objectId: marketplaceId});

    this.marketplaces[marketplaceId] = {
      ...info,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: marketplaceId,
          metadataSubtree: "public",
          resolveLinks: true,
          linkDepthLimit: 1,
          resolveIgnoreErrors: true,
          resolveIncludeSource: true,
          produceLinkUrls: true
        }))
      }
    };

    this.SetListFieldIds({
      objectId: marketplaceId,
      path: "/public/asset_metadata/info/storefront/sections",
      category: this.rootStore.l10n.pages.marketplace.form.categories.storefront_item_section,
      label: this.rootStore.l10n.pages.marketplace.form.common.id.label,
    });

    this.SetListFieldIds({
      objectId: marketplaceId,
      path: "/public/asset_metadata/info/banners",
      category: this.rootStore.l10n.pages.marketplace.form.categories.storefront_banner,
      label: this.rootStore.l10n.pages.marketplace.form.common.id.label,
    });

    this.SetListFieldIds({
      objectId: marketplaceId,
      path: "/public/asset_metadata/info/footer_links",
      category: this.rootStore.l10n.pages.marketplace.form.categories.storefront_footer_link,
      label: this.rootStore.l10n.pages.marketplace.form.common.id.label,
    });
  });

  Reload = flow(function * ({objectId}) {
    yield this.LoadMarketplace({marketplaceId: objectId, force: true});
  });

  UpdateDatabaseRecord = flow(function * ({objectId}) {
    yield this.rootStore.databaseStore.SaveMarketplace({marketplaceId: objectId});
  });

  DeployedHash({environment, marketplaceId}) {
    return this.rootStore.tenantStore[`tenant${environment.capitalize()}`]?.marketplaces?.[marketplaceId]?.versionHash;
  }

  IsMarketplaceDeployed({environment="latest", marketplaceId}) {
    return !!this.rootStore.tenantStore[`tenant${environment.capitalize()}`]?.marketplaces?.[marketplaceId];
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

AddActions(MarketplaceStore, "marketplaces");

export default MarketplaceStore;

