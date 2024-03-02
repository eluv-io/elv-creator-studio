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
import {rootStore, marketplaceStore, tenantStore} from "@/stores";
import {FabricUrl} from "@/helpers/Fabric.js";
import UrlJoin from "url-join";
import {LinkButton} from "@/components/common/Misc";
import PageContent from "@/components/common/PageContent.jsx";

const MarketplaceCard = observer(({marketplace, fullMarketplace}) => {
  const fullMarketplaceMetadata = fullMarketplace?.metadata?.public?.asset_metadata || {};
  const name = fullMarketplaceMetadata?.info?.branding?.name || marketplace.brandedName || marketplace.name;
  const image = FabricUrl({...marketplace, path: "/meta/public/asset_metadata/info/branding/card_banner_front", width: 400});

  return (
    <Card withBorder radius="md" p="md" style={{display: "flex", flexDirection: "column"}}>
      <Card.Section p="xl">
        <AspectRatio ratio={1}>
          <Image src={image} alt={name} withPlaceholder />
        </AspectRatio>
      </Card.Section>

      <Card.Section p="xl" pt={0} size="100%" style={{display: "flex", flexDirection: "column", flexGrow: 1}}>
        <Text fz="lg" fw={600}>
          { name }
        </Text>
        <Code fz="xs" p={0} bg="transparent">
          { tenantStore.tenantSlug } / { marketplace.marketplaceSlug }
        </Code>
        <Text fz="sm" mt={20} lineClamp={3}>
          { fullMarketplaceMetadata?.info?.branding?.description || marketplace.description || "" }
        </Text>
        <Group mt="xl" style={{display: "flex", flexGrow: 1, alignItems: "flex-end"}}>
          <LinkButton radius="md" style={{ flex: 1 }} to={UrlJoin("/marketplaces", marketplace.objectId)}>
            Manage
          </LinkButton>
        </Group>
      </Card.Section>
    </Card>
  );
});

const MarketplaceList = observer(() => {
  return (
    <AsyncWrapper
      loadingMessage="Loading Marketplaces"
      Load={async () => await marketplaceStore.LoadMarketplaces({force: true})}
    >
      <PageContent title={rootStore.l10n.pages.marketplace.form.categories.marketplaces}>
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
            (marketplaceStore.allMarketplaces || []).map(marketplace =>
              <MarketplaceCard key={`marketplace-${marketplace.objectId}`} marketplace={marketplace} fullMarketplace={marketplaceStore.marketplaces[marketplace.objectId]} />
            )
          }
        </SimpleGrid>
      </PageContent>
    </AsyncWrapper>
  );
});

export default MarketplaceList;
