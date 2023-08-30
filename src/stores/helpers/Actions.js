import {flow} from "mobx";
import UrlJoin from "url-join";
import Set from "lodash/set";
import Get from "lodash/get";
import {FabricUrl} from "@/helpers/Fabric.js";
import {GenerateUUID} from "@/helpers/Misc.js";

export const ACTIONS = {
  MODIFY_FIELD: {
    stackable: true,
    collapsible: true
  },
  MODIFY_FIELD_UNSTACKABLE: {
    stackable: false,
    collapsible: true
  },
  TOGGLE_FIELD: {
    stackable: false,
    collapsible: true
  },
  SET_DEFAULT: {
    invisible: true,
    stackable: false,
    collapsible: true
  },
  SET_LINK: {
    stackable: false,
    collapsible: true
  },
  INSERT_LIST_ELEMENT: {
    stackable: false,
    collapsible: false
  },
  MOVE_LIST_ELEMENT: {
    stackable: false,
    collapsible: false
  },
  REMOVE_LIST_ELEMENT: {
    stackable: false,
    collapsible: false
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
  inverted=false
}) {
  if(!objectId) {
    this.DebugLog({message: "Set metadata: Missing objectId", level: this.logLevels.DEBUG_LEVEL_ERROR});
  }

  const fullPath = UrlJoin(path, field);
  const pathComponents = fullPath.replace(/^\//, "").replace(/\/$/, "").split("/");

  const originalValue = this.GetMetadata({objectId, path, field});

  this.ApplyAction({
    objectId,
    page,
    path: fullPath,
    actionType,
    category,
    subcategory,
    label,
    info: {
      cleared: !value,
      inverted
    },
    Apply: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, value),
    Undo: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, originalValue),
    Write: async (objectParams) => await this.client.ReplaceMetadata({
      ...objectParams,
      metadataSubtree: fullPath,
      metadata: value
    })
  });
};

// Set a default value of a field that will not be subject to the undo/redo flow
const SetDefaultValue = function({objectId, path, field, category, subcategory, label, value}) {
  this.SetMetadata({actionType: "SET_DEFAULT", objectId, page: "__set-default", path, field, category, subcategory, label, value});
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
  label
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

    writeValue = {
      ".": {
        "auto_update": {
          "tag": "latest"
        }
      },
      "/": objectId === linkObjectId ?
        UrlJoin("./meta", linkPath) :
        UrlJoin("/qfab", targetHash, linkType, linkPath)
    };

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
          path: linkPath
        })
      };
    }
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
      metadata: writeValue
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

  const originalList = this.GetMetadata({objectId, path, field}) || [];

  let newList;
  switch(actionType) {
    case "INSERT_LIST_ELEMENT":
      if(typeof index === "undefined") {
        // Append
        index = originalList.length;
        newList =[...originalList, value];
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
      metadata: newList
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


// Action handling

const ApplyAction = function ({
  id,
  actionType,
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

  Apply();

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

  yield action.Undo();

  // Remove undone action from action stack
  this.actionStack[objectId] = this.actionStack[objectId].slice(0, -1);

  // Add undone action to redo stack
  this.redoStack[objectId] = this.redoStack[objectId] || [];
  this.redoStack[objectId].push(action);
});

const RedoAction = flow(function * ({objectId, page}) {
  const action = this.RedoQueue({objectId, page})[0];

  if(!action) { return; }

  yield action.Apply();

  // Remove undone action from redo stack
  this.redoStack[objectId] = this.redoStack[objectId].slice(0, -1);

  // Add undone action to action stack
  this.actionStack[objectId] = this.actionStack[objectId] || [];
  this.actionStack[objectId].push(action);
});

const Save = flow(function * ({libraryId, objectId, writeToken}) {
  for(const action of this.actionStack[objectId]) {
    yield action.Write({libraryId, objectId, writeToken});
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

export const AddActions = (storeClass, objectsMapKey) => {
  storeClass.prototype.objectsMapKey = objectsMapKey;
  storeClass.prototype.actionStack = {};
  storeClass.prototype.redoStack = {};

  storeClass.prototype.GetMetadata = GetMetadata;
  storeClass.prototype.SetMetadata = SetMetadata;
  storeClass.prototype.SetDefaultValue = SetDefaultValue;
  storeClass.prototype.SetLink = SetLink;
  storeClass.prototype.ListAction = ListAction;
  storeClass.prototype.InsertListElement = InsertListElement;
  storeClass.prototype.MoveListElement = MoveListElement;
  storeClass.prototype.RemoveListElement = RemoveListElement;

  storeClass.prototype.ApplyAction = ApplyAction;
  storeClass.prototype.UndoAction = UndoAction;
  storeClass.prototype.RedoAction = RedoAction;
  storeClass.prototype.UndoQueue = UndoQueue;
  storeClass.prototype.RedoQueue = RedoQueue;

  storeClass.prototype.Save = Save;
  storeClass.prototype.ClearActions = ClearActions;

  storeClass.prototype.SetListFieldIds = SetListFieldIds;
};
