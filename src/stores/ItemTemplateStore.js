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

  LoadItemTemplates = flow(function * (force=false) {
    if(this.allItemTemplates && !force) { return; }

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

    const versionHash = yield this.client.LatestVersionHash({objectId: itemTemplateId});

    this.itemTemplates[itemTemplateId] = {
      ...info,
      versionHash,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: itemTemplateId,
          metadataSubtree: "public",
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

  /*
  Postprocess = flow(function * ({libraryId, objectId, writeToken}) {

  });
  */

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
    const versionHash = yield this.client.LatestVersionHash({objectId});
    const embedUrl = yield this.SelfEmbedUrl({objectId});
    const tokenURI = FabricUrl({
      versionHash,
      path: "/meta/public/asset_metadata/nft",
      noWriteToken: true
    });

    const metadata = yield this.client.ContentObjectMetadata({
      versionHash,
      metadataSubtree: "/public/asset_metadata/nft"
    });

    // Generate new self-referential URLs
    yield this.client.EditAndFinalizeContentObject({
      libraryId,
      objectId,
      commitMessage: "Build /public/nft and Update self-referential URLs",
      callback: async ({writeToken}) => {
        // See elv-live-js - NftMake
        await this.client.MergeMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: "/public/nft",
          metadata: {
            test: metadata.test,
            name: metadata.name,
            display_name: metadata.display_name,
            description: metadata.description,
            edition_name: metadata.edition_name,
            rich_text: metadata.rich_text,
            copyright: metadata.copyright,
            created_at: metadata.created_at,
            creator: metadata.creator,
            image: metadata.image,
            playable: metadata.playable,
            style: metadata.style,
            collection_name: metadata.collection_name,
            collection_image: metadata.collection_image,

            address: metadata.address,
            total_supply: metadata.total_supply,
            template_id: metadata.template_id,
            id_format: metadata.id_format,

            embed_url: embedUrl,
            external_url: embedUrl,
            token_uri: tokenURI,

            marketplace_attributes: {
              opensea: {
                youtube_url: embedUrl
              }
            }
          }
        });

        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: "/public/nft/attributes",
          metadata: [
            {
              trait_type: "Creator",
              value: "Eluvio NFT Central",
            },
            {
              trait_type: "Total Minted Supply",
              value: metadata.total_supply?.toString(),
            },
            {
              trait_type: "Content Fabric Hash",
              value: versionHash,
            }
          ]
        });

        await this.client.MergeMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: "/public/asset_metadata/nft",
          metadata: {
            embed_url: embedUrl,
            external_url: embedUrl,
            token_uri: tokenURI,
            marketplace_attributes: {
              opensea: {
                youtube_url: embedUrl
              }
            }
          }
        });
      }
    });
  });

  UpdateDatabaseRecord = flow(function * ({objectId}) {
    yield this.rootStore.databaseStore.SaveItemTemplate({itemTemplateId: objectId});
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
