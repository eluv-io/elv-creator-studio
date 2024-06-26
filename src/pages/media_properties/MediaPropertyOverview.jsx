import {observer} from "mobx-react-lite";
import {mediaPropertyStore, uiStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import {Group, Paper, Text, Title, Container, Image} from "@mantine/core";
import {ScaleImage} from "@/helpers/Fabric";

const MediaPropertyOverview = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];
  const metadata = mediaProperty.metadata.public.asset_metadata;

  return (
    <PageContent>
      <Container p="xl" m={0} maw={uiStore.inputWidthWide}>
        <Paper>
          <Group align="top" noWrap spacing="xl">
            <Image
              width={250}
              height={250 * 3 / 2}
              withPlaceholder
              fit="contain"
              src={ScaleImage(metadata?.info?.image?.url, 250)}
              alt={metadata?.info?.name || mediaProperty?.name}
            />
            <Container p={0} m={0} maw={400}>
              <Title order={4}>{ metadata?.info?.name || mediaProperty?.name }</Title>
              <Title order={6} color="dimmed">{ mediaProperty.objectId }</Title>
              <Text fz="xs" color="dimmed">{ metadata.info.slug }</Text>
              <Text fz="sm" mt="md">{metadata?.info?.description}</Text>
            </Container>
          </Group>
        </Paper>
      </Container>
    </PageContent>
  );
});

export default MediaPropertyOverview;
