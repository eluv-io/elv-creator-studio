import cx from "clsx";
import { useListState, useClickOutside} from "@mantine/hooks";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {rootStore, mediaPropertyStore, uiStore} from "@/stores";
import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {LogItem} from "@/helpers/Misc";
import {S} from "./CssHelper";
import { useHover, useDisclosure } from "@mantine/hooks";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import {useEffect, useState} from "react";
import {
  Input as MantineInput,
  Text,
  TextInput,
  Textarea,
  MultiSelect as MantineMultiSelect,
  Button,
  Modal,
  Container,
  Title,
  Group,
  Paper,
  Flex
} from "@mantine/core";

import Inputs from "@/components/inputs/Inputs";

import {
  IconX,
  IconPlus,
  IconGripVertical,
  IconPhotoX,
  IconEdit,
  IconEditOff,
  IconTrashX,
  IconSelect,
  IconFile,
  IconDownload,
  IconPlayerPause,
  IconPlayerPlay,
  IconLink,
  IconUnlink, IconCopy
} from "@tabler/icons-react";

export const BuilderTextInput = observer(({text = "", classNames = [], setText = null, label = "", inputProps = null}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [opened, { open, close }] = useDisclosure(false);


  if(value == "" && !editing) {
    setValue(text);
  }


  console.log("Value: ", value);
  return (
    <div className={S("builder-input-container")}>
        <Modal size="sm" opened={opened} onClose={()=>{close(); setValue("");}} withCloseButton={false} centered>
            <Inputs.Text
              {...inputProps}
              label={label}
            />

            <Flex
              gap="md"
            >

            <Button fullWidth mt="xl"
              onClick={()=>{

                console.log("onSubmit Value ", value);
                if (setText != null) {
                  setText(value);
                }
                close();
                setValue("");
              }
              
              }>
                OK
              </Button>
              </Flex>
        </Modal>
        <Text 
          className={S("editable",...classNames)}
          onClick={() => {setEditing(!editing); open();}}
        >
          {text}
        </Text>
    </div>
  );
});

export const BuilderTextArea = observer(({text = "", classNames = [], setText = null, label = "", inputProps = null}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

  if(value == "" && !editing) {
    setValue(text);
  }

  return (
    <div className={S("builder-input-container")}>
        <Modal size="lg" opened={opened} onClose={()=>{close(); setValue("");}} withCloseButton={false} centered>
          <Flex
              gap="md"
              direction="column"
            >

            <Inputs.TextArea
              {...inputProps}
              label={label}
              className={S("text-area")}
            />

            </Flex>

            <Flex
              gap="md"
            >

            <Button fullWidth mt="xl"
              onClick={()=>{

                console.log("onSubmit Value ", value);
                if (setText != null) {
                  setText(value);
                }
                close();
                setValue("");
              }
              
              }>
                Close
              </Button>
              </Flex>
        </Modal>
        <Text 
          className={S("editable",...classNames)}
          onClick={() => {setEditing(!editing); open();}}
        >
          {text}
        </Text>
    </div>
  );
});

export const BuilderImage = observer(({src = "", classNames = [], fields = {}, label = "", inputProps = null}) => {
  const [editing, setEditing] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <div className={S("builder-input-container")}>
        <Modal size="xl" opened={opened} onClose={()=>{close();}} withCloseButton={false} centered>
          <Flex
              gap="md"
              direction="column"
            >

          <Inputs.ImageInput
            {...inputProps}
          />
            </Flex>

            <Flex
              gap="md"
            >

            <Button fullWidth mt="xl"
              onClick={()=>{
                close();
              }
              
              }>
                Close
              </Button>
              </Flex>
        </Modal>
        <img 
          className={S("editable",...classNames)}
          onClick={() => {setEditing(!editing); open();}}
          src = {src}
        />
    </div>
  );
});