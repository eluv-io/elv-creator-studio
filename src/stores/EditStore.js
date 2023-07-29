import {flow, makeAutoObservable} from "mobx";

// Store for handling writing content, modification actions and undo/redo functionality
class EditStore {
  type;
  writeTokens = {};
  writeServers = {};
  actions = {};

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  WriteToken = flow(function * ({objectId}) {
    if(this.writeTokens[objectId]) {
      return this.writeTokens[objectId];
    }

    const libraryId = yield this.client.ContentObjectLibraryId({objectId});

    const { writeToken } = yield this.client.EditContentObject({
      libraryId,
      objectId
    });

    this.writeTokens[objectId] = writeToken;

    return writeToken;
  });

  Finalize = flow(function * ({objectId}) {
    const libraryId = yield this.client.ContentObjectLibraryId({objectId});

    const writeToken = this.writeTokens[objectId];

    if(!writeToken) {
      this.DebugLog({message: "No write token present for " + objectId, level: this.logLevels.DEBUG_LEVEL_ERROR});
    }

    const response = yield this.client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken,
      commitMessage: ""
    });

    delete this.writeTokens[objectId];

    return response;
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

export default EditStore;
