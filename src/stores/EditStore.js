import {flow, makeAutoObservable} from "mobx";
import {StorageHandler} from "@/helpers/Misc.js";
import {FormatChangeList} from "@/stores/helpers/Changelist.js";

// TODO: Move write token saving to database, load metadata from write token if present

// Store for handling writing content, modification actions and undo/redo functionality
class EditStore {
  type;
  //writeInfo = StorageHandler.get({type: "local",  key: "write-info", json: true, b64: true}) || {};
  writeInfo = {};
  actions = {};
  showSaveModal = false;

  types = {
    "tenant": { storeKey: "tenantStore"},
    "marketplace": { storeKey: "marketplaceStore", namePath: "/public/asset_metadata/info/branding/name"},
    "item_template": { storeKey: "itemTemplateStore", namePath: "/public/asset_metadata/nft/name"},
    "media_catalog": { storeKey: "mediaCatalogStore", namePath: "/public/asset_metadata/info/name"},
    "media_property": { storeKey: "mediaPropertyStore", namePath: "/public/asset_metadata/info/name"},
    "permission_set": { storeKey: "permissionSetStore", namePath: "/public/asset_metadata/info/name"},
  };

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  get hasUnsavedChanges() {
    return Object.values(this.types).find(({storeKey}) =>
      this.rootStore[storeKey].HasUnsavedChanges()
    );
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

  // Gather changelists from each relevant store
  ChangeLists() {
    const saveOrder = [
      "itemTemplateStore",
      "marketplaceStore",
      "permissionSetStore",
      "mediaCatalogStore",
      "mediaPropertyStore"
    ];

    const GetChangeList = ({type, storeKey, namePath="/public/asset_metadata/info/name"}) => {
      const store = this.rootStore[storeKey];

      return Object.keys(store.actionStack)
        .map(objectId => {
          const actions = store.actionStack[objectId];

          if(!actions || actions.length === 0 || !actions.find(action => action.actionType !== "SET_DEFAULT")) {
            return;
          }

          const object = store[store.objectsMapKey][objectId];
          const name = store.GetMetadata({objectId, path: namePath}) || objectId;
          return {
            type,
            typeName: this.rootStore.l10n.components.save_modal.types[type] || type,
            storeKey,
            name,
            objectId,
            object,
            actions,
            changeList: FormatChangeList(actions)
          };
        })
        .filter(a => a);
    };

    return Object.keys(this.types)
      .map(type => GetChangeList({type, ...this.types[type]}))
      .flat()
      .sort((a, b) => saveOrder.indexOf(a.storeKey) < saveOrder.indexOf(b.storeKey) ? -1 : 1);
  }

  ToggleSaveModal(show) {
    this.showSaveModal = show;
  }

  Save = flow(function * ({selectedObjectIds, commitMessages}) {
    let errors = {};
    for(const item of this.ChangeLists()) {
      if(!selectedObjectIds.includes(item.objectId)) {
        continue;
      }
      const store = this.rootStore[item.storeKey];
      const objectId = item.objectId;

      try {
        this.rootStore.uiStore.SetLoading(true);
        this.rootStore.uiStore.SetLoadingMessage(`Saving ${item.typeName} '${item.name}'`);

        const libraryId = yield this.rootStore.LibraryId({objectId});
        const writeToken = yield this.InitializeWrite({objectId});

        yield store.Save({libraryId, objectId, writeToken});

        try {
          yield this.client.ReplaceMetadata({
            libraryId,
            objectId,
            writeToken,
            metadataSubtree: "changelist",
            metadata: item.changeList.markdown
          });

          let commitHistory = (yield this.client.ContentObjectMetadata({
            libraryId,
            objectId,
            metadataSubtree: "commit_history"
          })) || [];

          commitHistory.unshift({
            message: commitMessages[objectId],
            author: (yield this.client.userProfileClient.UserMetadata({metadataSubtree: "public/name"})) || this.rootStore.address,
            author_address: this.rootStore.address,
            timestamp: new Date().toISOString(),
            changelist: item.changeList.markdown
          });

          yield this.client.ReplaceMetadata({
            libraryId,
            objectId,
            writeToken,
            metadataSubtree: "commit_history",
            metadata: commitHistory
          });
        } catch(error) {
          this.DebugLog({
            message: "Unable to save commit history",
            error,
            level: this.logLevels.DEBUG_LEVEL_ERROR
          });
        }

        yield this.Finalize({objectId, commitMessage: commitMessages[objectId]});

        yield store.ClearActions({objectId, commitMessage: commitMessages[objectId] || ""});

        if(store.PostSave) {
          yield store.PostSave({libraryId, objectId});
        }

        if(store.UpdateDatabaseRecord) {
          yield store.UpdateDatabaseRecord({objectId});
        }

        // Force reload object after saving
        yield store.Reload({objectId});
      } catch(error) {
        this.DebugLog({error, level: this.logLevels.DEBUG_LEVEL_ERROR});
        this.DiscardWriteToken({objectId});
        errors[objectId] = error;
      }
    }

    this.rootStore.uiStore.SetLoading(false);

    return errors;
  });

  WriteToken({objectId}) {
    return this.writeInfo[objectId]?.writeToken;
  }

  DiscardWriteToken({objectId}) {
    delete this.writeInfo[objectId];
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
      fabricNodeUrl: yield this.client.WriteTokenNodeUrlNetwork({writeToken})
    };

    this.SaveWriteInfo();

    return writeToken;
  });

  Finalize = flow(function * ({objectId, commitMessage}) {
    const libraryId = yield this.rootStore.LibraryId({objectId});

    const writeInfo = this.writeInfo[objectId];

    if(!writeInfo) {
      this.DebugLog({message: "No write token present for " + objectId, level: this.logLevels.DEBUG_LEVEL_ERROR});
      return;
    }

    const response = yield this.client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: writeInfo.writeToken,
      commitMessage
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
