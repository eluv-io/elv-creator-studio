// Example store

import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";
import {FabricUrl} from "@/helpers/Fabric.js";

class ItemTemplateStore {
  allItemTemplates;
  itemTemplates = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  LoadItemTemplates = flow(function * () {
    if(this.allItemTemplates) { return; }

    this.allItemTemplates = (yield this.rootStore.databaseStore.GetCollection({collection: "templates"}))
      .map(itemTemplate => ({
        ...itemTemplate,
        contractId: itemTemplate.address ? `ictr${this.utils.AddressToHash(itemTemplate.address)}` : ""
      }));
  });

  LoadItemTemplate = flow(function * ({itemTemplateId, force=false}) {
    if(this.itemTemplates[itemTemplateId] && !force) { return; }

    yield this.LoadItemTemplates();

    const info = this.allItemTemplates.find(itemTemplate => itemTemplate.objectId === itemTemplateId);

    const libraryId = yield this.rootStore.LibraryId({objectId: itemTemplateId});

    this.itemTemplates[itemTemplateId] = {
      ...info,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: itemTemplateId,
          metadataSubtree: "public",
          resolveLinks: true,
          linkDepthLimit: 1,
          resolveIgnoreErrors: true,
          resolveIncludeSource: true,
          produceLinkUrls: true
        }))
      }
    };

    this.SetListFieldIds({
      objectId: itemTemplateId,
      path: "/public/asset_metadata/nft/redeemable_offers",
      category: this.rootStore.l10n.pages.item_template.form.categories.redeemable_offer,
      label: this.rootStore.l10n.pages.item_template.form.common.id.label,
    });
  });

  Reload = flow(function * ({objectId}) {
    yield this.LoadItemTemplate({itemTemplateId: objectId, force: true});
  });

  Postprocess = flow(function * ({libraryId, objectId, writeToken}) {
    const itemTemplate = this.itemTemplates[objectId];
    if(typeof itemTemplate.metadata?.public?.asset_metadata?.mint?.merge_meta === "string") {
      const parsedMeta = JSON.parse(itemTemplate.metadata?.public?.asset_metadata?.mint?.merge_meta);
      yield this.client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "/public/asset_metadata/mint/merge_meta",
        metadata: parsedMeta
      });
    }
  });

  async SelfEmbedUrl({objectId}) {
    const latestHash = await this.client.LatestVersionHash({objectId});
    const itemTemplate = this.itemTemplates[objectId];
    const primaryMediaHasAudio = itemTemplate.metadata?.public?.asset_metadata?.nft?.has_audio;

    let embedUrl = new URL("https://embed.v3.contentfabric.io");

    embedUrl.searchParams.set("p", "");
    embedUrl.searchParams.set("net", this.rootStore.network === "demov3" ? "demo" : this.rootStore.network);
    embedUrl.searchParams.set("vid", latestHash);

    if(primaryMediaHasAudio) {
      embedUrl.searchParams.set("ct", "h");
    } else {
      embedUrl.searchParams.set("m", "h");
      embedUrl.searchParams.set("lp", "h");
      embedUrl.searchParams.set("ap", "h");
    }

    return embedUrl.toString();
  }

  PostSave = flow(function * ({libraryId, objectId}) {
    // Generate new self-referential URLs
    yield this.client.EditAndFinalizeContentObject({
      libraryId,
      objectId,
      commitMessage: "Update self-referential URLs",
      callback: async ({writeToken}) => {
        const embedUrl = await this.SelfEmbedUrl({objectId});
        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: "/public/asset_metadata/nft/embed_url",
          metadata: embedUrl
        });
        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: "/public/asset_metadata/nft/external_url",
          metadata: embedUrl
        });
        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: "/public/asset_metadata/nft/marketplace_attributes/opensea/youtube_url",
          metadata: embedUrl
        });
        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: "/public/asset_metadata/nft/token_uri",
          metadata: FabricUrl({
            versionHash: await this.client.LatestVersionHash({objectId}),
            path: "/meta/public/asset_metadata/nft",
            noWriteToken: true
          })
        });
      }
    });
  });

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

AddActions(ItemTemplateStore, "itemTemplates");

export default ItemTemplateStore;
