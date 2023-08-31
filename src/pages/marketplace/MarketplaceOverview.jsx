import {observer} from "mobx-react-lite";
import {rootStore, marketplaceStore, tenantStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import {Group, Paper, Text, Title, Container, Image} from "@mantine/core";
import {LocalizeString} from "@/components/common/Misc.jsx";

const MarketplaceOverview = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];
  const metadata = marketplace.metadata.public.asset_metadata;
  const itemCount = metadata?.info?.items?.length || 0;
  return (
    <PageContent>
      <Container p={0} m={0} maw={800}>
        <Paper>
          <Group align="top" noWrap spacing="xl">
            <Image
              width={250}
              height={250}
              withPlaceholder
              src={metadata?.info?.branding?.card_banner_front?.url}
              alt={metadata?.info?.branding?.name}
            />
            <Container p={0} m={0} maw={400}>
              <Title order={3}>{ metadata.info?.branding?.name }</Title>
              <Title order={6} color="dimmed">{ tenantStore.tenantSlug } / { metadata.slug }</Title>
              <Text fz="xs" color="dimmed">{ marketplace.objectId }</Text>
              <Text fz="sm" mt="md">{metadata?.info?.branding?.description}</Text>
              <Text mt="xl" fw={600}>
                {LocalizeString(rootStore.l10n.pages.marketplace.form.overview[itemCount === 1 ? "item" : "items"], {count: itemCount})}
              </Text>
            </Container>
          </Group>
        </Paper>
      </Container>
    </PageContent>
  );
});

export default MarketplaceOverview;
