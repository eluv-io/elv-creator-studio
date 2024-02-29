import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";
import {
  MediaPropertyPageSpec,
  MediaPropertySectionAutomaticSpec,
  MediaPropertySectionItemFilterSpec,
  MediaPropertySectionItemMarketplaceLinkSpec,
  MediaPropertySectionItemMediaSpec,
  MediaPropertySectionItemPageLinkSpec,
  MediaPropertySectionItemSubpropertyLinkSpec,
  MediaPropertySectionManualSpec,
  MediaPropertySpec
} from "@/specs/MediaPropertySpecs.js";
import {GenerateUUID} from "@/helpers/Misc.js";
import UrlJoin from "url-join";
import {LocalizeString} from "@/components/common/Misc.jsx";

class MediaPropertyStore {
  allMediaProperties;
  mediaProperties = {};

  ID_PREFIXES = {
    "property": "prop",
    "page": "ppge",
    "section_manual": "pscm",
    "section_automatic": "psca",
    "section_item": "psci"
  };

  SECTION_CONTENT_TYPES = {
    "media": "Media",
    "filter": "Filtered View",
    "page_link": "Page Link",
    "subproperty_link": "Subproperty Link",
    "marketplace_link": "Marketplace Link"
  };

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  LoadMediaProperties = flow(function * (force=false) {
    if(this.allMediaProperties && !force) { return; }

    this.allMediaProperties = yield this.rootStore.databaseStore.GetCollection({collection: "mediaProperties"});
  });

  LoadMediaProperty = flow(function * ({mediaPropertyId, force=false}) {
    if(this.mediaProperties[mediaPropertyId] && !force) { return; }

    yield this.LoadMediaProperties();

    const info = this.allMediaProperties.find(mediaProperty => mediaProperty.objectId === mediaPropertyId);

    const libraryId = yield this.rootStore.LibraryId({objectId: mediaPropertyId});

    yield this.rootStore.mediaCatalogStore.LoadMediaCatalogs();
    yield this.rootStore.marketplaceStore.LoadMarketplaces();

    yield Promise.all(
      this.rootStore.mediaCatalogStore.allMediaCatalogs.map(async ({objectId}) =>
        await this.rootStore.mediaCatalogStore.LoadMediaCatalog({mediaCatalogId: objectId})
      )
    );

    this.mediaProperties[mediaPropertyId] = {
      ...info,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: mediaPropertyId,
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

  GetMediaPropertyTags({mediaPropertyId}) {
    const associatedCatalogIds = this.mediaProperties[mediaPropertyId]?.metadata.public.asset_metadata.info.media_catalogs || [];

    return associatedCatalogIds.map(mediaCatalogId =>
      this.rootStore.mediaCatalogStore.mediaCatalogs[mediaCatalogId]?.metadata.public.asset_metadata.info.tags || []
    )
      .flat();
  }

  GetSectionItemLabel({mediaPropertyId, sectionId, sectionItemId, sectionItem}) {
    if(!sectionItem) {
      const sectionContent = this.GetMetadata({
        objectId: mediaPropertyId,
        path: UrlJoin("/public/asset_metadata/info/sections", sectionId, "content")
      }) || [];

      sectionItem = sectionContent.find(sectionItem => sectionItem.id === sectionItemId);
    }

    return (
      sectionItem?.label ||
      (sectionItem.type === "media" && this.GetMediaItem({mediaItemId: sectionItem?.media_id})?.label)
    );
  }

  CreateMediaProperty = flow(function * ({name="New Media Property"}) {
    const libraryId = this.rootStore.tenantInfo.propertiesLibraryId;
    const response = yield this.client.CreateAndFinalizeContentObject({
      libraryId,
      options: {
        type: this.rootStore.typeInfo.mediaProperty
      },
      callback: async ({objectId, writeToken}) => {
        const id = `${this.ID_PREFIXES["property"]}${objectId.replace("iq__", "")}`;
        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadata: {
            public: {
              name: `Media Property - ${name}`,
              asset_metadata: {
                info: {
                  ...MediaPropertySpec,
                  id,
                  name
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
      this.LoadMediaProperty({mediaPropertyId: objectId}),
    ]);

    yield this.LoadMediaProperties(true);

    return objectId;
  });

  CreatePage({page, mediaPropertyId, label}) {
    let id = `${this.ID_PREFIXES["page"]}${GenerateUUID()}`;

    const spec = MediaPropertyPageSpec;
    spec.id = id;
    spec.label = label || spec.label;

    this.AddField({
      objectId: mediaPropertyId,
      page,
      path: "/public/asset_metadata/info/pages",
      field: id,
      value: spec,
      category: this.MediaPropertyCategory({category: "page_label", mediaPropertyId, type: "pages", id, label: spec.label}),
      label: spec.label
    });

    return id;
  }

  CreateSection({page, mediaPropertyId, type="manual", label}) {
    let id = `${this.ID_PREFIXES[`section_${type}`]}${GenerateUUID()}`;

    const spec = type === "manual" ? MediaPropertySectionManualSpec : MediaPropertySectionAutomaticSpec;

    spec.id = id;
    spec.label = label || spec.label;

    this.AddField({
      objectId: mediaPropertyId,
      page,
      path: "/public/asset_metadata/info/sections",
      field: id,
      value: spec,
      category: this.MediaPropertyCategory({category: "section_label", mediaPropertyId, type: "sections", id, label: spec.label}),
      label: spec.label
    });

    return id;
  }

  CreateSectionItem({
    page,
    mediaPropertyId,
    sectionId,
    type="media",
    label,
    mediaItemId,
    expand,
    pageId,
    subPropertyId,
    marketplaceId,
    marketplaceSKU
  }) {
    let id = `${this.ID_PREFIXES["section_item"]}${GenerateUUID()}`;

    let spec;
    switch(type) {
      case "media":
        // eslint-disable-next-line no-case-declarations
        const mediaItem = this.GetMediaItem({mediaItemId});
        spec = MediaPropertySectionItemMediaSpec;
        spec.media_id = mediaItemId;
        spec.media_type = mediaItem?.type;
        spec.expand = expand;
        break;
      case "filter":
        spec = MediaPropertySectionItemFilterSpec;
        break;
      case "page_link":
        spec = MediaPropertySectionItemPageLinkSpec;
        spec.page_id = pageId;
        break;
      case "subproperty_link":
        spec = MediaPropertySectionItemSubpropertyLinkSpec;
        spec.subproperty_id = subPropertyId;
        break;
      case "marketplace_link":
        spec = MediaPropertySectionItemMarketplaceLinkSpec;
        // eslint-disable-next-line no-case-declarations
        const marketplace = this.rootStore.marketplaceStore.allMarketplaces.find(marketplace => marketplace.objectId === marketplaceId);
        spec.marketplace = {
          marketplace_id: marketplaceId,
          tenant_slug: marketplace.tenantSlug,
          marketplace_slug: marketplace.marketplaceSlug
        };
        spec.marketplace_sku = marketplaceSKU;
        break;
    }

    spec.id = id;
    spec.type = type;
    spec.label = label || spec.label;

    const path = UrlJoin("/public/asset_metadata/info/sections", sectionId);

    this.InsertListElement({
      objectId: mediaPropertyId,
      page,
      path,
      field: "content",
      value: spec,
      category: this.MediaPropertyCategory({
        category: "section_label",
        mediaPropertyId,
        type: "sections",
        id: sectionId,
        label: this.mediaProperties[mediaPropertyId].metadata.public.asset_metadata.info.sections[sectionId]?.label || "Section"
      }),
      subcategory: this.MediaPropertyCategory({
        category: "section_item_label",
        mediaPropertyId,
        type: "sectionItem",
        id: sectionId,
        sectionItemId: id,
        label: spec.label
      }),
      label: this.GetSectionItemLabel({sectionItem: spec})
    });

    return id;
  }

  MediaPropertyCategory({category, type="sections", mediaPropertyId, id, sectionItemId, label}) {
    return () => {
      if(type === "sectionItem") {
        label = this.GetSectionItemLabel({mediaPropertyId, sectionId: id, sectionItemId}) || label;
      } else {
        label = this.GetMetadata({objectId: mediaPropertyId, path: UrlJoin("/public/asset_metadata/info", type, id), field: "label"}) || label;
      }

      return LocalizeString(this.rootStore.l10n.pages.media_property.form.categories[category], { label: label });
    };
  }

  Reload = flow(function * ({objectId}) {
    yield this.LoadMediaProperty({mediaPropertyId: objectId, force: true});
  });

  UpdateDatabaseRecord = flow(function * ({objectId}) {
    yield this.rootStore.databaseStore.SaveMediaProperty({mediaPropertyId: objectId});
  });

  DeployedHash({environment, mediaPropertyId}) {
    return this.rootStore.tenantStore[`tenant${environment.capitalize()}`]?.mediaProperties?.[mediaPropertyId]?.versionHash;
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

AddActions(MediaPropertyStore, "mediaProperties");

export default MediaPropertyStore;

