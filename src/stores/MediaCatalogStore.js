import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";
import {GenerateUUID} from "@/helpers/Misc.js";
import {
  MediaCatalogCollectionSpec,
  MediaCatalogMediaGallerySpec,
  MediaCatalogMediaImageSpec,
  MediaCatalogMediaListSpec,
  MediaCatalogMediaOtherSpec,
  MediaCatalogMediaVideoSpec,
  MediaCatalogSpec
} from "@/specs/MediaCatalogSpecs.js";
import UrlJoin from "url-join";
import {LocalizeString} from "@/components/common/Misc.jsx";

class MediaCatalogStore {
  allMediaCatalogs;
  mediaCatalogs = {};

  MEDIA_TYPES = [
    "Video",
    "Image",
    "Gallery",
    "Ebook",
    "HTML",
    "Link"
  ];

  ID_PREFIXES = {
    "Video": "mvid",
    "Image": "mimg",
    "Ebook": "mebk",
    "HTML": "mhtm",
    "Link": "mlnk",
    "Gallery": "mgal",
    "media_lists": "mlst",
    "media_collections":" mcol",
    "media_catalog": "mcat"
  };

  IMAGE_ASPECT_RATIOS = {
    "Portrait": {
      label: "Portrait (2:3)",
      ratio: 2/3
    },
    "Square": {
      label: "Square (1:1)",
      ratio: 1
    },
    "Landscape": {
      label: "Landscape (16:9)",
      ratio: 16/9
    }
  };

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  CreateMediaCatalog = flow(function * ({name="New Media Catalog"}) {
    const libraryId = this.rootStore.tenantInfo.propertiesLibraryId;
    const response = yield this.client.CreateAndFinalizeContentObject({
      libraryId,
      options: {
        type: this.rootStore.typeInfo.mediaCatalog
      },
      callback: async ({objectId, writeToken}) => {
        const id = `${this.ID_PREFIXES["media_catalog"]}${objectId.replace("iq__", "")}`;
        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadata: {
            public: {
              name: `Media Catalog - ${name}`,
              asset_metadata: {
                info: {
                  ...MediaCatalogSpec,
                  id,
                  name,
                  title: name
                }
              }
            }
          }
        });

        await this.client.SetPermission({objectId, writeToken, permission: "listable"});
      }
    });

    const objectId = response.id;

    yield Promise.all([
      this.UpdateDatabaseRecord({objectId}),
      this.LoadMediaCatalog({mediaCatalogId: objectId}),
    ]);

    yield this.LoadMediaCatalogs(true);

    return objectId;
  });

  LoadMediaCatalogs = flow(function * (force=false) {
    if(this.allMediaCatalogs && !force) { return; }

    this.allMediaCatalogs = yield this.rootStore.databaseStore.GetCollection({collection: "mediaCatalogs"});
  });

  LoadMediaCatalog = flow(function * ({mediaCatalogId, force=false}) {
    if(this.mediaCatalogs[mediaCatalogId] && !force) { return; }

    yield this.LoadMediaCatalogs();

    const info = this.allMediaCatalogs.find(mediaCatalog => mediaCatalog.objectId === mediaCatalogId);

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

  CreateMediaItem({page, type="media", mediaCatalogId, mediaType, title}) {
    let id = GenerateUUID();

    let spec, label, prefix;
    if(type === "media_collections") {
      spec = MediaCatalogCollectionSpec;
      label = this.rootStore.l10n.pages.media_catalog.form.categories.media_collection;
      prefix = this.ID_PREFIXES["media_collections"];
    } else if(type === "media_lists") {
      spec = MediaCatalogMediaListSpec;
      label = this.rootStore.l10n.pages.media_catalog.form.categories.media_list;
      prefix = this.ID_PREFIXES["media_lists"];
    } else {
      prefix = this.ID_PREFIXES[mediaType];
      label = this.rootStore.l10n.pages.media_catalog.form.categories.media_item;

      if(mediaType === "Video") {
        spec = MediaCatalogMediaVideoSpec;
      } else if(mediaType === "Image") {
        spec = MediaCatalogMediaImageSpec;
      } else if(mediaType === "Gallery") {
        spec = MediaCatalogMediaGallerySpec;
      } else {
        spec = MediaCatalogMediaOtherSpec({mediaType});
      }
    }

    id = `${prefix}${id}`;

    spec.id = id;
    spec.title = title;
    spec.catalog_title = title;

    this.AddField({
      objectId: mediaCatalogId,
      page,
      path: UrlJoin("/public/asset_metadata/info/", type),
      field: id,
      value: spec,
      category: this.MediaItemCategory({type, mediaCatalogId, id, title}),
      label
    });

    return id;
  }

  RemoveMediaItem({page, type, mediaCatalogId, mediaItem}) {
    this.RemoveField({
      objectId: mediaCatalogId,
      page,
      path: UrlJoin("/public/asset_metadata/info", type),
      field: mediaItem.id,
      category: this.MediaItemCategory({type, mediaCatalogId, id: mediaItem.id, title: mediaItem.title || mediaItem.catalog_title || mediaItem.id}),
      label: mediaItem.title
    });
  }

  MediaItemCategory({type="media", mediaCatalogId, id, title}) {
    return () => {
      title = this.GetMetadata({objectId: mediaCatalogId, path: UrlJoin("/public/asset_metadata/info", type, id), field: "title"}) || title;

      let category =
        type === "media" ? "media_item_label" :
          type === "media_lists" ? "media_list_label" :
            "media_collection_label";

      return LocalizeString(this.rootStore.l10n.pages.media_catalog.form.categories[category], { label: title });
    };
  }

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

