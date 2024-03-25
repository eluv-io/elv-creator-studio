import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";
import {
  MediaPropertyPageSpec,
  MediaPropertySectionAutomaticSpec,
  MediaPropertySectionItemFilterSpec,
  MediaPropertySectionItemMarketplaceLinkSpec,
  MediaPropertySectionItemMediaSpec,
  MediaPropertySectionItemPageLinkSpec,
  MediaPropertySectionItemPropertyLinkSpec,
  MediaPropertySectionItemSubpropertyLinkSpec,
  MediaPropertySectionManualSpec,
  MediaPropertySpec
} from "@/specs/MediaPropertySpecs.js";
import Clone from "lodash/clone";
import {GenerateUUID} from "@/helpers/Misc.js";
import UrlJoin from "url-join";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {Slugify} from "@/components/common/Validation.jsx";

class MediaPropertyStore {
  allMediaProperties;
  mediaProperties = {};

  ID_PREFIXES = {
    "page": "ppge",
    "section_manual": "pscm",
    "section_automatic": "psca",
    "section_item": "psci"
  };

  SECTION_CONTENT_TYPES = {
    "media": "Media",
    "filter": "Filtered View",
    "page_link": "Page Link",
    "property_link": "Property Link",
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

  GetMediaPropertyAttributes({mediaPropertyId}) {
    const associatedCatalogIds = this.mediaProperties[mediaPropertyId]?.metadata.public.asset_metadata.info.media_catalogs || [];

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

  GetResolvedSectionItem({mediaPropertyId, sectionId, sectionItemId, sectionItem}) {
    if(!sectionItem) {
      const sectionContent = this.GetMetadata({
        objectId: mediaPropertyId,
        path: UrlJoin("/public/asset_metadata/info/sections", sectionId, "content")
      }) || [];

      sectionItem = sectionContent.find(sectionItem => sectionItem.id === sectionItemId);
    }

    let mediaItem;
    if(sectionItem.type === "media" && sectionItem.use_media_settings) {
      mediaItem = this.GetMediaItem({mediaItemId: sectionItem?.media_id});
    }

    return {
      ...sectionItem,
      mediaItem,
      display: {
        ...(mediaItem || sectionItem.display)
      }
    };
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

  GetAutomaticSectionContent({mediaPropertyId, sectionId}) {
    const mediaProperty = this.mediaProperties[mediaPropertyId]?.metadata.public.asset_metadata.info;

    if(!mediaProperty) { return []; }

    const section = mediaProperty.sections[sectionId];

    if(!section) { return []; }

    let catalogIds = section.select.media_catalog ?
      [ section.select.media_catalog ] :
      mediaProperty.media_catalogs || [];

    return (
      catalogIds.map(mediaCatalogId =>
        this.rootStore.mediaCatalogStore.GetFilteredContent({mediaCatalogId, select: section.select})
      )
        .flat()
        .sort((a, b) => a.catalog_title < b.catalog_title ? -1 : 1)
    );
  }

  CreateMediaProperty = flow(function * ({name="New Media Property", slug}) {
    slug = slug || Slugify(name);
    const libraryId = this.rootStore.tenantInfo.propertiesLibraryId;
    const response = yield this.client.CreateAndFinalizeContentObject({
      libraryId,
      options: {
        type: this.rootStore.typeInfo.mediaProperty
      },
      callback: async ({objectId, writeToken}) => {
        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadata: {
            public: {
              name: `Media Property - ${name}`,
              asset_metadata: {
                slug,
                info: {
                  ...MediaPropertySpec,
                  id: objectId,
                  name,
                  slug
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

    const spec = Clone(MediaPropertyPageSpec);
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

    const spec = Clone(
      type === "manual" ?
        MediaPropertySectionManualSpec :
        MediaPropertySectionAutomaticSpec
    );

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
    propertyId,
    subpropertyId,
    propertyPageId,
    marketplaceId,
    marketplaceSKU
  }) {
    let id = `${this.ID_PREFIXES["section_item"]}${GenerateUUID()}`;

    let spec;
    switch(type) {
      case "media":
        // eslint-disable-next-line no-case-declarations
        const mediaItem = this.GetMediaItem({mediaItemId});
        spec = Clone(MediaPropertySectionItemMediaSpec);
        spec.media_id = mediaItemId;
        spec.media_type = mediaItem?.type;
        spec.expand = expand;
        break;
      case "filter":
        spec = Clone(MediaPropertySectionItemFilterSpec);
        break;
      case "page_link":
        spec = Clone(MediaPropertySectionItemPageLinkSpec);
        spec.page_id = pageId;
        break;
      case "property_link":
        spec = Clone(MediaPropertySectionItemPropertyLinkSpec);
        spec.property_id = propertyId;
        spec.property_page_id = propertyPageId || "main";
        break;
      case "subproperty_link":
        spec = Clone(MediaPropertySectionItemSubpropertyLinkSpec);
        spec.subproperty_id = subpropertyId;
        spec.subproperty_page_id = propertyPageId || "main";
        break;
      case "marketplace_link":
        spec = Clone(MediaPropertySectionItemMarketplaceLinkSpec);
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

    delete spec.display.id;
    delete spec.display.label;

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

  Postprocess = flow(function * ({libraryId, objectId, writeToken}) {
    // Build slug map
    const mediaProperty = yield this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "/public/asset_metadata/info"
    });

    let slugs = {
      pages: {},
      sections: {}
    };

    Object.values(mediaProperty?.pages).forEach(page =>
      slugs.pages[page.slug || page.id] = {
        page_id: page.id,
        label: page.label,
        slug: page.slug || page.id
      }
    );

    Object.values(mediaProperty?.sections).forEach(section => {
      slugs.sections[section.slug || section.id] = {
        section_id: section.id,
        label: section.label,
        slug: section.slug || section.id,
        section_items: {}
      };

      if(section.type === "manual") {
        section.content?.forEach((sectionItem, sectionItemIndex) =>
          slugs.sections[section.slug || section.id].section_items[sectionItem.slug || sectionItem.id] = {
            section_item_id: sectionItem.id,
            label: sectionItem.label,
            slug: sectionItem.slug || sectionItem.id,
            index: sectionItemIndex
          }
        );
      }
    });

    yield this.client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "/public/asset_metadata/info/slug_map",
      metadata: slugs
    });
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

