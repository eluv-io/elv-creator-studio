import {flow, makeAutoObservable, toJS} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";
import {
  MediaPropertyContainerSectionSpec,
  MediaPropertyHeroItemSpec,
  MediaPropertyHeroSectionSpec,
  MediaPropertyPageSpec,
  MediaPropertySectionAutomaticSpec,
  MediaPropertySectionItemExternalLinkSpec,
  MediaPropertySectionItemFilterSpec,
  MediaPropertySectionItemMarketplaceLinkSpec,
  MediaPropertySectionItemMediaSpec,
  MediaPropertySectionItemPageLinkSpec,
  MediaPropertySectionItemPropertyLinkSpec,
  MediaPropertySectionItemPurchaseSpec,
  MediaPropertySectionItemRedeemableOfferSpec,
  MediaPropertySectionItemSubpropertyLinkSpec,
  MediaPropertySectionItemVisualSpec,
  MediaPropertySectionManualSpec,
  MediaPropertySpacerSectionSpec,
  MediaPropertySpec
} from "@/specs/MediaPropertySpecs.js";
import Clone from "lodash/clone";
import {CompareSemVer, GenerateUUID} from "@/helpers/Misc.js";
import UrlJoin from "url-join";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {Slugify} from "@/components/common/Validation.jsx";

import {Migrations, latestVersion} from "@/migrations/MediaPropertyMigrations.js";

class MediaPropertyStore {
  allMediaProperties;
  mediaProperties = {};

  ID_PREFIXES = {
    "page": "ppge",
    "section_manual": "pscm",
    "section_automatic": "psca",
    "section_hero": "psch",
    "section_hero_item": "pshi",
    "section_container": "pscc",
    "section_spacer": "pssp",
    "section_item": "psci"
  };

  SECTION_CONTENT_TYPES = {
    "media": "Media",
    "item_purchase": "Item Purchase",
    "filter": "Filtered View",
    "page_link": "Page Link",
    "property_link": "Property Link",
    "subproperty_link": "Subproperty Link",
    "redeemable_offer": "Redeemable Offer",
    "external_link": "External Link",
    "visual_only": "Visual Only"
  };

  PERMISSION_BEHAVIORS = {
    "hide": "Hide",
    "disable": "Show Disabled",
    "show_purchase": "Show Purchase Options"
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
    yield this.LoadResource({
      key: "mediaProperty",
      id: mediaPropertyId,
      force,
      Load: async () => {
        await this.LoadMediaProperties();

        const info = this.allMediaProperties.find(mediaProperty => mediaProperty.objectId === mediaPropertyId);

        const libraryId = await this.rootStore.LibraryId({objectId: mediaPropertyId});

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

        this.mediaProperties[mediaPropertyId] = {
          ...info,
          metadata: {
            public: (await this.client.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: mediaPropertyId,
              metadataSubtree: "public",
              produceLinkUrls: true
            }))
          }
        };

        this.ApplyMigrations({mediaPropertyId});
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

  GetAutomaticSectionContent({mediaPropertyId, sectionId, select={}}) {
    const mediaProperty = this.mediaProperties[mediaPropertyId]?.metadata.public.asset_metadata.info;

    if(!mediaProperty) { return []; }

    if(sectionId) {
      const section = mediaProperty.sections[sectionId];

      if(section) {
        select = section.select;
      }
    }

    if(!select) { return []; }

    let catalogIds = select.media_catalog ?
      [ select.media_catalog ] :
      mediaProperty.media_catalogs || [];
    
    return (
      catalogIds.map(mediaCatalogId =>
        this.rootStore.mediaCatalogStore.GetFilteredContent({mediaCatalogId, select})
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

          switch(select.sort_order) {
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
    );
  }

  CreateMediaProperty = flow(function * ({name="New Media Property", slug}) {
    const libraryId = this.rootStore.tenantInfo.propertiesLibraryId;
    const response = yield this.client.CreateAndFinalizeContentObject({
      libraryId,
      options: {
        type: this.rootStore.typeInfo.mediaProperty
      },
      callback: async ({objectId, writeToken}) => {
        slug = slug || Slugify(name);

        let spec = Clone(MediaPropertySpec);

        const mainPageId = `${this.ID_PREFIXES["page"]}${GenerateUUID()}`;
        const accessPageId = `${this.ID_PREFIXES["page"]}${GenerateUUID()}`;

        const mainPageHeroSectionId = `${this.ID_PREFIXES["section_hero"]}${GenerateUUID()}`;
        const mainPageHeroSectionHeroItemId = `${this.ID_PREFIXES["section_hero_item"]}${GenerateUUID()}`;
        const accessPageHeroSectionId = `${this.ID_PREFIXES["section_hero"]}${GenerateUUID()}`;
        const accessPageHeroSectionHeroItemId = `${this.ID_PREFIXES["section_hero_item"]}${GenerateUUID()}`;

        spec.version = latestVersion;

        spec.sections = {
          [mainPageHeroSectionId]: {
            ...Clone(MediaPropertyHeroSectionSpec),
            id: mainPageHeroSectionId,
            label: "Main Page Header",
            hero_items: [{
              ...Clone(MediaPropertyHeroItemSpec),
              id: mainPageHeroSectionHeroItemId,
              label: "Header",
              display: {
                ...Clone(MediaPropertyHeroItemSpec.display),
                title: "Page Header"
              }
            }]
          },
          [accessPageHeroSectionId]: {
            ...Clone(MediaPropertyHeroSectionSpec),
            id: accessPageHeroSectionId,
            label: "Access Page Header",
            hero_items: [{
              ...Clone(MediaPropertyHeroItemSpec),
              id: accessPageHeroSectionHeroItemId,
              label: "Header",
              display: {
                ...Clone(MediaPropertyHeroItemSpec.display),
                title: "Page Header"
              }
            }]
          },
        };

        spec.pages = {
          [mainPageId]: {
            ...Clone(MediaPropertyPageSpec),
            id: mainPageId,
            label: "Main Page",
            sections: [mainPageHeroSectionId],
            permissions: {
              ...Clone(MediaPropertyPageSpec).permissions,
              page_permissions: [],
              page_permissions_alternate_page_id: accessPageId,
              page_permissions_behavior: "show_alternate_page"
            }
          },
          [accessPageId]: {
            ...MediaPropertyPageSpec,
            id: accessPageId,
            label: "No Access Page",
            sections: [accessPageHeroSectionId]
          }
        };

        spec.pages.main = {
          ...spec.pages[mainPageId],
          id: "main",
          slug: "main"
        };

        spec.page_ids = {
          "main": mainPageId
        };

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
                  ...spec,
                  id: objectId,
                  name,
                  slug
                }
              }
            }
          }
        });
      }
    });

    const objectId = response.id;

    yield this.UpdateDatabaseRecord({objectId});
    yield this.LoadMediaProperties(true);
    yield this.LoadMediaProperty({mediaPropertyId: objectId, force: true});

    yield this.client.EditAndFinalizeContentObject({
      libraryId,
      objectId,
      callback: async ({writeToken}) => {
        await this.Save({libraryId, objectId, writeToken});
      }
    });

    yield this.client.SetPermission({objectId, permission: "listable"});
    yield this.rootStore.databaseStore.AddGroupPermissions({objectId});

    yield this.UpdateDatabaseRecord({objectId});
    yield this.LoadMediaProperties(true);
    yield this.LoadMediaProperty({mediaPropertyId: objectId, force: true});

    return objectId;
  });

  SetPropertyPageSlug({mediaPropertyId, slug, pageId, label, clear}) {
    const pageLabel = this.mediaProperties[mediaPropertyId].metadata.public.asset_metadata.info.pages[pageId].label;

    this.SetMetadata({
      objectId: mediaPropertyId,
      page: location.pathname,
      path: "/public/asset_metadata/info/page_ids",
      field: slug,
      value: !clear ? pageId : undefined,
      category: this.MediaPropertyCategory({category: "page_label", mediaPropertyId, type: "pages", id: pageId, label: pageLabel}),
      label
    });
  }

  CreatePage({mediaPropertyId, label, copyPageId}) {
    let id = `${this.ID_PREFIXES["page"]}${GenerateUUID()}`;

    const spec = copyPageId ?
      Clone(toJS(this.mediaProperties[mediaPropertyId].metadata.public.asset_metadata.info.pages[copyPageId])) :
      Clone(MediaPropertyPageSpec);
    spec.id = id;
    spec.label = label || (copyPageId ? `${spec.label} (Copy)` : spec.label);

    this.AddField({
      objectId: mediaPropertyId,
      page: location.pathname,
      path: "/public/asset_metadata/info/pages",
      field: id,
      value: spec,
      category: this.MediaPropertyCategory({category: "page_label", mediaPropertyId, type: "pages", id, label: spec.label}),
      label: spec.label
    });

    return id;
  }

  CreateSection({mediaPropertyId, type="manual", label, copySectionId}) {
    let id = `${this.ID_PREFIXES[`section_${type}`]}${GenerateUUID()}`;

    let spec;
    if(copySectionId) {
      spec = Clone(toJS(this.mediaProperties[mediaPropertyId].metadata.public.asset_metadata.info.sections[copySectionId]));

      // Update IDs of section items
      if(spec.content) {
        spec.content = spec.content.map(sectionItem => ({
          ...sectionItem,
          id: `${sectionItem.id.slice(0, 4)}${GenerateUUID()}`
        }));
      }

      if(spec.hero_items) {
        spec.hero_items = spec.hero_items.map(sectionItem => ({
          ...sectionItem,
          id: `${sectionItem.id.slice(0, 4)}${GenerateUUID()}`
        }));
      }
    } else {
      switch(type) {
        case "manual":
          spec = Clone(MediaPropertySectionManualSpec);
          break;
        case "automatic":
          spec = Clone(MediaPropertySectionAutomaticSpec);
          break;
        case "hero":
          spec = Clone(MediaPropertyHeroSectionSpec);
          break;
        case "container":
          spec = Clone(MediaPropertyContainerSectionSpec);
          break;
        case "spacer":
          spec = Clone(MediaPropertySpacerSectionSpec);
          break;
      }
    }

    spec.id = id;
    spec.label = label || (copySectionId ? `${spec.label} (Copy)` : spec.label);

    this.AddField({
      objectId: mediaPropertyId,
      page: location.pathname,
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
    marketplaceSKU,
    offerId,
    url
  }) {
    let id = `${this.ID_PREFIXES["section_item"]}${GenerateUUID()}`;

    let spec, marketplace;
    switch(type) {
      case "media":
        // eslint-disable-next-line no-case-declarations
        const mediaItem = this.GetMediaItem({mediaItemId});
        spec = Clone(MediaPropertySectionItemMediaSpec);
        spec.media_id = mediaItemId;
        spec.media_type = mediaItem?.type;
        spec.expand = expand;
        break;
      case "item_purchase":
        spec = Clone(MediaPropertySectionItemPurchaseSpec);
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

        marketplace = this.rootStore.marketplaceStore.allMarketplaces.find(marketplace => marketplace.objectId === marketplaceId);
        spec.marketplace = {
          marketplace_id: marketplaceId,
          tenant_slug: marketplace.tenantSlug,
          marketplace_slug: marketplace.marketplaceSlug
        };
        spec.marketplace_sku = marketplaceSKU;
        break;
      case "redeemable_offer":
        spec = Clone(MediaPropertySectionItemRedeemableOfferSpec);

        marketplace = this.rootStore.marketplaceStore.allMarketplaces.find(marketplace => marketplace.objectId === marketplaceId);
        spec.marketplace = {
          marketplace_id: marketplaceId,
          tenant_slug: marketplace.tenantSlug,
          marketplace_slug: marketplace.marketplaceSlug
        };
        spec.marketplace_sku = marketplaceSKU;
        spec.offer_id = offerId;
        break;
      case "external_link":
        spec = Clone(MediaPropertySectionItemExternalLinkSpec);
        spec.url = url;
        break;
      case "visual_only":
        spec = Clone(MediaPropertySectionItemVisualSpec);
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
      fieldName: label,
      label: this.GetSectionItemLabel({sectionItem: spec})
    });

    return id;
  }

  MediaPropertyCategory({category, type="sections", mediaPropertyId, path, id, sectionItemId, label}) {
    return () => {
      if(type === "sectionItem") {
        label = this.GetSectionItemLabel({mediaPropertyId, sectionId: id, sectionItemId}) || label;
      } else {
        label = this.GetMetadata({objectId: mediaPropertyId, path: path || UrlJoin("/public/asset_metadata/info", type, id), field: "label"}) || label;
      }

      return LocalizeString(this.rootStore.l10n.pages.media_property.form.categories[category], { label: label });
    };
  }

  Reload = flow(function * ({objectId}) {
    yield this.LoadMediaProperty({mediaPropertyId: objectId, force: true});
  });

  ApplyMigrations({mediaPropertyId}) {
    const mediaProperty = this.mediaProperties[mediaPropertyId];
    const currentVersion = mediaProperty.metadata.public.asset_metadata.info.version || "1.0.0";

    const migrations = Object.keys(Migrations)
      .filter(version => CompareSemVer(currentVersion, version) < 0)
      .sort(CompareSemVer);

    migrations.forEach(version =>
      Migrations[version]({mediaPropertyId, mediaProperty, store: this})
    );
  }

  Postprocess = flow(function * ({libraryId, objectId, writeToken}) {
    let mediaProperty = yield this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "/public/asset_metadata/info"
    });

    // Ensure validity of dependent search filters
    if(mediaProperty.search?.filter_options) {
      const primaryFilterValues =
        mediaProperty.search.primary_filter === "__media-type" ?
          ["Video", "Gallery", "Image", "Ebook"] :
          this.GetMediaPropertyAttributes({mediaPropertyId: objectId})?.[mediaProperty.search.primary_filter]?.tags || [];
      const validatedSecondaryFilters = (mediaProperty.search.filter_options || [])
        .filter(filterOption =>
          !filterOption.secondary_filter_attribute ||
          (filterOption.secondary_filter_attribute !== mediaProperty.search.primary_filter &&
            (!filterOption.primary_filter_value || primaryFilterValues.includes(filterOption.primary_filter_value)))
        );

      if(validatedSecondaryFilters.length !== mediaProperty.search.filter_options?.length) {
        this.DebugLog({message: "Removing invalid dependent secondary filters"});

        yield this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: "/public/asset_metadata/info/search/filter_options",
          metadata: toJS(validatedSecondaryFilters)
        });
      }
    }

    // Copy named pages
    yield Promise.all(
      Object.keys(mediaProperty.page_ids).map(async slug => {
        const pageId = mediaProperty.page_ids[slug];
        mediaProperty.pages[slug] = { ...mediaProperty.pages[pageId], id: slug, slug };

        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: UrlJoin("/public/asset_metadata/info/pages", slug),
          metadata: {
            ...toJS(mediaProperty.pages[pageId]),
            id: slug,
            slug
          }
        });
      })
    );

    // Build slug map
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
    yield this.LoadMediaProperty({mediaPropertyId: objectId, force: true});

    let modified = false;
    const catalogs = this.mediaProperties[objectId].metadata.public.asset_metadata.info.media_catalogs || [];

    let catalogLinks = {};
    yield Promise.all(catalogs.map(async catalogId => {
      const catalogHash = await this.client.LatestVersionHash({objectId: catalogId});

      catalogLinks[catalogId] = {
        "/": UrlJoin("/qfab", catalogHash, "meta", "public", "asset_metadata", "info")
      };
    }));

    // Determine if any links changed
    const oldCatalogLinks = this.mediaProperties[objectId].metadata.public.asset_metadata.info.media_catalog_links || {};

    modified = JSON.stringify(Object.keys(catalogLinks).sort()) !== JSON.stringify(Object.keys(oldCatalogLinks).sort());

    if(!modified) {
      Object.keys(catalogLinks).forEach(catalogId => {
        if(catalogLinks[catalogId]?.["/"] !== oldCatalogLinks[catalogId]?.["/"]) {
          modified = true;
        }
      });
    }

    const permissionSets = this.mediaProperties[objectId].metadata.public.asset_metadata.info.permission_sets || [];
    let permissionSetLinks = {};
    yield Promise.all(permissionSets.map(async permissionSetId => {
      const permissionSetHash = await this.client.LatestVersionHash({objectId: permissionSetId});

      permissionSetLinks[permissionSetId] = {
        "/": UrlJoin("/qfab", permissionSetHash, "meta", "public", "asset_metadata", "info")
      };
    }));

    if(!modified) {
      const oldPermissionSetLinks = this.mediaProperties[objectId].metadata.public.asset_metadata.info.permission_set_links || {};

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

