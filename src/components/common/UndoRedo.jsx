import {Affix, Button, Group, Text} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {useLocation} from "react-router-dom";
import {ArrowNarrowLeft as IconArrowBack, ArrowNarrowRight as IconArrowForward} from "tabler-icons-react";
import {useHover} from "@mantine/hooks";

const HoverButton = (props) => {
  const { hovered, ref } = useHover();

  props = {...props};
  const Render = props.Render;
  delete props.Render;

  return (
    <Button {...props} ref={ref}>
      { Render(hovered) }
    </Button>
  );
};

const UndoRedo = observer(({store, objectId}) => {
  const location = useLocation();
  const page = location.pathname;

  const undoActions = store.UndoQueue({objectId, page});
  const redoActions = store.RedoQueue({objectId, page});

  return (
    <Affix position={{bottom: 20, right: 20}}>
      <Group>
        <HoverButton
          compact
          variant="light"
          disabled={undoActions.length === 0}
          onClick={() => store.UndoAction({objectId, page})}
          Render={hovered => (
            <>
              <IconArrowBack />
              { hovered ? <Text>Undo Action</Text> : null }
            </>
          )}
        />
        <Button compact variant="light" disabled={undoActions.length === 0} onClick={() => store.UndoAction({objectId, page})}>
          <IconArrowBack />
          <Text>Undo Action</Text>
        </Button>
        <Button compact variant="light" disabled={redoActions.length === 0} onClick={() => store.RedoAction({objectId, page})}>
          <IconArrowForward />
          <Text>Redo Action</Text>
        </Button>
      </Group>
    </Affix>
  );
});

export default UndoRedo;
