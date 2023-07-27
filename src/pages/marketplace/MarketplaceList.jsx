import {
  Container,
  Title,
  Group,
  Text,
  Card,
  Image,
  SimpleGrid,
  AspectRatio,
  Code,
} from "@mantine/core";
import {observer} from "mobx-react-lite";
import AsyncWrapper from "Components/common/AsyncWrapper.jsx";
import {marketplaceStore} from "Stores";
import {FabricUrl} from "Helpers/Fabric.js";
import UrlJoin from "url-join";
import {LinkButton} from "Components/common/Misc";


const MarketplaceCard = observer(({marketplace}) => {
  const name = marketplace.brandedName || marketplace.name;
  const image = FabricUrl({...marketplace, path: "/meta/public/asset_metadata/info/branding/card_banner_front"});

  return (
    <Card withBorder radius="md" p="md">
      <Card.Section p="xl">
        <AspectRatio ratio={1}>
          <Image src={image} alt={name} withPlaceholder />
        </AspectRatio>
      </Card.Section>

      <Card.Section p="xl" pt={0}>
        <Text fz="lg" fw={600}>
          { name }
        </Text>
        <Code fz="xs" bg="transparent">
          { marketplace.marketplaceSlug }
        </Code>
      </Card.Section>

      <Group mt="xs" align="end">
        <LinkButton radius="md" style={{ flex: 1 }} to={UrlJoin("/marketplaces", marketplace.objectId)}>
          Show details
        </LinkButton>
      </Group>
    </Card>
  );
});

const MarketplaceList = observer(() => {
  return (
    <AsyncWrapper
      loadingMessage="Loading Marketplaces"
      Load={async () => await marketplaceStore.LoadMarketplaces()}
    >
      <Container p="xl" fluid>
        <Title>Marketplaces</Title>
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
            marketplaceStore.allMarketplaces.map(marketplace =>
              <MarketplaceCard key={`marketplace-${marketplace.objectId}`} marketplace={marketplace} />
            )
          }
        </SimpleGrid>
      </Container>
    </AsyncWrapper>
  );
});

export default MarketplaceList;
