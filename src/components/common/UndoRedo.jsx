import {Affix, Button, Group} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {useLocation} from "react-router-dom";
import {
  ArrowNarrowLeft as IconArrowBack,
  ArrowNarrowRight as IconArrowForward
} from "tabler-icons-react";

const UndoRedo = observer(({store, objectId}) => {
  const location = useLocation();
  const page = location.pathname;

  const undoActions = store.UndoQueue({objectId, page});
  const redoActions = store.RedoQueue({objectId, page});

  return (
    <Affix position={{bottom: 20, right: 20}}>
      <Group>
        <Button compact variant="light" disabled={undoActions.length === 0} onClick={() => store.UndoAction({objectId, page})}>
          <IconArrowBack />
        </Button>
        <Button compact variant="light" disabled={redoActions.length === 0} onClick={() => store.RedoAction({objectId, page})}>
          <IconArrowForward />
        </Button>
      </Group>
    </Affix>
  );
});

export default UndoRedo;
