import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/inputs/Inputs";
import {MarketplaceItemSelect, MarketplaceItemMultiselect} from "../../components/inputs/MarketplaceItemInput.jsx";
import UrlJoin from "url-join";
import {Accordion, Group, Title} from "@mantine/core";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js";

import {
  MarketplaceStorefrontSectionSpec,
  MarketplaceStorefrontBannerSpec,
  MarketplaceFooterLinkSpec
} from "Specs/MarketplaceSpecs.js";
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

  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: UrlJoin("/public/asset_metadata/info/storefront/sections", sectionIndex.toString())
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Storefront Section - ${section.name || section.id}`}
      section="marketplace"
      backLink={UrlJoin("/marketplaces", marketplaceId, "storefront")}
      useHistory
    >
      <Title order={3} mt={50} mb="md">Section Info</Title>
      <Inputs.UUID
        {...inputProps}
        field="id"
        label="ID"
      />
      <Inputs.Text
        {...inputProps}
        field="name"
        label="Name"
      />
      <MarketplaceItemMultiselect
        {...inputProps}
        label="Items"
        field="items"
      />
      <Inputs.Text
        {...inputProps}
        field="section_header"
        label="Header"
      />
      <Inputs.RichText
        {...inputProps}
        field="section_header_rich_text"
        label="Header (Rich Text)"
      />
      <Inputs.Text
        {...inputProps}
        field="section_subheader"
        label="Subheader"
      />

      <Inputs.RichText
        {...inputProps}
        field="section_footer"
        label="Footer"
      />

      <Title order={3} mt={50} mb="md">Section Settings</Title>

      <Inputs.Select
        {...inputProps}
        field="type"
        label="Section Type"
        options={[
          { label: "Standard", value: "Standard" },
          { label: "Featured", value: "Featured" }
        ]}
      />

      {
        section.type !== "Featured" ? null :
          <>
            <Inputs.Select
              {...inputProps}
              field="featured_view_justification"
              label="Featured View Justification"
              options={["Left", "Right", "Center"]}
            />
            <Inputs.Checkbox
              {...inputProps}
              field="show_carousel_gallery"
              label="Show Carousel Gallery"
              description="Show selectable icons of items in the list below the featured view. Will not be displayed when only one item is in the list"
            />
          </>
      }

      <Inputs.Checkbox
        {...inputProps}
        field="show_countdown"
        label="Show Countdown"
      />

      {
        !section.show_countdown ? null :
          <>
            <Inputs.Text
              {...inputProps}
              path={UrlJoin(inputProps.path, "countdown")}
              field="header"
              label="Countdown Text"
            />
            <Inputs.DateTime
              {...inputProps}
              path={UrlJoin(inputProps.path, "countdown")}
              field="date"
              label="Countdown Date"
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

  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: "/public/asset_metadata/info/storefront"
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Storefront`}
      section="marketplace"
      useHistory
    >
      <Title order={3} mb="md">Storefront Settings</Title>

      <Inputs.Text
        {...inputProps}
        field="header"
        label="Header"
      />
      <Inputs.TextArea
        {...inputProps}
        field="subheader"
        label="Subheader"
      />

      <Inputs.CollectionTable
        {...inputProps}
        path="/public/asset_metadata/info/storefront"
        field="sections"
        fieldLabel="Section"
        idField="id"
        label="Storefront Item Sections"
        columns={[
          { label: "Title", field: "header", render: section => section.name || section.header || section.id || "" },
          { label: "Type", field: "type", centered: true },
          { label: "Items", field: "items", width: "80px", centered: true, render: section => section?.items?.length || "0" },
        ]}
        newEntrySpec={MarketplaceStorefrontSectionSpec}
      />

      <Title order={3} mb="md" mt={50}>Item Settings</Title>

      <Inputs.Checkbox
        {...inputProps}
        field="show_rich_text_descriptions"
        label="Show Rich Text Descriptions on Item Cards"
      />

      <Inputs.Checkbox
        {...inputProps}
        field="show_card_cta"
        label="Show CTA Button on Item Cards"
      />

      <Accordion maw={600} mb="md" variant="contained">
        <Accordion.Item value="default">
          <Accordion.Control icon={<IconSettings />}>
            Item Purchase Status Page
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Checkbox
              {...inputProps}
              INVERTED
              field="skip_reveal"
              label="Skip Purchase Reveal"
              description="If a single item was purchased, proceed directly to the item page on purchase completion instead of showing the results"
            />

            <Inputs.Checkbox
              {...inputProps}
              INVERTED
              field="hide_text"
              label="Show info on status page"
            />

            <Inputs.FabricBrowser
              {...inputProps}
              field="purchase_animation"
              label="Status Animation"
              previewable
              previewIsAnimation
            />

            <Inputs.FabricBrowser
              {...inputProps}
              field="purchase_animation_mobile"
              label="Status Animation (Mobile)"
              previewable
              previewIsAnimation
            />

            <Inputs.FabricBrowser
              {...inputProps}
              field="reveal_animation"
              label="Reveal Animation"
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
              field="reveal_animation_mobile"
              label="Reveal Animation (Mobile)"
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

      <Title order={3} mb="md" mt={50}>Storefront Media</Title>

      <Inputs.ImageInput
        {...inputProps}
        label="Storefront Background"
        fields={[
          { field: "background", label: "Background (Desktop)" },
          { field: "background_mobile", label: "Background (Mobile)" },
        ]}
      />

      <Group align="top">
        <Inputs.ImageInput
          {...inputProps}
          label="Header Logo"
          path="/public/asset_metadata/info/branding"
          altTextField="header_logo_alt"
          fields={[
            { field: "header_logo" },
          ]}
        />
        <Inputs.ImageInput
          {...inputProps}
          label="Header Image"
          path="/public/asset_metadata/info/branding"
          altTextField="header_image_alt"
          fields={[
            { field: "header_image" },
          ]}
        />
      </Group>

      <Inputs.List
        {...inputProps}
        path="/public/asset_metadata/info"
        field="banners"
        fieldLabel="Banner"
        label="Banners"
        description="Banners displayed at the top of the storefront. The banner will display either an image or a video. When clicked, the banner can link to a URL, an item for sale on the marketplace, or it can open a modal with video content."
        idField="id"
        showBottomAddButton
        newEntrySpec={MarketplaceStorefrontBannerSpec}
        renderItem={({value, ...props}) => {
          return (
            <>
              <Inputs.UUID
                {...props}
                field="id"
                label="ID"
              />
              <Inputs.Text
                {...props}
                field="name"
                label="Name"
              />
              {
                value.sku ? null :
                  <Inputs.URL
                    {...props}
                    field="link"
                    label="Link URL"
                  />
              }
              {
                value.link ? null :
                  <MarketplaceItemSelect
                    {...props}
                    field="sku"
                    label="Item Link SKU"
                    description="If specified, the banner will link to the specified item"
                  />
              }

              <Accordion maw={600} mb="md" variant="contained">
                <Accordion.Item value="default">
                  <Accordion.Control icon={<IconPhotoEdit />}>
                    Banner Media
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Inputs.ImageInput
                      {...props}
                      label="Images"
                      altTextField="image_alt"
                      fields={[
                        { field: "image", label: "Banner Image" },
                        { field: "image_mobile", label: "Banner Image (Mobile)" },
                      ]}
                    />

                    <Inputs.FabricBrowser
                      {...props}
                      field="video"
                      label="Video"
                      previewable
                      previewIsAnimation={value.video_muted}
                    />

                    {
                      !value.video ? null :
                        <Inputs.Checkbox
                          {...props}
                          field="video_muted"
                          label="Video Muted"
                          description="Muted banner videos will autoplay"
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
        path="/public/asset_metadata/info"
        field="footer_links"
        fieldLabel="Footer Link"
        label="Footer Links"
        description="Each footer link can link to a URL, or open a modal containing either an image, rich text content or HTML content"
        idField="id"
        showBottomAddButton
        newEntrySpec={MarketplaceFooterLinkSpec}
        renderItem={({value, ...props}) => {
          return (
            <>
              <Inputs.UUID
                {...props}
                field="id"
                label="ID"
              />
              <Inputs.Text
                {...props}
                field="name"
                label="Name"
              />
              <Inputs.Text
                {...props}
                field="text"
                label="Text"
              />

              <Accordion maw={600} mb="md" variant="contained">
                <Accordion.Item value="default">
                  <Accordion.Control icon={<IconPhotoEdit />}>
                    Footer Link Content
                  </Accordion.Control>
                  <Accordion.Panel>
                    {
                      value.image || value.content_rich_text || value.content_html ? null :
                        <Inputs.URL
                          {...props}
                          field="link"
                          label="Link URL"
                        />
                    }

                    {
                      value.link || value.content_rich_text || value.content_html ? null :
                        <Inputs.ImageInput
                          {...props}
                          label="Image"
                          altTextField="image_alt"
                          fields={[
                            { field: "image" },
                          ]}
                        />
                    }

                    {
                      value.image || value.link || value.content_html ? null :
                        <Inputs.RichText
                          {...props}
                          field="content_rich_text"
                          label="Rich Text Content"
                        />
                    }

                    {
                      value.image || value.link || value.content_rich_text ? null :
                        <Inputs.File
                          {...props}
                          field="content_html"
                          label="HTML Content"
                          extensions="html"
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
