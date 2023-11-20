import {observer} from "mobx-react-lite";
import {rootStore, marketplaceStore, tenantStore, uiStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import {Group, Paper, Text, Title, Container, Image, Button} from "@mantine/core";
import {LocalizeString} from "@/components/common/Misc.jsx";
import UrlJoin from "url-join";

const MarketplaceOverview = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];
  const metadata = marketplace.metadata.public.asset_metadata;
  const itemCount = metadata?.info?.items?.length || 0;

  let previewUrl = new URL(
    rootStore.network === "main" ?
      "https://wallet.preview.contentfabric.io" :
      "https://wallet.demov3.contentfabric.io"
  );
  previewUrl.pathname = UrlJoin("/marketplace", marketplace.objectId, "store");
  previewUrl.searchParams.set("mid", marketplace.objectId);
  previewUrl.searchParams.set("preview", marketplace.objectId);

  return (
    <PageContent>
      <Container p={0} m={0} maw={uiStore.inputWidthWide}>
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
              <Group>
                <Button fz="sm" mt="xl" component="a" href={previewUrl.toString()} target="_blank">
                  { rootStore.l10n.pages.marketplace.form.overview.preview }
                </Button>
              </Group>
            </Container>
          </Group>
        </Paper>
      </Container>
    </PageContent>
  );
});

export default MarketplaceOverview;
