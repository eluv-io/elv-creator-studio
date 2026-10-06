import BumperStyles from "@/assets/stylesheets/modules/serial.module.scss";

import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import UrlJoin from "url-join";
import {Button, Group, Title} from "@mantine/core";
import {MediaCatalogSerialItemSpec} from "@/specs/MediaCatalogSpecs.js";
import {MediaCatalogItemSelectionModal} from "@/components/inputs/media_catalog/MediaCatalogItemTable.jsx";
import {MediaItemCard} from "@/components/common/MediaCatalog.jsx";
import {useEffect, useState} from "react";
import {IconButton} from "@/components/common/Misc.jsx";
import {IconArrowLeft, IconArrowRight} from "@tabler/icons-react";
import {BumperPreview} from "@/pages/media_catalogs/MediaCatalogBumpers.jsx";
import Video from "@/components/common/Video.jsx";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js/lib";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";

const S = (...classes) => classes.map(c => BumperStyles[c] || "").join(" ");

const SerialPreviewItem = observer(({serial, item}) => {
  const {mediaCatalogId} = useParams();

  if(!item) { return null; }

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  if(item.type === "bumper") {
    const bumper = info.bumpers?.[item.bumper_id];

    if(!bumper) {
      return (
        <div className={S("preview-item", "preview-item--error")}>
          Bumper not found
        </div>
      );
    }

    return (
      <div className={S("preview-item", "preview-item--bumper")}>
        <BumperPreview bumper={bumper} mobile playVideo={true} unmute className={S("preview-item__bumper")} />
      </div>
    );
  } else {
    const mediaItem = info.media?.[item.media_item_id];

    if(!mediaItem) {
      return (
        <div className={S("preview-item", "preview-item--error")}>
          Media item not found
        </div>
      );
    }

    return (
      <div className={S("preview-item", "preview-item--media")}>
        <div className={S("preview-item__title-container")}>
          {
            !serial.title_icon?.url ? null :
              <img src={serial.title_icon.url} alt="Title Icon" className={S("preview-item__title-icon")} />
          }
          <div className={S("preview-item__title")}>
            { serial.title }
          </div>
        </div>
        <Video
          videoLink={mediaItem.media_link}
          videoLinkInfo={mediaItem.media_link_info}
          className={S("preview-item__media")}
          controls={{
            muted: EluvioPlayerParameters.muted.ON,
            autoplay: EluvioPlayerParameters.autoplay.OFF,
            controls: EluvioPlayerParameters.controls.AUTO_HIDE,
          }}
          playerOptions={{
            capLevelToPlayerSize: true,
            showLoader: false,
            backgroundColor: "transparent",
          }}
        />
      </div>
    );
  }
});

const SerialPreview = observer(() => {
  const {mediaCatalogId, serialId} = useParams();

  const [permissionItemId, setPermissionItemId] = useState("");
  const [index, setIndex] = useState(0);


  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const serial = info?.serials?.[serialId];

  useEffect(() => {
    setIndex(0);
  }, [JSON.stringify(serial), permissionItemId]);

  if(!serial) { return null; }

  const items = (serial.items || [])
    .filter(item => {
      if(item.permissions.length === 0) {
        return true;
      }

      const permissioned = item.permissions.find(p => p === permissionItemId);

      return permissioned ?
        // Behavior is show and permissioned
        item.permission_behavior === "show" :
        // Behavior is hide and not permissioned
        item.permission_behavior === "hide";
    });

  return (
    <>
      <div>
        <Title order={4} mt={50} fw={500}>Preview</Title>
        <Title order={6} mb={10} color="gray">Approximation for flow validation</Title>
      </div>

      <Group position="center" w={500}>
        <PermissionItemSelect
          permissionSetIds={info?.permission_sets}
          connectedInput={false}
          label="Previewing with Permissions"
          value={permissionItemId}
          onChange={value => setPermissionItemId(value)}
          w={350}
          my={10}
        />
      </Group>
      <div className={S("preview-container")}>
        <div className={S("preview-container__serial")}>
          <IconButton
            label="Previous Item"
            Icon={IconArrowLeft}
            onClick={() => setIndex(index - 1)}
            disabled={index <= 0}
            className={S("arrow")}
          />
          <div className={S("preview")}>
            {
              index === 0 ?
                <div className={S("preview-item", "preview-item--cover")}>
                  {
                    !serial.poster_image_mobile?.url ? null :
                      <img
                        src={serial.poster_image_mobile.url}
                        alt="Cover"
                        className={S("preview-item__image")}
                      />
                  }
                  <div className={S("preview-item__title-container")}>
                    {
                      !serial.title_icon?.url ? null :
                        <img src={serial.title_icon.url} alt="Title Icon" className={S("preview-item__title-icon")}/>
                    }
                    <div className={S("preview-item__title")}>
                      {serial.title}
                    </div>
                  </div>
                </div> :
                <SerialPreviewItem
                  key={`item-${index}`}
                  serial={serial}
                  item={items[index - 1]}
                />
            }
          </div>
          <IconButton
            label="Next Item"
            Icon={IconArrowRight}
            onClick={() => setIndex(index + 1)}
            disabled={index >= items.length}
            className={S("arrow")}
          />
        </div>
        <div className={S("preview__label")}>
          {
            index === 0 ? serial.label :
              `${index}/${items.length}: ${items[index - 1]?.label || ""}`
          }
        </div>
      </div>
    </>
  );
});

const SerialItem = observer(({index}) => {
  const {mediaCatalogId, serialId} = useParams();
  const [showMediaSelectionModal, setShowMediaSelectionModal] = useState(false);

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const serial = info.serials?.[serialId];

  if(!serial) { return null; }

  const item = serial.items[parseInt(index)];

  if(!item) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({
      mediaCatalogId,
      type: "serials",
      category: "serial_label",
      id: serialId,
      titleField: "label"
    }),
    subcategory: l10n.categories.serial_item,
    path: UrlJoin("/public/asset_metadata/info/serials", serialId, "items", index.toString())
  };

  const selectedMediaItem = item.type === "media" && info.media[item.media_item_id];

  return (
    <>
      <Inputs.UUID
        {...l10n.common.id}
        {...inputProps}
        field="id"
      />
      <Inputs.Text
        {...l10n.common.label}
        {...inputProps}
        field="label"
      />
      <PermissionItemSelect
        permissionSetIds={info?.permission_sets}
        {...inputProps}
        {...l10n.serials.item.permissions}
        multiple
        field="permissions"
      />
      <Inputs.Select
        {...l10n.serials.item.permission_behavior}
        {...inputProps}
        field="permission_behavior"
        defaultValue="show"
        options={[
          {label: "Show", value: "show"},
          {label: "Hide", value: "hide"}
        ]}
      />
      <Inputs.Select
        {...l10n.serials.item.type}
        {...inputProps}
        field="type"
        options={[
          {label: "Media", value: "media"},
          {label: "Ad, Bumper, or Offer", value: "bumper"}
        ]}
      />
      {
        item.type === "bumper" ?
          <Inputs.Select
            {...l10n.serials.item.type}
            {...inputProps}
            field="bumper_id"
            defaultValue=""
            options={[
              {label: "<Select Bumper>", value: ""},
              ...Object.keys(info.bumpers).map(bumperId => ({
                label: info.bumpers[bumperId].label,
                value: bumperId
              }))
            ]}
          /> :
          <Inputs.InputWrapper
            disabled
            {...l10n.serials.item.media_item_id}
          >
            <Button my="xs" variant="outline" onClick={() => setShowMediaSelectionModal(true)}>
              Select Media
            </Button>
            {
              !selectedMediaItem ? null :
                <MediaItemCard
                  key={`media-item-${selectedMediaItem.id}`}
                  mediaItem={selectedMediaItem}
                  imageSize={50}
                  withLink
                />
            }
            {
              !showMediaSelectionModal ? null :
                <MediaCatalogItemSelectionModal
                  multiple={false}
                  allowTypeSelection={false}
                  mediaType="Video"
                  mediaCatalogId={mediaCatalogId}
                  Close={() => setShowMediaSelectionModal(false)}
                  Submit={(mediaItemIds) => {
                    mediaCatalogStore.SetMetadata({
                      ...inputProps,
                      ...l10n.serials.item.media_item_id,
                      page: location.pathname,
                      field: "media_item_id",
                      value: mediaItemIds?.[0] || "",
                    });

                    setShowMediaSelectionModal(false);
                  }}
                />
              }
          </Inputs.InputWrapper>
      }
    </>
  );
});

export const MediaCatalogSerial = observer(() => {
  const { mediaCatalogId, serialId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const serial = info.serials?.[serialId];

  if(!serial) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({
      mediaCatalogId,
      type: "serials",
      category: "serial_label",
      id: serialId,
      titleField: "label"
    }),
    path: UrlJoin("/public/asset_metadata/info/serials", serialId)
  };

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - ${l10n.categories.serials} - ${serial.label}`}
      section="mediaCatalog"
      backLink={UrlJoin("/media-catalogs", mediaCatalogId, "serials")}
      useHistory
    >
      <Inputs.Text
        {...l10n.common.id}
        {...inputProps}
        field="id"
        disabled
      />
      <Inputs.Hidden
        {...inputProps}
        field="type"
        defaultValue="serial"
      />
      <Inputs.Text
        {...l10n.common.label}
        {...inputProps}
        field="label"
      />
      <Inputs.Text
        {...l10n.serials.slug}
        {...inputProps}
        field="slug"
      />
      <Inputs.TextArea
        {...l10n.common.description}
        {...inputProps}
        field="description"
      />
      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.serials.tags}
        subcategory={l10n.categories.tags}
        disabled={(info.tags || []).length === 0}
        field="tags"
        searchable
        options={info.tags || []}
      />

      <Title order={5} mt={35} mb="xs">
        { l10n.categories.display }
      </Title>
      <Inputs.SingleImageInput
        {...l10n.serials.poster_image_mobile}
        {...inputProps}
        subcategory={l10n.categories.display}
        field="poster_image_mobile"
        aspectRatio={9/16}
      />
      <Inputs.SingleImageInput
        {...l10n.serials.title_icon}
        {...inputProps}
        subcategory={l10n.categories.display}
        field="title_icon"
        baseSize={80}
        p={10}
      />
      <Inputs.Text
        {...l10n.serials.title}
        {...inputProps}
        subcategory={l10n.categories.display}
        field="title"
      />
      <Inputs.Text
        {...l10n.serials.subtitle}
        {...inputProps}
        subcategory={l10n.categories.display}
        field="subtitle"
      />

      <Inputs.List
        {...l10n.serials.items}
        {...inputProps}
        subcategory={l10n.categories.serial_items}
        newItemSpec={MediaCatalogSerialItemSpec}
        field="items"
        renderItem={({index}) =>
          <SerialItem index={index} />
        }
      />

      <SerialPreview />

    </PageContent>
  );
});

const MediaCatalogSerials = observer(() => {
  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: l10n.categories.serials,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - ${l10n.categories.serials}`}
      section="mediaCatalog"
      useHistory
    >
      <Inputs.ReferenceTable
        {...inputProps}
        {...l10n.serials.serials}
        field="serials"
        nameField="label"
        filterable
        filterFields={["label", "description"]}
        CopyItem={({item}) => mediaCatalogStore.CreateSerial({
          mediaCatalogId,
          copySerialId: item.id
        })}
        AddItem={() => mediaCatalogStore.CreateSerial({mediaCatalogId})}
        columns={[
          {
            accessor: "label",
            sortable: true,
            width: 150,
            title: l10n.common.label.label,
          },
          {
            accessor: "description",
            width: 250,
            title: l10n.common.description.label,
          },
          {
            accessor: "tags",
            title: l10n.serials.tags.label,
            render: item => item?.tags?.join(", ")
          }
        ]}
      />
    </PageContent>
  );
});

export default MediaCatalogSerials;
