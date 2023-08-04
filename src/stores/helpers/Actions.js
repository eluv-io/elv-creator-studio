import {flow} from "mobx";
import UrlJoin from "url-join";
import Set from "lodash/set";
import Get from "lodash/get";

export const ACTIONS = {
  MODIFY_FIELD: {
    stackable: true,
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

  const pathComponents = UrlJoin(path, field).replace(/^\//, "").replace(/\/$/, "").split("/");

  return Get(this[this.objectsMapKey][objectId].metadata, pathComponents);
};

const SetMetadata = function({objectId, page, path, field, value}) {
  if(!objectId) {
    this.DebugLog({message: "Set metadata: Missing objectId", level: this.logLevels.DEBUG_LEVEL_ERROR});
  }

  const fullPath = UrlJoin(path, field);
  const pathComponents = fullPath.replace(/^\//, "").replace(/\/$/, "").split("/");

  const originalValue = this.GetMetadata({objectId, path, field});

  this.ApplyAction({
    objectId,
    page,
    key: fullPath,
    actionType: "MODIFY_FIELD",
    Apply: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, value),
    Undo: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, originalValue),
    Write: async (objectParams) => await this.client.ReplaceMetadata({
      ...objectParams,
      metadataSubtree: fullPath,
      metadata: value
    })
  });
};

const ListAction = function({actionType, objectId, page, path, field, index, newIndex, value}) {
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
    Apply: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, newList),
    Undo: () => Set(this[this.objectsMapKey][objectId].metadata, pathComponents, originalList),
    Write: async (objectParams) => await this.client.ReplaceMetadata({
      ...objectParams,
      metadataSubtree: fullPath,
      metadata: newList
    })
  });
};

const InsertListElement = function({objectId, page, path, field, index, value}) {
  this.ListAction({actionType: "INSERT_LIST_ELEMENT", objectId, page, path, field, index, value});
};

const MoveListElement = function({objectId, page, path, field, index, newIndex}) {
  this.ListAction({actionType: "MOVE_LIST_ELEMENT", objectId, page, path, field, index, newIndex});
};

const RemoveListElement = function({objectId, page, path, field, index}) {
  this.ListAction({actionType: "REMOVE_LIST_ELEMENT", objectId, page, path, field, index});
};


// Action handling

const ApplyAction = flow(function * ({
  id,
  actionType,
  objectId,
  page,
  key,
  category,
  subcategory,
  description,
  Apply,
  Undo,
  Write
}) {
  id = id || crypto.randomUUID();

  let actionStack = [ ...(this.actionStack[objectId] || []) ];

  const { stackable } = ACTIONS[actionType];

  yield Apply();

  if(stackable) {
    let stackableActions = [];


    for(let i = actionStack.length - 1; i >= 0; i--) {
      const action = actionStack[i];
      if(
        action.objectId !== objectId ||
        action.actionType !== actionType ||
        action.page !== page ||
        action.key !== key
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
    key,
    category,
    subcategory,
    description,
    Apply,
    Undo,
    Write
  });

  this.actionStack[objectId] = actionStack;
  this.redoStack[objectId] = [];
});

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

export const AddActions = (storeClass, objectsMapKey) => {
  storeClass.prototype.objectsMapKey = objectsMapKey;
  storeClass.prototype.actionStack = {};
  storeClass.prototype.redoStack = {};

  storeClass.prototype.GetMetadata = GetMetadata;
  storeClass.prototype.SetMetadata = SetMetadata;
  storeClass.prototype.ListAction = ListAction;
  storeClass.prototype.InsertListElement = InsertListElement;
  storeClass.prototype.MoveListElement = MoveListElement;
  storeClass.prototype.RemoveListElement = RemoveListElement;

  storeClass.prototype.ApplyAction = ApplyAction;
  storeClass.prototype.UndoAction = UndoAction;
  storeClass.prototype.RedoAction = RedoAction;
  storeClass.prototype.UndoQueue = UndoQueue;
  storeClass.prototype.RedoQueue = RedoQueue;
};
