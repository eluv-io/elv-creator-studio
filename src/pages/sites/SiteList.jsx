import {
  Group,
  Text,
  Card,
  Image,
  SimpleGrid,
  AspectRatio,
  Code
} from "@mantine/core";
import {observer} from "mobx-react-lite";
import AsyncWrapper from "@/components/common/AsyncWrapper.jsx";
import {rootStore, siteStore, tenantStore} from "@/stores";
import {FabricUrl} from "@/helpers/Fabric.js";
import UrlJoin from "url-join";
import {LinkButton} from "@/components/common/Misc";
import PageContent from "@/components/common/PageContent.jsx";

const SiteCard = observer(({site, fullSite}) => {
  const fullSiteMetadata = fullSite?.metadata?.public?.asset_metadata || {};
  const name = fullSiteMetadata?.info?.name || site.brandedName || site.name;
  const image = FabricUrl({...site, path: "/meta/public/asset_metadata/info/event_images/hero_background", width: 400});

  return (
    <Card withBorder radius="md" p="md" style={{display: "flex", flexDirection: "column"}}>
      <Card.Section p="xl">
        <AspectRatio ratio={16/9}>
          <Image src={image} alt={name} withPlaceholder />
        </AspectRatio>
      </Card.Section>

      <Card.Section p="xl" pt={0} size="100%" style={{display: "flex", flexDirection: "column", flexGrow: 1}}>
        <Text fz="lg" fw={600}>
          { name }
        </Text>
        <Code fz="xs" p={0} bg="transparent">
          { tenantStore.tenantSlug } / { site.siteSlug }
        </Code>
        <Text fz="sm" mt={20} lineClamp={3}>
          { fullSiteMetadata?.info?.description || site.description || "" }
        </Text>
        <Group mt="xl" style={{display: "flex", flexGrow: 1, alignItems: "flex-end"}}>
          <LinkButton radius="md" style={{ flex: 1 }} to={UrlJoin("/sites", site.objectId)}>
            Show details
          </LinkButton>
        </Group>
      </Card.Section>
    </Card>
  );
});

const SiteList = observer(() => {
  return (
    <AsyncWrapper
      loadingMessage="Loading Sites"
      Load={async () => await siteStore.LoadSites()}
    >
      <PageContent title={rootStore.l10n.pages.site.form.categories.sites}>
        <SimpleGrid
          spacing="xl"
          my="xl"
          cols={4}
          breakpoints={[
            { maxWidth: "xl", cols: 3, spacing: "md" },
            { maxWidth: "md", cols: 2, spacing: "sm" },
            { maxWidth: "sm", cols: 1, spacing: "sm" },
          ]}
        >
          {
            (siteStore.allSites || []).map(site =>
              <SiteCard key={`site-${site.objectId}`} site={site} fullSite={siteStore.sites[site.objectId]} />
            )
          }
        </SimpleGrid>
      </PageContent>
    </AsyncWrapper>
  );
});

export default SiteList;
