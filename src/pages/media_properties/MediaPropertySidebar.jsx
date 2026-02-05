import {observer} from "mobx-react-lite";
import {Link, useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore, uiStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
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
import {MediaPropertySidebarTabGroupSpec, MediaPropertySidebarTabSpec} from "@/specs/MediaPropertySpecs.js";

const AutomaticSectionContentPreview = observer(({mediaPropertyId, select}) => {
  let content = mediaPropertyStore.GetAutomaticSectionContent({mediaPropertyId, select: {...select, content_type: "media"}});

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
  const { mediaPropertyId, tabId, groupId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  useEffect(() => {
    (mediaProperty?.metadata?.public?.asset_metadata?.info?.media_catalogs || [])
      .forEach(mediaCatalogId => mediaCatalogStore.LoadMediaCatalog({mediaCatalogId}));
  }, []);

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const tabIndex = info.sidebar_config?.tabs?.findIndex(tab => tab.id === tabId);
  const tab = info.sidebar_config?.tabs?.[tabIndex];

  if(!tab) { return null; }

  const groupIndex = tab.groups.findIndex(group => group.id === groupId);
  const group = tab.groups[groupIndex];

  if(!group) { return null; }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    path: UrlJoin("/public/asset_metadata/info/sidebar_config/tabs/", tabIndex.toString(), "groups", groupIndex.toString(), "select"),
    category: ListItemCategory({
      store: mediaPropertyStore,
      objectId: mediaPropertyId,
      listPath: "/public/asset_metadata/info/sidebar_config/tabs",
      id: tabId,
      labelField: "label",
      l10n: l10n.categories.sidebar_tab_label
    }),
    subcategory: l10n.categories.sidebar_tab_group
  };

  const attributes = mediaPropertyStore.GetMediaPropertyAttributes({mediaPropertyId});

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
          options={mediaPropertyStore.GetMediaPropertyTags({mediaPropertyId})}
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
            mediaPropertyId={mediaPropertyId}
            select={group.select}
          />
      }
    </>
  );
});

export const MediaItemTitle = observer(({mediaItemId, aspectRatio}) => {
  const mediaItem = mediaPropertyStore.GetMediaItem({mediaItemId});

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
  const { mediaPropertyId, tabId, groupId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const tabIndex = info.sidebar_config?.tabs?.findIndex(tab => tab.id === tabId);
  const tab = info.sidebar_config?.tabs?.[tabIndex];

  if(!tab) { return null; }

  const groupIndex = tab.groups.findIndex(group => group.id === groupId);
  const group = tab.groups[groupIndex];

  if(!group) { return null; }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    path: UrlJoin("/public/asset_metadata/info/sidebar_config/tabs/", tabIndex.toString(), "groups", groupIndex.toString()),
    category: ListItemCategory({
      store: mediaPropertyStore,
      objectId: mediaPropertyId,
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
          const mediaItem = mediaPropertyStore.GetMediaItem({mediaItemId});

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
            render: mediaItemId => <MediaItemPermissionIcon mediaItem={mediaPropertyStore.GetMediaItem({mediaItemId})} />,
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
              mediaPropertyStore.SetMetadata({
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

export const MediaPropertyContentTabGroup = observer(() => {
  const { mediaPropertyId, tabId, groupId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const tabIndex = info.sidebar_config?.tabs?.findIndex(tab => tab.id === tabId);
  const tab = info.sidebar_config?.tabs?.[tabIndex];

  if(!tab) { return null; }

  const groupIndex = tab.groups.findIndex(group => group.id === groupId);
  const group = tab.groups[groupIndex];

  if(!group) { return null; }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    path: UrlJoin("/public/asset_metadata/info/sidebar_config/tabs/", tabIndex.toString(), "groups", groupIndex.toString()),
    category: ListItemCategory({
      store: mediaPropertyStore,
      objectId: mediaPropertyId,
      listPath: "/public/asset_metadata/info/sidebar_config/tabs",
      id: tabId,
      labelField: "label",
      l10n: l10n.categories.sidebar_tab_label
    }),
    subcategory: l10n.categories.sidebar_tab_group
  };

  return (
    <PageContent
      backLink={UrlJoin("/media-properties", mediaPropertyId, "sidebar", tab.id)}
      title={`${info.name || mediaProperty.name || "Media Property"} - Sidebar Tab Group`}
      section="mediaProperty"
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
        {...l10n.sidebar_tab_group.hide_on_tv}
        field="hide_on_tv"
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.sidebar_tab_group.type}
        defaultValue="manual"
        field="type"
        options={[
          { label: "Manual", value: "manual" },
          { label: "Automatic", value: "automatic" },
          { label: "Section", value: "section" },
        ]}
      />

      {
        group.type === "section" ?
          <Inputs.Select
            {...inputProps}
            {...l10n.sidebar_tab_group.section}
            searchable
            defaultValue=""
            field="section_id"
            options={[
              {label: "<Current Section>", value: ""},
              ...Object.keys(info.sections).map(sectionId => ({
                label: info.sections[sectionId].label,
                value: sectionId
              }))
            ]}
          /> :
          group.type === "automatic" ?
            <AutomaticSectionFilters /> :
            <GroupMediaTable />
      }
    </PageContent>
  );
});


export const MediaPropertySidebarContentTab = observer(() => {
  const { mediaPropertyId, tabId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const tabIndex = info.sidebar_config?.tabs?.findIndex(tab => tab.id === tabId);
  const tab = info.sidebar_config?.tabs?.[tabIndex];

  if(!tab) { return null; }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    path: UrlJoin("/public/asset_metadata/info/sidebar_config/tabs/", tabIndex.toString()),
    category: ListItemCategory({
      store: mediaPropertyStore,
      objectId: mediaPropertyId,
      listPath: "/public/asset_metadata/info/sidebar_config/tabs",
      id: tabId,
      labelField: "label",
      l10n: l10n.categories.sidebar_tab_label
    })
  };

  return (
    <PageContent
      backLink={UrlJoin("/media-properties", mediaPropertyId, "sidebar")}
      title={`${info.name || mediaProperty.name || "Media Property"} - Sidebar Tab`}
      section="mediaProperty"
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
        {...l10n.sidebar_tab.hide_on_tv}
        field="hide_on_tv"
      />

      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.sidebar_tab_groups}
        subcategory={l10n.categories.sidebar_tab_group}
        field="groups"
        idField="id"
        newItemSpec={MediaPropertySidebarTabGroupSpec}
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
    </PageContent>
  );
});

export const MediaPropertySidebarSettings = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.sidebar,
    path: "/public/asset_metadata/info/sidebar_config"
  };

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "Media Property"} - ${l10n.categories.sidebar}`}
      section="mediaProperty"
      useHistory
    >
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.sidebar_tabs}
        categoryFnParams={{fields: ["label", "id"], l10n: l10n.categories.sidebar_tab_label}}
        field="tabs"
        idField="id"
        newItemSpec={MediaPropertySidebarTabSpec}
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
    </PageContent>
  );
});

export default MediaPropertySidebarSettings;

