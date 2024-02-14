import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";

class MediaCatalogStore {
  allMediaCatalogs;
  mediaCatalogs = {};

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  CreateMediaCatalog = flow(function * ({name="New Media Catalog"}) {
    const libraryId = this.rootStore.tenantInfo.propertiesLibraryId;
    const {id} = yield this.client.CreateAndFinalizeContentObject({
      libraryId,
      options: {
        type: this.rootStore.typeInfo.mediaCatalog
      },
      callback: async ({objectId, writeToken}) => {
        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadata: {
            public: {
              name: `Media Catalog - ${name}`,
              asset_metadata: {
                info: {
                  name
                }
              }
            }
          }
        });

        await this.client.SetPermission({objectId, writeToken, permission: "listable"});
      }
    });

    yield Promise.all([
      this.UpdateDatabaseRecord({objectId: id}),
      this.LoadMediaCatalog({mediaCatalogId: id}),
    ]);

    yield this.LoadMediaCatalogs(true);

    return id;
  });

  LoadMediaCatalogs = flow(function * (force=false) {
    if(this.allMediaCatalogs && !force) { return; }

    this.allMediaCatalogs = yield this.rootStore.databaseStore.GetCollection({collection: "mediaCatalogs"});
  });

  LoadMediaCatalog = flow(function * ({mediaCatalogId, force=false}) {
    if(this.mediaCatalogs[mediaCatalogId] && !force) { return; }

    yield this.LoadMediaCatalogs();

    const info = this.allMediaCatalogs.find(mediaCatalogId => mediaCatalogId.objectId === mediaCatalogId);

    const libraryId = yield this.rootStore.LibraryId({objectId: mediaCatalogId});

    this.mediaCatalogs[mediaCatalogId] = {
      ...info,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: mediaCatalogId,
          metadataSubtree: "public",
          resolveLinks: true,
          linkDepthLimit: 1,
          resolveIgnoreErrors: true,
          resolveIncludeSource: true,
          produceLinkUrls: true
        }))
      }
    };
  });

  Reload = flow(function * ({objectId}) {
    yield this.LoadMediaCatalog({mediaCatalogId: objectId, force: true});
  });

  UpdateDatabaseRecord = flow(function * ({objectId}) {
    yield this.rootStore.databaseStore.SaveMediaCatalog({mediaCatalogId: objectId});
  });

  DeployedHash({environment, mediaCatalogId}) {
    return this.rootStore.tenantStore[`tenant${environment.capitalize()}`]?.mediaCatalogs?.[mediaCatalogId]?.versionHash;
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

AddActions(MediaCatalogStore, "mediaCatalogs");

export default MediaCatalogStore;

