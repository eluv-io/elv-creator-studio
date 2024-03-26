import {flow, makeAutoObservable} from "mobx";
import {initializeApp} from "firebase/app";
import * as FS from "firebase/firestore/lite";
import UrlJoin from "url-join";
import {ExtractHashFromLink} from "@/helpers/Fabric.js";

const DATABASE_VERSION = 1;

class DatabaseStore {
  firebase;
  firestore;
  appName = EluvioConfiguration.dev ? "creatorStudio-dev" : "creatorStudio";

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

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  Initialize = flow(function * () {
    try {
      this.rootStore.DebugTimeStart({key: "Database store initialization", level: this.logLevels.DEBUG_LEVEL_INFO});

      // eslint-disable-next-line no-undef
      this.firebase = initializeApp(EluvioConfiguration["firebase-config"]);
      this.firestore = FS.getFirestore(this.firebase);

      // eslint-disable-next-line no-undef
      if(EluvioConfiguration["firebase-local"] && !this.firestore._settingsFrozen) {
        FS.connectFirestoreEmulator(this.firestore, "127.0.0.1", 9001);
      }

      yield this.ScanContent();
    } catch(error) {
      this.DebugLog({message: error, level: this.logLevels.DEBUG_LEVEL_ERROR});
    } finally {
      this.rootStore.DebugTimeEnd({key: "Database store initialization", level: this.logLevels.DEBUG_LEVEL_INFO});
    }
  });

  InitializeTypes = flow(function * () {
    this.rootStore.DebugLog({message: "Initializing Types", level: this.logLevels.DEBUG_LEVEL_MEDIUM});
    this.rootStore.uiStore.SetLoadingMessage(this.l10n.stores.initialization.loading.types);

    const typeNames = {
      tenant: "Tenant",
      marketplace: "Marketplace",
      site: "Drop Event Site",
      template: "Template",
      mezzanine: "Title",
      mediaCatalog: "Media Catalog",
      mediaProperty: "Media Property"
    };

    let typeIds = {};

    const allTypes = yield this.client.ContentTypes();

    yield Promise.all(
      Object.keys(typeNames).map(async key => {
        const name = typeNames[key];
        const existingType = Object.values(allTypes)
          .find(type =>
            type.name?.toLowerCase()?.includes(name.toLowerCase())
          );

        if(existingType) {
          typeIds[key] = existingType.id;
        } else {
          // Create type
          this.rootStore.DebugLog({message: `Creating Type ${name}`, level: this.logLevels.DEBUG_LEVEL_MEDIUM});

          typeIds[key] = await this.client.CreateContentType({
            metadata: {
              "bitcode_flags": "abrmaster",
              "bitcode_format": "builtin",
              "description": "",
              "name": name,
              "public": {
                "description": "",
                "eluv.manageApp": "default",
                "name": name,
                "title_configuration": {
                  "profile": {
                    "name": `Eluvio ${name}`,
                    "version": "1.0"
                  }
                }
              }
            }
          });
        }
      })
    );

    return typeIds;
  });

  ScanContent = flow(function * ({force}={}) {
    this.rootStore.DebugLog({message: "Initializing database setup", level: this.logLevels.DEBUG_LEVEL_MEDIUM});

    // Problem: The only reliable way to determine the 'right' tenant ID is by finding the properties library
    const tenantInfo = yield this.GetDocument({collection: "tenant", document: "info"});
    const dbInfo = yield this.GetDocument({collection: "database", document: "info"});

    const isOldDB = !dbInfo || dbInfo.version < DATABASE_VERSION;

    if(tenantInfo && !isOldDB && !force) {
      this.rootStore.DebugLog({message: "Database already set up - skipping", level: this.logLevels.DEBUG_LEVEL_MEDIUM});
      return;
    }

    this.rootStore.DebugLog({message: "Finding properties library", level: this.logLevels.DEBUG_LEVEL_MEDIUM});

    const libraryIds = yield this.client.ContentLibraries();

    // Find properties library
    let propertiesLibraryId;
    for(const libraryId of libraryIds) {
      try {
        const metadata = yield this.client.ContentObjectMetadata({
          libraryId,
          objectId: libraryId.replace("ilib", "iq__"),
          metadataSubtree: "public"
        });

        if(metadata?.name?.toLowerCase()?.includes("- properties")) {
          propertiesLibraryId = libraryId;
          break;
        }
      } catch(error) {
        this.rootStore.DebugLog({message: "Unable to query library", error, level: this.logLevels.DEBUG_LEVEL_ERROR});
      }
    }

    if(!propertiesLibraryId) {
      this.DebugLog({message: "No properties library found", level: this.logLevels.DEBUG_LEVEL_ERROR});
      return;
    }

    this.rootStore.DebugLog({message: "Loading content from properties", level: this.logLevels.DEBUG_LEVEL_MEDIUM});
    this.rootStore.uiStore.SetLoadingMessage(this.l10n.stores.initialization.loading.properties);

    // Retrieve content objects in library and their metadata
    const { contents } = yield this.client.ContentObjects({
      libraryId: propertiesLibraryId,
      filterOptions: {
        select: ["public"],
        limit: 10000
      }
    });

    // Get type info for objects
    const objects = (yield Promise.all(
      contents.map(async object => {
        try {
          const objectId = object.id;
          const metadata = object.versions[0].meta;
          const objectInfo = await this.client.ContentObject({libraryId: propertiesLibraryId, objectId});
          const typeId = objectInfo.type ? this.utils.DecodeVersionHash(objectInfo.type).objectId : "";
          const name = metadata.public?.name || "";

          return {
            typeId,
            libraryId: propertiesLibraryId,
            objectId,
            name,
            metadata,
          };
        } catch(error) {
          this.DebugLog({message: error, level: this.logLevels.DEBUG_LEVEL_LOW});
        }
      })
    ))
      .filter(object => object);

    let content = {
      tenant: undefined,
      marketplaces: {},
      sites: {},
      templates: {},
      mediaCatalogs: {},
      mediaProperties: {}
    };

    const typeIds = yield this.InitializeTypes();

    this.rootStore.DebugLog({message: "Classifying content from properties", level: this.logLevels.DEBUG_LEVEL_MEDIUM});

    objects.forEach(object => {
      const typeKey = Object.keys(typeIds).find(key => object.typeId === typeIds[key]);

      switch(typeKey) {
        case "marketplace":
          object.brandedName = object.metadata.public?.asset_metadata?.info?.branding?.name || "";
          object.description = object.metadata.public?.asset_metadata?.info?.branding?.description || "";

          content.marketplaces[object.objectId] = object;
          break;
        case "site":
          object.brandedName = object.metadata.public?.asset_metadata?.info?.name || object.metadata.public?.name;
          content.sites[object.objectId] = object;
          break;
        case "tenant":
          content.tenant = object;
          break;
        case "mediaCatalog":
          object.name = object.metadata.public?.asset_metadata?.info?.name || object.metadata.public?.name;
          content.mediaCatalogs[object.objectId] = object;
          break;
        case "mediaProperty":
          object.name = object.metadata.public?.asset_metadata?.info?.name || object.metadata.public?.name;
          content.mediaProperties[object.objectId] = object;
          break;
      }
    });

    if(!content.tenant) {
      this.DebugLog({message: "Unable to find tenant object", level: this.logLevels.DEBUG_LEVEL_ERROR});
      return;
    }

    this.rootStore.DebugLog({message: "Determining slugs for properties", level: this.logLevels.DEBUG_LEVEL_MEDIUM});

    // Determine slugs
    const tenantSlug = content.tenant.metadata.public.asset_metadata.slug;
    content.tenant.tenantSlug = tenantSlug;

    Object.keys(content.marketplaces).forEach(marketplaceId => {
      content.marketplaces[marketplaceId].tenantSlug = tenantSlug;
      content.marketplaces[marketplaceId].marketplaceSlug = content.marketplaces[marketplaceId].metadata.public.asset_metadata.slug;
    });

    yield Promise.all(
      Object.keys(content.sites).map(async siteId => {
        content.sites[siteId].tenantSlug = tenantSlug;
        content.sites[siteId].siteSlug = content.sites[siteId].metadata.public.asset_metadata.slug;

        // Determine marketplaces
        content.sites[siteId].primaryMarketplace = await this.MarketplaceInfo(
          content.sites[siteId].metadata.public?.asset_metadata?.info.marketplace_info || {}
        );

        content.sites[siteId].additionalMarketplaces = await Promise.all(
          (content.sites[siteId].metadata.public?.asset_metadata?.info.additional_marketplaces || []).map(async marketplaceInfo =>
            await this.MarketplaceInfo(marketplaceInfo)
          )
        );
      })
    );

    yield Promise.all(
      Object.keys(content.mediaCatalogs).map(async mediaCatalogId => {
        content.mediaCatalogs[mediaCatalogId].tenantSlug = tenantSlug;
      })
    );

    yield Promise.all(
      Object.keys(content.mediaProperties).map(async mediaPropertyId => {
        content.mediaProperties[mediaPropertyId].tenantSlug = tenantSlug;
      })
    );

    this.rootStore.DebugLog({message: "Loading templates", level: this.logLevels.DEBUG_LEVEL_MEDIUM});
    this.rootStore.uiStore.SetLoadingMessage(this.l10n.stores.initialization.loading.templates);

    // Determine NFT templates
    for(const marketplace of Object.values(content.marketplaces)) {
      let templateIds = [];
      yield this.utils.LimitedMap(
        10,
        marketplace.metadata.public?.asset_metadata?.info?.items || [],
        async item => {
          try {
            const templateHash = ExtractHashFromLink(item.nft_template);

            if(!templateHash) { return; }

            const templateId = this.utils.DecodeVersionHash(templateHash).objectId;
            const templateLibraryId = await this.rootStore.LibraryId({objectId: templateId});

            // Template referenced and loaded already, add to referenced marketplace list and stop
            if(content.templates[templateId]) {
              content.templates[templateId].associatedSKUs[marketplace.objectId] =
                content.templates[templateId].associatedSKUs[marketplace.objectId] || [];

              content.templates[templateId].associatedSKUs[marketplace.objectId].push(item.sku);

              return;
            }

            if(!templateIds.includes(templateId)) {
              templateIds.push(templateId);
            }

            const metadata = {
              public: await this.client.ContentObjectMetadata({
                libraryId: templateLibraryId,
                objectId: templateId,
                metadataSubtree: "public"
              })
            };

            content.templates[templateId] = {
              libraryId: templateLibraryId,
              objectId: templateId,
              name: metadata.public?.name || "",
              brandedName: metadata.public?.asset_metadata?.nft?.display_name || "",
              image: metadata.public?.asset_metadata?.nft?.image || "",
              address: metadata.public?.asset_metadata?.nft?.address || "",
              test: metadata.public?.asset_metadata?.nft?.test || false,
              associatedSKUs: {
                [marketplace.objectId]: [
                  item.sku
                ]
              },
              metadata
            };
          } catch(error) {
            this.DebugLog({message: error, level: this.logLevels.DEBUG_LEVEL_MEDIUM});
          }
        }
      );

      marketplace.templateIds = templateIds;
    }

    /*
    this.rootStore.DebugLog({message: "Loading media", level: this.logLevels.DEBUG_LEVEL_MEDIUM});
    this.rootStore.uiStore.SetLoadingMessage(this.l10n.stores.initialization.loading.media);

    // Determine media
    for(const template of Object.values(content.templates)) {
      const metadata = template.metadata.public?.asset_metadata?.nft || {};

      // Aggregate media
      let mediaList = [];
      if(metadata.additional_media_type?.toLowerCase() === "sections") {
        mediaList = [...(metadata.additional_media_sections?.featured_media || [])];

        metadata.additional_media_sections.sections.forEach(section =>
          section.collections.forEach(collection => {
            mediaList = [
              ...mediaList,
              ...collection.media.map(media => ({
                ...media,
                sectionId: section.id,
                collectionId: collection.id,
                mediaId: media.id
              }))
            ];
          })
        );
      } else {
        mediaList = metadata.additional_media || [];
      }

      // Parse media
      yield this.utils.LimitedMap(
        10,
        mediaList,
        async media => {
          try {
            if(!["live video", "video", "audio"].includes(media.media_type?.toLowerCase())) {
              return;
            }

            const mediaHash = ExtractHashFromLink(media.media_link);

            if(!mediaHash) { return; }

            const mediaId = this.utils.DecodeVersionHash(mediaHash).objectId;
            const mediaLibraryId = await this.rootStore.LibraryId({objectId: mediaId});

            if(!content.types.mezzanine) {
              const objectInfo = await this.client.ContentObject({libraryId: mediaLibraryId, objectId: mediaId});
              content.types.mezzanine = objectInfo.type ? this.utils.DecodeVersionHash(objectInfo.type).objectId : undefined;
            }

            // Media referenced in another marketplace, add to referenced marketplace list and stop
            if(content.media[mediaId]) {
              if(!content.media[mediaId].templates.includes(template.objectId)) {
                content.media[mediaId].templates.push(template.objectId);
                content.media[mediaId].templateMediaIds.push({
                  sectionId: media.sectionId || "",
                  collectionId: media.collectionId || "",
                  mediaId: media.mediaId || ""
                });
              }

              return;
            }

            const metadata = {
              public: await this.client.ContentObjectMetadata({
                libraryId: mediaLibraryId,
                objectId: mediaId,
                metadataSubtree: "public"
              })
            };

            content.media[mediaId] = {
              libraryId: mediaLibraryId,
              objectId: mediaId,
              name: metadata.public?.name || "",
              brandedName: media.name || "",
              templates: [template.objectId],
              templateMediaIds: [{
                sectionId: media.sectionId || "",
                collectionId: media.collectionId || "",
                mediaId: media.mediaId || ""
              }],
              metadata
            };
          } catch(error) {
            this.DebugLog({message: error, level: this.logLevels.DEBUG_LEVEL_MEDIUM});
          }
        }
      );
    }

     */

    this.rootStore.DebugLog({message: "Saving to database", level: this.logLevels.DEBUG_LEVEL_MEDIUM});
    this.rootStore.uiStore.SetLoadingMessage(this.l10n.stores.initialization.loading.saving);

    // Write data
    let tenant = {
      ...content.tenant,
      tenantId: this.rootStore.tenantId,
      propertiesLibraryId
    };
    delete tenant.metadata;

    this.DebugLog({message: content, level: this.logLevels.DEBUG_LEVEL_INFO});

    let batch = FS.writeBatch(this.firestore);

    yield this.WriteDocument({batch, collection: "tenant", document: "info",  content: tenant});
    yield this.WriteDocument({batch, collection: "tenant", document: "types",  content: typeIds});

    yield Promise.all(
      Object.values(content.marketplaces).map(async marketplace => {
        marketplace = { ...marketplace };
        delete marketplace.metadata;

        await this.WriteDocument({batch, collection: "marketplaces", document: marketplace.objectId, content: marketplace});
      })
    );

    yield Promise.all(
      Object.values(content.sites).map(async site => {
        site = { ...site };
        delete site.metadata;

        await this.WriteDocument({batch, collection: "sites", document: site.objectId, content: site});
      })
    );

    yield Promise.all(
      Object.values(content.mediaCatalogs).map(async mediaCatalog => {
        mediaCatalog = { ...mediaCatalog };
        delete mediaCatalog.metadata;

        await this.WriteDocument({batch, collection: "mediaCatalogs", document: mediaCatalog.objectId, content: mediaCatalog});
      })
    );

    yield Promise.all(
      Object.values(content.mediaProperties).map(async mediaProperty => {
        mediaProperty = { ...mediaProperty };
        delete mediaProperty.metadata;

        await this.WriteDocument({batch, collection: "mediaProperties", document: mediaProperty.objectId, content: mediaProperty});
      })
    );

    yield batch.commit();

    batch = FS.writeBatch(this.firestore);
    yield Promise.all(
      Object.values(content.templates).map(async template => {
        template = { ...template };
        delete template.metadata;

        await this.WriteDocument({batch, collection: "templates", document: template.objectId, content: template});
      })
    );

    yield this.WriteDocument({batch, collection: "database", document: "info",  content: { version: DATABASE_VERSION, created: new Date().toISOString() }});
    yield batch.commit();


    /*
    batch = FS.writeBatch(this.firestore);
    yield Promise.all(
      Object.values(content.media).map(async media => {
        media = { ...media };
        delete media.metadata;

        await this.WriteDocument({batch, collection: "media", document: media.objectId, content: media});
      })
    );
    yield batch.commit();

     */
  });

  // Retrieve marketplace ID by resolving link, if necessary
  async MarketplaceInfo(marketplaceInfo) {
    let info = {
      marketplace_id: marketplaceInfo.marketplace_id || marketplaceInfo.objectId || "",
      tenant_slug: marketplaceInfo.tenant_slug || marketplaceInfo.tenantSlug || "",
      marketplace_slug: marketplaceInfo.marketplace_slug || marketplaceInfo.marketplaceSlug || ""
    };

    // Marketplace ID not present in metadata, try finding from all marketplaces in database, or from the marketplace link
    if(marketplaceInfo.marketplace_slug && !marketplaceInfo.marketplace_id) {
      await this.rootStore.marketplaceStore.LoadMarketplaces();

      info.marketplace_id = this.rootStore.marketplaceStore.allMarketplaces?.find(marketplace =>
        marketplace.marketplaceSlug === marketplaceInfo.marketplace_slug
      )?.objectId;

      if(!info.marketplace_id) {
        const marketplaceLink = await this.client.ContentObjectMetadata({
          libraryId: this.rootStore.liveConfig.staging.siteLibraryId,
          objectId: this.rootStore.liveConfig.staging.siteId,
          metadataSubtree: UrlJoin("public/asset_metadata/tenants", marketplaceInfo.tenant_slug, "marketplaces", marketplaceInfo.marketplace_slug)
        });

        info.marketplace_id = !marketplaceLink ? "" : this.utils.DecodeVersionHash(ExtractHashFromLink(marketplaceLink)).objectId;
      }
    }

    return info;
  }

  SaveMarketplace = flow(function * ({batch, marketplaceId}) {
    const libraryId = yield this.client.ContentObjectLibraryId({objectId: marketplaceId});
    const metadata = {
      public: yield this.client.ContentObjectMetadata({
        libraryId,
        objectId: marketplaceId,
        metadataSubtree: "/public"
      })
    };

    const templateIds = metadata.public?.asset_metadata?.info?.items
      ?.map(item =>
        item.nft_template ? this.utils.DecodeVersionHash(ExtractHashFromLink(item.nft_template)).objectId : undefined
      )
      ?.filter(t => t)
      ?.filter((v, i, a) => a.indexOf(v) === i);

    let object = {
      libraryId,
      objectId: marketplaceId,
      tenantSlug: this.rootStore.tenantInfo.tenantSlug,
      marketplaceSlug: metadata.public?.asset_metadata?.slug,
      name: metadata.public?.name,
      brandedName:
        metadata.public?.asset_metadata?.info?.branding?.name ||
        metadata.public?.name,
      description: metadata.public?.asset_metadata?.info?.branding?.description || "",
      templateIds
    };

    yield this.WriteDocument({
      batch,
      collection: "marketplaces",
      document: marketplaceId,
      content: object
    });
  });

  SaveSite = flow(function * ({batch, siteId}) {
    const libraryId = yield this.client.ContentObjectLibraryId({objectId: siteId});
    const metadata = {
      public: yield this.client.ContentObjectMetadata({
        libraryId,
        objectId: siteId,
        metadataSubtree: "/public"
      })
    };

    const marketplaceInfo = metadata.public?.asset_metadata?.info.marketplace_info || {};
    const additionalMarketplaces = metadata.public?.asset_metadata?.info.additional_marketplaces || [];

    let object = {
      libraryId,
      objectId: siteId,
      tenantSlug: this.rootStore.tenantInfo.tenantSlug,
      siteSlug: metadata.public?.asset_metadata?.slug,
      name: metadata.public?.name,
      brandedName:
        metadata.public?.asset_metadata?.info?.name ||
        metadata.public?.name,
      description: metadata.public?.asset_metadata?.info?.branding?.description || "",
      primaryMarketplace: yield this.MarketplaceInfo(marketplaceInfo),
      additionalMarketplaces: yield Promise.all(
        additionalMarketplaces.map(async marketplaceInfo => await this.MarketplaceInfo(marketplaceInfo))
      )
    };

    yield this.WriteDocument({
      batch,
      collection: "sites",
      document: siteId,
      content: object
    });
  });

  SaveItemTemplate = flow(function * ({batch, itemTemplateId}) {
    const libraryId = yield this.client.ContentObjectLibraryId({objectId: itemTemplateId});
    const metadata = {
      public: yield this.client.ContentObjectMetadata({
        libraryId,
        objectId: itemTemplateId,
        metadataSubtree: "/public"
      })
    };

    yield this.rootStore.marketplaceStore.LoadMarketplaces();
    let associatedSKUs = {};
    yield Promise.all(
      this.rootStore.marketplaceStore.allMarketplaces.map(async marketplace => {
        const metadata =
          this.rootStore.marketplaceStore.marketplaces[marketplace.objectId]?.metadata ||
          {
            public: await this.client.ContentObjectMetadata({
              versionHash: await this.client.LatestVersionHash({objectId: marketplace.objectId}),
              metadataSubtree: "public",
              select: [
                "asset_metadata/info/items/*/sku",
                "asset_metadata/info/items/*/nft_template"
              ]
            })
          };

        (metadata.public?.asset_metadata?.info?.items || []).forEach(item => {
          const itemHash = ExtractHashFromLink(item.nft_template);

          if(!itemHash || this.utils.DecodeVersionHash(itemHash).objectId !== itemTemplateId) {
            return;
          }

          associatedSKUs[marketplace.objectId] =
            associatedSKUs[marketplace.objectId] || [];

          associatedSKUs[marketplace.objectId].push(item.sku);
        });
      })
    );

    let object = {
      libraryId,
      objectId: itemTemplateId,
      name: metadata.public?.name || "",
      brandedName: metadata.public?.asset_metadata?.nft?.display_name || "",
      image: metadata.public?.asset_metadata?.nft?.image || "",
      address: metadata.public?.asset_metadata?.nft?.address || "",
      associatedSKUs
    };

    yield this.WriteDocument({
      batch,
      collection: "templates",
      document: itemTemplateId,
      content: object
    });
  });

  SaveMediaCatalog = flow(function * ({batch, mediaCatalogId}) {
    const libraryId = yield this.client.ContentObjectLibraryId({objectId: mediaCatalogId});
    const metadata = {
      public: yield this.client.ContentObjectMetadata({
        libraryId,
        objectId: mediaCatalogId,
        metadataSubtree: "/public"
      })
    };

    let object = {
      libraryId,
      objectId: mediaCatalogId,
      tenantSlug: this.rootStore.tenantInfo.tenantSlug,
      name: metadata.public?.asset_metadata?.info?.name || metadata.public?.name || "",
      description: metadata.public?.asset_metadata?.info?.description || "",
      id: metadata.public?.asset_metadata?.info?.id
    };

    yield this.WriteDocument({
      batch,
      collection: "mediaCatalogs",
      document: mediaCatalogId,
      content: object
    });
  });

  SaveMediaProperty = flow(function * ({batch, mediaPropertyId}) {
    const libraryId = yield this.client.ContentObjectLibraryId({objectId: mediaPropertyId});
    const metadata = {
      public: yield this.client.ContentObjectMetadata({
        libraryId,
        objectId: mediaPropertyId,
        metadataSubtree: "/public"
      })
    };

    let object = {
      libraryId,
      objectId: mediaPropertyId,
      tenantSlug: this.rootStore.tenantInfo.tenantSlug || "",
      propertySlug: metadata.public?.asset_metadata?.info?.slug || "",
      name: metadata.public?.asset_metadata?.info?.name || metadata.public?.name || "",
      description: metadata.public?.asset_metadata?.info?.description || "",
      id: metadata.public?.asset_metadata?.info?.id
    };

    yield this.WriteDocument({
      batch,
      collection: "mediaProperties",
      document: mediaPropertyId,
      content: object
    });
  });

  GetCollection = flow(function * ({collection, conditions}) {
    try {
      let ref = FS.collection(this.firestore, "apps", this.appName, "tenants", this.rootStore.tenantId, collection);
      if(conditions && conditions.length > 0) {
        ref = FS.query(ref, FS.where(...conditions));
      }

      let results = [];
      (yield FS.getDocs(ref)).forEach(doc =>
        doc.data() && results.push(doc.data())
      );

      return results;
    } catch(error) {
      this.DebugLog({message: error, level: this.logLevels.DEBUG_LEVEL_INFO});
    }
  });

  GetDocument = flow(function * ({collection, document}) {
    try {
      const ref = FS.doc(this.firestore, "apps", this.appName, "tenants", this.rootStore.tenantId, collection, document);
      const results = yield FS.getDoc(ref);

      if(results.exists()) {
        return results.data();
      }
    } catch(error) {
      this.DebugLog({message: error, level: this.logLevels.DEBUG_LEVEL_INFO});
    }
  });

  WriteDocument = flow(function * ({batch, collection, document, content}) {
    try {
      this.rootStore.DebugLog({
        message: `${batch ? "(batch) " : ""} Writing ${UrlJoin("apps", this.appName, "tenants", this.rootStore.tenantId, collection, document)}`,
        level: this.logLevels.DEBUG_LEVEL_INFO
      });

      content.updated = new Date().toISOString();

      const ref = FS.doc(this.firestore, "apps", this.appName, "tenants", this.rootStore.tenantId, collection, document);
      if(batch) {
        batch.set(ref, content);
      } else {
        yield FS.setDoc(ref, content);
      }
    } catch(error) {
      this.DebugLog({message: `Error writing to firestore: /${collection}/${document}`, level: this.logLevels.DEBUG_LEVEL_ERROR});
      this.DebugLog({message: content, level: this.logLevels.DEBUG_LEVEL_ERROR});
      throw error;
    }
  });
}

export default DatabaseStore;
