import {flow, runInAction, toJS} from "mobx";
import UrlJoin from "url-join";
import Set from "lodash/set";
import Get from "lodash/get";
import {ExtractHashFromLink, FabricUrl} from "@/helpers/Fabric.js";
import {GenerateUUID} from "@/helpers/Misc.js";
import {LocalizeString} from "@/components/common/Misc.jsx";

export const ACTIONS = {
  MODIFY_FIELD: {
    stackable: true
  },
  MODIFY_FIELD_UNSTACKABLE: {
    stackable: false
  },
  MODIFY_FIELD_BATCH: {
    stackable: true
  },
  MODIFY_FIELD_BATCH_UNSTACKABLE: {
    stackable: false
  },
  TOGGLE_FIELD: {
    stackable: false
  },
  ADD_FIELD: {
    stackable: false
  },
  REMOVE_FIELD: {
    stackable: false
  },
  SET_DEFAULT: {
    invisible: true,
    stackable: false
  },
  SET_LINK: {
    stackable: false
  },
  UPDATE_LINK: {
    stackable: false
  },
  REMOVE_LINK: {
    stackable: false
  },
  INSERT_LIST_ELEMENT: {
    stackable: false
  },
  MOVE_LIST_ELEMENT: {
    stackable: false
  },
  REMOVE_LIST_ELEMENT: {
    stackable: false
  },
  CUSTOM: {
    stackable: false
  },
  MIGRATION: {
    stackable: false
  }
};

// Metadata manipulation

const GetMetadata = function({objectId, path, field}) {
  if(!objectId) {
    this.DebugLog({message: "Get metadata: Missing objectId", level: this.logLevels.DEBUG_LEVEL_ERROR});
  }

  const pathComponents = UrlJoin(path, field || "").replace(/^\//, "").replace(/\/$/, "").split("/");

  return Get(this[this.objectsMapKey][objectId].metadata, pathComponents);
};

const SetMetadata = function({
  actionType="MODIFY_FIELD",
  objectId,
  page,
  path,
  field,
  value,
  category,
  subcategory,
  label,
  inverted=false,
  json=false
}) {
  if(!objectId) {
    this.DebugLog({message: "Set metadata: Missing objectId", level: this.logLevels.DEBUG_LEVEL_ERROR});
  }

  const fullPath = UrlJoin(path, field);
  const pathComponents = fullPath.replace(/^\//, "").replace(/\/$/, "").split("/");

  const originalValue = this.GetMetadata({objectId, path, field});

  // Save JSON fields as objects, not strings
  let parsedValue;
  if(json) {
    try {
      parsedValue = JSON.parse(value);
    } catch(error) {
      // TODO: Fatal error - prevent saving
    }
  }

  this.ApplyAction({
    objectId,
    page,
    path: fullPath,
    actionType,
    category,
    subcategory,
    label,
    info: {
      cleared: typeof value !== "number" && !value,
      inverted
    },
    Apply: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, value),
    Undo: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, originalValue),
    Write: async (objectParams) => {
      value = toJS(parsedValue || value);

      // For 'falsy' values like false, 0 and "", updating the value directly will delete it
      // Instead, merge it in
      if(!value && typeof value === "boolean") {
        await this.client.MergeMetadata({
          ...objectParams,
          metadataSubtree: path,
          metadata: {
            [field]: false
          }
        });
      } else if(!value && typeof value === "number") {
        await this.client.MergeMetadata({
          ...objectParams,
          metadataSubtree: path,
          metadata: {
            [field]: 0
          }
        });
      } else if(!value && typeof value === "string") {
        await this.client.MergeMetadata({
          ...objectParams,
          metadataSubtree: path,
          metadata: {
            [field]: ""
          }
        });
      } else {
        await this.client.ReplaceMetadata({
          ...objectParams,
          metadataSubtree: fullPath,
          metadata: value
        });
      }
    }
  });
};

const SetBatchMetadata = function({
  actionType="MODIFY_FIELD_BATCH",
  objectId,
  page,
  path,
  field,
  values,
  category,
  subcategory,
  label,
  inverted=false
}) {
  if(!objectId) {
    this.DebugLog({message: "Set batch metadata: Missing objectId", level: this.logLevels.DEBUG_LEVEL_ERROR});
  }

  const pathComponents = path.replace(/^\//, "").replace(/\/$/, "").split("/");

  const originalValues = values.map(value => ({
    field: value.field,
    value: this.GetMetadata({objectId, path: UrlJoin(path, value.field)})
  }));

  this.ApplyAction({
    objectId,
    page,
    path: UrlJoin(path, field),
    actionType,
    category,
    subcategory,
    label,
    info: {
      cleared: values.length === 0 || !values.find(({value}) => !!value),
      inverted
    },
    Apply: () => {
      values.forEach(value =>
        Set(this[this.objectsMapKey][objectId].metadata, [...pathComponents, value.field], value.value)
      );
    },
    Undo: () => {
      originalValues.forEach(value => {
        Set(this[this.objectsMapKey][objectId].metadata, [...pathComponents, value.field], value.value);
      });
    },
    Write: async (objectParams) => {
      await Promise.all(
        values.map(async value => {
          await this.client.ReplaceMetadata({
            ...objectParams,
            metadataSubtree: UrlJoin(path, value.field),
            metadata: toJS(value.value)
          });
        })
      );
    }
  });
};

const AddField = function({
  objectId,
  page,
  path,
  field,
  value,
  category,
  subcategory,
  label
}) {
  if(!objectId) {
    this.DebugLog({message: "Add Field: Missing objectId", level: this.logLevels.DEBUG_LEVEL_ERROR});
  }

  const pathComponents = path.replace(/^\//, "").replace(/\/$/, "").split("/");

  this.ApplyAction({
    objectId,
    page,
    path: UrlJoin(path, field),
    actionType: "ADD_FIELD",
    category,
    subcategory,
    label,
    Apply: () => Set(this[this.objectsMapKey][objectId].metadata, [...pathComponents, field], value),
    Undo: () => {
      const metadata = { ...this.GetMetadata({objectId, path}) };
      delete metadata[field];
      return Set(this[this.objectsMapKey][objectId].metadata, pathComponents, metadata);
    },
    Write: async (objectParams) => await this.client.ReplaceMetadata({
      ...objectParams,
      metadataSubtree: UrlJoin(path, field),
      metadata: value
    })
  });
};

const RemoveField = function({
  objectId,
  page,
  path,
  field,
  category,
  subcategory,
  label
}) {
  if(!objectId) {
    this.DebugLog({message: "Remove Field: Missing objectId", level: this.logLevels.DEBUG_LEVEL_ERROR});
  }

  const pathComponents = path.replace(/^\//, "").replace(/\/$/, "").split("/");

  const originalValue = this.GetMetadata({objectId, path, field});

  this.ApplyAction({
    objectId,
    page,
    path: UrlJoin(path, field),
    actionType: "REMOVE_FIELD",
    category,
    subcategory,
    label,
    Apply: () => {
      const metadata = { ...this.GetMetadata({objectId, path}) };
      delete metadata[field];
      return Set(this[this.objectsMapKey][objectId].metadata, pathComponents, metadata);
    },
    Undo: () => Set(this[this.objectsMapKey][objectId].metadata, [...pathComponents, field], originalValue),
    Write: async (objectParams) => await this.client.DeleteMetadata({
      ...objectParams,
      metadataSubtree: UrlJoin(path, field)
    })
  });
};

// Set a default value of a field that will not be subject to the undo/redo flow
const SetDefaultValue = function({objectId, path, field, category, subcategory, label, value, json=false}) {
  this.SetMetadata({actionType: "SET_DEFAULT", objectId, page: "__set-default", path, field, category, subcategory, label, value, json});
};

// Links
const SetLink = flow(function * ({
  actionType="SET_LINK",
  objectId,
  page,
  path,
  field,
  linkObjectId,
  linkType="meta",
  linkPath="/public/asset_metadata",
  category,
  subcategory,
  label,
  autoUpdate
}) {
  if(!objectId) {
    this.DebugLog({message: "Set metadata: Missing objectId", level: this.logLevels.DEBUG_LEVEL_ERROR});
  }

  const fullPath = UrlJoin(path, field);
  const pathComponents = fullPath.replace(/^\//, "").replace(/\/$/, "").split("/");

  const originalValue = this.GetMetadata({objectId, path, field});

  // Local metadata must contain resolved link, but must write out link structure to fabric
  let metadataValue, writeValue;
  if(linkObjectId) {
    const targetHash = yield this.client.LatestVersionHash({objectId: linkObjectId});
    const originalHash = ExtractHashFromLink(originalValue);

    if(originalHash && this.utils.DecodeVersionHash(originalHash)?.objectId === linkObjectId) {
      actionType = "UPDATE_LINK";
    }

    writeValue = {
      "/": objectId === linkObjectId ?
        UrlJoin("./", linkType, linkPath) :
        UrlJoin("/qfab", targetHash, linkType, linkPath)
    };

    if(autoUpdate) {
      writeValue["."] = {
        "auto_update": {
          "tag": "latest"
        }
      };
    }

    if(linkType === "meta") {
      // Metadata links should contain resolved metadata
      metadataValue = yield this.client.ContentObjectMetadata({
        versionHash: targetHash,
        metadataSubtree: linkPath,
        produceMetadataLinks: true,
      });

      metadataValue["."] = {
        source: targetHash
      };
    } else {
      // File links should contain regular fabric link content, in addition to URL to file
      metadataValue = {
        ...writeValue,
        url: FabricUrl({
          objectId,
          path: writeValue["/"]
        })
      };
    }
  } else if(originalValue) {
    actionType = "REMOVE_LINK";
  }

  this.ApplyAction({
    objectId,
    page,
    path: fullPath,
    target: writeValue ? writeValue["/"] : "",
    actionType,
    category,
    subcategory,
    label,
    info: {
      cleared: !writeValue
    },
    Apply: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, metadataValue),
    Undo: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, originalValue),
    Write: async (objectParams) => await this.client.ReplaceMetadata({
      ...objectParams,
      metadataSubtree: fullPath,
      metadata: toJS(writeValue)
    })
  });
});

const ListAction = function({
  actionType,
  objectId,
  page,
  path,
  field,
  index,
  newIndex,
  value,
  category,
  subcategory,
  label,
  useLabel=true
}) {
  if(!objectId) {
    this.DebugLog({message: "List Action: Missing objectId", level: this.logLevels.DEBUG_LEVEL_ERROR});
  }

  if(typeof index !== "undefined") {
    index = parseInt(index);
  }

  if(typeof newIndex !== "undefined") {
    newIndex = parseInt(newIndex);
  }

  const fullPath = UrlJoin(path, field);
  const pathComponents = fullPath.replace(/^\//, "").replace(/\/$/, "").split("/");

  let originalList = this.GetMetadata({objectId, path, field}) || [];

  if(!Array.isArray(originalList)) {
    originalList = [];
  }

  let newList;
  switch(actionType) {
    case "INSERT_LIST_ELEMENT":
      if(typeof index === "undefined") {
        // Append
        index = originalList.length;
        newList = [...originalList, value];
      } else {
        // Insert at position
        newList = [...originalList.slice(0, index), value, ...originalList.slice(index)];
      }
      break;
    case "REMOVE_LIST_ELEMENT":
      if(typeof index === "undefined" || index < 0 || index >= originalList.length) {
        throw Error("Remove list element: Index not specified or out of range: " + index);
      }

      // If category is a function, resolve it now before item is removed
      if(typeof category === "function") {
        category = category({
          actionType,
          info: {
            index,
            newIndex
          },
        });
      }

      // If subcategory is a function, resolve it now before item is removed
      if(typeof subcategory === "function") {
        subcategory = subcategory({
          actionType,
          info: {
            index,
            newIndex
          },
        });
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
    actionType,
    objectId,
    page,
    path: UrlJoin(fullPath, (typeof newIndex !== "undefined" ? newIndex : index).toString()),
    basePath: fullPath,
    listIndex: index || originalList.length,
    category,
    subcategory,
    label,
    useLabel,
    info: {
      index,
      newIndex
    },
    Apply: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, newList),
    Undo: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, originalList),
    Write: async (objectParams) => await this.client.ReplaceMetadata({
      ...objectParams,
      metadataSubtree: fullPath,
      metadata: JSON.parse(JSON.stringify(newList))
    })
  });
};

const InsertListElement = function({objectId, page, path, field, index, value, ...args}) {
  this.ListAction({actionType: "INSERT_LIST_ELEMENT", objectId, page, path, field, index, value, ...args});
};

const MoveListElement = function({objectId, page, path, field, index, newIndex, ...args}) {
  this.ListAction({actionType: "MOVE_LIST_ELEMENT", objectId, page, path, field, index, newIndex, ...args});
};

const RemoveListElement = function({objectId, page, path, field, index, ...args}) {
  this.ListAction({actionType: "REMOVE_LIST_ELEMENT", objectId, page, path, field, index, ...args});
};

const ApplyMigration = function ({
  objectId,
  version,
  label,
  Apply,
  Write
}) {
  this.ApplyAction({
    objectId,
    page: "/migration",
    path: "/",
    actionType: "MIGRATION",
    category: LocalizeString(this.rootStore.l10n.actions.MIGRATION_LABEL, { version }),
    label,
    Apply: () => {
      Apply({
        Set: (path, value) => {
          const pathComponents = path.replace(/^\//, "").replace(/\/$/, "").split("/");
          Set(this[this.objectsMapKey][objectId].metadata, pathComponents, value);
        }
      });

      Set(this[this.objectsMapKey][objectId].metadata, ["public", "asset_metadata", "info", "version"], version);
    },
    Undo: () => {},
    Write: async (objectParams) => {
      await Write(objectParams);

      await this.client.ReplaceMetadata({
        ...objectParams,
        metadataSubtree: "/public/asset_metadata/info/version",
        metadata: version
      });
    }
  });
};


// Action handling

const ApplyAction = function ({
  id,
  actionType,
  changelistLabel,
  objectId,
  page,
  path,
  basePath,
  category,
  subcategory,
  label,
  useLabel=true,
  info={},
  Apply,
  Undo,
  Write
}) {
  id = id || crypto.randomUUID();

  let actionStack = [ ...(this.actionStack[objectId] || []) ];

  const { stackable } = ACTIONS[actionType];

  runInAction(() => Apply());

  if(stackable) {
    let stackableActions = [];

    for(let i = actionStack.length - 1; i >= 0; i--) {
      const action = actionStack[i];
      if(
        action.objectId !== objectId ||
        action.actionType !== actionType ||
        action.page !== page ||
        action.path !== path
      ) {
        break;
      }

      stackableActions.push(action);
    }

    const stackableAction = stackableActions.slice(-1)[0];


    if(stackableAction) {
      // Replace action's undo function with oldest version
      Undo = stackableAction.Undo;
    }

    // Remove stacked actions
    actionStack = actionStack.filter(action => !stackableActions.find(({id}) => action.id === id));
  }

  actionStack.push({
    id,
    actionType,
    changelistLabel,
    objectId,
    page,
    basePath,
    path,
    category,
    subcategory,
    label,
    useLabel,
    info,
    Apply,
    Undo,
    Write
  });

  this.actionStack[objectId] = actionStack;
  this.redoStack[objectId] = [];
};

const UndoQueue = function({objectId, page}) {
  return (this.actionStack[objectId] || [])
    .filter(action =>
      action.objectId === objectId &&
      action.page === page
    )
    .reverse();
};

const RedoQueue = function({objectId, page}) {
  return (this.redoStack[objectId] || [])
    .filter(action =>
      action.objectId === objectId &&
      action.page === page
    )
    .reverse();
};

const UndoAction = flow(function * ({objectId, page}) {
  const action = this.UndoQueue({objectId, page})[0];

  if(!action) { return; }

  yield runInAction(async () => await action.Undo());

  // Remove undone action from action stack
  this.actionStack[objectId] = this.actionStack[objectId].slice(0, -1);

  // Add undone action to redo stack
  this.redoStack[objectId] = this.redoStack[objectId] || [];
  this.redoStack[objectId].push(action);
});

const RedoAction = flow(function * ({objectId, page}) {
  const action = this.RedoQueue({objectId, page})[0];

  if(!action) { return; }

  yield runInAction(async () => await action.Apply());

  // Remove undone action from redo stack
  this.redoStack[objectId] = this.redoStack[objectId].slice(0, -1);

  // Add undone action to action stack
  this.actionStack[objectId] = this.actionStack[objectId] || [];
  this.actionStack[objectId].push(action);
});

const Save = flow(function * ({libraryId, objectId, writeToken}) {
  if(this.Preprocess) {
    yield this.Preprocess({libraryId, objectId, writeToken});
  }

  for(const action of (this.actionStack[objectId] || [])) {
    yield action.Write({libraryId, objectId, writeToken});
  }

  if(this.Postprocess) {
    yield this.Postprocess({libraryId, objectId, writeToken});
  }
});

const ClearActions = function({objectId}) {
  this.actionStack[objectId] = [];
  this.redoStack[objectId] = [];
};

// Ensure ID fields are properly set in lists
const SetListFieldIds = function({objectId, path, idField="id", category, label}) {
  const list = this.GetMetadata({objectId, path});

  if(!list) { return; }

  list.forEach((item, index) => {
    if(item[idField]) {
      return;
    }

    this.SetDefaultValue({
      objectId,
      path: UrlJoin(path, index.toString()),
      field: idField,
      category,
      label,
      value: GenerateUUID()
    });
  });
};

const HasUnsavedChanges = function() {
  return !!Object.values(this.actionStack).find(actions =>
    actions?.length > 0 && actions?.find(action => action.actionType !== "SET_DEFAULT")
  );
};

// Ensure the specified load method is called only once unless forced
const LoadResource = async function({key, id, force, Load}) {
  key = `_load-${key}`;

  if(force) {
    // Force - drop all loaded content
    this[key] = {};
  }

  this[key] = this[key] || {};

  if(force || !this[key][id]) {
    this[key][id] = Load();
  }

  return await this[key][id];
};

export const AddActions = (storeClass, objectsMapKey) => {
  storeClass.prototype.objectsMapKey = objectsMapKey;
  storeClass.prototype.actionStack = {};
  storeClass.prototype.redoStack = {};

  storeClass.prototype.GetMetadata = GetMetadata;
  storeClass.prototype.SetMetadata = SetMetadata;
  storeClass.prototype.SetBatchMetadata = SetBatchMetadata;
  storeClass.prototype.AddField = AddField;
  storeClass.prototype.RemoveField = RemoveField;
  storeClass.prototype.SetDefaultValue = SetDefaultValue;
  storeClass.prototype.SetLink = SetLink;
  storeClass.prototype.ListAction = ListAction;
  storeClass.prototype.InsertListElement = InsertListElement;
  storeClass.prototype.MoveListElement = MoveListElement;
  storeClass.prototype.RemoveListElement = RemoveListElement;
  storeClass.prototype.ApplyMigration = ApplyMigration;

  storeClass.prototype.ApplyAction = ApplyAction;
  storeClass.prototype.UndoAction = UndoAction;
  storeClass.prototype.RedoAction = RedoAction;
  storeClass.prototype.UndoQueue = UndoQueue;
  storeClass.prototype.RedoQueue = RedoQueue;

  storeClass.prototype.Save = Save;
  storeClass.prototype.ClearActions = ClearActions;

  storeClass.prototype.SetListFieldIds = SetListFieldIds;

  storeClass.prototype.HasUnsavedChanges = HasUnsavedChanges;

  storeClass.prototype.LoadResource = LoadResource;
};
