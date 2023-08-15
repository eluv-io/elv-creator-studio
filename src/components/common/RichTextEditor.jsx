import { RichTextEditor as TipTapEditor, Link } from "@mantine/tiptap";
import { useEditor, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {observer} from "mobx-react-lite";
import {useEffect} from "react";
import {rootStore} from "Stores";

import {
  IconArrowBackUp as IconUndo,
  IconArrowForwardUp as IconRedo
} from "@tabler/icons-react";


const RichTextEditor = observer(({store, objectId, page, path, field, componentProps={}}) => {
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
        // If editor is empty, just set to empty string instead of empty html
        value: editor.getText().trim() === "" ? "" : editor.getHTML()
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
    <TipTapEditor {...componentProps} editor={editor}>
      {
        !editor ? null :
          <BubbleMenu editor={editor}>
            <TipTapEditor.ControlsGroup>
              <TipTapEditor.Bold />
              <TipTapEditor.Italic />
              <TipTapEditor.Underline />
              <TipTapEditor.Strikethrough />
              <TipTapEditor.ClearFormatting />
              <TipTapEditor.Code />
              <TipTapEditor.H1 />
              <TipTapEditor.H2 />
              <TipTapEditor.H3 />
              <TipTapEditor.H4 />
            </TipTapEditor.ControlsGroup>
          </BubbleMenu>
      }
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
            aria-label={rootStore.l10n.components.actions.undo}
            title={rootStore.l10n.components.actions.undo}
            onClick={() => editor?.commands.undo()}
          >
            <IconUndo size={18} />
          </TipTapEditor.Control>
          <TipTapEditor.Control
            aria-label={rootStore.l10n.components.actions.redo}
            title={rootStore.l10n.components.actions.redo}
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
