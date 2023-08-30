import {Affix, Button, Group} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {useLocation, useParams} from "react-router-dom";
import {
  IconArrowBackUp as IconUndo,
  IconArrowForwardUp as IconRedo
} from "@tabler/icons-react";
import {rootStore, marketplaceStore, tenantStore, siteStore} from "@/stores";

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
    case "site":
      store = siteStore;
      objectId = params.siteId;
      break;
    default:
      rootStore.DebugLog({message: `History Buttons: Unknown section type '${section}'`, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
  }

  const undoActions = store.UndoQueue({objectId, page});
  const redoActions = store.RedoQueue({objectId, page});

  return (
    <Affix position={{bottom: 20, right: 20}}>
      <Group>
        <Button compact variant="light" disabled={undoActions.length === 0} onClick={() => store.UndoAction({objectId, page})}>
          <IconUndo />
        </Button>
        <Button compact variant="light" disabled={redoActions.length === 0} onClick={() => store.RedoAction({objectId, page})}>
          <IconRedo />
        </Button>
      </Group>
    </Affix>
  );
});

export default HistoryButtons;
