import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "./helpers/Actions.js";
import {GenerateUUID} from "../helpers/Misc.js";

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

    const libraryId = yield this.rootStore.LibraryId({objectId: marketplaceId});

    const marketplace = {
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

    // Ensure IDs are set for list fields
    if(marketplace.metadata.public?.asset_metadata?.info?.storefront?.sections) {
      marketplace.metadata.public.asset_metadata.info.storefront.sections =
        marketplace.metadata.public.asset_metadata.info.storefront.sections.map(
          section => ({ ...section, id: section.id || GenerateUUID() })
        );
    }
    if(marketplace.metadata.public?.asset_metadata?.info?.banners) {
      marketplace.metadata.public.asset_metadata.info.banners =
        marketplace.metadata.public.asset_metadata.info.banners.map(
          banner => ({ ...banner, id: banner.id || GenerateUUID() })
        );
    }
    if(marketplace.metadata.public?.asset_metadata?.info?.footer_links) {
      marketplace.metadata.public.asset_metadata.info.footer_links =
        marketplace.metadata.public.asset_metadata.info.footer_links.map(
          footerLink => ({ ...footerLink, id: footerLink.id || GenerateUUID() })
        );
    }

    this.marketplaces[marketplaceId] = marketplace;
  });

  Load = flow(function * ({objectId}) {
    yield this.LoadMarketplace({marketplaceId: objectId, force: true});
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

