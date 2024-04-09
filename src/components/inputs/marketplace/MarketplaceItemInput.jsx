import React, {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Box, Text, Group, Paper, Stack, Select} from "@mantine/core";
import Inputs, {ConfirmDelete} from "../Inputs.jsx";
import {rootStore, marketplaceStore, uiStore} from "@/stores/index.js";
import {IconButton, ItemImage, LocalizeString} from "@/components/common/Misc.jsx";
import {DragDropContext, Draggable, Droppable} from "@hello-pangea/dnd";
import {IconGripVertical, IconX} from "@tabler/icons-react";

// eslint-disable-next-line react/display-name
const ItemSelectComponent = React.forwardRef(({image, label, value, selected, ...others}) => {
  return (
    <Paper {...others} p={5}>
      <Group>
        <Box mr={10}>
          { image }
        </Box>
        <div>
          <Text fz="sm">{label}</Text>
          <Text color={!selected ? "dimmed" : undefined} fz="xs">{value}</Text>
        </div>
      </Group>
    </Paper>
  );
});

const SelectedItem = observer(({
  single,
  store,
  objectId,
  path,
  field,
  category,
  subcategory,
  label,
  index,
  item,
  disabled,
  componentProps={},
  dragHandleProps={},
  Remove
}) => {
  return (
    <Paper
      {...componentProps}
      p={3}
      withBorder
    >
      <Group pl={single ? 0 : "xs"} pr={35} spacing="sm" style={{position: "relative"}} noWrap>
        {
          single ? null :
            <div style={{cursor: "grab"}} {...dragHandleProps}>
              <IconGripVertical size={15}/>
            </div>
        }
        { item.image }
        <div>
          <Text fz="sm">{item.label || item.value}</Text>
          <Text fz="xs" color="dimmed">{item.value}</Text>
        </div>
        {
          disabled ? null :
            <IconButton
              label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: item.name || item.sku})}
              variant="transparent"
              tabIndex={-1}
              style={{position: "absolute", top: 5, right: 5}}
              icon={<IconX size={15}/>}
              onClick={() => {
                Remove ? Remove() :
                  ConfirmDelete({
                    itemName: item.label || item.value,
                    onConfirm: () => {
                      single ?
                        store.SetMetadata({
                          objectId,
                          page: location.pathname,
                          path,
                          field,
                          value: "",
                          category,
                          subcategory,
                          label
                        }) :
                        store.RemoveListElement({
                          objectId,
                          page: location.pathname,
                          path,
                          field,
                          index,
                          category,
                          subcategory,
                          label: item.name || item.sku
                        });
                    }
                  });
              }}
            />
        }
      </Group>
    </Paper>
  );
});

const MarketplaceItemSelectWrapper = observer(({objectId, marketplaceSlug, marketplaceId, Component, ...props}) => {
  const [resolvedMarketplaceId, setResolvedMarketplaceId] = useState(marketplaceId || (marketplaceSlug ? undefined : objectId));

  useEffect(() => {
    marketplaceStore.LoadMarketplaces()
      .then(() => {
        if(marketplaceId) {
          setResolvedMarketplaceId(marketplaceId);
          marketplaceStore.LoadMarketplace({marketplaceId});
          return;
        }

        const selectedMarketplace = marketplaceStore.allMarketplaces?.find(marketplace => marketplace.marketplaceSlug === marketplaceSlug);

        if(!selectedMarketplace) {
          return;
        }

        setResolvedMarketplaceId(selectedMarketplace.objectId);
        marketplaceStore.LoadMarketplace({marketplaceId: selectedMarketplace.objectId});
      });
  }, [marketplaceSlug, marketplaceId]);

  const items = marketplaceStore.marketplaces[resolvedMarketplaceId]?.metadata?.public?.asset_metadata?.info?.items || [];

  const options = items
    .map(item =>
      ({
        image: <ItemImage marketplaceId={resolvedMarketplaceId} item={item} scale={200} width={40} height={40} />,
        label: item.name || item.sku,
        value: item.sku
      })
    )
    .sort((a, b) => a.label.toLowerCase() < b.label.toLowerCase() ? -1 : 1);

  return (
    <Component
      {...props}
      objectId={objectId}
      items={items}
      options={options}
    />
  );
});

// A component for selecting a single marketplace item - a select with the current value displayed below
const MarketplaceItemSelectComponent = observer(({
  store,
  objectId,
  path,
  field,
  category,
  subcategory,
  label,
  description,
  hint,
  options,
  componentProps={},
  disabled,
  useBasicInput,
  inputProps={},
}) => {
  const selectedSKU = typeof inputProps?.value !== "undefined" ? inputProps.value : store.GetMetadata({objectId, path, field}) || "";
  const selectedItem = options.find(item => item.value === selectedSKU);

  return (
    <Paper withBorder p="xl" pt="sm" mb="md" maw={uiStore.inputWidth} {...componentProps}>
      {
        useBasicInput ?
          <Select data={options} mb="xs" searchable disabled={disabled} {...inputProps} /> :
          <Inputs.Select
            disabled={disabled}
            store={store}
            objectId={objectId}
            path={path}
            field={field}
            category={category}
            subcategory={subcategory}
            label={label}
            description={description}
            hint={hint}
            searchable
            itemComponent={ItemSelectComponent}
            options={options}
            componentProps={{
              mb: "xs",
              itemComponent: ItemSelectComponent,
              // Allow filtering by name or sku
              filter: (filter, item) =>
                item.label?.toLowerCase().includes(filter?.toLowerCase()) ||
                item.value?.toLowerCase().includes(filter?.toLowerCase())
            }}
          />
      }
      {
        !selectedItem ? null :
          <Stack p={0} spacing="xs">
            <SelectedItem
              disabled={disabled}
              single
              key={`item-${selectedSKU}`}
              store={store}
              objectId={objectId}
              path={path}
              field={field}
              item={selectedItem}
              Remove={!useBasicInput ? null : () => inputProps.onChange("")}
            />
          </Stack>
      }
    </Paper>
  );
});

// A component for selecting a list of marketplace items - a multiselect with the current value displayed below
const MarketplaceItemMultiselectComponent = observer(({
  store,
  objectId,
  path,
  field,
  category,
  subcategory,
  label,
  description,
  hint,
  items,
  disabled,
  options
}) => {
  const selectedSKUs = store.GetMetadata({objectId, path, field}) || [];

  const itemList = selectedSKUs.map((sku, index) => {
    const item = options.find(item => item.value === sku);

    if(!item) { return null; }

    return (
      <Draggable key={`draggable-item-${sku}`} index={index} draggableId={`item-${sku}`}>
        {(itemProvided, snapshot) => (
          <SelectedItem
            disabled={disabled}
            key={`item-${sku}`}
            store={store}
            objectId={objectId}
            path={path}
            field={field}
            category={category}
            subcategory={subcategory}
            label={label}
            index={index}
            item={item}
            componentProps={{
              shadow: snapshot.isDragging ? "lg" : "",
              ref: itemProvided.innerRef,
              ...itemProvided.draggableProps
            }}
            dragHandleProps={itemProvided.dragHandleProps}
          />
        )}
      </Draggable>
    );
  });

  return (
    <Paper withBorder p="xl" pt="md" mb="md" maw={uiStore.inputWidth}>
      <Inputs.MultiSelect
        disabled={disabled}
        store={store}
        objectId={objectId}
        path={path}
        field={field}
        category={category}
        subcategory={subcategory}
        label={label}
        description={description}
        hint={hint}
        searchable
        itemComponent={ItemSelectComponent}
        options={options}
        componentProps={{
          mb: "xs",
          itemComponent: ItemSelectComponent,
          valueComponent: () => null,
          // Allow filtering by name or sku
          filter: (filter, selected, item) =>
            !selected &&
            (item.label?.toLowerCase().includes(filter?.toLowerCase()) ||
            item.value?.toLowerCase().includes(filter?.toLowerCase()))
        }}
      />
      <DragDropContext
        onDragEnd={({source, destination}) => {
          const sku = selectedSKUs[source.index];
          const item = items.find(item => item.sku === sku);

          store.MoveListElement({
            objectId,
            page: location.pathname,
            path,
            field,
            index: source.index,
            newIndex: destination.index,
            category,
            subcategory,
            label: item?.name || item?.sku || ""
          });
        }}
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

export const MarketplaceItemSelect = observer(function (props, ref) {
  return <MarketplaceItemSelectWrapper {...props} Component={MarketplaceItemSelectComponent} ref={ref}/>;
});

export const MarketplaceItemMultiselect = observer(function (props, ref) {
  return <MarketplaceItemSelectWrapper {...props} Component={MarketplaceItemMultiselectComponent} ref={ref}/>;
});

export default MarketplaceItemMultiselect;
