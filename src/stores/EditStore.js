import {flow, makeAutoObservable} from "mobx";
import {StorageHandler} from "../helpers/Misc.js";

// TODO: Move write token saving to database, load metadata from write token if present

// Store for handling writing content, modification actions and undo/redo functionality
class EditStore {
  type;
  writeInfo = StorageHandler.get({type: "local",  key: "write-info", json: true, b64: true}) || {};
  actions = {};

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
