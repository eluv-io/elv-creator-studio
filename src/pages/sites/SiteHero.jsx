import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, siteStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";

const SiteHero = observer(() => {
  const { siteId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.site.form;
  const inputProps = {
    store: siteStore,
    objectId: siteId,
    category: l10n.categories.hero,
    path: "/public/asset_metadata/info/event_images"
  };

  return (
    <PageContent
      title={`${info.name || site.name || "Site"} - ${l10n.categories.hero}`}
      section="site"
      useHistory
    >
      <Title order={3} my="md">{ l10n.categories.hero_background }</Title>
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.hero.hero_background}
        subcategory={l10n.categories.hero_background}
        altTextField="hero_alt_text"
        fields={[
          { field: "hero_background", ...l10n.hero.hero_background_landscape },
          { field: "hero_background_mobile", ...l10n.hero.hero_background_portrait }
        ]}
      />

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.hero.use_video_hero}
        subcategory={l10n.categories.hero_background}
        field="use_video_hero"
      />

      {
        !info?.event_images?.use_video_hero ? null :
          <>
            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.hero.hero_video_landscape}
              subcategory={l10n.categories.hero_background}
              field="hero_video"
              previewable
              previewIsAnimation
            />
            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.hero.hero_video_portrait}
              subcategory={l10n.categories.hero_background}
              field="hero_video_mobile"
              previewable
              previewIsAnimation
              hint={"asd"}
            />
          </>
      }

      <Title order={3} mb="md" mt={50}>{ l10n.categories.hero_banner }</Title>
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.hero.hero_banner}
        subcategory={l10n.categories.hero_banner}
        altTextField="hero_banner_alt_text"
        fields={[
          { field: "hero_banner", ...l10n.hero.hero_banner_desktop },
          { field: "hero_banner_mobile", ...l10n.hero.hero_banner_mobile }
        ]}
      />

      {
        !(info?.event_images?.hero_banner || info?.event_images?.hero_banner_mobile) ? null :
          <Inputs.Text
            {...inputProps}
            {...l10n.hero.hero_banner_link}
            subcategory={l10n.categories.hero_banner}
            field="hero_banner_link"
          />
      }

      <Title order={3} mb="md" mt={50}>{ l10n.categories.logo }</Title>
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.hero.logo}
        subcategory={l10n.categories.logo}
        altTextField="logo_alt"
        fields={[
          { field: "logo" }
        ]}
      />
      {
        !info?.event_images?.logo ? null :
          <Inputs.Text
            {...inputProps}
            {...l10n.hero.logo_link}
            subcategory={l10n.categories.logo}
            field="logo_link"
          />
      }

      <Title order={3} mb="md" mt={50}>{ l10n.categories.hero_text }</Title>

      <Inputs.Checkbox
        INVERTED
        {...inputProps}
        {...l10n.hero.show_text_over_hero}
        path="/public/asset_metadata/info/event_info"
        subcategory={l10n.categories.hero_text}
        field="hero_info"
      />

      {
        info?.event_info?.hero_info ? null :
          <>
            <Inputs.ImageInput
              {...inputProps}
              {...l10n.hero.header_image}
              subcategory={l10n.categories.hero_text}
              altTextField="header_image_alt"
              path="/public/asset_metadata/info/event_images"
              fields={[
                { field: "header_image" }
              ]}
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.hero.header}
              subcategory={l10n.categories.hero_text}
              path="/public/asset_metadata/info/event_info"
              field="event_header"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.hero.subheader_1}
              subcategory={l10n.categories.hero_text}
              path="/public/asset_metadata/info/event_info"
              field="event_subheader"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.hero.subheader_2}
              subcategory={l10n.categories.hero_text}
              path="/public/asset_metadata/info/event_info"
              field="date_subheader"
            />
          </>
      }

      <Title order={3} mb="md" mt={50}>{ l10n.categories.hero_promos }</Title>

      <Inputs.List
        {...inputProps}
        {...l10n.hero.promo_videos}
        subcategory={l10n.categories.hero_promos}
        path="/public/asset_metadata/info"
        field="promo_videos"
        fieldLabel={l10n.hero.promo_video.label}
        renderItem={({...props}) => (
          <Inputs.FabricBrowser
            {...props}
            {...l10n.hero.promo_video}
            subcategory={l10n.categories.hero_promos}
            field="video"
            previewable
            mb={0}
          />
        )}
      />
    </PageContent>
  );
});

export default SiteHero;
