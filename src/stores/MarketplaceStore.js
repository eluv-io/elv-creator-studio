import {flow, makeAutoObservable} from "mobx";
import {Capitalize} from "Helpers/Misc.js";
import {AddActions} from "./helpers/Actions.js";
import Set from "lodash/set";
import Get from "lodash/get";

import UrlJoin from "url-join";


class MarketplaceStore {
  allMarketplaces = [];
  marketplaces = {};

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  LoadMarketplaces = flow(function * () {
    if(this.allMarketplaces.length > 0) { return; }

    this.allMarketplaces = yield this.rootStore.databaseStore.GetCollection({collection: "marketplaces"});
  });

  LoadMarketplace = flow(function * ({marketplaceId, force=false}) {
    if(this.marketplaces[marketplaceId] && !force) { return; }

    yield this.LoadMarketplaces();

    const info = this.allMarketplaces.find(marketplace => marketplace.objectId === marketplaceId);

    const libraryId = yield this.client.ContentObjectLibraryId({objectId: marketplaceId});

    this.marketplaces[marketplaceId] = {
      ...info,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: marketplaceId,
          metadataSubtree: "public"
        }))
      }
    };
  });

  ListAction({actionType, objectId, page, path, field, index, newIndex, value}) {
    if(typeof index !== "undefined") {
      index = parseInt(index);
    }

    if(typeof newIndex !== "undefined") {
      newIndex = parseInt(newIndex);
    }

    const fullPath = UrlJoin(path, field);
    const pathComponents = fullPath.replace(/^\//, "").replace(/\/$/, "").split("/");

    const originalList = this.GetMetadata({objectId, path, field}) || [];

    let newList;
    switch(actionType) {
      case "INSERT_LIST_ELEMENT":
        newList =
          typeof index === "undefined" ?
            // Append
            [...originalList, value] :
            // Insert
            [...originalList.slice(0, index), value, ...originalList.slice(index)];
        break;
      case "REMOVE_LIST_ELEMENT":
        if(typeof index === "undefined" || index < 0 || index >= originalList.length) {
          throw Error("Remove list element: Index not specified or out of range: " + index);
        }

        newList = originalList.filter((_, i) => i !== index);
        break;
      case "MOVE_LIST_ELEMENT":
        if(typeof index === "undefined" || index < 0 || index >= originalList.length) {
          throw Error("Swap list element: index not specified or out of range: " + index);
        } else if(typeof newIndex === "undefined" || newIndex < 0 || newIndex >= originalList.length) {
          throw Error("Swap list element: newIndex not specified or out of range: " + newIndex);
        }

        // eslint-disable-next-line no-case-declarations
        const element = originalList[index];
        newList = originalList.filter((_, i) => i !== index);
        newList = [...newList.slice(0, newIndex), element, ...newList.slice(newIndex)];
        break;
    }

    this.ApplyAction({
      objectId,
      page,
      key: fullPath,
      listIndex: index || originalList.length,
      actionType,
      Apply: () => Set(this.marketplaces[objectId].metadata, pathComponents, newList),
      Undo: () => Set(this.marketplaces[objectId].metadata, pathComponents, originalList),
      Write: async (objectParams) => await this.client.ReplaceMetadata({
        ...objectParams,
        metadataSubtree: fullPath,
        metadata: newList
      })
    });
  }

  InsertListElement({objectId, page, path, field, index, value}) {
    this.ListAction({actionType: "INSERT_LIST_ELEMENT", objectId, page, path, field, index, value});
  }

  MoveListElement({objectId, page, path, field, index, newIndex}) {
    this.ListAction({actionType: "MOVE_LIST_ELEMENT", objectId, page, path, field, index, newIndex});
  }

  RemoveListElement({objectId, page, path, field, index}) {
    this.ListAction({actionType: "REMOVE_LIST_ELEMENT", objectId, page, path, field, index});
  }

  GetMetadata({objectId, path, field}) {
    const pathComponents = UrlJoin(path, field).replace(/^\//, "").replace(/\/$/, "").split("/");

    return Get(this.marketplaces[objectId].metadata, pathComponents);
  }

  SetMetadata({objectId, page, path, field, value}) {
    const fullPath = UrlJoin(path, field);
    const pathComponents = fullPath.replace(/^\//, "").replace(/\/$/, "").split("/");

    const originalValue = this.GetMetadata({objectId, path, field});

    this.ApplyAction({
      objectId,
      page,
      key: fullPath,
      actionType: "MODIFY_FIELD",
      Apply: () => Set(this.marketplaces[objectId].metadata, pathComponents, value),
      Undo: () => Set(this.marketplaces[objectId].metadata, pathComponents, originalValue),
      Write: async (objectParams) => await this.client.ReplaceMetadata({
        ...objectParams,
        metadataSubtree: fullPath,
        metadata: value
      })
    });
  }

  DeployedHash({environment, marketplaceId}) {
    return this.rootStore.tenantStore[`tenant${Capitalize(environment)}`]?.marketplaces?.[marketplaceId]?.versionHash;
  }

  IsMarketplaceDeployed({environment="latest", marketplaceId}) {
    return !!this.rootStore.tenantStore[`tenant${Capitalize(environment)}`]?.marketplaces?.[marketplaceId];
  }

  IsLatestMarketplaceDeployed({environment, marketplaceId}) {
    return this.DeployedHash({environment: "latest", marketplaceId}) === this.DeployedHash({environment, marketplaceId});
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

AddActions(MarketplaceStore);

export default MarketplaceStore;

