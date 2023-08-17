import {useEffect} from "react";
import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/inputs/Inputs";
import MarketplaceItemInput from "../../components/inputs/MarketplaceItemInput.jsx";
import UrlJoin from "url-join";
import {Accordion, Title} from "@mantine/core";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js";

import {MarketplaceStorefrontSectionSpec} from "Specs/MarketplaceSpecs.js";
import {IconSettings} from "@tabler/icons-react";
import {GenerateUUID} from "../../helpers/Misc.js";

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
      <MarketplaceItemInput
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

  useEffect(() =>{
    // Ensure storefront section IDs are set
    info.storefront?.sections.forEach((section, index) => {
      if(section.id) { return; }

      marketplaceStore.SetDefaultValue({...inputProps, path: UrlJoin(inputProps.path, "sections", index.toString()), field: "id", value: GenerateUUID()});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <Inputs.ImageInput
        {...inputProps}
        label="Storefront Background"
        fields={[
          { field: "background", label: "Background (Desktop)" },
          { field: "background_mobile", label: "Background (Mobile)" },
        ]}
      />

      <Title mt={50} order={3}>Storefront Sections</Title>

      <Inputs.CollectionTable
        {...inputProps}
        path="/public/asset_metadata/info/storefront"
        field="sections"
        fieldLabel="Section"
        idField="id"
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

      <Accordion maw={600} variant="contained">
        <Accordion.Item value="photos">
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
    </PageContent>
  );
});

export default MarketplaceStorefront;
