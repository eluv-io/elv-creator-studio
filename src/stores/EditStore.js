import {flow, makeAutoObservable} from "mobx";
import {StorageHandler} from "../helpers/Misc.js";

// TODO: Move write token saving to database, load metadata from write token if present

// Store for handling writing content, modification actions and undo/redo functionality
class EditStore {
  type;
  writeInfo = StorageHandler.get({type: "local",  key: "write-info", json: true, b64: true}) || {};
  actions = {};
  showSaveModal = false;

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  Initialize() {
    // Ensure saved write tokens are mapped to proper nodes in client
    Object.values(this.writeInfo).forEach(({writeToken, fabricNodeUrl}) => {
      if(!fabricNodeUrl) {
        this.DebugLog({message: `No fabric node URL set for ${writeToken}`, level: this.logLevels.DEBUG_LEVEL_ERROR});
        return;
      }

      this.client.RecordWriteToken({writeToken, fabricNodeUrl});
    });
  }

  get changeList() {
    const marketplaceActions = Object.keys(this.rootStore.marketplaceStore.actionStack)
      .map(marketplaceId => {
        const actions = this.rootStore.marketplaceStore.actionStack[marketplaceId];
        if(!actions || actions.length === 0) { return; }

        const marketplace = this.rootStore.marketplaceStore.marketplaces[marketplaceId];
        const name = marketplace?.metadata?.public?.asset_metadata?.info?.branding?.name || marketplaceId;
        return {
          type: "Marketplace",
          name,
          objectId: marketplaceId,
          object: marketplace,
          actions
        };
      });

    return [
      ...marketplaceActions
    ]
      .filter(actions => actions);
  }

  ToggleSaveModal(show) {
    this.showSaveModal = show;
  }

  Save = flow(function * (excludeList) {
    for(const item of this.changeList) {
      if(excludeList[item.objectId]) { continue; }

      try {
        this.rootStore.uiStore.SetLoading(true);
        this.rootStore.uiStore.SetLoadingMessage(`Saving ${item.type} ${item.name}`);

        const libraryId = yield this.rootStore.LibraryId({objectId: item.objectId});
        const writeToken = yield this.InitializeWrite({objectId: item.objectId});

        for(const action of item.actions) {
          yield action.Write({libraryId, objectId: item.objectId, writeToken});
        }

        yield this.Finalize({objectId: item.objectId});
      } catch(error) {
        this.DebugLog({error, level: this.logLevels.DEBUG_LEVEL_ERROR});
      }
    }

    this.rootStore.uiStore.SetLoading(false);
  });

  WriteToken({objectId}) {
    return this.writeInfo[objectId]?.writeToken;
  }

  InitializeWrite = flow(function * ({objectId}) {
    if(this.WriteToken({objectId})) {
      return this.WriteToken({objectId});
    }

    const libraryId = yield this.rootStore.LibraryId({objectId});

    const { writeToken } = yield this.client.EditContentObject({
      libraryId,
      objectId
    });

    this.writeInfo[objectId] = {
      writeToken,
      fabricNodeUrl: yield this.client.WriteTokenNodeUrl({writeToken})
    };

    this.SaveWriteInfo();

    return writeToken;
  });

  Finalize = flow(function * ({objectId}) {
    const libraryId = yield this.rootStore.LibraryId({objectId});

    const writeInfo = this.writeInfo[objectId];

    if(!writeInfo) {
      this.DebugLog({message: "No write token present for " + objectId, level: this.logLevels.DEBUG_LEVEL_ERROR});
    }

    const response = yield this.client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: writeInfo.writeToken,
      commitMessage: ""
    });

    delete this.writeInfo[objectId];
    this.SaveWriteInfo();

    return response;
  });

  SaveWriteInfo() {
    StorageHandler.set({type: "local", key: "write-info", value: { ...this.writeInfo }, b64: true, json: true});
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

export default EditStore;
