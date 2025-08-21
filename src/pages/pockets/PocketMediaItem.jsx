import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, pocketStore, mediaCatalogStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import UrlJoin from "url-join";
import {MediaItemCard} from "@/components/common/MediaCatalog.jsx";

const PocketGeneralSettings = observer(() => {
  const { pocketId, pocketMediaItemId } = useParams();

  const pocket = pocketStore.pockets[pocketId];

  if(!pocket) { return null; }

  const pocketMediaItem = pocket.metadata.public.asset_metadata.info.media[pocketMediaItemId];

  if(!pocketMediaItem) { return null; }

  const mediaItem = pocketStore.GetMediaItem({mediaItemId: pocketMediaItem.media_id});
  const tags = pocketStore.GetPocketTags({pocketId});

  const l10n = rootStore.l10n.pages.pocket.form;
  const l10nMedia = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    category: pocketStore.PocketCategory({
      category: "media_item_label",
      pocketId,
      id: pocketMediaItemId,
      label: pocketMediaItem.label,
      path: UrlJoin("/public/asset_metadata/info/media", pocketMediaItemId, "label")
    }),
    path: UrlJoin("/public/asset_metadata/info/media", pocketMediaItemId)
  };

  return (
    <PageContent
      title={`${pocket.name || "Pocket TV Property"} - ${pocketMediaItem.label}`}
      backLink={UrlJoin("/pocket", pocketId, "media")}
      section="pocket"
      useHistory
    >
      <Inputs.Text
        {...inputProps}
        {...l10n.common.id}
        disabled
        subcategory={l10n.categories.general}
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.common.slug}
        subcategory={l10n.categories.general}
        field="slug"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media_item.label}
        subcategory={l10n.categories.general}
        field="label"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.media_item.description}
        subcategory={l10n.categories.general}
        field="description"
      />

      <Inputs.InputWrapper
        {...l10n.media_item.media_item}
        disabled
      >
        <MediaItemCard
          mediaItem={mediaItem}
          size="md"
          mb="md"
          withLink
          showPermissions
        />
      </Inputs.InputWrapper>

      <Title order={3} mt={50} mb="md">{l10n.categories.display}</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.media_item.use_media_settings}
        subcategory={l10n.categories.display}
        defaultValue={true}
        field="use_media_settings"
      />

      {
        pocketMediaItem.use_media_settings ? null :
          <>
            <Inputs.Text
              {...inputProps}
              {...l10nMedia.media.title}
              subcategory={l10n.categories.display}
              path={UrlJoin(inputProps.path, "display")}
              field="title"
              placeholder={mediaItem?.title}
            />

            <Inputs.Text
              {...inputProps}
              {...l10nMedia.media.subtitle}
              subcategory={l10n.categories.display}
              path={UrlJoin(inputProps.path, "display")}
              field="subtitle"
              placeholder={mediaItem?.subtitle}
            />

            <Inputs.List
              {...inputProps}
              {...l10nMedia.media.headers}
              subcategory={l10n.categories.display}
              path={UrlJoin(inputProps.path, "display")}
              field="headers"
            />

            <Inputs.TextArea
              {...inputProps}
              {...l10nMedia.media.description}
              subcategory={l10n.categories.display}
              path={UrlJoin(inputProps.path, "display")}
              field="description"
              placeholder={mediaItem?.description}
            />

            <Inputs.MultiSelect
              {...inputProps}
              {...l10nMedia.media.tags}
              path={UrlJoin(inputProps.path, "display")}
              subcategory={l10n.categories.tags}
              disabled={tags.length === 0}
              field="tags"
              searchable
              options={tags}
              placeholder={mediaItem?.tags?.join(", ") || ""}
            />
            <Inputs.ImageInput
              {...inputProps}
              {...l10nMedia.media.thumbnail_images}
              subcategory={l10n.categories.display}
              componentProps={{maw: uiStore.inputWidthWide}}
              fields={[
                { ...l10nMedia.media.image_portrait, baseSize: 125, aspectRatio: mediaCatalogStore.IMAGE_ASPECT_RATIOS["Portrait"]?.ratio, field: "thumbnail_image_portrait" },
                { ...l10nMedia.media.image_square, baseSize: 125, aspectRatio: mediaCatalogStore.IMAGE_ASPECT_RATIOS["Square"]?.ratio, field: "thumbnail_image_square" },
                { ...l10nMedia.media.image_landscape, baseSize: 125, aspectRatio: mediaCatalogStore.IMAGE_ASPECT_RATIOS["Landscape"]?.ratio, field: "thumbnail_image_landscape" }
              ]}
              altTextField="thumbnail_alt_text"
            />
          </>
      }

    </PageContent>
  );
});

export default PocketGeneralSettings;
