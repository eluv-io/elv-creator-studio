import {observer} from "mobx-react-lite";
import {ActionIcon, Box, Text, Group, Paper, Stack} from "@mantine/core";
import Inputs, {ConfirmDelete} from "./Inputs.jsx";
import {rootStore, marketplaceStore} from "Stores";
import {ItemImage} from "../common/Misc.jsx";

import {IconX} from "@tabler/icons-react";
import {useLocation} from "react-router-dom";

const ItemSelectComponent = ({image, label, value, ...others}) => {
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
        image: <ItemImage item={item} width={200} imageProps={{width: 40, height: 40, radius: "md"}} />,
        label: item.name || item.sku,
        value: item.sku
      })
    )
    .sort((a, b) => a.label.toLowerCase() < b.label.toLowerCase() ? -1 : 1);

  return (
    <Paper withBorder p="xl" pt="md" maw={500}>
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
      <Stack spacing="xs">
        {
          selectedSKUs.map((sku, index) => {
            const item = items.find(item => item.sku === sku);

            if(!item) { return null; }

            return (
              <Paper key={`item-${sku}`} style={{position: "relative"}} p={5} pr={25} withBorder>
                <Group>
                  <Box mr={10}>
                    <ItemImage item={item} width={200} imageProps={{width: 50, height: 50, radius: "md"}} />
                  </Box>
                  <div>
                    <Text fz="sm">{item.name || item.sku}</Text>
                    <Text fz="xs" color="dimmed">{sku}</Text>
                  </div>
                </Group>
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
              </Paper>
            );
          })
        }
      </Stack>
    </Paper>
  );
});

export default MarketplaceItemMultiselect;
