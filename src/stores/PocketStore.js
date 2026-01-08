import {flow, makeAutoObservable, toJS} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";
import { PocketSpec } from "@/specs/PocketSpecs.js";
import Clone from "lodash/clone";
import {Slugify} from "@/components/common/Validation.jsx";
import UrlJoin from "url-join";

class PocketStore {
  allPockets;
  pockets = {};

  ID_PREFIXES = {
    "pocket": "pktv"
  };

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  LoadPockets = flow(function * (force=false) {
    if(this.allPockets && !force) { return; }

    this.allPockets = yield this.rootStore.databaseStore.GetCollection({collection: "pockets"});
  });

  LoadPocket = flow(function * ({pocketId, force=false}) {
    yield this.LoadPockets();

    yield this.LoadResource({
      key: "pocket",
      id: pocketId,
      force,
      Load: async () => {
        await this.LoadPockets();

        const info = this.allPockets.find(pocket => pocket.objectId === pocketId);

        const libraryId = await this.rootStore.LibraryId({objectId: pocketId});

        await this.rootStore.mediaCatalogStore.LoadMediaCatalogs();
        await this.rootStore.marketplaceStore.LoadMarketplaces();
        await this.rootStore.permissionSetStore.LoadPermissionSets();

        await Promise.all(
          this.rootStore.mediaCatalogStore.allMediaCatalogs.map(async ({objectId}) =>
            await this.rootStore.mediaCatalogStore.LoadMediaCatalog({mediaCatalogId: objectId})
          )
        );

        await Promise.all(
          this.rootStore.permissionSetStore.allPermissionSets.map(async ({objectId}) =>
            await this.rootStore.permissionSetStore.LoadPermissionSet({permissionSetId: objectId})
          )
        );

        this.pockets[pocketId] = {
          ...info,
          metadata: {
            public: (await this.client.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: pocketId,
              metadataSubtree: "public",
              produceLinkUrls: true
            }))
          }
        };
      }
    });
  });

  GetMediaItem({mediaItemId}) {
    const mediaCatalogIds = this.rootStore.mediaCatalogStore.allMediaCatalogs.map(mediaCatalog => mediaCatalog.objectId);

    for(const mediaCatalogId of mediaCatalogIds) {
      const mediaCatalog = this.rootStore.mediaCatalogStore.mediaCatalogs[mediaCatalogId]?.metadata.public.asset_metadata.info;

      if(!mediaCatalog) { continue; }

      const mediaItem = (
        mediaCatalog?.media?.[mediaItemId] ||
        mediaCatalog?.media_lists?.[mediaItemId] ||
        mediaCatalog?.media_collections?.[mediaItemId]
      );

      if(mediaItem) {
        return {
          mediaCatalogId,
          ...mediaItem
        };
      }
    }
  }

  GetPocketTags({pocketId}) {
    const associatedCatalogIds = this.pockets[pocketId]?.metadata.public.asset_metadata.info.media_catalogs || [];

    return associatedCatalogIds.map(mediaCatalogId =>
      this.rootStore.mediaCatalogStore.mediaCatalogs[mediaCatalogId]?.metadata.public.asset_metadata.info.tags || []
    )
      .flat();
  }

  GetPocketAttributes({pocketId}) {
    const associatedCatalogIds = this.pockets[pocketId]?.metadata.public.asset_metadata.info.media_catalogs || [];

    let attributes = {};
    associatedCatalogIds.map(mediaCatalogId =>
      Object.keys(this.rootStore.mediaCatalogStore.mediaCatalogs[mediaCatalogId]?.metadata.public.asset_metadata.info.attributes || {})
        .forEach(attributeId =>
          attributes[attributeId] = {
            ...this.rootStore.mediaCatalogStore.mediaCatalogs[mediaCatalogId].metadata.public.asset_metadata.info.attributes[attributeId]
          }
        )
    );

    return attributes;
  }

  GetAutomaticGroupContent({pocketId, tabId, groupId}) {
    const pocket = this.pockets[pocketId].metadata.public.asset_metadata.info;

    if(!pocket) { return []; }

    const tabIndex = pocket.sidebar_config?.tabs?.findIndex(tab => tab.id === tabId);
    const tab = pocket.sidebar_config?.tabs?.[tabIndex];

    if(!tab) { return []; }

    const groupIndex = tab.groups.findIndex(group => group.id === groupId);
    const group = tab.groups[groupIndex];

    if(!group) { return []; }

    let mediaCatalogs = group.select.media_catalog ? [group.select.media_catalog] : pocket.media_catalogs;
    return (
      mediaCatalogs.map(mediaCatalogId =>
        this.rootStore.mediaCatalogStore.GetFilteredContent({
          mediaCatalogId,
          select: {
            ...group.select,
            content_type: "media"
          },
        })
      )
        .flat()
        .sort((a, b) => {
          let titleComparison = (a.catalog_title || a.title) < (b.catalog_title || b.title) ? -1 : 1;
          let scheduleComparison = 0;
          let timeComparison = 0;

          // For live comparison, regardless of direction we want live content to show first, followed by vod content
          if(a.live_video) {
            if(b.live_video) {
              timeComparison =
                a.start_time === b.start_time ? titleComparison :
                  a.start_time < b.start_time ? -1 : 1;
            } else {
              timeComparison = -1;
              scheduleComparison = -1;
            }
          } else if(b.live_video) {
            scheduleComparison = 1;
            timeComparison = 1;
          }

          switch(group.select.sort_order) {
            case "title_asc":
              return titleComparison;
            case "title_desc":
              return -1 * titleComparison;
            case "time_desc":
              return scheduleComparison || (-1 * timeComparison) || titleComparison;
            // "time_asc" is the default case
            default:
              return scheduleComparison || timeComparison || titleComparison;
          }
        })
        .filter(result => result)
    );
  }

  CreatePocket = flow(function * ({name="New Pocket TV Property", slug}) {
    const libraryId = this.rootStore.tenantInfo.propertiesLibraryId;
    const response = yield this.client.CreateAndFinalizeContentObject({
      libraryId,
      options: {
        type: this.rootStore.typeInfo.pocket
      },
      callback: async ({objectId, writeToken}) => {
        slug = slug || Slugify(name);

        let spec = Clone(PocketSpec);

        spec.version = "1.0.0";

        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadata: {
            public: {
              name: `Pocket TV Property - ${name}`,
              asset_metadata: {
                slug,
                info: {
                  ...spec,
                  id: objectId,
                  name,
                  slug,
                  meta_tags: {
                    site_name: name,
                    title: name,
                    description: ""
                  }
                }
              }
            }
          }
        });
      }
    });

    const objectId = response.id;

    yield this.UpdateDatabaseRecord({objectId});
    yield this.LoadPockets(true);
    yield this.LoadPocket({pocketId: objectId, force: true});

    yield this.client.EditAndFinalizeContentObject({
      libraryId,
      objectId,
      callback: async ({writeToken}) => {
        await this.Save({libraryId, objectId, writeToken});
      }
    });

    yield this.client.SetPermission({objectId, permission: "public"});
    yield this.rootStore.databaseStore.AddGroupPermissions({objectId});

    yield this.UpdateDatabaseRecord({objectId});
    yield this.LoadPockets(true);
    yield this.LoadPocket({pocketId: objectId, force: true});

    return objectId;
  });

  Reload = flow(function * ({objectId}) {
    yield this.LoadPocket({pocketId: objectId, force: true});
  });

  Postprocess = flow(function * ({libraryId, objectId, writeToken}) {
    // TODO: Build
    let pocket = yield this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "/public/asset_metadata/info"
    });

    // Get permission sets
    const permissionSetIds = (yield Promise.all(
      pocket.media_catalogs.map(async mediaCatalogId => {
        await this.rootStore.mediaCatalogStore.LoadMediaCatalog({mediaCatalogId});

        return this.rootStore.mediaCatalogStore.mediaCatalogs[mediaCatalogId]
          ?.metadata?.public?.asset_metadata?.info?.permission_sets || [];
      })
    ))
      .flat()
      .filter((v, i, a) => a.indexOf(v) === i);

    yield this.client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "/public/asset_metadata/info/permission_sets",
      metadata: permissionSetIds
    });

    // Set last updated time
    yield this.client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "/public/asset_metadata/info/meta_tags/updated_at",
      metadata: new Date().toISOString()
    });

    try {
      yield this.rootStore.tenantStore.RetrieveTenant({environment: "latest"});
      yield this.client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "/public/asset_metadata/info/tenant",
        metadata: {
          tenant_id: this.rootStore.tenantStore.tenantObjectId,
          tenant_name: this.rootStore.tenantStore.tenantName,
          tenant_slug: this.rootStore.tenantStore.tenantSlug
        }
      });
    } catch(error) {
      this.DebugLog({
        error,
        level: this.logLevels.DEBUG_LEVEL_ERROR
      });
    }
  });

  BeforeDeploy = flow(function * ({objectId}) {
    yield this.LoadPocket({pocketId: objectId, force: true});

    let modified = false;
    const catalogs = this.pockets[objectId].metadata.public.asset_metadata.info.media_catalogs || [];

    let catalogLinks = {};
    yield Promise.all(catalogs.map(async catalogId => {
      const catalogHash = await this.client.LatestVersionHash({objectId: catalogId});

      catalogLinks[catalogId] = {
        "/": UrlJoin("/qfab", catalogHash, "meta", "public", "asset_metadata", "info")
      };
    }));

    // Determine if any links changed
    const oldCatalogLinks = this.pockets[objectId].metadata.public.asset_metadata.info.media_catalog_links || {};

    modified = JSON.stringify(Object.keys(catalogLinks).sort()) !== JSON.stringify(Object.keys(oldCatalogLinks).sort());

    if(!modified) {
      Object.keys(catalogLinks).forEach(catalogId => {
        if(catalogLinks[catalogId]?.["/"] !== oldCatalogLinks[catalogId]?.["/"]) {
          modified = true;
        }
      });
    }

    const permissionSets = this.pockets[objectId].metadata.public.asset_metadata.info.permission_sets || [];
    let permissionSetLinks = {};
    yield Promise.all(permissionSets.map(async permissionSetId => {
      const permissionSetHash = await this.client.LatestVersionHash({objectId: permissionSetId});

      permissionSetLinks[permissionSetId] = {
        "/": UrlJoin("/qfab", permissionSetHash, "meta", "public", "asset_metadata", "info")
      };
    }));

    if(!modified) {
      const oldPermissionSetLinks = this.pockets[objectId].metadata.public.asset_metadata.info.permission_set_links || {};

      modified = JSON.stringify(Object.keys(permissionSetLinks).sort()) !== JSON.stringify(Object.keys(oldPermissionSetLinks).sort());

      if(!modified) {
        Object.keys(permissionSetLinks).forEach(permissionSetId => {
          if(permissionSetLinks[permissionSetId]?.["/"] !== oldPermissionSetLinks[permissionSetId]?.["/"]) {
            modified = true;
          }
        });
      }
    }

    if(!modified) {
      return;
    }

    const writeToken = yield this.rootStore.editStore.InitializeWrite({objectId});

    const writeParams = {
      libraryId: yield this.rootStore.LibraryId({objectId}),
      objectId: objectId,
      writeToken
    };

    yield this.client.ReplaceMetadata({
      ...writeParams,
      metadataSubtree: "/public/asset_metadata/info/media_catalog_links",
      metadata: { ...toJS(catalogLinks) }
    });

    yield this.client.ReplaceMetadata({
      ...writeParams,
      metadataSubtree: "/public/asset_metadata/info/permission_set_links",
      metadata: { ...toJS(permissionSetLinks) }
    });

    yield this.client.ReplaceMetadata({
      ...writeParams,
      metadataSubtree: "/public/asset_metadata/info/meta_tags/updated_at",
      metadata: new Date().toISOString()
    });

    const response = yield this.rootStore.editStore.Finalize({
      objectId,
      commitMessage: "Update media catalog and permission set links"
    });

    return response.hash;
  });

  UpdateDatabaseRecord = flow(function * ({objectId}) {
    yield this.rootStore.databaseStore.SavePocket({pocketId: objectId});
  });

  DeployedHash({environment, pocketId}) {
    return this.rootStore.tenantStore[`tenant${environment.capitalize()}`]?.pockets?.[pocketId]?.versionHash;
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

AddActions(PocketStore, "pockets");

export default PocketStore;

