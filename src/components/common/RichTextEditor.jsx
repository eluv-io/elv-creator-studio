import { RichTextEditor as TipTapEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {observer} from "mobx-react-lite";
import {useEffect} from "react";
import {rootStore} from "Stores";

import {
  IconArrowBackUp as IconUndo,
  IconArrowForwardUp as IconRedo
} from "@tabler/icons-react";


const RichTextEditor = observer(({store, objectId, page, path, field}) => {

  let value = store.GetMetadata({objectId, path, field});

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link
    ],
    onBlur: ({editor}) => {
      store.SetMetadata({
        objectId,
        page,
        path,
        field,
        value: editor.getHTML()
      });
    },
    content: value
  });

  useEffect(() => {
    if(!editor) { return; }

    // Ensure editor content is updated when referenced value is updated
    editor.commands.setContent(value);
  }, [editor, value]);

  return (
    <TipTapEditor editor={editor}>
      <TipTapEditor.Toolbar>
        <TipTapEditor.ControlsGroup>
          <TipTapEditor.Bold />
          <TipTapEditor.Italic />
          <TipTapEditor.Underline />
          <TipTapEditor.Strikethrough />
          <TipTapEditor.ClearFormatting />
          <TipTapEditor.Code />
        </TipTapEditor.ControlsGroup>

        <TipTapEditor.ControlsGroup>
          <TipTapEditor.H1 />
          <TipTapEditor.H2 />
          <TipTapEditor.H3 />
          <TipTapEditor.H4 />
        </TipTapEditor.ControlsGroup>

        <TipTapEditor.ControlsGroup>
          <TipTapEditor.Blockquote />
          <TipTapEditor.Hr />
          <TipTapEditor.BulletList />
          <TipTapEditor.OrderedList />
        </TipTapEditor.ControlsGroup>

        <TipTapEditor.ControlsGroup>
          <TipTapEditor.Link />
          <TipTapEditor.Unlink />
        </TipTapEditor.ControlsGroup>

        <TipTapEditor.ControlsGroup>
          <TipTapEditor.Control
            aria-label={rootStore.l10n.ui.actions.undo}
            title={rootStore.l10n.ui.actions.undo}
            onClick={() => editor?.commands.undo()}
          >
            <IconUndo size={18} />
          </TipTapEditor.Control>
          <TipTapEditor.Control
            aria-label={rootStore.l10n.ui.actions.redo}
            title={rootStore.l10n.ui.actions.redo}
            onClick={() => editor?.commands.redo()}
          >
            <IconRedo size={18} />
          </TipTapEditor.Control>
        </TipTapEditor.ControlsGroup>
      </TipTapEditor.Toolbar>

      <TipTapEditor.Content />
    </TipTapEditor>
  );
});

export default RichTextEditor;
