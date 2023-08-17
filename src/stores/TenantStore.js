import {flow, makeAutoObservable} from "mobx";
import {ExtractHashFromLink} from "Helpers/Fabric.js";

class TenantStore {
  tenantInfo;

  tenantLatest;
  tenantProduction;
  tenantStaging;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  Initialize = flow(function * () {
    // Get ID of tenant object
    this.tenantInfo = yield this.rootStore.databaseStore.GetDocument({collection: "tenant", document: "info"});

    yield this.RetrieveTenant({environment: "latest"});
    yield this.RetrieveTenant({environment: "production"});
    yield this.RetrieveTenant({environment: "staging"});
  });

  // Get latest info about a tenant for the specified environment, including deployed marketplaces and events
  // No environment means latest tenant object
  RetrieveTenant = flow(function * ({environment="latest"}={}) {
    let tenantHash;
    if(!environment || environment === "latest") {
      tenantHash = yield this.client.LatestVersionHash({objectId: this.tenantInfo.objectId});
    } else {
      tenantHash = ExtractHashFromLink(
        yield this.client.ContentObjectMetadata({
          libraryId: this.rootStore.liveConfig[environment].siteLibraryId,
          objectId: this.rootStore.liveConfig[environment].siteId,
          metadataSubtree: `public/asset_metadata/tenants/${this.tenantInfo.tenantSlug}`,
        })
      );
    }

    if(!tenantHash) { return; }

    const metadata = {
      public: (yield this.client.ContentObjectMetadata({
        versionHash: tenantHash,
        metadataSubtree: "public"
      }))
    };

    const marketplaces = {};
    Object.keys(metadata.public?.asset_metadata?.marketplaces || {}).forEach(marketplaceSlug => {
      const marketplaceHash = ExtractHashFromLink(metadata.public.asset_metadata.marketplaces[marketplaceSlug]);
      marketplaces[this.utils.DecodeVersionHash(marketplaceHash).objectId] = {
        versionHash: marketplaceHash,
        marketplaceSlug
      };
    });

    const sites = {};
    Object.keys(metadata.public?.asset_metadata?.sites || {}).forEach(siteSlug => {
      const siteHash = ExtractHashFromLink(metadata.public.asset_metadata.sites[siteSlug]);
      sites[this.utils.DecodeVersionHash(siteHash).objectId] = {
        versionHash: siteHash,
        siteSlug
      };
    });

    this[`tenant${environment.capitalize()}`] = {
      versionHash: tenantHash,
      metadata,
      marketplaces,
      sites
    };
  });

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

export default TenantStore;
