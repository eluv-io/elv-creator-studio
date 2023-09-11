import {observer} from "mobx-react-lite";
import {itemTemplateStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import {Group, Paper, Text, Title, Container, Image} from "@mantine/core";
import {ScaleImage} from "@/helpers/Fabric";

const ItemTemplateOverview = observer(() => {
  const { itemTemplateId } = useParams();

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];
  const metadata = itemTemplate.metadata.public.asset_metadata;

  return (
    <PageContent>
      <Container p="xl" m={0} maw={800}>
        <Paper>
          <Group align="top" noWrap spacing="xl">
            <Image
              width={250}
              height={250}
              fit="contain"
              bg="gray.2"
              withPlaceholder
              src={ScaleImage(metadata?.nft?.image, 400)}
              alt={metadata?.nft?.name || itemTemplate?.name}
            />
            <Container p={0} m={0} maw={400}>
              <Title order={4}>{ metadata?.nft?.name || itemTemplate?.name }</Title>
              <Text fz="sm" color="dimmed">{ itemTemplate.objectId }</Text>
              <Text fz="xs" color="dimmed">{metadata?.nft?.address}</Text>
              <Text fz="sm" mt="md">{metadata?.nft?.description}</Text>
            </Container>
          </Group>
        </Paper>
      </Container>
    </PageContent>
  );
});

export default ItemTemplateOverview;
