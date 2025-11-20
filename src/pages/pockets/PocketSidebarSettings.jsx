import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, pocketStore, uiStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import {MediaItemCard} from "@/components/common/MediaCatalog.jsx";
import {PocketSidebarTabSpec} from "@/specs/PocketSpecs.js";
import {forwardRef} from "react";

const PocketSidebarSettings = observer(() => {
  const { pocketId } = useParams();

  const pocket = pocketStore.pockets[pocketId];

  if(!pocket) { return null; }

  const info = pocket?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.pocket.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    category: l10n.categories.sidebar,
    path: "/public/asset_metadata/info/sidebar_config"
  };

  const media = info.media_catalogs
    .map(mediaCatalogId =>
      mediaCatalogStore.GetFilteredContent({mediaCatalogId, select: {content_type: "media"}})
    )
    .flat()
    .filter(m => m);

  const MediaSelectComponent = forwardRef(function MediaSelectComponent({value, ...props}, ref) {
    return (
      <MediaItemCard
        {...props}
        ref={ref}
        showType={false}
        mediaItem={media.find(item => item.id === value)}
      />
    );
  });

  return (
    <PageContent
      title={`${info.name || pocket.name || "Pocket TV Property"} - Sidebar Settings`}
      section="pocket"
      useHistory
    >
      <Title order={3} fw={500} mt={50} maw={uiStore.inputWidth} mb="md">{l10n.categories.sidebar_content}</Title>

      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.sidebar_tabs}
        categoryFnParams={{fields: ["label", "id"], l10n: l10n.categories.sidebar_tab_label}}
        field="tabs"
        idField="id"
        newItemSpec={PocketSidebarTabSpec}
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


        <Title order={3} fw={500} mt={50} maw={uiStore.inputWidth} mb="md">{l10n.categories.sidebar_banners}</Title>

        <Inputs.List
          {...inputProps}
          {...l10n.sidebar.banners}
          subcategory={l10n.categories.sidebar_banners}
          field="banners"
          renderItem={props =>
            <>
              <Inputs.ImageInput
                {...props}
                {...l10n.sidebar.banner_image}
                altTextField="image_alt"
                fields={[
                  { ...l10n.sidebar.banner_image_desktop, field: "image", aspectRatio: 3 },
                  { ...l10n.sidebar.banner_image_mobile, field: "image_mobile", aspectRatio: 3 }
                ]}
              />
              <Inputs.Select
                {...props}
                {...l10n.sidebar.mobile_position}
                field="mobile_position"
                defaultValue=""
                options={[
                  { label: "Bottom", value: "" },
                  { label: "Top", value: "above" }
                ]}
              />
              <Inputs.Select
                {...props}
                {...l10n.sidebar.link_type}
                field="link_type"
                defaultValue=""
                options={[
                  { label: "Visual Only", value: "" },
                  { label: "Media", value: "media" },
                  { label: "External Link", value: "external" },
                  { label: "Reset Account", value: "reset" }
                ]}
              />
              {
                props.item?.link_type !== "media" ? null :
                  <>
                    <Inputs.Select
                      {...props}
                      {...l10n.sidebar.media}
                      searchable
                      componentProps={{itemComponent: MediaSelectComponent}}
                      field="media_id"
                      options={media.map(item => ({label: item.label, value: item.id}))}
                    />
                    {
                      !props.item.media_id ? null :
                        <MediaItemCard
                          mediaItem={media.find(item => item.id === props.item.media_id)}
                        />
                    }
                  </>
              }
              {
                props.item?.link_type !== "external" ? null :
                  <Inputs.URL
                    {...props}
                    {...l10n.sidebar.link}
                    field="url"
                  />
              }
            </>
          }
        />
    </PageContent>
  );
});

export default PocketSidebarSettings;
