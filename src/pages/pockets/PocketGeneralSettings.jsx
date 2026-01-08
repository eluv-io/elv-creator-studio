import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, pocketStore, mediaCatalogStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Slugify} from "@/components/common/Validation.jsx";
import {Accordion, Title} from "@mantine/core";
import UrlJoin from "url-join";

import CountryCodesList from "country-codes-list";
import {PocketBumpers} from "@/pages/pockets/PocketCommon.jsx";

const currencies = CountryCodesList.customList("currencyCode", "{currencyNameEn}");
Object.keys(currencies).forEach(currencyCode => {
  if(!currencyCode || !currencies[currencyCode]) {
    delete currencies[currencyCode];
  }
});


const FAQForm = observer(({index}) => {
  const { pocketId } = useParams();

  const pocket = pocketStore.pockets[pocketId];

  if(!pocket) { return null; }

  const l10n = rootStore.l10n.pages.pocket.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    category: l10n.categories.general,
    subcategory: l10n.categories.faq,
    path: "/public/asset_metadata/info/faq"
  };

  if(typeof index !== "undefined") {
    inputProps.path = UrlJoin(inputProps.path, "additional", index.toString());
  }

  return (
    <>
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.faq.header_image}
        localizable
        componentProps={{
          maw: "100%"
        }}
        altTextField="header_image_alt"
        fields={[
          { ...l10n.general.faq.header_image, field: "header_image", aspectRatio: 2, baseSize: 100},
          { ...l10n.general.faq.header_image_mobile, field: "header_image_mobile", aspectRatio: 2, baseSize: 100}
        ]}
      />
      <Inputs.Color
        {...inputProps}
        {...l10n.general.faq.background_color}
        field="background_color"
      />
      <Inputs.Color
        {...inputProps}
        {...l10n.general.faq.header_text_color}
        field="header_text_color"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.general.faq.title}
        localizable
        field="title"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.general.faq.description}
        localizable
        field="description"
      />
      <Inputs.List
        {...inputProps}
        {...l10n.general.faq.questions}
        localizable
        maw="100%"
        w="100%"
        field="questions"
        fields={[
          { field: "question", InputComponent: Inputs.Text, ...l10n.general.faq.question },
          { field: "answer", InputComponent: Inputs.RichText, ...l10n.general.faq.answer },
          {
            field: "video",
            InputComponent: Inputs.FabricBrowser,
            previewable: true,
            ...l10n.general.faq.video
          },
          {
            field: "images",
            InputComponent: Inputs.List,
            ...l10n.general.faq.images,
            fields: [
              {
                ...l10n.general.faq.image_position,
                InputComponent: Inputs.Select,
                field: "position",
                defaultValue: "inside",
                options: [
                  { label: "Before", value: "before" },
                  { label: "Inside", value: "inside" },
                  { label: "After", value: "after" }
                ]
              },
              {
                ...l10n.general.faq.image_link,
                InputComponent: Inputs.URL,
                field: "link"
              },
              {
                ...l10n.general.faq.image,
                InputComponent: Inputs.ImageInput,
                altTextField: "image_alt",
                fields: [
                  { baseSize: 100, field: "image", aspectRatio: 2, ...l10n.general.faq.image_desktop },
                  { baseSize: 100, field: "image_mobile", aspectRatio: 2, ...l10n.general.faq.image_mobile }
                ]
              }
            ]
          }
        ]}
      />
    </>
  );
});

const PocketGeneralSettings = observer(() => {
  const { pocketId } = useParams();

  const pocket = pocketStore.pockets[pocketId];

  if(!pocket) { return null; }

  const info = pocket?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.pocket.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    category: l10n.categories.general,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || pocket.name || "Pocket TV Property"} - General`}
      section="pocket"
      useHistory
    >
      <Inputs.Text
        {...inputProps}
        {...l10n.general.slug}
        defaultValue={Slugify(info.name)}
        field="slug"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.common.name}
        field="name"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.common.description}
        field="description"
      />

      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.general.image}
        componentProps={{maw: uiStore.inputWidthWide}}
        aspectRatio={1}
        field="image"
      />

      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.general.media_catalogs}
        subcategory={l10n.general.media_catalogs.label}
        field="media_catalogs"
        options={
          mediaCatalogStore.allMediaCatalogs.map(mediaCatalog => ({
            label: mediaCatalog.name,
            value: mediaCatalog.objectId
          }))
        }
      />

      <Inputs.Password
        {...inputProps}
        {...l10n.general.preview_password}
        field="preview_password_digest"
      />

      <Inputs.URL
        {...inputProps}
        {...l10n.general.support_link}
        field="support_link"
      />

      <Accordion maw={uiStore.inputWidthExtraWide} variant="contained">
        <Accordion.Item value="branding">
          <Accordion.Control>
            { l10n.categories.branding }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Text
              {...inputProps}
              {...l10n.general.app_name}
              placeholder="Pocket TV"
              field="app_name"
            />

            <Inputs.Text
              {...inputProps}
              {...l10n.general.receipt_name}
              placeholder="Pocket TV"
              field="receipt_name"
            />

            <Inputs.List
              {...inputProps}
              {...l10n.general.custom_domains}
              subcategory={l10n.categories.custom_domains}
              path="/public/asset_metadata/info"
              field="custom_domains"
            />

            <Inputs.ImageInput
              {...inputProps}
              {...l10n.general.header_logo}
              subcategory={l10n.categories.branding}
              componentProps={{maw: uiStore.inputWidthWide}}
              fields={[
                { field: "header_logo", aspectRatio: 3, baseSize: 100, ...l10n.general.header_logo_desktop },
                { field: "header_logo_mobile", aspectRatio: 1, baseSize: 100, ...l10n.general.header_logo_mobile },
              ]}
            />

            <Inputs.URL
              {...inputProps}
              {...l10n.general.header_logo_link}
              subcategory={l10n.categories.branding}
              field="header_logo_link"
            />

            <Inputs.ImageInput
              {...inputProps}
              {...l10n.general.splash_screen}
              subcategory={l10n.categories.branding}
              componentProps={{maw: uiStore.inputWidthWide}}
              fields={[
                { field: "splash_screen_background", aspectRatio: 16/9, ...l10n.general.splash_screen_background },
                { field: "splash_screen_background_mobile", aspectRatio: 1/2, ...l10n.general.splash_screen_background_mobile },
              ]}
            />

            <Inputs.SingleImageInput
              {...inputProps}
              {...l10n.general.qr_code_logo}
              subcategory={l10n.categories.branding}
              field="qr_code_logo"
              aspectRatio={1}
            />

            <Inputs.TextArea
              {...inputProps}
              {...l10n.general.payment_message}
              subcategory={l10n.categories.branding}
              field="payment_message"
            />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="bumpers">
          <Accordion.Control>
            { l10n.categories.bumpers }
            <Title order={6} fw={500} maw={uiStore.inputWidth} color="dimmed">{l10n.bumpers.bumpers_description}</Title>
          </Accordion.Control>
          <Accordion.Panel>
            <PocketBumpers inputProps={inputProps} />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="faq">
          <Accordion.Control>
            { l10n.categories.faq }
            <Title order={6} fw={500} maw={uiStore.inputWidth} color="dimmed">{l10n.general.faq.faq_description}</Title>
          </Accordion.Control>
          <Accordion.Panel>
            <FAQForm />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="meta_tags">
          <Accordion.Control>
            { l10n.categories.meta_tags }
            <Title order={6} fw={500} maw={uiStore.inputWidth} color="dimmed">{l10n.general.meta_tags.meta_tags_description}</Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Title order={6} fw={500} color="dimmed" maw={uiStore.inputWidth} mb="md">{l10n.general.meta_tags.meta_tags_description}</Title>

            <Inputs.Text
              {...inputProps}
              {...l10n.general.meta_tags.site_name}
              path={UrlJoin(inputProps.path, "meta_tags")}
              subcategory={l10n.categories.meta_tags}
              placeholder="Eluvio Pocket TV"
              field="site_name"
            />

            <Inputs.Text
              {...inputProps}
              {...l10n.general.meta_tags.title}
              path={UrlJoin(inputProps.path, "meta_tags")}
              subcategory={l10n.categories.meta_tags}
              field="title"
            />

            <Inputs.TextArea
              {...inputProps}
              {...l10n.general.meta_tags.description}
              path={UrlJoin(inputProps.path, "meta_tags")}
              subcategory={l10n.categories.meta_tags}
              field="description"
            />

            <Inputs.ImageInput
              {...inputProps}
              {...l10n.general.meta_tags.image}
              path={UrlJoin(inputProps.path, "meta_tags")}
              subcategory={l10n.categories.meta_tags}
              altTextField="image_alt"
              fields={[
                { field: "image", url: true, aspectRatio: 1.91 / 1}
              ]}
            />

            <Inputs.SingleImageInput
              {...inputProps}
              {...l10n.general.meta_tags.favicon}
              path={UrlJoin(inputProps.path, "meta_tags")}
              subcategory={l10n.categories.meta_tags}
              field="favicon"
              url
              horizontal
              aspectRatio={1}
              baseSize={125}
              fields={[
                { field: "favicon", url: true, aspectRatio: 1, baseSize: 25}
              ]}
            />
          </Accordion.Panel>
         </Accordion.Item>
         <Accordion.Item value="analytics">
          <Accordion.Control>
            { l10n.categories.analytics }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.List
              {...inputProps}
              {...l10n.general.analytics.analytics_ids}
              subcategory={l10n.categories.analytics}
              path="/public/asset_metadata/info"
              field="analytics_ids"
              fields={[
                {
                  ...l10n.general.analytics.label,
                  InputComponent: Inputs.Text,
                  field: "label",
                },
                {
                  ...l10n.general.analytics.analytics_type,
                  InputComponent: Inputs.Select,
                  field: "type",
                  options: [
                    { label: "Google Analytics ID", value: "google_analytics_id"},
                    { label: "Google Tag Manager ID", value: "google_tag_manager_id"},
                    { label: "Meta Pixel ID", value: "meta_pixel_id"},
                    { label: "X Pixel ID", value: "twitter_pixel_id"},
                    { label: "App Nexus Segment ID", value: "app_nexus_segment_id"}
                  ]
                },
                {
                  ...l10n.general.analytics.id,
                  InputComponent: Inputs.Text,
                  field: "id",
                  label: "ID"
                }
              ]}
            />
          </Accordion.Panel>
         </Accordion.Item>
      </Accordion>
    </PageContent>
  );
});

export default PocketGeneralSettings;
