import {flow, makeAutoObservable, toJS} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";
import {GenerateUUID} from "@/helpers/Misc.js";
import Clone from "lodash/clone";
import {
  MediaCatalogAttributeBaseSpec,
  MediaCatalogCollectionSpec, MediaCatalogGalleryItemSpec,
  MediaCatalogMediaGallerySpec,
  MediaCatalogMediaImageSpec,
  MediaCatalogMediaListSpec,
  MediaCatalogMediaOtherSpec,
  MediaCatalogMediaVideoSpec,
  MediaCatalogSpec
} from "@/specs/MediaCatalogSpecs.js";
import UrlJoin from "url-join";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {mediaCatalogStore} from "@/stores/index.js";
import Set from "lodash/set.js";
import {ExtractHashFromLink} from "@/helpers/Fabric.js";

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
    },
    "Mixed": {
      label: "Mixed",
      ratio: 1
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
        (select.media_types?.length === 0 || (select.media_types?.length === 1 && select.media_types?.[0] === "Video")) &&
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
            case "live_and_upcoming":
              return !ended && beforeEndLimit;
            case "upcoming":
              return !started && beforeEndLimit;
            case "past":
              return ended && afterStartLimit;
            case "period":
              return afterStartLimit && beforeEndLimit;
          }
        });
      }

      if(select.date) {
        const baseDate = select.date.split("T")[0];
        content = content.filter(mediaItem => mediaItem.date && mediaItem.date.split("T")[0] === baseDate);
      }

      if(select.content_type === "media" && select.media_types?.length > 0) {
        content = content.filter(mediaItem => select.media_types.includes(mediaItem.media_type));
      }

      if(select.tags?.length > 0) {
        content = content.filter(mediaItem =>
          !select.tags.find(tag => !mediaItem.tags.includes(tag))
        );
      }

      select.attributes?.forEach(attributeId => {
        content = content.filter(mediaItem =>
          mediaItem.attributes?.[attributeId]?.includes(select.attribute_values[attributeId])
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
    const versionHash = yield this.client.LatestVersionHash({objectId: mediaCatalogId});

    this.mediaCatalogs[mediaCatalogId] = {
      ...info,
      libraryId,
      versionHash,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: mediaCatalogId,
          metadataSubtree: "public",
          produceLinkUrls: true
        }))
      }
    };

    yield this.rootStore.permissionSetStore.LoadPermissionSets();
    yield Promise.all(
      this.rootStore.permissionSetStore.allPermissionSets.map(async ({objectId}) =>
        await this.rootStore.permissionSetStore.LoadPermissionSet({permissionSetId: objectId})
      )
    );
  });

  CreateMediaItem({page, type="media", mediaCatalogId, mediaType, title, copyMediaItemId}) {
    let id = GenerateUUID();

    let spec, label, prefix, copyItem;
    if(type === "media_collections") {
      spec = Clone(MediaCatalogCollectionSpec);
      label = this.rootStore.l10n.pages.media_catalog.form.categories.media_collection;
      prefix = this.ID_PREFIXES["media_collections"];

      if(copyMediaItemId) {
        copyItem = this.mediaCatalogs[mediaCatalogId].metadata.public.asset_metadata.info.media_collections[copyMediaItemId];
      }
    } else if(type === "media_lists") {
      spec = Clone(MediaCatalogMediaListSpec);
      label = this.rootStore.l10n.pages.media_catalog.form.categories.media_list;
      prefix = this.ID_PREFIXES["media_lists"];

      if(copyMediaItemId) {
        copyItem = this.mediaCatalogs[mediaCatalogId].metadata.public.asset_metadata.info.media_lists[copyMediaItemId];
      }
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
        spec = Clone(MediaCatalogMediaOtherSpec({mediaType}));
      }

      if(copyMediaItemId) {
        copyItem = this.mediaCatalogs[mediaCatalogId].metadata.public.asset_metadata.info.media[copyMediaItemId];
      }
    }

    id = `${prefix}${id}`;

    if(copyItem) {
      spec = Clone(toJS(copyItem));
      spec.label = `${spec.label} (Copy)`;
      spec.slug = "";
    } else {
      spec.label = title;
      spec.title = title;
      spec.catalog_title = title;
      spec.media_catalog_id = mediaCatalogId;
    }

    spec.id = id;

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

  GetOfferings = flow(function * (link) {
    const versionHash = ExtractHashFromLink(link);

    if(!versionHash) { return; }

    try {
      const offerings = (yield this.client.ContentObjectMetadata({
        versionHash,
        metadataSubtree: "offerings",
        select: [
          "*/ready",
          "*/media_struct/label",
        ]
      })) || {};

      return Object.keys(offerings)
        .map(offeringKey =>
          !offerings[offeringKey].ready ? null :
            { value: offeringKey, label: offerings[offeringKey]?.media_struct?.label || offeringKey }
        )
        .filter(o => o);
    } catch(error) {
      this.DebugLog({error});
    }
  });

  MigrateItemTemplateMedia = flow(function * ({itemTemplateId, mediaCatalogId, type, itemTemplateName}) {
    yield this.LoadMediaCatalog({mediaCatalogId});
    yield this.rootStore.itemTemplateStore.LoadItemTemplate({itemTemplateId});

    let itemTemplate = this.rootStore.itemTemplateStore.itemTemplates[itemTemplateId];
    itemTemplate = itemTemplate?.metadata.public.asset_metadata.nft;

    let templateMedia = [];

    if(type === "List") {
      templateMedia = Clone(itemTemplate.additional_media || []);
    } else {
      templateMedia = Clone(itemTemplate.additional_media_sections.featured_media || []);

      itemTemplate.additional_media_sections.sections.forEach((_, sectionIndex) =>
        itemTemplate.additional_media_sections.sections[sectionIndex].collections.forEach((_, collectionIndex) =>
          itemTemplate.additional_media_sections.sections[sectionIndex].collections[collectionIndex].media.forEach(mediaItem =>
            templateMedia.push(Clone(mediaItem))
          )
        )
      );
    }

    const GetImageAspectRatio = async url => {
      if(!url) { return; }

      return await new Promise((resolve) =>{
        url = new URL(url);
        url.searchParams.set("width", "100");

        const image = new Image();
        image.src = url;
        image.onload = () => {
          const ratio = image.naturalWidth / image.naturalHeight;
          const diff = ratio - 1;

          resolve(
            Math.abs(diff) < 0.1 ? "Square" :
              diff > 0 ? "Landscape" : "Portrait"
          );
        };
        image.onerror = () => resolve();
      });
    };

    const itemTemplateHash = yield this.client.LatestVersionHash({objectId: itemTemplateId});
    const Migrate = async (withUrls) => {
      const MigrateRelativeLink = async link => {
        if(!link) { return; }

        if(typeof link === "string" && link.startsWith("https")) {
          const url = new URL(link);

          let linkPath = decodeURIComponent(url.pathname).split("/q/")[1];

          let [versionHash, ...pathComponents] = linkPath.split("/");

          if(versionHash.startsWith("iq__")) {
            versionHash = await this.rootStore.VersionHash({objectId: versionHash});
          }

          link = { "/": UrlJoin("/qfab", versionHash, ...pathComponents) };

          if(withUrls) {
            link.url = url.toString();
          }
        } else {
          link = Clone(link);

          if(link?.["/"]?.startsWith("./")) {
            link["/"] = `/qfab/${itemTemplateHash}/${link["/"].replace("./", "")}`;
          }

          if(!withUrls) {
            delete link.url;
          }
        }

        return link;
      };

      let media = {};
      await this.client.utils.LimitedMap(
        5,
        templateMedia,
        async mediaItem => {
          let mediaType = mediaItem.media_type;
          if(mediaType === "Live Video") {
            type = "Video";
          }
          if(mediaType === "Audio") {
            type = "Video";
          }
          if(mediaType === "Media Reference") {
            return;
          }

          const id = `${this.ID_PREFIXES[mediaType]}${mediaItem.id || GenerateUUID()}`;

          let spec;
          if(mediaType === "Video") {
            spec = Clone(MediaCatalogMediaVideoSpec);
          } else if(mediaType === "Image") {
            spec = Clone(MediaCatalogMediaImageSpec);
          } else if(mediaType === "Gallery") {
            spec = Clone(MediaCatalogMediaGallerySpec);
          } else {
            spec = MediaCatalogMediaOtherSpec({mediaType});
          }

          const imageLink = await MigrateRelativeLink(mediaItem.image);
          const imageAspectRatio = await GetImageAspectRatio(mediaItem.image) || mediaItem.image_aspect_ratio;

          media[id] = {
            ...spec,
            media_catalog_id: mediaCatalogId,
            id,
            type: "media",
            media_type: mediaType,
            label: `${mediaItem.name} (${itemTemplateName})`,
            title: mediaItem.name,
            catalog_title: mediaItem.name,
            subtitle: mediaItem.subtitle_1 || "",
            description: mediaItem.descripton_text || "",
            description_rich_text: mediaItem.descripton || "",
            thumbnail_image_landscape: imageAspectRatio === "Landscape" ? imageLink : null,
            thumbnail_image_square: imageAspectRatio === "Square" ? imageLink : null,
            thumbnail_image_portrait: imageAspectRatio === "Portrait" ? imageLink : null,
            authorized_link: !!mediaItem.authorized_link,
            offerings: mediaItem.offerings || [],
            parameters: mediaItem.parameters || [],
            poster_image: await MigrateRelativeLink(mediaItem.poster_image),
            start_time: mediaItem.start_time,
            end_time: mediaItem.end_time,
            media_link: await MigrateRelativeLink(mediaItem.media_link),
            media_file: await  MigrateRelativeLink(mediaItem.media_file),
            live: mediaItem.media_type === "Live Video",
            url: mediaItem.link,
          };

          if(mediaType === "Gallery") {
            media[id].background_image = await MigrateRelativeLink(mediaItem.background_image);
            media[id].background_image_mobile = await MigrateRelativeLink(mediaItem.background_image_mobile);
            media[id].gallery = await this.client.utils.LimitedMap(
              5,
              mediaItem.gallery || [],
              async galleryItem => ({
                ...MediaCatalogGalleryItemSpec,
                id: GenerateUUID(),
                title: galleryItem.name || "",
                label: galleryItem.name || "",
                description: galleryItem.description || "",
                thumbnail: await MigrateRelativeLink(galleryItem.image),
                thumbnail_aspect_ratio: await GetImageAspectRatio(galleryItem.image?.url) ||
                  (galleryItem.image_aspect_ratio === "Wide" ? "Landscape" :
                    galleryItem.image_aspect_ratio === "Tall" ? "Portrait" :
                      "Square"),
                video: await MigrateRelativeLink(galleryItem.video)
              })
            );
          }
        }
      );

      return media;
    };

    // Keep link URLs in local metadata, but do not save to fabric
    const mediaWithUrls = yield Migrate(true);
    const media = yield Migrate(false);

    const originalCatalogMedia = Clone(this.mediaCatalogs[mediaCatalogId].metadata.public.asset_metadata.info.media);

    mediaCatalogStore.ApplyAction({
      objectId: mediaCatalogId,
      actionType: "CUSTOM",
      changelistLabel: LocalizeString(this.rootStore.l10n.pages.media_catalog.form.categories.migrate_media_from_template_label, {label: itemTemplateName}),
      label: LocalizeString(this.rootStore.l10n.pages.media_catalog.form.categories.migrate_media_from_template_label, {label: itemTemplateName}),
      category: this.rootStore.l10n.pages.media_catalog.form.categories.media,
      page: location.pathname,
      Apply: () => {
        Object.keys(mediaWithUrls).forEach(mediaId =>
          Set(this.mediaCatalogs[mediaCatalogId].metadata, ["public", "asset_metadata", "info", "media", mediaId], mediaWithUrls[mediaId])
        );
      },
      Undo: () => Set(this.mediaCatalogs[mediaCatalogId].metadata, ["public", "asset_metadata", "info", "media"], originalCatalogMedia),
      Write: async (objectParams) => {
        await this.client.utils.LimitedMap(
          5,
          Object.keys(media),
          async mediaId =>
            await mediaCatalogStore.client.ReplaceMetadata({
              ...objectParams,
              metadataSubtree: UrlJoin("/public/asset_metadata/info/media", mediaId),
              metadata: JSON.parse(JSON.stringify(media[mediaId]))
            })
        );
      }
    });
  });

  async VideoResolutionOptions({objectId, versionHash, offering}) {
    const metadata = (await this.client.ContentObjectMetadata({
      versionHash: await this.client.LatestVersionHash({objectId, versionHash}),
      metadataSubtree: "offerings",
      select: [
        "*/playout/playout_formats",
        "*/playout/streams/video/representations",
        "*/media_struct/streams/video/rate",
      ]
    }));

    const offeringKey = offering && metadata[offering] ? offering :
      metadata.default ? "default" :
      Object.keys(metadata)[0];

    if(!offeringKey) {
      return;
    }

    const repMetadata = metadata[offeringKey].playout.streams.video.representations;

    const repInfo = (
      Object.keys(repMetadata)
        .map(repKey => {
          try {
            const { bit_rate, codec, height, width } = repMetadata[repKey];

            return {
              key: repKey,
              resolution: `${width}x${height}`,
              width,
              height,
              codec,
              bitrate: bit_rate,
              string: `${width}x${height} (${(parseInt(bit_rate) / 1000 / 1000).toFixed(1)}Mbps)`
            };
          } catch(error) {
            this.DebugLog({
              message: `Error retrieving video representations for ${versionHash || objectId}`,
              error
            });
          }
        })
        .filter(rep => rep)
        .sort((a, b) => a.bitrate > b.bitrate ? -1 : 1)
    );

    if(repInfo[0]) {
      repInfo[0].isTopResolution = true;
    }

    return {
      downloadable: !!Object.keys(metadata[offeringKey].playout.playout_formats).find(key => key.includes("clear")),
      frameRateRat: metadata?.[offeringKey]?.media_struct?.streams?.video?.rate,
      resolutionInfo: repInfo
    };
  }

  Postprocess = flow(function * ({libraryId, objectId, writeToken}) {
    let mediaCatalog = yield this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "/public/asset_metadata/info"
    });

    let slugMap = {};
    ["media", "media_lists", "media_collections"].forEach(type => {
      Object.keys(mediaCatalog?.[type] || {}).forEach(itemId => {
        const item = mediaCatalog[type][itemId];

        if(item.slug) {
          slugMap[item.slug] = itemId;
        }
      });
    });

    yield this.client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "/public/asset_metadata/info/slug_map",
      metadata: slugMap
    });
  });

  Reload = flow(function * ({objectId}) {
    yield this.LoadMediaCatalog({mediaCatalogId: objectId, force: true});
  });

  UpdateDatabaseRecord = flow(function * ({objectId}) {
    yield this.rootStore.databaseStore.SaveMediaCatalog({mediaCatalogId: objectId});
  });

  DeployedHash({environment, mediaCatalogId}) {
    return this.rootStore.tenantStore[`
            }tenant${environment.capitalize()}`]?.mediaCatalogs?.[mediaCatalogId]?.versionHash;
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

