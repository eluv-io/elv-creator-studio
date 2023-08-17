import {observer} from "mobx-react-lite";
import {ActionIcon, Box, Text, Group, Paper, Stack} from "@mantine/core";
import Inputs, {ConfirmDelete} from "./Inputs.jsx";
import {marketplaceStore} from "Stores";
import {ItemImage} from "Components/common/Misc.jsx";
import {useLocation} from "react-router-dom";
import {DragDropContext, Draggable, Droppable} from "@hello-pangea/dnd";
import {IconGripVertical, IconX} from "@tabler/icons-react";

const ItemSelectComponent = ({image, label, value, ...others}) => {
  if(others.selected) { return null; }

  return (
    <Paper {...others} p={5}>
      <Group>
        <Box mr={10}>
          { image }
        </Box>
        <div>
          <Text fz="sm">{label}</Text>
          <Text color="dimmed" fz="xs">{value}</Text>
        </div>
      </Group>
    </Paper>
  );
};

// A component for selecting a list of marketplace items - a multiselect with the current value displayed below
const MarketplaceItemMultiselect = observer(({
  store,
  objectId,
  path,
  field,
  label,
  description,
  hint
}) => {
  const location = useLocation();
  const selectedSKUs = store.GetMetadata({objectId, path, field}) || [];
  const items = marketplaceStore.marketplaces[objectId]?.metadata?.public?.asset_metadata?.info?.items || [];

  const options = items
    .map(item =>
      ({
        image: <ItemImage item={item} width={200} imageProps={{width: 40, height: 40}} />,
        label: item.name || item.sku,
        value: item.sku
      })
    )
    .sort((a, b) => a.label.toLowerCase() < b.label.toLowerCase() ? -1 : 1);


  const itemList = selectedSKUs.map((sku, index) => {
    const item = items.find(item => item.sku === sku);

    if(!item) { return null; }

    return (
      <Draggable key={`item-${sku}`} index={index} draggableId={`item-${sku}`}>
        {(itemProvided, snapshot) => (
          <Paper
            key={`item-${sku}`}
            ref={itemProvided.innerRef}
            {...itemProvided.draggableProps}
            shadow={snapshot.isDragging ? "lg" : ""}
            p={0}
            withBorder
          >
            <Group pl="xs" pr={25} spacing="sm" style={{position: "relative"}}>
              <div style={{cursor: "grab"}} {...itemProvided.dragHandleProps}>
                <IconGripVertical size={15}/>
              </div>
              <ItemImage item={item} width={200} imageProps={{width: 50, height: 50}} />
              <div>
                <Text fz="sm">{item.name || item.sku}</Text>
                <Text fz="xs" color="dimmed">{sku}</Text>
              </div>
              <ActionIcon
                variant="transparent"
                tabIndex={-1}
                style={{position: "absolute", top: 5, right: 5}}
                onClick={() => {
                  ConfirmDelete({
                    itemName: item.name || item.sku,
                    onConfirm: () => store.RemoveListElement({objectId, page: location.pathname, path, field, index})
                  });
                }}
              >
                <IconX size={15} />
              </ActionIcon>
            </Group>
          </Paper>
        )}
      </Draggable>
    );
  });

  return (
    <Paper withBorder p="xl" pt="md" mb="md" maw={600}>
      <Inputs.MultiSelect
        store={store}
        objectId={objectId}
        path={path}
        field={field}
        label={label}
        description={description}
        hint={hint}
        searchable
        itemComponent={ItemSelectComponent}
        options={options}
        componentProps={{
          itemComponent: ItemSelectComponent,
          valueComponent: () => null,
          // Allow filtering by name or sku
          filter: (filter, something, item) =>
            item.label?.toLowerCase().includes(filter?.toLowerCase()) ||
            item.value?.toLowerCase().includes(filter?.toLowerCase())
        }}
      />
      <DragDropContext
        onDragEnd={({source, destination}) =>
          store.MoveListElement({objectId, page: location.pathname, path, field, index: source.index, newIndex: destination.index})
        }
      >
        <Droppable droppableId="simple-list" direction="vertical">
          {provided => (
            <Stack p={0} spacing="xs" {...provided.droppableProps} ref={provided.innerRef}>
              { itemList }
              { provided.placeholder }
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    </Paper>
  );
});

export default MarketplaceItemMultiselect;
