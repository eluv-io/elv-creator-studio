import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, pocketStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import {MediaItemCard} from "@/components/common/MediaCatalog.jsx";
import {forwardRef} from "react";

const PocketSidebarSettings = observer(() => {
  const { pocketId } = useParams();

  const pocket = pocketStore.pockets[pocketId];

  if(!pocket) { return null; }

  const info = pocket?.metadata?.public?.asset_metadata?.info || {};

  const media = Object.keys(info.media || {}).map(pocketMediaItemId =>
    pocketStore.GetResolvedPocketMediaItem({pocketId, pocketMediaItemId})
  ).filter(m => m);

  const l10n = rootStore.l10n.pages.pocket.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    category: l10n.categories.sidebar,
    path: "/public/asset_metadata/info/sidebar_config"
  };

  const MediaSelectComponent = forwardRef(function MediaSelectComponent({value, ...props}, ref) {
    return (
      <MediaItemCard
        {...props}
        ref={ref}
        showType={false}
        mediaItem={media.find(item => item.id === value)?.display}
      />
    );
  });

  return (
    <PageContent
      title={`${info.name || pocket.name || "Pocket TV Property"} - Sidebar Settings`}
      section="pocket"
      useHistory
    >
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.sidebar.hide_sidebar}
        defaultValue={false}
        field="hide"
      />
      {
        info.sidebar_config.hide ? null :
          <>
            <Title order={3} fw={500} mt={50} maw={uiStore.inputWidth} mb="md">{l10n.categories.sidebar_banners}</Title>

            <Inputs.List
              {...inputProps}
              {...l10n.sidebar.banners}
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
                    {...l10n.sidebar.link_type}
                    field="link_type"
                    defaultValue=""
                    options={[
                      { label: "Visual Only", value: "" },
                      { label: "Media", value: "media" },
                      { label: "External Link", value: "external" }
                    ]}
                  />
                  {
                    props.item?.link_type !== "media" ? null :
                      <>
                        <Inputs.Select
                          {...props}
                          {...l10n.sidebar.media}
                          componentProps={{itemComponent: MediaSelectComponent}}
                          field="media_id"
                          options={media.map(item => ({label: item.label, value: item.id}))}
                        />
                        {
                          !props.item.media_id ? null :
                            <MediaItemCard
                              mediaItem={media.find(item => item.id === props.item.media_id)?.display}
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

            <Title order={3} fw={500} mt={50} maw={uiStore.inputWidth} mb="md">{l10n.categories.sidebar_content}</Title>

            <Inputs.Select
              {...inputProps}
              {...l10n.sidebar.content}
              field="content"
              defaultValue=""
              options={[
                { label: "All", value: "" },
                { label: "Specific Items", value: "specific" }
              ]}
            />
            {
              info.sidebar_config.content !== "specific" ?
                <>
                  <Inputs.Select
                    {...inputProps}
                    {...l10n.sidebar.sort_order}
                    field="sort_order"
                    defaultValue="time_asc"
                    options={[
                      { label: "Title (A-Z)", value: "title_asc" },
                      { label: "Title (Z-A)", value: "title_desc" },
                      { label: "Start Time (Earliest to Latest)", value: "time_asc" },
                      { label: "Start Time (Latest to Earliest)", value: "time_desc" },
                    ]}
                  />
                </> :
                <>
                  <Inputs.List
                    {...inputProps}
                    {...l10n.sidebar.content_ids}
                    field="content_ids"
                    renderItem={props =>
                      <>
                        <Inputs.Select
                          {...l10n.sidebar.content_id}
                          {...props}
                          field="id"
                          componentProps={{itemComponent: MediaSelectComponent}}
                          options={
                            media
                              .filter(item =>
                                info.sidebar_config.content_ids
                                  .findIndex((other, index) => props.index !== index && other.id === item.id) < 0
                              )
                              .map(item => ({label: item.label, value: item.id}))

                          }
                        />
                        {
                          !props.item.id ? null :
                            <MediaItemCard
                              mediaItem={media.find(item => item.id === props.item.id)?.display}
                            />
                        }
                      </>
                    }
                  />
                </>
            }
          </>
      }
    </PageContent>
  );
});

export default PocketSidebarSettings;
