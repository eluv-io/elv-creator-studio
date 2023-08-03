import {flow} from "mobx";

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

export const AddActions = storeClass => {
  storeClass.prototype.actionStack = {};
  storeClass.prototype.redoStack = {};

  storeClass.prototype.ApplyAction = ApplyAction;
  storeClass.prototype.UndoAction = UndoAction;
  storeClass.prototype.RedoAction = RedoAction;
  storeClass.prototype.UndoQueue = UndoQueue;
  storeClass.prototype.RedoQueue = RedoQueue;
};
