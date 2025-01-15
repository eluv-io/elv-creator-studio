import {rootStore, mediaPropertyStore, uiStore} from "@/stores";
import {S} from "./CssHelper";

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

export const BuilderDeleteOrRemoveDialog = ({deleteMessage="", deleteAction, removeMessage="", removeAction}) => {

  return (
    <div className={S("builder-input-container")}>
          <Flex
            gap="md"
            direction="column"
          >
          <Button fullWidth mt="xl"
            onClick={()=>{
              if (!removeAction) {
                return;
              }

              removeAction();
            }
            
            }>
              {removeMessage}
            </Button>

          <Button fullWidth mt="xl"
            onClick={()=>{
              if (!deleteAction) {
                return;
              }
              
              deleteAction();
            }
            
            }>
              {deleteMessage}
          </Button>

          </Flex>
    </div>
  );
};