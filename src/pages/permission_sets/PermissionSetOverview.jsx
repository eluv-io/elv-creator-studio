import {observer} from "mobx-react-lite";
import {permissionSetStore, uiStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import {Group, Paper, Text, Title, Container, Image} from "@mantine/core";

const PermissionSetOverview = observer(() => {
  const { permissionSetId } = useParams();

  const permissionSet = permissionSetStore.permissionSets[permissionSetId];
  const metadata = permissionSet.metadata.public.asset_metadata;

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
              src={metadata?.info?.image?.url}
              alt={metadata?.info?.name || permissionSet?.name}
            />
            <Container p={0} m={0} maw={400}>
              <Title order={4}>{ metadata?.info?.name || permissionSet?.name }</Title>
              <Title order={6} color="dimmed">{ permissionSet.objectId }</Title>
              <Text fz="xs" color="dimmed">{ metadata.info.slug }</Text>
              <Text fz="sm" mt="md">{metadata?.info?.description}</Text>
            </Container>
          </Group>
        </Paper>
      </Container>
    </PageContent>
  );
});

export default PermissionSetOverview;
