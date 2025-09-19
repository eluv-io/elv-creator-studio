import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, pocketStore, mediaCatalogStore, permissionSetStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {MarketplaceMultiselect} from "@/components/inputs/ResourceSelection.jsx";
import {Slugify} from "@/components/common/Validation.jsx";
import {Accordion, Title} from "@mantine/core";
import UrlJoin from "url-join";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";
import {LocalizeString} from "@/components/common/Misc.jsx";
import CountryCodesList from "country-codes-list";

const currencies = CountryCodesList.customList("currencyCode", "{currencyNameEn}");
Object.keys(currencies).forEach(currencyCode => {
  if(!currencyCode || !currencies[currencyCode]) {
    delete currencies[currencyCode];
  }
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
        subcategory={l10n.categories.general}
        field="slug"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.common.name}
        subcategory={l10n.categories.general}
        field="name"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.common.description}
        subcategory={l10n.categories.general}
        field="description"
      />

      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.general.image}
        componentProps={{maw: uiStore.inputWidthWide}}
        subcategory={l10n.categories.general}
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




      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.general.permission_sets}
        subcategory={l10n.categories.permissions}
        field="permission_sets"
        options={
          (permissionSetStore.allPermissionSets || []).map(permissionSet => ({
            label: permissionSet.name,
            value: permissionSet.objectId
          }))
        }
      />
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.splash_screen}
        componentProps={{maw: uiStore.inputWidthWide}}
        subcategory={l10n.categories.general}
        fields={[
          { field: "splash_screen_background", aspectRatio: 16/9, ...l10n.general.splash_screen_background },
          { field: "splash_screen_background_mobile", aspectRatio: 1/2, ...l10n.general.splash_screen_background_mobile },
        ]}
      />

      <Title order={3} fw={500} mt={50} maw={uiStore.inputWidth} mb="md">{l10n.categories.search}</Title>
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

      <Title order={3} fw={500} mt={50} maw={uiStore.inputWidth} mb="md">{l10n.categories.analytics}</Title>

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
    </PageContent>
  );
});

export default PocketGeneralSettings;
