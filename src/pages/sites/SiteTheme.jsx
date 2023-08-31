import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, siteStore, tenantStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Accordion, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";

import {IconSettings} from "@tabler/icons-react";

const SiteTheme = observer(() => {
  const { siteId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.site.form;
  const inputProps = {
    store: siteStore,
    objectId: siteId,
    category: l10n.categories.theme,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || site.name || "Site"} - ${l10n.categories.theme}`}
      section="site"
      useHistory
    >
      <Title order={3} my="md">{ l10n.categories.theme }</Title>
      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.theme.favicon}
        field="favicon"
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.theme.theme}
        field="theme"
        defaultValue="light"
        options={[
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" }
        ]}
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.theme.theme}
        field="font"
        defaultValue="Helvetica Neue"
        options={[
          "Inter",
          "Albertus",
          "Compacta",
          "Selawik"
        ]}
      />

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.theme.use_custom_css}
        field="use_custom_css"
      />

      {
        !info?.use_custom_css ? null :
          <Inputs.Code
            {...inputProps}
            {...l10n.theme.custom_css}
            field="custom_css"
            language="css"
          />
      }
    </PageContent>
  );
});

export default SiteTheme;
