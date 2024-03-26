import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";
import {GenerateUUID} from "@/helpers/Misc.js";
import Clone from "lodash/clone";
import {
  MediaCatalogAttributeBaseSpec,
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
    "HTML"
  ];

  ID_PREFIXES = {
    "Video": "mvid",
    "Image": "mimg",
    "Ebook": "mebk",
    "HTML": "mhtm",
    "Link": "mlnk",
    "Gallery": "mgal",
    "media_lists": "mlst",
    "media_collections": "mcol",
    "attribute": "attr"
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

  GetFilteredContent({mediaCatalogId, select}) {
    const mediaCatalog = this.mediaCatalogs[mediaCatalogId]?.metadata.public.asset_metadata.info;

    if(!mediaCatalog) { return []; }

    const FilterContent = ({contentType, content}) => {
      if(select.content_type && select.content_type !== contentType) {
        return [];
      }

      // Schedule filter
      // Only videos can be filtered by schedule
      if(
        select.content_type === "media" &&
        (select.media_types.length === 0 || (select.media_types.length === 1 && select.media_types[0] === "Video")) &&
        select.schedule
      ) {
        const now = new Date();
        content = content.filter(mediaItem => {

          if(!mediaItem.live_video || mediaItem.media_type !== "Video" || !mediaItem.start_time) {
            return false;
          }

          const startTime = new Date(mediaItem.start_time);
          const endTime = mediaItem.end_time && new Date(mediaItem.end_time);

          const started = startTime < now;
          const ended = endTime < now;
          const afterStartLimit = !select.start_time || new Date(select.start_time) < startTime;
          const beforeEndLimit = !select.end_time || new Date(select.end_time) > startTime;

          switch(select.schedule) {
            case "live":
              return started && !ended;
            case "upcoming":
              return !started && beforeEndLimit;
            case "past":
              return ended && afterStartLimit;
            case "period":
              return afterStartLimit && beforeEndLimit;
          }
        });
      }

      if(select.content_type === "media" && select.media_types?.length > 0) {
        content = content.filter(mediaItem => select.media_types.includes(mediaItem.media_type));
      }

      if(select.tags?.length > 0) {
        content = content.filter(mediaItem =>
          !select.tags.find(tag => !mediaItem.tags.includes(tag))
        );
      }

      select.attributes.forEach(attributeId => {
        content = content.filter(mediaItem =>
          mediaItem.attributes?.[attributeId] === select.attribute_values[attributeId]
        );
      });

      return content;
    };

    return [
      ...FilterContent({contentType: "collection", content: Object.values(mediaCatalog.media_collections || {})}),
      ...FilterContent({contentType: "list", content: Object.values(mediaCatalog.media_lists || {})}),
      ...FilterContent({contentType: "media", content: Object.values(mediaCatalog.media || {})})
    ];
  }

  CreateMediaCatalog = flow(function * ({name="New Media Catalog"}) {
    const libraryId = this.rootStore.tenantInfo.propertiesLibraryId;
    const response = yield this.client.CreateAndFinalizeContentObject({
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
                  ...MediaCatalogSpec,
                  id: objectId,
                  name,
                  title: name
                }
              }
            }
          }
        });
      }
    });

    const objectId = response.id;

    yield this.client.SetPermission({objectId, permission: "listable"});

    yield this.rootStore.databaseStore.AddGroupPermissions({objectId});

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
      spec = Clone(MediaCatalogCollectionSpec);
      label = this.rootStore.l10n.pages.media_catalog.form.categories.media_collection;
      prefix = this.ID_PREFIXES["media_collections"];
    } else if(type === "media_lists") {
      spec = Clone(MediaCatalogMediaListSpec);
      label = this.rootStore.l10n.pages.media_catalog.form.categories.media_list;
      prefix = this.ID_PREFIXES["media_lists"];
    } else {
      prefix = this.ID_PREFIXES[mediaType];
      label = this.rootStore.l10n.pages.media_catalog.form.categories.media_item;

      if(mediaType === "Video") {
        spec = Clone(MediaCatalogMediaVideoSpec);
      } else if(mediaType === "Image") {
        spec = Clone(MediaCatalogMediaImageSpec);
      } else if(mediaType === "Gallery") {
        spec = Clone(MediaCatalogMediaGallerySpec);
      } else {
        spec = MediaCatalogMediaOtherSpec({mediaType});
      }
    }

    id = `${prefix}${id}`;

    spec.id = id;
    spec.label = title;
    spec.title = title;
    spec.catalog_title = title;
    spec.media_catalog_id = mediaCatalogId;

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

  CreateAttribute({page, mediaCatalogId, id, title}) {
    if(!id) { throw Error("ID must be specified"); }

    const spec = Clone(MediaCatalogAttributeBaseSpec);

    spec.id = id;
    spec.title = title || spec.title;

    this.AddField({
      objectId: mediaCatalogId,
      page,
      path: "/public/asset_metadata/info/attributes",
      field: id,
      value: spec,
      category: this.MediaItemCategory({
        category: "attribute_label",
        mediaCatalogId,
        type: "attributes",
        id,
        title: spec.title
      }),
      label: spec.title
    });

    return id;
  }

  MediaItemCategory({type="media", mediaCatalogId, category, id, title}) {
    return () => {
      title = this.GetMetadata({objectId: mediaCatalogId, path: UrlJoin("/public/asset_metadata/info", type, id), field: "title"}) || title;

      category = category ||
        (type === "media" ? "media_item_label" :
          type === "media_lists" ? "media_list_label" :
            "media_collection_label");

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

