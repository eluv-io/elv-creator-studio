// Example store
 
import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";

class ItemTemplateStore {
  allItemTemplates;
  itemTemplates = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  LoadItemTemplates = flow(function * () {
    if(this.allItemTemplates) { return; }

    this.allItemTemplates = yield this.rootStore.databaseStore.GetCollection({collection: "templates"});
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
