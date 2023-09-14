import {
  Group,
  Text,
  Image,
  Stack,
  TextInput,
  Paper
} from "@mantine/core";
import {observer} from "mobx-react-lite";
import AsyncWrapper from "@/components/common/AsyncWrapper.jsx";
import {itemTemplateStore, rootStore, uiStore} from "@/stores";
import UrlJoin from "url-join";
import {IconButton, LocalizeString} from "@/components/common/Misc";
import PageContent from "@/components/common/PageContent.jsx";
import {DataTable} from "mantine-datatable";
import {useState} from "react";
import {useDebouncedValue} from "@mantine/hooks";
import {SortTable} from "@/helpers/Misc.js";
import {Link} from "react-router-dom";
import {IconEdit} from "@tabler/icons-react";
import {ScaleImage} from "@/helpers/Fabric";

const ItemTemplateList = observer(() => {
  const l10n = rootStore.l10n.pages.item_template.form;
  const [sortStatus, setSortStatus] = useState({columnAccessor: "name", direction: "asc"});
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);

  const itemTemplates =
    (itemTemplateStore.allItemTemplates || [])
      .map(template => {
        const fullTemplateMetadata = itemTemplateStore.itemTemplates[template.objectId]?.metadata?.public?.asset_metadata?.nft;

        if(!fullTemplateMetadata) {
          return {
            ...template,
            name: template.brandedName || template.name
          };
        }

        return {
          ...template,
          image: fullTemplateMetadata.image,
          name: fullTemplateMetadata.name || template.name,
          address: fullTemplateMetadata.address
        };
      })
      .filter(template =>
        !debouncedFilter ||
        template.name?.toLowerCase()?.includes(debouncedFilter.toLowerCase()) ||
        template.objectId?.includes(debouncedFilter) ||
        template.contractId.includes(debouncedFilter) ||
        template.address.includes(debouncedFilter)
      )
      .sort(SortTable({sortStatus}));

  return (
    <AsyncWrapper
      loadingMessage="Loading Item Templates"
      Load={async () => await itemTemplateStore.LoadItemTemplates()}
    >
      <PageContent title={l10n.categories.item_templates}>
        <Paper maw={uiStore.inputWidthWide}>
          <TextInput mb="md" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Filter" />
          <DataTable
            minHeight={itemTemplates.length === 0 ? 200 : 0}
            withBorder
            highlightOnHover
            idAccessor="objectId"
            records={itemTemplates}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            columns={[
              {
                accessor: "name",
                sortable: true,
                title: l10n.list.columns.name,
                render: itemTemplate => (
                  <Group>
                    <Image width={60} height={60} fit="contain" src={ScaleImage(itemTemplate.image, 400)} alt={itemTemplate.name} withPlaceholder />
                    <Stack spacing={0}>
                      <Text>{itemTemplate.name}</Text>
                      <Text fz="xs" color="dimmed">{itemTemplate.objectId}</Text>
                    </Stack>
                  </Group>
                )
              },
              {
                accessor: "address",
                title: l10n.list.columns.address,
                render: itemTemplate => (
                  !itemTemplate.address ? null :
                    <Stack spacing={0}>
                      <Text fz="xs">{itemTemplate.address}</Text>
                      <Text fz="xs" color="dimmed">{itemTemplate.contractId}</Text>
                    </Stack>
                )
              },
              {
                accessor: "objectId",
                title: "",
                render: itemTemplate => (
                  <IconButton
                    label={LocalizeString(rootStore.l10n.components.inputs.edit, {item: itemTemplate.name})}
                    component={Link}
                    to={UrlJoin(location.pathname, itemTemplate.objectId)}
                    color="blue.5"
                    Icon={IconEdit}
                  />
                )
              }
            ]}
          />
        </Paper>
      </PageContent>
    </AsyncWrapper>
  );
});

export default ItemTemplateList;
