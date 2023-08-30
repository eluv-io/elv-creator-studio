import {flow, makeAutoObservable} from "mobx";
import UrlJoin from "url-join";
import {ExtractHashFromLink, FabricUrl} from "@/helpers/Fabric.js";
import {AddActions} from "@/stores/helpers/Actions.js";
import {tenantStore} from "./index.js";

class TenantStore {
  tenant = {};
  tenantInfo;

  productionTenant;
  stagingTenant;

  get tenantObjectId() {
    return this.tenantInfo.objectId;
  }

  get tenantSlug() {
    return this.latestTenant.metadata?.public?.asset_metadata?.slug;
  }

  get latestTenant() {
    return this.tenant[this.tenantObjectId];
  }

  get productionTenantDeployed() {
    return this.latestTenant.versionHash === this.productionTenant.versionHash;
  }

  get stagingTenantDeployed() {
    return this.latestTenant.versionHash === this.stagingTenant.versionHash;
  }

  async MarketplaceStatus() {
    await this.rootStore.marketplaceStore.LoadMarketplaces();

    return await Promise.all(
      this.rootStore.marketplaceStore.allMarketplaces.map(async marketplace => {
        const marketplaceHash = await this.client.LatestVersionHash({objectId: marketplace.objectId});

        // Prefer name from modified metadata, otherwise load directly
        let name = this.rootStore.marketplaceStore.marketplaces?.[marketplace.objectId]?.metadata?.public?.asset_metadata?.info?.branding?.name;
        if(!name) {
          name = await this.client.ContentObjectMetadata({
            versionHash: marketplaceHash,
            metadataSubtree: "public/asset_metadata/info/branding/name",
            select: [
              "slug",
              "info/branding/name"
            ],
            remove: [
              "info/branding/custom_css"
            ]
          });
        }

        const latestHash = ExtractHashFromLink(tenantStore.latestTenant.metadata.public.asset_metadata.marketplaces[marketplace.marketplaceSlug]);
        const productionHash = ExtractHashFromLink(tenantStore.productionTenant.metadata.public.asset_metadata.marketplaces[marketplace.marketplaceSlug]);
        const stagingHash = ExtractHashFromLink(tenantStore.stagingTenant.metadata.public.asset_metadata.marketplaces[marketplace.marketplaceSlug]);

        return {
          name,
          slug: marketplace.marketplaceSlug,
          imageUrl: FabricUrl({
            libraryId: marketplace.libraryId,
            objectId: marketplace.objectId,
            path: "/meta/public/asset_metadata/info/branding/card_banner_front"
          }),
          libraryId: marketplace.libraryId,
          marketplaceId: marketplace.objectId,
          marketplaceHash,
          latestHash,
          latestDeployed: latestHash === marketplaceHash,
          productionHash,
          productionDeployed: productionHash === marketplaceHash,
          stagingHash,
          stagingDeployed: stagingHash === marketplaceHash
        };
      })
    );
  }

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
      tenantHash = yield this.client.LatestVersionHash({objectId: this.tenantObjectId});
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

    const tenant = {
      libraryId: yield this.rootStore.LibraryId({objectId: this.tenantObjectId}),
      versionHash: tenantHash,
      metadata,
      marketplaces,
      sites
    };

    if(environment === "latest") {
      this.tenant[this.tenantObjectId] = tenant;
    } else {
      this[`${environment.toLowerCase()}Tenant`] = tenant;
    }
  });

  Load = flow(function * () {
    yield this.RetrieveTenant({environment: "latest"});
    yield this.RetrieveTenant({environment: "production"});
    yield this.RetrieveTenant({environment: "staging"});
  });

  UpdateMarketplaceLink = flow(function * ({name, slug, versionHash}) {
    yield new Promise(resolve => setTimeout(resolve, 5000));

    const writeToken = yield this.rootStore.editStore.InitializeWrite({objectId: this.tenantObjectId});

    yield this.client.ReplaceMetadata({
      libraryId: yield this.rootStore.LibraryId({objectId: this.tenantObjectId}),
      objectId: this.tenantObjectId,
      writeToken,
      metadataSubtree: UrlJoin("/public/asset_metadata/marketplaces", slug),
      metadata: {
        ".": {
          "auto_update": {
            "tag": "latest"
          },
        },
        "/": UrlJoin("/qfab", versionHash, "/meta/public/asset_metadata"),
      }
    });

    yield this.rootStore.editStore.Finalize({objectId: this.tenantObjectId, commitMessage: `Update link to ${name || slug}`});

    yield new Promise(resolve => setTimeout(resolve, 2000));

    yield this.Load();
  });

  RemoveMarketplaceLink = flow(function * ({name, slug}) {
    yield new Promise(resolve => setTimeout(resolve, 5000));

    const writeToken = yield this.rootStore.editStore.InitializeWrite({objectId: this.tenantObjectId});

    yield this.client.DeleteMetadata({
      libraryId: yield this.rootStore.LibraryId({objectId: this.tenantObjectId}),
      objectId: this.tenantObjectId,
      writeToken,
      metadataSubtree: UrlJoin("/public/asset_metadata/marketplaces", slug),
    });

    yield this.rootStore.editStore.Finalize({objectId: this.tenantObjectId, commitMessage: `Update link to ${name || slug}`});

    yield new Promise(resolve => setTimeout(resolve, 2000));

    yield this.Load();
  });

  DeployTenant = flow(function * () {
    const body = { content_hash: this.latestTenant.versionHash, ts: Date.now() };
    const token = yield this.client.Sign(JSON.stringify(body));
    yield this.client.authClient.MakeAuthServiceRequest({
      path: UrlJoin("as", "tnt", "config", this.rootStore.tenantId, "metadata"),
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    yield new Promise(resolve => setTimeout(resolve, 5000));

    yield this.Load();
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

AddActions(TenantStore, "tenant");

export default TenantStore;
