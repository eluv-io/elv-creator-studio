import {observer} from "mobx-react-lite";
import {Link, useParams} from "react-router-dom";
import {rootStore, pocketStore, mediaCatalogStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {PocketSidebarTabGroupSpec} from "@/specs/PocketSpecs.js";
import UrlJoin from "url-join";
import {IconButton, ListItemCategory} from "@/components/common/Misc.jsx";
import {useEffect, useState} from "react";
import {Button, Container, Group, Paper, Stack, Text, Title} from "@mantine/core";
import {
  MediaItemCard, MediaItemImage,
  MediaItemPermissionIcon,
} from "@/components/common/MediaCatalog.jsx";
import {MediaCatalogItemSelectionModal} from "@/components/inputs/media_catalog/MediaCatalogItemTable.jsx";
import {IconExternalLink} from "@tabler/icons-react";
import {PocketBumpers} from "@/pages/pockets/PocketCommon.jsx";

const AutomaticSectionContentPreview = observer(({pocketId, tabId, groupId}) => {
  let content = pocketStore.GetAutomaticGroupContent({pocketId, tabId, groupId});

  if(content.length === 0) {
    return (
      <Text mt="md" italic fz="sm">No Matching Content</Text>
    );
  }

  return (
    <Paper shadow="sm" withBorder py="md" px={5} h="max-content" mt="md" w={uiStore.inputWidth}>
      <Title order={4} align="center">Section Content Preview</Title>
      <Text align="center" fz="xs" mb="sm">{content.length} Matching Items</Text>
      <Stack spacing={5} mah={550} px="sm" style={{overflowY: "auto", overflowX: "visible", overscrollBehavior: "none"}}>
        {
          content.map(mediaItem =>
            <MediaItemCard
              key={`media-item-${mediaItem.id}`}
              mediaItem={mediaItem}
              aspectRatio="Canonical"
              size="sm"
              withLink
              link={UrlJoin("/media-catalogs", mediaItem.media_catalog_id, "media", mediaItem.id)}
              showPermissions
            />
          )
        }
      </Stack>
    </Paper>
  );
});

const AutomaticSectionFilters = observer(() => {
  const [showContentPreview, setShowContentPreview] = useState(false);
  const { pocketId, tabId, groupId } = useParams();
  const pocket = pocketStore.pockets[pocketId];

  useEffect(() => {
    (pocket?.metadata?.public?.asset_metadata?.info?.media_catalogs || [])
      .forEach(mediaCatalogId => mediaCatalogStore.LoadMediaCatalog({mediaCatalogId}));
  }, []);

  if(!pocket) { return null; }

  const info = pocket?.metadata?.public?.asset_metadata?.info || {};

  const tabIndex = info.sidebar_config?.tabs?.findIndex(tab => tab.id === tabId);
  const tab = info.sidebar_config?.tabs?.[tabIndex];

  if(!tab) { return null; }

  const groupIndex = tab.groups.findIndex(group => group.id === groupId);
  const group = tab.groups[groupIndex];

  if(!group) { return null; }

  const l10n = rootStore.l10n.pages.pocket.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    path: UrlJoin("/public/asset_metadata/info/sidebar_config/tabs/", tabIndex.toString(), "groups", groupIndex.toString(), "select"),
    category: ListItemCategory({
      store: pocketStore,
      objectId: pocketId,
      listPath: "/public/asset_metadata/info/sidebar_config/tabs",
      id: tabId,
      labelField: "label",
      l10n: l10n.categories.sidebar_tab_label
    }),
    subcategory: l10n.categories.sidebar_tab_group
  };

  const attributes = pocketStore.GetPocketAttributes({pocketId});

  return (
    <>
      <Container m={0} p={0} miw={uiStore.inputWidth}>
        <Inputs.Select
          {...inputProps}
          {...l10n.sidebar_tab_group.filters.media_catalog}
          field="media_catalog"
          defaultValue=""
          options={[
            { label: "All Property Catalogs", value: "" },
            ...info.media_catalogs.map(mediaCatalogId => ({
              label: mediaCatalogStore.mediaCatalogs[mediaCatalogId]?.metadata.public.asset_metadata.info.name || mediaCatalogId,
              value: mediaCatalogId
            }))
          ]}
        />
        <Inputs.Select
          {...inputProps}
          {...l10n.sidebar_tab_group.filters.sort_order}
          field="sort_order"
          defaultValue=""
          options={[
            { label: "Title (A-Z)", value: "title_asc" },
            { label: "Title (Z-A)", value: "title_desc" },
            { label: "Start Time (Earliest to Latest)", value: "time_asc" },
            { label: "Start Time (Latest to Earliest)", value: "time_desc" },
          ]}
        />
        <Inputs.MultiSelect
          {...inputProps}
          {...l10n.sidebar_tab_group.filters.tags}
          clearable
          searchable
          options={pocketStore.GetPocketTags({pocketId})}
          field="tags"
        />
        <Inputs.MultiSelect
          {...inputProps}
          {...l10n.sidebar_tab_group.filters.attributes}
          clearable
          searchable
          options={
            Object.keys(attributes).map(attributeId => ({
              label: attributes[attributeId].title || "Attribute",
              value: attributeId
            }))
          }
          field="attributes"
        />

        {
          (group?.select?.attributes || []).map(attributeId => {
            const attribute = attributes[attributeId];

            if(!attribute) { return; }

            return (
              <Inputs.Select
                componentProps={{mt: "md"}}
                key={`attribute-${attributeId}`}
                {...inputProps}
                path={UrlJoin(inputProps.path, "attribute_values")}
                field={attributeId}
                label={attribute.title || "Attribute"}
                searchable
                defaultValue=""
                options={attributes[attributeId].tags || []}
              />
            );
          })
        }
        <Inputs.Date
          {...inputProps}
          {...l10n.sidebar_tab_group.filters.date}
          field="date"
        />
        <Inputs.Select
          {...inputProps}
          {...l10n.sidebar_tab_group.filters.schedule}
          field="schedule"
          defaultValue=""
          options={[
            { label: "Any Time", value: "" },
            { label: "Live Now", value: "live" },
            { label: "Live and Upcoming", value: "live_and_upcoming" },
            { label: "Upcoming", value: "upcoming" },
            { label: "Past", value: "past" },
            { label: "Specific Time Period", value: "period" }
          ]}
        />
        {
          !["past", "period"].includes(group.select.schedule) ? null :
            <Inputs.DateTime
              {...inputProps}
              {...l10n.sidebar_tab_group.filters.start_time}
              field="start_time"
            />
        }
        {
          !["live_and_upcoming", "upcoming", "period"].includes(group.select.schedule) ? null :
            <Inputs.DateTime
              {...inputProps}
              {...l10n.sidebar_tab_group.filters.end_time}
              field="end_time"
            />
        }
        <Button
          mt="xl"
          fz="xs"
          variant="outline"
          onClick={() => setShowContentPreview(!showContentPreview)}
        >
          { showContentPreview ? "Hide Content Preview" : "Show Content Preview" }
        </Button>
      </Container>
      {
        !showContentPreview ? null :
          <AutomaticSectionContentPreview
            pocketId={pocketId}
            tabId={tabId}
            groupId={groupId}
          />
      }
    </>
  );
});

export const MediaItemTitle = observer(({mediaItemId, aspectRatio}) => {
  const mediaItem = pocketStore.GetMediaItem({mediaItemId});

  return (
    <Group noWrap>
      <MediaItemImage
        mediaItem={mediaItem}
        scale={150}
        width={60}
        height={60}
        miw={60}
        fit="contain"
        position="left"
        aspectRatio={aspectRatio}
      />
      <Stack spacing={2}>
        <Text fw={600}>
          { mediaItem.label || mediaItem.title || mediaItemId }
        </Text>
        <Text italic fz={10}>
          { mediaItem.slug || mediaItemId }
        </Text>
      </Stack>
    </Group>
  );
});

const GroupMediaTable = observer(() => {
  const [showMediaSelectionModal, setShowMediaSelectionModal] = useState(false);
  const { pocketId, tabId, groupId } = useParams();
  const pocket = pocketStore.pockets[pocketId];

  if(!pocket) { return null; }

  const info = pocket?.metadata?.public?.asset_metadata?.info || {};

  const tabIndex = info.sidebar_config?.tabs?.findIndex(tab => tab.id === tabId);
  const tab = info.sidebar_config?.tabs?.[tabIndex];

  if(!tab) { return null; }

  const groupIndex = tab.groups.findIndex(group => group.id === groupId);
  const group = tab.groups[groupIndex];

  if(!group) { return null; }

  const l10n = rootStore.l10n.pages.pocket.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    path: UrlJoin("/public/asset_metadata/info/sidebar_config/tabs/", tabIndex.toString(), "groups", groupIndex.toString()),
    category: ListItemCategory({
      store: pocketStore,
      objectId: pocketId,
      listPath: "/public/asset_metadata/info/sidebar_config/tabs",
      id: tabId,
      labelField: "label",
      l10n: l10n.categories.sidebar_tab_label
    }),
    subcategory: l10n.categories.sidebar_tab_group
  };

  return (
    <>
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.sidebar_tab_group.content}
        editable={false}
        field="content"
        AddItem={() => setShowMediaSelectionModal(true)}
        Actions={mediaItemId => {
          const mediaItem = pocketStore.GetMediaItem({mediaItemId});

          if(!mediaItem) { return null; }

          return (
            <IconButton
              label="View Media Item"
              Icon={IconExternalLink}
              component={Link}
              to={UrlJoin("/media-catalogs", mediaItem.media_catalog_id, "media", mediaItem.id)}
              color="purple.6"
            />
          );
        }}
        columns={[
          {
            accessor: "label",
            sortable: true,
            label: l10n.sidebar_tab_group.content.columns.label,
            render: mediaItemId => <MediaItemTitle mediaItemId={mediaItemId} />
          },
          {
            accessor: "permissions",
            label: l10n.sidebar_tab_group.content.columns.permissions,
            centered: true,
            render: mediaItemId => <MediaItemPermissionIcon mediaItem={pocketStore.GetMediaItem({mediaItemId})} />,
            width: 125
          }
        ]}
      />
      {
        !showMediaSelectionModal ? null :
          <MediaCatalogItemSelectionModal
            multiple
            mediaCatalogIds={info.media_catalogs || []}
            Submit={mediaItemIds =>
              pocketStore.SetMetadata({
                ...inputProps,
                ...l10n.sidebar_tab_group.content,
                page: location.pathname,
                field: "content",
                value: [...(group.content || []), ...mediaItemIds]
              })
            }
            Close={() => setShowMediaSelectionModal(false)}
          />
      }
    </>
  );
});

export const PocketSidebarContentTabGroup = observer(() => {
  const { pocketId, tabId, groupId } = useParams();
  const pocket = pocketStore.pockets[pocketId];

  if(!pocket) { return null; }

  const info = pocket?.metadata?.public?.asset_metadata?.info || {};

  const tabIndex = info.sidebar_config?.tabs?.findIndex(tab => tab.id === tabId);
  const tab = info.sidebar_config?.tabs?.[tabIndex];

  if(!tab) { return null; }

  const groupIndex = tab.groups.findIndex(group => group.id === groupId);
  const group = tab.groups[groupIndex];

  if(!group) { return null; }

  const l10n = rootStore.l10n.pages.pocket.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    path: UrlJoin("/public/asset_metadata/info/sidebar_config/tabs/", tabIndex.toString(), "groups", groupIndex.toString()),
    category: ListItemCategory({
      store: pocketStore,
      objectId: pocketId,
      listPath: "/public/asset_metadata/info/sidebar_config/tabs",
      id: tabId,
      labelField: "label",
      l10n: l10n.categories.sidebar_tab_label
    }),
    subcategory: l10n.categories.sidebar_tab_group
  };

  return (
    <PageContent
      backLink={UrlJoin("/pocket", pocketId, "sidebar", tab.id)}
      title={`${info.name || pocket.name || "Pocket TV Property"} - Sidebar Tab Group`}
      section="pocket"
      useHistory
    >
      <Inputs.Text
        {...inputProps}
        {...l10n.common.id}
        disabled
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.common.label}
        field="label"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.common.description}
        field="description"
      />

      <Title order={3} fw={500} mt={50} maw={uiStore.inputWidth} mb="md">Display</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.sidebar_tab_group.title}
        field="title"
      />

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.sidebar_tab_group.sequential}
        value={tab.sequential}
        disabled={tab.sequential}
        field="sequential"
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.sidebar_tab_group.type}
        defaultValue="manual"
        field="type"
        options={[
          { label: "Manual", value: "manual" },
          { label: "Automatic", value: "automatic" },
        ]}
      />

      {
        group.type === "automatic" ?
          <AutomaticSectionFilters /> :
          <GroupMediaTable />
      }
    </PageContent>
  );
});


const PocketSidebarContentTab = observer(() => {
  const { pocketId, tabId } = useParams();

  const pocket = pocketStore.pockets[pocketId];

  if(!pocket) { return null; }

  const info = pocket?.metadata?.public?.asset_metadata?.info || {};

  const tabIndex = info.sidebar_config?.tabs?.findIndex(tab => tab.id === tabId);
  const tab = info.sidebar_config?.tabs?.[tabIndex];

  if(!tab) { return null; }

  const l10n = rootStore.l10n.pages.pocket.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    path: UrlJoin("/public/asset_metadata/info/sidebar_config/tabs/", tabIndex.toString()),
    category: ListItemCategory({
      store: pocketStore,
      objectId: pocketId,
      listPath: "/public/asset_metadata/info/sidebar_config/tabs",
      id: tabId,
      labelField: "label",
      l10n: l10n.categories.sidebar_tab_label
    })
  };

  return (
    <PageContent
      backLink={UrlJoin("/pocket", pocketId, "sidebar")}
      title={`${info.name || pocket.name || "Pocket TV Property"} - Sidebar Tab`}
      section="pocket"
      useHistory
    >
      <Inputs.Text
        {...inputProps}
        {...l10n.common.id}
        disabled
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.common.label}
        field="label"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.common.description}
        field="description"
      />

      <Title order={3} fw={500} mt={50} maw={uiStore.inputWidth} mb="md">Display</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.sidebar_tab.title}
        field="title"
      />

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.sidebar_tab.sequential}
        field="sequential"
      />

      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.sidebar_tab_groups}
        subcategory={l10n.categories.sidebar_tab_group}
        field="groups"
        idField="id"
        newItemSpec={PocketSidebarTabGroupSpec}
        columns={[
          {
            ...l10n.common.label,
            field: "label"
          },
          {
            ...l10n.common.description,
            field: "description"
          }
        ]}
      />

      <Title order={3} fw={500} mt={50} maw={uiStore.inputWidth} mb="md">{l10n.categories.bumpers}</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.sidebar_tab.override_bumpers}
        field="override_bumpers"
      />

      {
        !tab.override_bumpers ? null :
          <PocketBumpers inputProps={inputProps} />
      }
    </PageContent>
  );
});

export default PocketSidebarContentTab;
