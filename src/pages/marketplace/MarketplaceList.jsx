import {useState} from "react";
import {Container, Table, Title, Group, Avatar, Text} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {CheckboxCard, ContainedInputs} from "../../components/common/Inputs";
import AsyncWrapper from "../../components/common/AsyncWrapper.jsx";
import {marketplaceStore} from "Stores";
import {FabricUrl} from "../../helpers/Fabric.js";

const MarketplaceRows = observer(() => {
  return marketplaceStore.allMarketplaces.map(marketplace => {
    return (
      <tr key={marketplace.objectId}>
        <td>
          <Group spacing="xl">
            <Avatar size={60} radius={60} src={FabricUrl({...marketplace, path: "/meta/public/asset_metadata/info/branding/card_banner_front"})} />
            <Text size="sm" weight={500}>
              { marketplace.brandedName || marketplace.name }
            </Text>
          </Group>
        </td>
        <td>
          <Text>
            { marketplace.marketplaceSlug }
          </Text>
        </td>
        <td>
          <Text>
            Status
          </Text>
        </td>
      </tr>
    );
  });
});

const MarketplaceList = observer(() => {
  return (
    <AsyncWrapper
      loadingMessage="Loading Marketplaces"
      Load={async () => await marketplaceStore.LoadMarketplaces}
    >
      <Container fluid>
        <Title>Marketplaces</Title>
        <Table miw={800}>
          <thead>
            <tr>
              <th>Marketplace</th>
              <th>Slug</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <MarketplaceRows />
          </tbody>
        </Table>
      </Container>
    </AsyncWrapper>
  );
});

export default MarketplaceList;
