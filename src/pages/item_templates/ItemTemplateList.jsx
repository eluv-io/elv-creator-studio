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
import {itemTemplateStore, rootStore} from "@/stores";
import UrlJoin from "url-join";
import {IconButton, LocalizeString} from "@/components/common/Misc";
import PageContent from "@/components/common/PageContent.jsx";
import {DataTable} from "mantine-datatable";
import {useState} from "react";
import {useDebouncedValue} from "@mantine/hooks";
import {SortTable} from "@/helpers/Misc.js";
import {Link} from "react-router-dom";
import {IconEdit} from "@tabler/icons-react";

const ItemTemplateList = observer(() => {
  const l10n = rootStore.l10n.pages.item_template.form;
  const [sortStatus, setSortStatus] = useState({columnAccessor: "brandedName", direction: "asc"});
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);

  const itemTemplates =
    (itemTemplateStore.allItemTemplates || [])
      .filter(template =>
        !debouncedFilter ||
        template.brandedName?.toLowerCase()?.includes(debouncedFilter.toLowerCase()) ||
        template.name?.toLowerCase()?.includes(debouncedFilter.toLowerCase()) ||
        template.objectId?.includes(debouncedFilter)
      )
      .sort(SortTable({sortStatus}))
      .map(template => {
        const fullTemplateMetadata = itemTemplateStore.itemTemplates[template.objectId]?.metadata?.public?.asset_metadata?.nft;

        if(!fullTemplateMetadata) {
          return template;
        }

        return {
          ...template,
          image: fullTemplateMetadata.image,
          brandedName: fullTemplateMetadata.name
        };
      });

  return (
    <AsyncWrapper
      loadingMessage="Loading Item Templates"
      Load={async () => await itemTemplateStore.LoadItemTemplates()}
    >
      <PageContent title={l10n.categories.item_templates}>
        <Paper maw={800}>
          <TextInput mb="md" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Filter" />
          <DataTable
            minHeight={125}
            withBorder
            highlightOnHover
            idAccessor="objectId"
            records={itemTemplates}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            columns={[
              {
                accessor: "brandedName",
                sortable: true,
                title: l10n.list.columns.name,
                render: itemTemplate => (
                  <Group>
                    <Image width={60} height={60} fit="contain" src={itemTemplate.image} alt={itemTemplate.brandedName} withPlaceholder />
                    <Stack spacing={0}>
                      <Text>{itemTemplate.brandedName || itemTemplate.name}</Text>
                      <Text fz="xs" color="dimmed">{itemTemplate.objectId}</Text>
                    </Stack>
                  </Group>
                )
              },
              {
                accessor: "objectId",
                title: "",
                render: itemTemplate => (
                  <IconButton
                    label={LocalizeString(rootStore.l10n.components.inputs.edit, {item: itemTemplate.brandedName || itemTemplate.name})}
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
