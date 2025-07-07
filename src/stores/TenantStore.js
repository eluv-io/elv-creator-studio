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

  get tenantName() {
    return this.latestTenant.metadata?.public?.asset_metadata?.info?.name;
  }

  get latestTenant() {
    return this.tenant[this.tenantObjectId];
  }

  get productionTenantDeployed() {
    return this.latestTenant.versionHash === this.productionTenant?.versionHash;
  }

  get stagingTenantDeployed() {
    return this.latestTenant.versionHash === this.stagingTenant?.versionHash;
  }

  TenantLinkSlugAndHash({links={}, objectId}) {
    for(const slug of Object.keys(links)) {
      const versionHash = ExtractHashFromLink(links[slug]);

      if(versionHash && this.client.utils.DecodeVersionHash(versionHash).objectId === objectId) {
        return { versionHash, slug };
      }
    }

    return {};
  }

  async MediaPropertyStatus() {
    await this.rootStore.mediaPropertyStore.LoadMediaProperties();

    return await Promise.all(
      this.rootStore.mediaPropertyStore.allMediaProperties.map(async mediaProperty => {
        const mediaPropertyHash = await this.client.LatestVersionHash({objectId: mediaProperty.objectId});

        // Prefer name from modified metadata, otherwise load directly
        let name = this.rootStore.mediaPropertyStore.mediaProperties?.[mediaProperty.objectId]?.metadata?.public?.asset_metadata?.info?.branding?.name;
        if(!name) {
          name = (await this.client.ContentObjectMetadata({
            versionHash: mediaPropertyHash,
            metadataSubtree: "public/asset_metadata/info/name",
          })) || mediaProperty.name;
        }

        const info = (await this.client.ContentObjectMetadata({
          versionHash: mediaPropertyHash,
          metadataSubtree: "public/asset_metadata/info",
          select: [
            "slug",
            "media_catalog_links",
            "permission_set_links"
          ]
        })) || {};

        const slug = info.slug;

        const latestLink = this.TenantLinkSlugAndHash({objectId: mediaProperty.objectId, links: tenantStore.latestTenant.metadata.public.asset_metadata.media_properties});
        const productionLink = this.TenantLinkSlugAndHash({objectId: mediaProperty.objectId, links: tenantStore.productionTenant?.metadata.public.asset_metadata.media_properties});
        const stagingLink = this.TenantLinkSlugAndHash({objectId: mediaProperty.objectId, links: tenantStore.stagingTenant?.metadata.public.asset_metadata.media_properties});

        let mediaCatalogsBehind = (
          await Promise.all(
            Object.keys(info.media_catalog_links || {}).map(async mediaCatalogId => {
              const deployedHash = ExtractHashFromLink(info.media_catalog_links[mediaCatalogId]);
              const latestHash = await this.client.LatestVersionHash({objectId: mediaCatalogId});

              return deployedHash !== latestHash;
            })
          )
        ).find(result => result);

        let permissionSetsBehind = (
          await Promise.all(
            Object.keys(info.permission_set_links || {}).map(async permissionSetId => {
              const deployedHash = ExtractHashFromLink(info.permission_set_links[permissionSetId]);
              const latestHash = await this.client.LatestVersionHash({objectId: permissionSetId});

              return deployedHash !== latestHash;
            })
          )
        ).find(result => result);

        return {
          name,
          slug,
          imageUrl: FabricUrl({
            libraryId: mediaProperty.libraryId,
            objectId: mediaProperty.objectId,
            path: "/meta/public/asset_metadata/info/image",
            width: 400
          }),
          libraryId: mediaProperty.libraryId,
          objectId: mediaProperty.objectId,
          mediaPropertyId: mediaProperty.objectId,
          versionHash: mediaPropertyHash,
          mediaPropertyHash,
          latestHash: latestLink.versionHash,
          latestDeployed: latestLink.versionHash === mediaPropertyHash,
          latestSlug: latestLink.slug,
          productionHash: productionLink.versionHash,
          productionDeployed: productionLink.versionHash === mediaPropertyHash,
          productionSlug: productionLink.slug,
          stagingHash: stagingLink.versionHash,
          stagingDeployed: stagingLink.versionHash === mediaPropertyHash,
          stagingSlug: stagingLink.slug,
          mediaCatalogsBehind,
          permissionSetsBehind
        };
      })
    );
  }

  async MarketplaceStatus() {
    await this.rootStore.marketplaceStore.LoadMarketplaces();

    return await Promise.all(
      this.rootStore.marketplaceStore.allMarketplaces.map(async marketplace => {
        const marketplaceHash = await this.client.LatestVersionHash({objectId: marketplace.objectId});

        // Prefer name from modified metadata, otherwise load directly
        let name = this.rootStore.marketplaceStore.marketplaces?.[marketplace.objectId]?.metadata?.public?.asset_metadata?.info?.branding?.name;
        if(!name) {
          name = (await this.client.ContentObjectMetadata({
            versionHash: marketplaceHash,
            metadataSubtree: "public/asset_metadata/info/branding/name",
          })) || marketplace.brandedName;
        }

        let slug = await this.client.ContentObjectMetadata({
          versionHash: marketplaceHash,
          metadataSubtree: "public/asset_metadata/slug"
        });

        const latestLink = this.TenantLinkSlugAndHash({objectId: marketplace.objectId, links: tenantStore.latestTenant.metadata.public.asset_metadata.marketplaces});
        const productionLink = this.TenantLinkSlugAndHash({objectId: marketplace.objectId, links: tenantStore.productionTenant?.metadata.public.asset_metadata.marketplaces});
        const stagingLink = this.TenantLinkSlugAndHash({objectId: marketplace.objectId, links: tenantStore.stagingTenant?.metadata.public.asset_metadata.marketplaces});

        return {
          name,
          slug,
          imageUrl: FabricUrl({
            libraryId: marketplace.libraryId,
            objectId: marketplace.objectId,
            path: "/meta/public/asset_metadata/info/branding/card_banner_front",
            width: 400
          }),
          libraryId: marketplace.libraryId,
          objectId: marketplace.objectId,
          marketplaceId: marketplace.objectId,
          marketplaceHash,
          versionHash: marketplaceHash,
          latestHash: latestLink.versionHash,
          latestDeployed: latestLink.versionHash === marketplaceHash,
          latestSlug: latestLink.slug,
          productionHash: productionLink.versionHash,
          productionDeployed: productionLink.versionHash === marketplaceHash,
          productionSlug: productionLink.slug,
          stagingHash: stagingLink.versionHash,
          stagingDeployed: stagingLink.versionHash === marketplaceHash,
          stagingSlug: stagingLink.slug
        };
      })
    );
  }

  async SiteStatus() {
    await this.rootStore.siteStore.LoadSites();

    return await Promise.all(
      this.rootStore.siteStore.allSites.map(async site => {
        const siteHash = await this.client.LatestVersionHash({objectId: site.objectId});

        // Prefer name from modified metadata, otherwise load directly
        let name = this.rootStore.siteStore.sites?.[site.objectId]?.metadata?.public?.asset_metadata?.info?.name;
        if(!name) {
          name = (await this.client.ContentObjectMetadata({
            versionHash: siteHash,
            metadataSubtree: "public/asset_metadata/info/name",
          })) || site.name;
        }

        const latestLink = this.TenantLinkSlugAndHash({objectId: site.objectId, links: tenantStore.latestTenant.metadata.public.asset_metadata.sites});
        const productionLink = this.TenantLinkSlugAndHash({objectId: site.objectId, links: tenantStore.productionTenant?.metadata.public.asset_metadata.sites});
        const stagingLink = this.TenantLinkSlugAndHash({objectId: site.objectId, links: tenantStore.stagingTenant?.metadata.public.asset_metadata.sites});


        return {
          name,
          slug: site.siteSlug,
          imageUrl: FabricUrl({
            libraryId: site.libraryId,
            objectId: site.objectId,
            path: "/meta/public/asset_metadata/info/event_images/hero_background",
            width: 400
          }),
          libraryId: site.libraryId,
          objectId: site.objectId,
          siteId: site.objectId,
          siteHash,
          versionHash: siteHash,
          latestHash: latestLink.versionHash,
          latestDeployed: latestLink.versionHash === siteHash,
          latestSlug: latestLink.slug,
          productionHash: productionLink.versionHash,
          productionDeployed: productionLink.versionHash === siteHash,
          productionSlug: productionLink.slug,
          stagingHash: stagingLink.versionHash,
          stagingDeployed: stagingLink.versionHash === siteHash,
          stagingSlug: stagingLink.slug
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
        metadataSubtree: "public",
        produceLinkUrls: true
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

  Reload = flow(function * () {
    yield this.RetrieveTenant({environment: "latest"});
    yield this.RetrieveTenant({environment: "production"});
    yield this.RetrieveTenant({environment: "staging"});
  });

  UpdateLink = flow(function * ({type, name, slug, versionHash}) {
    const writeToken = yield this.rootStore.editStore.InitializeWrite({objectId: this.tenantObjectId});

    const objectId = this.client.utils.DecodeVersionHash(versionHash).objectId;

    let path, metadataPath, store;
    if(type === "site") {
      path = "/public/asset_metadata/sites";
      metadataPath = "/meta/public/asset_metadata";
      store = this.rootStore.siteStore;
    } else if(type === "marketplace") {
      path = "/public/asset_metadata/marketplaces";
      metadataPath = "/meta/public/asset_metadata";
      store = this.rootStore.marketplaceStore;
    } else if(type === "mediaProperty") {
      path = "/public/asset_metadata/media_properties";
      metadataPath = "/meta/public/asset_metadata/info";
      store = this.rootStore.mediaPropertyStore;
    }

    // Some things may need updating before deploying
    versionHash = (yield (store.BeforeDeploy && store.BeforeDeploy({objectId}))) || versionHash;

    const writeParams = {
      libraryId: yield this.rootStore.LibraryId({objectId: this.tenantObjectId}),
      objectId: this.tenantObjectId,
      writeToken
    };

    // Remove existing link(s)
    const currentMetadata = (yield this.client.ContentObjectMetadata({
      versionHash: yield this.client.LatestVersionHash({objectId: this.tenantObjectId}),
      metadataSubtree: path
    })) || {};

    yield Promise.all(
      Object.keys(currentMetadata).map(async key => {
        const hash = ExtractHashFromLink(currentMetadata[key]);

        if(hash && this.client.utils.DecodeVersionHash(hash).objectId === objectId) {
          await this.client.DeleteMetadata({...writeParams, metadataSubtree: UrlJoin(path, key)});
        }
      })
    );

    yield this.client.ReplaceMetadata({
      ...writeParams,
      metadataSubtree: UrlJoin(path, slug || objectId),
      metadata: {
        ".": {
          "auto_update": {
            "tag": "latest"
          },
        },
        "/": UrlJoin("/qfab", versionHash, metadataPath),
      }
    });

    yield this.rootStore.editStore.Finalize({objectId: this.tenantObjectId, commitMessage: `Update link to ${name || slug}`});

    yield new Promise(resolve => setTimeout(resolve, 2000));

    yield this.Reload();
  });

  RemoveLink = flow(function * ({type, name, slug, versionHash}) {
    yield new Promise(resolve => setTimeout(resolve, 5000));

    const writeToken = yield this.rootStore.editStore.InitializeWrite({objectId: this.tenantObjectId});

    const objectId = this.client.utils.DecodeVersionHash(versionHash).objectId;

    let path;
    if(type === "site") {
      path = "/public/asset_metadata/sites";
    } else if(type === "marketplace") {
      path = "/public/asset_metadata/marketplaces";
    } else if(type === "mediaProperty") {
      path = "/public/asset_metadata/media_properties";
    }

    const writeParams = {
      libraryId: yield this.rootStore.LibraryId({objectId: this.tenantObjectId}),
      objectId: this.tenantObjectId,
      writeToken
    };

    yield this.client.DeleteMetadata({...writeParams, metadataSubtree: UrlJoin(path, objectId)});

    if(slug) {
      yield this.client.DeleteMetadata({...writeParams, metadataSubtree: UrlJoin(path, slug)});
    }

    yield this.rootStore.editStore.Finalize({objectId: this.tenantObjectId, commitMessage: `Remove link to ${name || slug}`});

    yield new Promise(resolve => setTimeout(resolve, 2000));

    yield this.Reload();
  });

  DeployTenant = flow(function * ({mode}) {
    yield this.client.walletClient.DeployTenant({
      tenantId: this.rootStore.tenantId,
      tenantSlug: this.tenantSlug,
      environment: mode === "staging" ? "staging" : "production"
    });

    yield new Promise(resolve => setTimeout(resolve, 5000));

    this.ClearCaches({mode});

    yield this.Reload();
  });

  ClearCaches = flow(function * ({mode}) {
    yield this.rootStore.mediaPropertyStore.LoadMediaProperties(true);

    const propertyInfo = yield Promise.all(
      this.rootStore.mediaPropertyStore.allMediaProperties.map(async property =>
        (this.rootStore.mediaPropertyStore.mediaProperties?.[property.objectId]
          ?.metadata?.public?.asset_metadata?.info) ||
          await this.client.ContentObjectMetadata({
            libraryId: property.libraryId,
            objectId: property.objectId,
            metadataSubtree: "public/asset_metadata/info",
            select: [
              "slug",
              "domain"
            ]
          })
      )
    );

    let urls = [];
    if(this.rootStore.network === "main") {
      if(mode === "staging") {
        urls = [
          "https://wallet.preview.contentfabric.io",
          // Secondary custom domains
          ...(propertyInfo.map(info => (info?.domain?.secondary_custom_domains || [])).flat())
        ];
      } else {
        urls = [
          "https://wallet.contentfabric.io",
          // All custom domains
          ...(propertyInfo.map(info => info?.domain?.custom_domain)),
          ...(propertyInfo.map(info => (info?.domain?.secondary_custom_domains || [])).flat())
        ];
      }
    } else {
      urls = [
        "https://wallet.demov3.contentfabric.io",
        // All custom domains
        ...(propertyInfo.map(info => info?.domain?.custom_domain)),
        ...(propertyInfo.map(info => (info?.domain?.secondary_custom_domains || [])).flat())
      ];
    }

    urls = urls
      .map(u => (u || "").trim())
      .filter(u => u)
      .map(u => u.startsWith("http") ? u : `https://${u}`)
      .filter((x, i, a) => a.indexOf(x) == i);

    const propertySlugs = [
      ...(propertyInfo
        .map(property => property.slug)
        .filter(s => s)
      ),
      ...this.rootStore.mediaPropertyStore.allMediaProperties.map(property => property.mediaPropertySlug)
    ]
      .filter((x, i, a) => a.indexOf(x) == i);

    yield Promise.all(
      urls.map(async url => {
        // Clear URL
        await this.client.walletClient.PurgeUrl({
          tenantId: this.rootStore.tenantId,
          url
        });

        // Clear all property slugs for this url
        await Promise.all(
          propertySlugs.map(async slug => {
            try {
              const propertyUrl = new URL(url);
              propertyUrl.pathname = slug;

              await this.client.walletClient.PurgeUrl({
                tenantId: this.rootStore.tenantId,
                url: propertyUrl
              });
            } catch(error) {
              this.DebugLog({
                message: `Failed to purge url ${url} ${slug}`,
                error,
                level: this.logLevels.DEBUG_LEVEL_ERROR
              });
            }
          })
        );
      })
    );
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
