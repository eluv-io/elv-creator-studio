import cx from "clsx";
import { Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {rootStore, mediaPropertyStore, uiStore} from "@/stores";
import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import UrlJoin from "url-join";
import {LogItem} from "@/helpers/Misc";
import {S} from "./CssHelper";
import {IconButton} from "@/components/common/Misc.jsx";
import {
  BuilderTextInput,
  BuilderTextArea
} from "./BuilderInputs";

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

const SectionList = observer(({mediaPropertyId, sections}) =>  {
  const [state, handlers] = useListState(sections);
  LogItem(sections);

  const items = state.map((item, index) => (
    <Draggable key={item.id} index={index} draggableId={item.id}>
      {(provided, snapshot) => (
        <div
          //className={cx(classes.section, { [classes.itemDragging]: snapshot.isDragging })}
          className={S("page__section")}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <div>
            <HeroSectionBuilder mediaPropertyId = {mediaPropertyId} section={item}/>
          </div>
        </div>
      )}
    </Draggable>
  ));

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) =>
        handlers.reorder({ from: source.index, to: destination?.index || 0 })
      }
    >
      <Droppable droppableId="dnd-list" direction="vertical">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className={S("page__sections")}>
            {items}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
});

export function HeroSectionBuilder({mediaPropertyId, section}) {
  if(!section){return;}
  
  const sectionId = section.id;

  const heroItems = section.hero_items;

  if(!heroItems || heroItems.count == 0) {return;}
  const heroItem = heroItems[0];
  if(!heroItem) {
    return null;
  }

  const heroItemId = heroItem.id;
  const heroItemIndex = section.hero_items?.findIndex(heroItem => heroItem.id === heroItemId);


  const l10n = rootStore.l10n.pages.media_property.form;
  const basePath = UrlJoin("/public/asset_metadata/info/sections", sectionId, "hero_items", heroItemIndex.toString());
  let inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: mediaPropertyStore.MediaPropertyCategory({category: "section_label", mediaPropertyId, type: "sections", id: sectionId, label: section.label}),
    subcategory: mediaPropertyStore.MediaPropertyCategory({
      category: "section_hero_item_label",
      mediaPropertyId,
      type: "hero_item",
      path: basePath,
      label: heroItem.label
    }),
    path: UrlJoin(basePath, "display")
  };


  //console.log("HeroSectionBuilder");
  LogItem(section);

  return (
    <div className={S("section-hero")}>
      <div className={S("section-hero-logo-container")}>
        <img
          className={S("section-hero-logo", "hidden-trigger")}
          src={heroItem.display?.logo?.url}
        />
        <IconButton
          label={rootStore.l10n.components.actions.edit}
          Icon={IconEdit}
          onClick={() => {console.log("clicked");}}
          color="purple.6"
          className={S("hidden", "overlay")}
        />
      </div>

        <div>

          <BuilderTextInput 
            classNames={["section-hero-title"]}
            text={heroItem.display?.title} 
            setText={(text)=>{
              console.log("setText ", text);
            }}
            label="Hero Title"
            inputProps = {{field:"title",...l10n.pages.header.title,...inputProps}}
            />

          <BuilderTextArea
            classNames={["section-hero-description"]}
            text={heroItem.display?.description}
            setText={(text)=>{
              console.log("setText ", text);
            }}
            label="Hero Description"
            inputProps = {{field:"description",...inputProps}}
            />

        </div>
    </div>
  );

}


export default SectionList;