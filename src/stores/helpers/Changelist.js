import UrlJoin from "url-join";
import {rootStore} from "@/stores/index.js";
import {LocalizeString} from "@/components/common/Misc.jsx";

// Update paths when list actions are performed to keep action paths in sync for pruning
const ModifyPathIndex = ({path, basePath, originalIndex, newIndex}) => {
  if(!path.includes(basePath)) {
    return { action: "none", path };
  }

  let [pathIndex, ...rest] = path.replace(basePath, "").replace(/^\//, "").split("/");

  if(!pathIndex) {
    return { action: "none", path };
  }

  pathIndex = parseInt(pathIndex);
  rest = rest.join("/");

  let action = "none";
  const removed = typeof newIndex === "undefined";

  if(removed) {
    if(pathIndex === originalIndex) {
      // This entry was removed
      return { entryAction: "removed" };
    } else if(pathIndex > originalIndex) {
      // An entry before this one was removed - decrement
      pathIndex -= 1;
      action = "decremented";
    }
  } else {
    if(pathIndex === originalIndex) {
      // This entry was moved
      pathIndex = newIndex;
      action = "moved";
    } else if(pathIndex > originalIndex && newIndex >= pathIndex) {
      // Item moved from before this entry to after this entry - decrement
      pathIndex -= 1;
      action = "decremented";
    } else if(pathIndex < originalIndex && newIndex <= pathIndex) {
      // Item moved from after this entry to before this entry - increment
      pathIndex += 1;
      action = "incremented";
    }
  }

  return {
    entryAction: action,
    path: UrlJoin(basePath, pathIndex.toString(), rest)
  };
};

// Prune changeList for display by pruning
const ProcessChangeList = changeList => {
  const actions = [...changeList];

  let processedList = [];

  // Handle list index modifications (delete/move) to keep action paths aligned with final position
  for(let i = 0; i < actions.length; i++) {
    const action = actions[i];

    if(["MOVE_LIST_ELEMENT", "REMOVE_LIST_ELEMENT"].includes(action.actionType)) {
      processedList = processedList
        .map(previousAction => {
          if(
            !previousAction.path.includes(action.basePath) ||
            // Preserve list removals
            previousAction.actionType === "REMOVE_LIST_ELEMENT"
          ) {
            return previousAction;
          }

          const {entryAction, path} = ModifyPathIndex({
            path: previousAction.path,
            basePath: action.basePath,
            originalIndex: action.info.index,
            newIndex: action.info.newIndex
          });

          // If this entry was removed, drop actions associated with it
          if(entryAction === "removed") {
            return;
          }

          return {
            ...previousAction,
            path
          };
        })
        .filter(a => a);
    }

    processedList.push({...action});
  }

  // Mark duplicate modifications for pruning
  for(let i = processedList.length - 1; i >= 0; i--) {
    const action = processedList[i];

    if(action.prune) { continue; }

    if(action.actionType === "TOGGLE_FIELD") {
      let keep = true;

      for(let p = 0; p < i; p++) {
        const previousAction = processedList[p];
        if(previousAction.actionType !== "TOGGLE_FIELD" || previousAction.path !== action.path) { continue; }

        keep = !keep;
        processedList[p].prune = true;
      }

      if(!keep) {
        processedList[i].prune = true;
      }
    // Other modifications except for list removal
    } else {
      for(let p = 0; p < i; p++) {
        const previousAction = processedList[p];
        if(
          previousAction.path !== action.path ||
          // Preserve list removals
          previousAction.actionType === "REMOVE_LIST_ELEMENT"
        ) { continue; }

        processedList[p].prune = true;
      }
    }
  }

  return processedList.filter(action => !action.prune);
};

export const ActionToString = action => {
  if(!action) { return ""; }

  let string = rootStore.l10n.actions[action.useLabel ? action.actionType : `${action.actionType}_UNLABELLED`];
  if(action.actionType === "TOGGLE_FIELD") {
    const unchecked = action.info.inverted ? !action.info.cleared : action.info.cleared;
    string = rootStore.l10n.actions[unchecked ? "TOGGLE_FIELD_OFF" : "TOGGLE_FIELD_ON"];
  } else if(action?.info?.cleared && action.actionType !== "REMOVE_LINK") {
    string = rootStore.l10n.actions.CLEARED_FIELD;
  }

  return LocalizeString(string, { label: action.label });
};

export const FormatChangeList = changeList => {
  changeList = ProcessChangeList(changeList);

  let formattedChangeList = {
    uncategorized: []
  };

  changeList
    .filter(action => action.actionType !== "SET_DEFAULT")
    .forEach((action) => {
      if(!rootStore.l10n.actions[action.actionType]) { return; }

      if(!action.label) {
        rootStore.DebugLog({message: "Unlabelled action", level: rootStore.logLevels.DEBUG_LEVEL_MEDIUM});
        rootStore.DebugLog({message: action, level: rootStore.logLevels.DEBUG_LEVEL_MEDIUM});
        return;
      }

      if(!action.category) {
        formattedChangeList.uncategorized.push(action);
        return;
      }

      let category = action.category;
      if(typeof category === "function") {
        category = category(action);
      }

      formattedChangeList[category] = formattedChangeList[category] || { uncategorized: [] };

      if(!action.subcategory) {
        formattedChangeList[category].uncategorized.push(action);
      } else {
        formattedChangeList[category][action.subcategory] = formattedChangeList[category][action.subcategory] || [];
        formattedChangeList[category][action.subcategory].push(action);
      }
    });

    let changeListString = [];
    let changeListMarkdown = [];
    let changeListElements = [];

    const categories = [...new Set(Object.keys(formattedChangeList))].sort();
    categories.forEach((category, index) => {
      if(category === "uncategorized") { return; }

      if(index > 0) {
        changeListMarkdown.push(" --- ");
      }

      changeListMarkdown.push(`### ${category}`);
      changeListString.push(`${category}:`);
      changeListElements.push({type: "category", value: category, level: 0});

      const subcategories = [...new Set(Object.keys(formattedChangeList[category]))].sort();
      subcategories.forEach(subcategory => {
        if(subcategory === "uncategorized") { return; }

        changeListMarkdown.push(`#### ${subcategory}`);
        changeListString.push(`  ${subcategory}:`);
        changeListElements.push({type: "subcategory", value: subcategory, level: 1});

        const modifications = [
          ...new Set(
            formattedChangeList[category][subcategory]
              .map(action => ActionToString(action))
          )
        ].sort();

        modifications.forEach(modification => {
          changeListMarkdown.push(`- ${modification}`);
          changeListString.push(`    ${modification}`);
          changeListElements.push({type: "field", value: modification, level: 2});
        });
      });

      if(formattedChangeList[category].uncategorized.length > 0) {
        formattedChangeList[category].uncategorized.forEach(action => {
          const modification = ActionToString(action);
          changeListMarkdown.push(`- ${modification}`);
          changeListString.push(`  ${modification}`);
          changeListElements.push({type: "field", value: modification, level: 1});
        });
      }
    });

  if(formattedChangeList.uncategorized.length > 0) {
    formattedChangeList.uncategorized.forEach(action => {
      const modification = ActionToString(action);
      changeListMarkdown.push(" --- ");
      changeListMarkdown.push(`### ${modification}`);
      changeListString.push(`${modification}`);
      changeListElements.push({type: "field", value: modification, level: 0});
    });
  }

  return {
    string: changeListString.join("\n"),
    markdown: changeListMarkdown.join("\n"),
    elements: changeListElements
  };
};
