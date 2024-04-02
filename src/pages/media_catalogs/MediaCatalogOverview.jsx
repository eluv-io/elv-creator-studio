import {observer} from "mobx-react-lite";
import {mediaCatalogStore, uiStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import {Group, Paper, Text, Title, Container, Image} from "@mantine/core";

const MediaCatalogOverview = observer(() => {
  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];
  const metadata = mediaCatalog.metadata.public.asset_metadata;

  return (
    <PageContent>
      <Container p="xl" m={0} maw={uiStore.inputWidthWide}>
        <Paper>
          <Group align="top" noWrap spacing="xl">
            <Image
              width={250}
              height={140}
              withPlaceholder
              fit="contain"
              src={metadata?.info?.image?.url}
              alt={metadata?.info?.name || mediaCatalog?.name}
            />
            <Container p={0} m={0} maw={400}>
              <Title order={4}>{ metadata?.info?.name || mediaCatalog?.name }</Title>
              <Title order={6} color="dimmed">{ mediaCatalog.objectId }</Title>
              <Text fz="xs" color="dimmed">{ metadata.info.id }</Text>
              <Text fz="sm" mt="md">{metadata?.info?.description}</Text>
            </Container>
          </Group>
        </Paper>
      </Container>
    </PageContent>
  );
});

export default MediaCatalogOverview;
