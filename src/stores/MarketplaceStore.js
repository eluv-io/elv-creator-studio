import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";
import {ExtractHashFromLink} from "@/helpers/Fabric.js";

class MarketplaceStore {
  allMarketplaces;
  marketplaces = {};
  itemTemplateMetadata = {};

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  LoadMarketplaces = flow(function * ({force=false}={}) {
    if(this.allMarketplaces && !force) { return; }

    this.allMarketplaces = yield this.rootStore.databaseStore.GetCollection({collection: "marketplaces"});
  });

  LoadMarketplace = flow(function * ({marketplaceId, force=false}) {
    if(this.marketplaces[marketplaceId] && !force) { return; }

    yield this.LoadMarketplaces();

    const info = this.allMarketplaces.find(marketplace => marketplace.objectId === marketplaceId);

    const libraryId = yield this.rootStore.LibraryId({objectId: marketplaceId});

    this.marketplaces[marketplaceId] = {
      ...info,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: marketplaceId,
          metadataSubtree: "public",
          produceLinkUrls: true
        }))
      }
    };

    const itemTemplates = yield this.client.ContentObjectMetadata({
      libraryId: libraryId,
      objectId: marketplaceId,
      metadataSubtree: "public/asset_metadata/info/items",
      produceLinkUrls: true,
      resolveLinks: true,
      resolveIgnoreErrors: true,
      resolveIncludeSource: true,
      linkDepthLimit: 1,
      select: [
        "*/nft_template"
      ]
    });

    itemTemplates.forEach(({nft_template}) => {
      if(!nft_template?.["."]?.source) { return; }

      this.itemTemplateMetadata[nft_template["."].source] = nft_template;
    });

    this.SetListFieldIds({
      objectId: marketplaceId,
      path: "/public/asset_metadata/info/storefront/sections",
      category: this.rootStore.l10n.pages.marketplace.form.categories.storefront_item_section,
      label: this.rootStore.l10n.pages.marketplace.form.common.id.label,
    });

    this.SetListFieldIds({
      objectId: marketplaceId,
      path: "/public/asset_metadata/info/banners",
      category: this.rootStore.l10n.pages.marketplace.form.categories.storefront_banner,
      label: this.rootStore.l10n.pages.marketplace.form.common.id.label,
    });

    this.SetListFieldIds({
      objectId: marketplaceId,
      path: "/public/asset_metadata/info/footer_links",
      category: this.rootStore.l10n.pages.marketplace.form.categories.storefront_footer_link,
      label: this.rootStore.l10n.pages.marketplace.form.common.id.label,
    });
  });

  LoadItemTemplateMetadata = flow(function * ({itemTemplateHash}) {
    if(!itemTemplateHash || this.itemTemplateMetadata[itemTemplateHash]) { return; }

    this.itemTemplateMetadata[itemTemplateHash] = yield this.client.ContentObjectMetadata({
      versionHash: itemTemplateHash,
      metadataSubtree: "/public/asset_metadata",
      produceLinkUrls: true
    });
  });

  LoadMarketplaceItemStatus = flow(function * ({marketplaceId}) {
    yield this.LoadMarketplace({marketplaceId});

    const items = this.marketplaces[marketplaceId]?.metadata?.public?.asset_metadata?.info?.items;

    if(!items || items.length > 50) { return; }

    this.marketplaces[marketplaceId].metadata.public.asset_metadata.info.items = (
      yield this.client.utils.LimitedMap(
        5,
        items,
        async item => {
          const currentHash = ExtractHashFromLink(item.nft_template);
          const latestHash = currentHash && await this.client.LatestVersionHash({versionHash: currentHash});

          return {
            ...item,
            isLatestTemplate: currentHash === latestHash
          };
        }
      )
    );
  });

  Reload = flow(function * ({objectId}) {
    yield this.LoadMarketplace({marketplaceId: objectId, force: true});
  });

  UpdateDatabaseRecord = flow(function * ({objectId}) {
    yield this.rootStore.databaseStore.SaveMarketplace({marketplaceId: objectId});
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

AddActions(MarketplaceStore, "marketplaces");

export default MarketplaceStore;

