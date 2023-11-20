import {flow, makeAutoObservable} from "mobx";
import {initializeApp} from "firebase/app";
import * as FS from "firebase/firestore/lite";
import UrlJoin from "url-join";
import {ExtractHashFromLink} from "@/helpers/Fabric.js";

class DatabaseStore {
  firebase;
  firestore;

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

      if(this.rootStore.tenantInfo) {
        // Tenant info retrieved from localstorage, make sure it's actually in the database
        const tenantInfoFromDB = yield this.rootStore.databaseStore.GetDocument({
          collection: "tenant",
          document: "info"
        });

        if(tenantInfoFromDB) {
          this.rootStore.DebugLog({
            message: "Tenant info retrieved from local storage - skipping initialization",
            level: this.logLevels.DEBUG_LEVEL_LOW
          });

          return;
        }
      }

      yield this.ScanContent();
    } catch(error) {
      this.DebugLog({message: error, level: this.logLevels.DEBUG_LEVEL_ERROR});
    } finally {
      this.rootStore.DebugTimeEnd({key: "Database store initialization", level: this.logLevels.DEBUG_LEVEL_INFO});
    }
  });

  ScanContent = flow(function * ({force}={}) {
    this.rootStore.DebugLog({message: "Initializing database setup", level: this.logLevels.DEBUG_LEVEL_MEDIUM});

    this.rootStore.DebugLog({message: "Finding properties library", level: this.logLevels.DEBUG_LEVEL_MEDIUM});

    const libraryIds = yield this.client.ContentLibraries();

    // Find properties library
    let propertiesLibraryId;
    for(const libraryId of libraryIds) {
      const metadata = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId: libraryId.replace("ilib", "iq__"),
        metadataSubtree: "public"
      });

      if(metadata?.name?.toLowerCase()?.includes("- properties")) {
        propertiesLibraryId = libraryId;
        break;
      }
    }

    if(!propertiesLibraryId) {
      this.DebugLog({message: "No properties library found", level: this.logLevels.DEBUG_LEVEL_ERROR});
      return;
    }

    // Problem: The only reliable way to determine the 'right' tenant ID is by finding the properties library
    const tenantId = yield this.client.ContentObjectTenantId({objectId: propertiesLibraryId});
    const tenantInfo = yield this.GetDocument({collection: "tenant", document: "info"});

    if(tenantInfo) {
      this.rootStore.SetTenantInfo({
        ...tenantInfo,
        tenantId
      });

      if(!force) {
        return;
      }
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
    let typeIds = [];
    const objects = (yield Promise.all(
      contents.map(async object => {
        try {
          const objectId = object.id;
          const metadata = object.versions[0].meta;
          const objectInfo = await this.client.ContentObject({libraryId: propertiesLibraryId, objectId});
          const typeId = objectInfo.type ? this.utils.DecodeVersionHash(objectInfo.type).objectId : "";
          const name = metadata.public?.name || "";

          if(!typeIds.includes(typeId)) {
            typeIds.push(typeId);
          }

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
      media: {},
      types: {
        tenant: "",
        marketplace: "",
        site: "",
        template: "",
        mezzanine: ""
      }
    };

    this.rootStore.DebugLog({message: "Classifying content from properties", level: this.logLevels.DEBUG_LEVEL_MEDIUM});

    // Classify property objects by type
    yield Promise.all(
      typeIds.map(async typeId => {
        try {
          let { name } = await this.client.ContentType({
            typeId,
            publicOnly: true
          });

          if(!name) { return; }

          name = name.toLowerCase();

          if(name.includes("marketplace")) {
            content.types.marketplace = typeId;
            objects.forEach(object => {
              if(object.typeId !== typeId) { return; }

              object.brandedName = object.metadata.public?.asset_metadata?.info?.branding?.name || "";
              object.description = object.metadata.public?.asset_metadata?.info?.branding?.description || "";

              content.marketplaces[object.objectId] = object;
            });
          } else if(name.includes("event site")) {
            // Only use newer 'drop event site' type vs old 'event site' type
            if(name.includes("drop event site")) {
              content.types.site = typeId;
            }

            objects.forEach(object => {
              if(object.typeId !== typeId) { return; }

              object.brandedName = object.metadata.public?.asset_metadata?.info?.name || object.metadata.public?.name;
              content.sites[object.objectId] = object;
            });
          } else if(name.includes("tenant")) {
            content.types.tenant = typeId;

            content.tenant = objects.find(object => object.typeId === typeId);
          }
        } catch(error) {
          this.DebugLog({message: error, level: this.logLevels.DEBUG_LEVEL_MEDIUM});
        }
      })
    );

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

            if(!content.types.template) {
              const objectInfo = await this.client.ContentObject({libraryId: templateLibraryId, objectId: templateId});
              content.types.template = objectInfo.type ? this.utils.DecodeVersionHash(objectInfo.type).objectId : undefined;
            }

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

    this.rootStore.DebugLog({message: "Saving to database", level: this.logLevels.DEBUG_LEVEL_MEDIUM});
    this.rootStore.uiStore.SetLoadingMessage(this.l10n.stores.initialization.loading.saving);

    // Write data
    let tenant = { ...content.tenant };
    delete tenant.metadata;

    this.DebugLog({message: content, level: this.logLevels.DEBUG_LEVEL_INFO});

    this.rootStore.SetTenantInfo({
      ...tenantInfo,
      tenantId
    });

    let batch = FS.writeBatch(this.firestore);

    yield this.WriteDocument({batch, collection: "tenant", document: "info",  content: tenant});
    yield this.WriteDocument({batch, collection: "tenant", document: "types",  content: content.types});

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

    yield batch.commit();

    batch = FS.writeBatch(this.firestore);
    yield Promise.all(
      Object.values(content.templates).map(async template => {
        template = { ...template };
        delete template.metadata;

        await this.WriteDocument({batch, collection: "templates", document: template.objectId, content: template});
      })
    );
    yield batch.commit();

    batch = FS.writeBatch(this.firestore);
    yield Promise.all(
      Object.values(content.media).map(async media => {
        media = { ...media };
        delete media.metadata;

        await this.WriteDocument({batch, collection: "media", document: media.objectId, content: media});
      })
    );
    yield batch.commit();
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

        info.marketplace_id = !marketplaceLink ? undefined : this.utils.DecodeVersionHash(ExtractHashFromLink(marketplaceLink)).objectId;
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

  // TODO: Update media records as well
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

  GetCollection = flow(function * ({collection, conditions}) {
    try {
      let ref = FS.collection(this.firestore, "tenants", this.rootStore.tenantId, collection);
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
      const ref = FS.doc(this.firestore, "tenants", this.rootStore.tenantId, collection, document);
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
        message: `${batch ? "(batch) " : ""} Writing ${UrlJoin("tenants", this.rootStore.tenantId, collection, document)}`,
        level: this.logLevels.DEBUG_LEVEL_INFO
      });

      const ref = FS.doc(this.firestore, "tenants", this.rootStore.tenantId, collection, document);
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
