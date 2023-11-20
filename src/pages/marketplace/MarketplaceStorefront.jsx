import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, marketplaceStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {MarketplaceItemSelect, MarketplaceItemMultiselect} from "@/components/inputs/MarketplaceItemInput.jsx";
import UrlJoin from "url-join";
import {Accordion, Title} from "@mantine/core";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js";
import {ListItemCategory} from "@/components/common/Misc.jsx";

import {
  MarketplaceStorefrontSectionSpec,
  MarketplaceStorefrontBannerSpec,
  MarketplaceFooterLinkSpec
} from "@/specs/MarketplaceSpecs.js";

import {IconSettings, IconPhotoEdit} from "@tabler/icons-react";

export const MarketplaceStorefrontSection = observer(() => {
  const { marketplaceId, sectionId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};
  const sectionIndex = info.storefront.sections?.findIndex(section => section.id === sectionId);
  const section = info.storefront.sections?.[sectionIndex];

  if(!section) {
    return (
      <div>
        Storefront section not found
      </div>
    );
  }

  const l10n = rootStore.l10n.pages.marketplace.form;
  const listPath = "/public/asset_metadata/info/storefront/sections";
  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: UrlJoin(listPath, sectionIndex.toString()),
    category: ListItemCategory({
      store: marketplaceStore,
      objectId: marketplaceId,
      listPath,
      id: sectionId,
      l10n: l10n.categories.storefront_item_section_label
    })
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Storefront Section - ${section.name || section.id}`}
      section="marketplace"
      backLink={UrlJoin("/marketplaces", marketplaceId, "storefront")}
      useHistory
    >
      <Title order={3} mt={50} mb="md">{l10n.categories.storefront_item_section_info}</Title>
      <Inputs.UUID
        {...inputProps}
        {...l10n.storefront_section.id}
        subcategory={l10n.categories.storefront_item_section_info}
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.storefront_section.name}
        subcategory={l10n.categories.storefront_item_section_info}
        field="name"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.storefront_section.header}
        subcategory={l10n.categories.storefront_item_section_info}
        field="section_header"
      />
      <Inputs.RichText
        {...inputProps}
        {...l10n.storefront_section.header_rich_text}
        subcategory={l10n.categories.storefront_item_section_info}
        field="section_header_rich_text"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.storefront_section.subheader}
        subcategory={l10n.categories.storefront_item_section_info}
        field="section_subheader"
      />

      <Inputs.RichText
        {...inputProps}
        {...l10n.storefront_section.footer}
        subcategory={l10n.categories.storefront_item_section_info}
        field="section_footer"
      />

      <Title order={3} mt={50} mb="md">{l10n.categories.storefront_item_section_settings}</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.storefront_section.type}
        subcategory={l10n.categories.storefront_item_section_settings}
        field="type"
        options={[
          { label: "Standard", value: "Standard" },
          { label: "Featured", value: "Featured" }
        ]}
      />

      <MarketplaceItemMultiselect
        {...inputProps}
        {...l10n.storefront_section.items}
        subcategory={l10n.categories.storefront_item_section_items}
        field="items"
      />

      {
        section.type !== "Featured" ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.storefront_section.featured_view_justification}
              subcategory={l10n.categories.storefront_item_section_settings}
              field="featured_view_justification"
              options={["Left", "Right", "Center"]}
            />
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.storefront_section.show_carousel_gallery}
              subcategory={l10n.categories.storefront_item_section_settings}
              field="show_carousel_gallery"
              defaultValue={true}
            />
          </>
      }

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.storefront_section.show_countdown}
        subcategory={l10n.categories.storefront_item_section_settings}
        field="show_countdown"
      />

      {
        !section.show_countdown ? null :
          <>
            <Inputs.Text
              {...inputProps}
              {...l10n.storefront_section.countdown_text}
              subcategory={l10n.categories.storefront_item_section_settings}
              path={UrlJoin(inputProps.path, "countdown")}
              field="header"
            />
            <Inputs.DateTime
              {...inputProps}
              {...l10n.storefront_section.countdown_date}
              subcategory={l10n.categories.storefront_item_section_settings}
              path={UrlJoin(inputProps.path, "countdown")}
              field="date"
            />
          </>
      }
    </PageContent>
  );
});

const MarketplaceStorefront = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.marketplace.form;
  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: "/public/asset_metadata/info/storefront",
    category: l10n.categories.storefront
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Storefront`}
      section="marketplace"
      useHistory
    >
      <Title order={3} mb="md">{ l10n.categories.storefront_settings }</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.storefront.header}
        subcategory={l10n.categories.storefront_settings}
        field="header"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.storefront.subheader}
        subcategory={l10n.categories.storefront_settings}
        field="subheader"
      />

      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.storefront.sections}
        categoryFnParams={{fields: ["name", "id"], l10n: l10n.categories.storefront_item_section_label}}
        path="/public/asset_metadata/info/storefront"
        field="sections"
        idField="id"
        columns={[
          { label: l10n.storefront.sections.columns.title, field: "header", render: section => section.name || section.header || section.id || "" },
          { label: l10n.storefront.sections.columns.type, field: "type", centered: true },
          { label: l10n.storefront.sections.columns.items, field: "items", width: "80px", centered: true, render: section => section?.items?.length || "0" },
        ]}
        newItemSpec={MarketplaceStorefrontSectionSpec}
      />

      <Title order={3} mb="md" mt={50}>{ l10n.categories.storefront_item_settings }</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.storefront.show_rich_text_descriptions}
        subcategory={l10n.categories.storefront_item_settings}
        field="show_rich_text_descriptions"
      />

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.storefront.show_card_cta}
        subcategory={l10n.categories.storefront_item_settings}
        field="show_card_cta"
      />

      <Accordion maw={uiStore.inputWidth} mb="md" variant="contained">
        <Accordion.Item value="default">
          <Accordion.Control icon={<IconSettings />}>
            { l10n.categories.storefront_purchase_status_settings }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.storefront.skip_reveal}
              subcategory={l10n.categories.purchase_status_settings}
              field="skip_reveal"
            />

            <Inputs.Checkbox
              {...inputProps}
              {...l10n.storefront.hide_info}
              subcategory={l10n.categories.purchase_status_settings}
              field="hide_text"
            />

            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.storefront.purchase_animation}
              subcategory={l10n.categories.purchase_status_settings}
              field="purchase_animation"
              previewable
              previewIsAnimation
            />

            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.storefront.purchase_animation_mobile}
              subcategory={l10n.categories.purchase_status_settings}
              field="purchase_animation_mobile"
              previewable
              previewIsAnimation
            />

            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.storefront.reveal_animation}
              subcategory={l10n.categories.purchase_status_settings}
              field="reveal_animation"
              previewable
              previewOptions={{
                muted: EluvioPlayerParameters.muted.OFF_IF_POSSIBLE,
                autoplay: EluvioPlayerParameters.autoplay.ON,
                controls: EluvioPlayerParameters.controls.OFF_WITH_VOLUME_TOGGLE,
                loop: EluvioPlayerParameters.loop.OFF
              }}
            />

            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.storefront.reveal_animation}
              subcategory={l10n.categories.purchase_status_settings}
              field="reveal_animation_mobile"
              previewable
              previewOptions={{
                muted: EluvioPlayerParameters.muted.OFF_IF_POSSIBLE,
                autoplay: EluvioPlayerParameters.autoplay.ON,
                controls: EluvioPlayerParameters.controls.OFF_WITH_VOLUME_TOGGLE,
                loop: EluvioPlayerParameters.loop.OFF
              }}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Title order={3} mb="md" mt={50}>{l10n.categories.storefront_media}</Title>

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.storefront.storefront_background}
        subcategory={l10n.categories.storefront_media}
        fields={[
          { field: "background", ...l10n.storefront.background_desktop },
          { field: "background_mobile", ...l10n.storefront.background_mobile },
        ]}
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.storefront.header_logo}
        subcategory={l10n.categories.storefront_media}
        path="/public/asset_metadata/info/branding"
        altTextField="header_logo_alt"
        fields={[
          { field: "header_logo" },
        ]}
      />
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.storefront.header_image}
        subcategory={l10n.categories.storefront_media}
        path="/public/asset_metadata/info/branding"
        altTextField="header_image_alt"
        fields={[
          { field: "header_image" },
        ]}
      />

      <Inputs.List
        {...inputProps}
        {...l10n.storefront_banners.banners}
        category={l10n.categories.storefront_banner}
        path="/public/asset_metadata/info"
        field="banners"
        idField="id"
        showBottomAddButton
        newItemSpec={MarketplaceStorefrontBannerSpec}
        renderItem={({item, ...props}) => {
          return (
            <>
              <Inputs.UUID
                {...props}
                {...l10n.storefront_banners.id}
                subcategory={l10n.categories.storefront_banner_info}
                field="id"
              />
              <Inputs.Text
                {...props}
                {...l10n.storefront_banners.name}
                subcategory={l10n.categories.storefront_banner_info}
                field="name"
              />
              {
                item.sku || item.modal_video ? null :
                  <Inputs.URL
                    {...props}
                    {...l10n.storefront_banners.link_url}
                    subcategory={l10n.categories.storefront_banner_info}
                    field="link"
                  />
              }
              {
                item.link || item.modal_video ? null :
                  <MarketplaceItemSelect
                    {...props}
                    {...l10n.storefront_banners.sku}
                    subcategory={l10n.categories.storefront_banner_info}
                    field="sku"
                  />
              }
              {
                item.link || item.sku ? null :
                  <Inputs.FabricBrowser
                    {...props}
                    {...l10n.storefront_banners.modal_video}
                    subcategory={l10n.categories.storefront_banner_info}
                    field="modal_video"
                    previewable
                  />
              }

              <Accordion maw={uiStore.inputWidth} mb="md" variant="contained">
                <Accordion.Item value="default">
                  <Accordion.Control icon={<IconPhotoEdit />}>
                    { l10n.categories.storefront_banner_media }
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Inputs.ImageInput
                      {...props}
                      {...l10n.storefront_banners.images}
                      subcategory={l10n.categories.storefront_banner_media}
                      altTextField="image_alt"
                      fields={[
                        { field: "image", ...l10n.storefront_banners.image },
                        { field: "image_mobile", ...l10n.storefront_banners.image_mobile }
                      ]}
                    />

                    <Inputs.FabricBrowser
                      {...props}
                      {...l10n.storefront_banners.video}
                      subcategory={l10n.categories.storefront_banner_media}
                      field="video"
                      previewable
                      previewIsAnimation={item.video_muted}
                    />

                    {
                      !item.video ? null :
                        <Inputs.Checkbox
                          {...props}
                          {...l10n.storefront_banners.video_muted}
                          subcategory={l10n.categories.storefront_banner_media}
                          field="video_muted"
                          defaultValue={true}
                        />
                    }
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </>
          );
        }}
      />

      <Inputs.List
        {...inputProps}
        {...l10n.storefront_footer_links.footer_links}
        category={l10n.categories.storefront_footer_link}
        path="/public/asset_metadata/info"
        field="footer_links"
        idField="id"
        showBottomAddButton
        newItemSpec={MarketplaceFooterLinkSpec}
        renderItem={({item, ...props}) => {
          let type;
          if(item.image) {
            type = l10n.storefront_footer_links.types.image;
          } else if(item.link) {
            type = l10n.storefront_footer_links.types.link;
          } else if(item.content_rich_text) {
            type = l10n.storefront_footer_links.types.rich_text;
          } else if(item.content_html) {
            type = l10n.storefront_footer_links.types.html;
          }

          return (
            <>
              <Inputs.UUID
                {...props}
                {...l10n.storefront_footer_links.id}
                subcategory={l10n.categories.storefront_footer_link_info}
                field="id"
              />
              <Inputs.Text
                {...props}
                {...l10n.storefront_footer_links.name}
                subcategory={l10n.categories.storefront_footer_link_info}
                field="name"
              />
              <Inputs.Text
                {...props}
                {...l10n.storefront_footer_links.text}
                subcategory={l10n.categories.storefront_footer_link_info}
                field="text"
              />

              {
                !type ? null :
                  <Inputs.Text
                    {...props}
                    {...l10n.storefront_footer_links.type}
                    subcategory={l10n.categories.storefront_footer_link_info}
                    field="type"
                    disabled
                    value={type}
                  />
              }

              <Accordion maw={uiStore.inputWidth} mb="md" variant="contained">
                <Accordion.Item value="default">
                  <Accordion.Control icon={<IconPhotoEdit />}>
                    {l10n.categories.storefront_footer_link_content}
                  </Accordion.Control>
                  <Accordion.Panel>
                    {
                      item.image || item.content_rich_text || item.content_html ? null :
                        <Inputs.URL
                          {...props}
                          {...l10n.storefront_footer_links.link_url}
                          subcategory={l10n.categories.storefront_footer_link_info}
                          field="link"
                        />
                    }

                    {
                      item.link || item.content_rich_text || item.content_html ? null :
                        <Inputs.ImageInput
                          {...props}
                          {...l10n.storefront_footer_links.image}
                          subcategory={l10n.categories.storefront_footer_link_info}
                          altTextField="image_alt"
                          fields={[
                            { field: "image" },
                          ]}
                        />
                    }

                    {
                      item.image || item.link || item.content_html ? null :
                        <Inputs.RichText
                          {...props}
                          {...l10n.storefront_footer_links.content_rich_text}
                          subcategory={l10n.categories.storefront_footer_link_info}
                          field="content_rich_text"
                        />
                    }

                    {
                      item.image || item.link || item.content_rich_text ? null :
                        <Inputs.File
                          {...props}
                          {...l10n.storefront_footer_links.content_html}
                          subcategory={l10n.categories.storefront_footer_link_info}
                          field="content_html"
                          extensions={["html"]}
                        />
                    }
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </>
          );
        }}
      />
    </PageContent>
  );
});

export default MarketplaceStorefront;
