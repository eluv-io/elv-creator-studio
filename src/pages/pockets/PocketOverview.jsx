import {observer} from "mobx-react-lite";
import {pocketStore, uiStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import {Group, Paper, Text, Title, Container, Image} from "@mantine/core";
import {ScaleImage} from "@/helpers/Fabric";

const PocketOverview = observer(() => {
  const { pocketId } = useParams();

  const pocket = pocketStore.pockets[pocketId];

  if(!pocket) { return null; }

  const metadata = pocket.metadata.public.asset_metadata;

  return (
    <PageContent>
      <Container p="xl" m={0} maw={uiStore.inputWidthWide}>
        <Paper>
          <Group align="top" noWrap spacing="xl">
            <Image
              width={250}
              height={250}
              withPlaceholder
              fit="contain"
              src={ScaleImage(metadata?.info?.image?.url, 250)}
              alt={metadata?.info?.name || pocket?.name}
            />
            <Container p={0} m={0} maw={400}>
              <Title order={4}>{ metadata?.info?.name || pocket?.name }</Title>
              <Title order={6} color="dimmed">{ pocket.objectId }</Title>
              <Text fz="xs" color="dimmed">{ metadata.info.slug }</Text>
              <Text fz="sm" mt="md">{metadata?.info?.description}</Text>
            </Container>
          </Group>
        </Paper>
      </Container>
    </PageContent>
  );
});

export default PocketOverview;
