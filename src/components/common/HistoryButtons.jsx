import {Affix, Group} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {useLocation, useParams} from "react-router-dom";
import {
  IconArrowBackUp as IconUndo,
  IconArrowForwardUp as IconRedo
} from "@tabler/icons-react";
import {
  rootStore,
  marketplaceStore,
  tenantStore,
  itemTemplateStore,
  mediaCatalogStore,
  mediaPropertyStore, permissionSetStore
} from "@/stores";
import {IconButton, LocalizeString} from "@/components/common/Misc";
import {ActionToString} from "@/stores/helpers/Changelist.js";

const HistoryButtons = observer(({section}) => {
  const params = useParams();
  const location = useLocation();
  const page = location.pathname;

  let store, objectId;
  switch(section) {
    case "tenant":
      store = tenantStore;
      objectId = tenantStore.tenantObjectId;
      break;
    case "marketplace":
      store = marketplaceStore;
      objectId = params.marketplaceId;
      break;
    case "itemTemplate":
      store = itemTemplateStore;
      objectId = params.itemTemplateId;
      break;
    case "mediaCatalog":
      store = mediaCatalogStore;
      objectId = params.mediaCatalogId;
      break;
    case "mediaProperty":
      store = mediaPropertyStore;
      objectId = params.mediaPropertyId;
      break;
    case "permissionSet":
      store = permissionSetStore;
      objectId = params.permissionSetId;
      break;
    default:
      rootStore.DebugLog({message: `History Buttons: Unknown section type '${section}'`, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
  }

  const undoActions = store.UndoQueue({objectId, page, localizationKey: rootStore.localizationKey});
  const redoActions = store.RedoQueue({objectId, page, localizationKey: rootStore.localizationKey});

  return (
    <Affix position={{bottom: 20, right: 20}} style={{zIndex: 10}}>
      <Group>
        <IconButton
          label={
            undoActions.length === 0 ? undefined :
              LocalizeString(rootStore.l10n.components.actions.undo_action, { action: ActionToString(undoActions[0]) })
          }
          Icon={IconUndo}
          variant="filled"
          color="purple.6"
          disabled={undoActions.length === 0}
          onClick={() => store.UndoAction({objectId, page, localizationKey: rootStore.localizationKey})}
        />
        <IconButton
          label={
            redoActions.length === 0 ? undefined :
              LocalizeString(rootStore.l10n.components.actions.redo_action, { action: ActionToString(redoActions[0]) })
          }
          Icon={IconRedo}
          variant="filled"
          color="purple.6"
          disabled={redoActions.length === 0}
          onClick={() => store.RedoAction({objectId, page, localizationKey: rootStore.localizationKey})}
        />
      </Group>
    </Affix>
  );
});

export default HistoryButtons;
