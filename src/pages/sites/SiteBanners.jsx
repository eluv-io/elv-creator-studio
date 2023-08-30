import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, siteStore, tenantStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Accordion, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";

import {IconSettings} from "@tabler/icons-react";

const SiteBanners = observer(() => {
  const { siteId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.site.form;
  const inputProps = {
    store: siteStore,
    objectId: siteId,
    category: l10n.categories.general
  };

  return (
    <PageContent
      title={`${info.name || site.name || "Site"} - General`}
      section="site"
      useHistory
    >
      <Title order={3} my="md">{ l10n.categories.info }</Title>

    </PageContent>
  );
});

export default SiteBanners;
