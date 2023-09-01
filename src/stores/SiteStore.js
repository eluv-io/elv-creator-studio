// Example store

import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";

class SiteStore {
  allSites;
  sites = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  LoadSites = flow(function * () {
    if(this.allSites) { return; }

    this.allSites = yield this.rootStore.databaseStore.GetCollection({collection: "sites"});
  });

  LoadSite = flow(function * ({siteId, force=false}) {
    if(this.sites[siteId] && !force) { return; }

    yield this.LoadSites();

    const info = this.allSites.find(site => site.objectId === siteId);

    const libraryId = yield this.rootStore.LibraryId({objectId: siteId});

    const site = {
      ...info,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: siteId,
          metadataSubtree: "public",
          resolveLinks: true,
          linkDepthLimit: 1,
          resolveIgnoreErrors: true,
          resolveIncludeSource: true,
          produceLinkUrls: true
        }))
      }
    };

    this.sites[siteId] = site;

    this.SetListFieldIds({
      objectId: siteId,
      path: "/public/asset_metadata/info/main_page_banner_cards/cards",
      category: this.rootStore.l10n.pages.site.form.categories.banner_cards,
      label: this.rootStore.l10n.pages.site.form.common.id.label,
    });

    this.SetListFieldIds({
      objectId: siteId,
      path: "/public/asset_metadata/info/main_page_banners",
      category: this.rootStore.l10n.pages.site.form.categories.banner_cards,
      label: this.rootStore.l10n.pages.site.form.common.id.label,
    });
  });

  Reload = flow(function * ({objectId}) {
    yield this.LoadSite({siteId: objectId, force: true});
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

AddActions(SiteStore, "sites");

export default SiteStore;
