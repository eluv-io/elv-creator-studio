import {observer} from "mobx-react-lite";
import {siteStore, tenantStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import {Group, Paper, Text, Title, Container, Image} from "@mantine/core";

const SiteOverview = observer(() => {
  const { siteId } = useParams();

  const site = siteStore.sites[siteId];
  const metadata = site.metadata.public.asset_metadata;

  return (
    <PageContent>
      <Container p="xl" m={0} maw={800}>
        <Paper>
          <Group align="top" noWrap spacing="xl">
            <Image
              width={250}
              height={250 * 9 / 16}
              withPlaceholder
              src={metadata?.info?.event_images?.hero_background?.url}
              alt={metadata?.info?.name || site?.name}
            />
            <Container p={0} m={0} maw={400}>
              <Title order={4}>{ metadata?.info?.name || site?.name }</Title>
              <Title order={6} color="dimmed">{ tenantStore.tenantSlug } / { metadata.slug }</Title>
              <Text fz="xs" color="dimmed">{ site.objectId }</Text>
              <Text fz="sm" mt="md">{metadata?.info?.description}</Text>
            </Container>
          </Group>
        </Paper>
      </Container>
    </PageContent>
  );
});

export default SiteOverview;
