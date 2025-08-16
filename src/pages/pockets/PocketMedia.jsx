import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, pocketStore, mediaPropertyStore, mediaCatalogStore, permissionSetStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {modals} from "@mantine/modals";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {useEffect, useState} from "react";
import {useForm} from "@mantine/form";
import {Input as MantineInput, Button, Checkbox, Container, Group, Stack, Text, TextInput} from "@mantine/core";
import {
  MediaItemCard,
  MediaItemImage,
  MediaItemPermissionIcon,
  MediaPropertySectionPermissionIcon
} from "@/components/common/MediaCatalog.jsx";
import {MediaCatalogItemSelectionModal} from "@/components/inputs/media_catalog/MediaCatalogItemTable.jsx";

const CreatePocketMediaItemsForm = observer(({pocket, Create}) => {
  const [creating, setCreating] = useState(false);
  const [showMediaSelectionModal, setShowMediaSelectionModal] = useState(false);

  useEffect(() => {
    pocket.metadata.public.asset_metadata.info?.media_catalogs?.forEach(mediaCatalogId =>
      mediaCatalogStore.LoadMediaCatalog({mediaCatalogId: mediaCatalogId})
    );
  }, [pocket?.media_catalogs]);

  const l10n = rootStore.l10n.pages.media_property.form;
  const form = useForm({
    initialValues: {
      mediaItemIds: [],
    },
    validate: {
      mediaItemIds: value => form.values.type !== "media" || value.length > 0 ? null : l10n.section_items.create.validation.media_items,
    }
  });

  const selectedMediaItems = form.values.mediaItemIds.map(mediaItemId =>
    mediaPropertyStore.GetMediaItem({mediaItemId})
  );

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(values => {
          setCreating(true);
          Create(values)
            .catch(error => {
              rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
              setCreating(false);
            })
            .then(() => {
              modals.closeAll();
            });
        })}
      >
        <Stack spacing="md">
          <MantineInput.Wrapper
            disabled
            {...l10n.section_items.media_items}
            {...form.getInputProps("mediaItemIds")}
          >
            <Stack mb={5} spacing={5}>
              <Button variant="outline" onClick={() => setShowMediaSelectionModal(true)}>
                { l10n.section_items.select_media.label }
              </Button>
              <Stack mb={5} spacing={5} mah={500} style={{overflowY: "auto"}}>
                {
                  selectedMediaItems.length === 0 ? null :
                    <>
                      {selectedMediaItems.map(selectedMediaItem =>
                        <MediaItemCard
                          key={`media-item-${selectedMediaItem.id}`}
                          mediaItem={selectedMediaItem}
                          imageSize={50}
                        />
                      )}
                      {
                        selectedMediaItems[0].type === "media" ? null :
                          <Checkbox
                            mt="md"
                            {...l10n.section_items[`expand_${selectedMediaItems[0].type}`]}
                            {...form.getInputProps("expand")}
                          />
                      }
                    </>
                }
              </Stack>
              {
                selectedMediaItems.length === 0 ? null :
                  <Text fz="xs" align="center">{selectedMediaItems.length} Items Selected</Text>
              }
            </Stack>
          </MantineInput.Wrapper>
        </Stack>

        <Group mt="xl">
          <Button
            w="100%"
            loading={creating}
            type="submit"
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </form>
      {
        !showMediaSelectionModal ? null :
          <MediaCatalogItemSelectionModal
            type="media"
            mediaType="Video"
            multiple
            allowTypeSelection={false}
            mediaCatalogIds={pocket.metadata.public.asset_metadata.info?.media_catalogs || []}
            Submit={(mediaItemIds) => form.getInputProps("mediaItemIds").onChange(mediaItemIds)}
            Close={() => setShowMediaSelectionModal(false)}
          />
      }
    </Container>
  );
});

const CreatePocketMediaItemForm2 = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const l10n = rootStore.l10n.pages.pocket.form;

  const form = useForm({
    initialValues: {
      label: ""
    },
    validate: {
      label: value => value ? null : l10n.media.create.validation.label
    }
  });

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(values => {
          setCreating(true);
          Create({label: values.label, type: values.type})
            .catch(error => {
              rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
              setCreating(false);
            })
            .then(() => {
              modals.closeAll();
            });
        })}
      >
        <TextInput
          data-autofocus
          mb="md"
          {...l10n.media.create.label}
          {...form.getInputProps("label")}
        />
        <Group mt="md">
          <Button
            w="100%"
            loading={creating}
            type="submit"
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </form>
    </Container>
  );
};

export const PocketMediaItemTitle = observer(({pocketMediaItem, aspectRatio}) => {
  pocketMediaItem = pocketStore.GetResolvedPocketMediaItem({pocketMediaItem});

  const mediaLabel = (
    !pocketMediaItem.label &&
    pocketMediaItem.mediaItem &&
    pocketMediaItem.use_media_settings &&
    pocketMediaItem.mediaItem.label
  ) || "";

  return (
    <Group noWrap>
      <MediaItemImage
        mediaItem={pocketMediaItem.mediaItem}
        scale={150}
        width={60}
        height={60}
        miw={60}
        fit="contain"
        position="left"
        aspectRatio={aspectRatio}
      />
      <Stack spacing={2}>
        <Text italic={mediaLabel}>
          { mediaLabel || pocketMediaItem.label || pocketMediaItem.display.title || pocketMediaItem.id }
        </Text>
      </Stack>
    </Group>
  );
});

const PocketMedia = observer(() => {
  const { pocketId } = useParams();

  const pocket = pocketStore.pockets[pocketId];

  useEffect(() => {
    pocket.metadata.public.asset_metadata.info?.media_catalogs?.forEach(mediaCatalogId =>
      mediaCatalogStore.LoadMediaCatalog({mediaCatalogId: mediaCatalogId})
    );

    pocket.metadata.public.asset_metadata.info?.permission_sets?.forEach(permissionSetId =>
      permissionSetStore.LoadPermissionSet({permissionSetId})
    );
  }, [pocket]);

  if(!pocket) { return null; }

  const info = pocket?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.pocket.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    category: l10n.categories.media,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || pocket.name || "Pocket TV Property"} - ${l10n.categories.media}`}
      section="pocket"
      useHistory
    >
      <Inputs.ReferenceTable
        {...inputProps}
        {...l10n.media.media_items}
        subcategoryFnParams={{fields: ["label", "id"], l10n: l10n.categories.media_item_label}}
        field="media"
        nameField="label"
        idField="id"
        filterable
        filterFields={["label", "description"]}
        editable
        AddItem={async () => {
          return new Promise((resolve) => {
            modals.open({
              title: LocalizeString(l10n.create.create, {type: l10n.categories.media_item}),
              centered: true,
              onCancel: () => resolve(),
              children:
                <div>
                  <CreatePocketMediaItemsForm
                    pocket={pocket}
                    Create={async args => {
                      // When specifying media, multiple items are allowed. Create an entry for each and don't redirect
                      const ids = args.mediaItemIds.map(mediaItemId =>
                        pocketStore.CreatePocketMediaItem({
                          page: location.pathname,
                          pocketId,
                          mediaItemId,
                          ...args
                        })
                      );

                      modals.closeAll();

                      resolve(ids[0]);
                    }}
                  />
                </div>
            });
          });
        }}
        columns={[
          {
            accessor: "label",
            sortable: true,
            title: l10n.media.label.label,
            render: pocketMediaItem => <PocketMediaItemTitle pocketMediaItem={pocketMediaItem} />
          },
          {
            accessor: "permissions",
            title: l10n.media.permissions.label,
            centered: true,
            render: pocketMediaItem => <MediaPropertySectionPermissionIcon sectionOrSectionItem={pocketMediaItem} />,
            width: 125
          },
          {
            accessor: "media_permissions",
            title: l10n.media.media_permissions.label,
            centered: true,
            render: pocketMediaItem => <MediaItemPermissionIcon mediaItem={pocketStore.GetMediaItem({mediaItemId: pocketMediaItem.media_id})} />,
            width: 150
          }
        ]}
      />
    </PageContent>
  );
});

export default PocketMedia;
