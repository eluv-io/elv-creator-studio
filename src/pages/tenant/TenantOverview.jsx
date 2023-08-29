import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {rootStore, tenantStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import {
  Title,
  Text,
  Paper,
  Group,
  Tooltip,
  Container,
  Button,
  Image,
  ActionIcon
} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {modals} from "@mantine/modals";
import {LocalizeString, TooltipIcon} from "Components/common/Misc.jsx";
import UrlJoin from "url-join";
import {Link} from "react-router-dom";

import {IconUnlink, IconLinkOff, IconEqual, IconEqualNot} from "@tabler/icons-react";



const DeployedIcon = ({deployed}) =>
  <TooltipIcon
    label={rootStore.l10n.pages.tenant.form.overview[deployed ? "deployed" : "not_deployed"]}
    Icon={deployed ? IconEqual : IconEqualNot}
    size={20}
    color={deployed ? "green" : "red"}
  />;

const UpdateLinkButton = ({type, record}) => {
  const [loading, setLoading] = useState(false);

  const l10n = rootStore.l10n.pages.tenant.form[type === "marketplace" ? "marketplaces" : "sites"];
  return (
    <Tooltip label={LocalizeString(l10n.update_link_label, {name: record.name})} events={{ hover: true, focus: true, touch: true }}>
      <ActionIcon
        loading={loading}
        title={LocalizeString(l10n.update_link_label, {name: record.name})}
        aria-label={LocalizeString(l10n.update_link_label, {name: record.name})}
        color="blue.5"
        onClick={() =>
          modals.openConfirmModal({
            title: l10n.update_link,
            children: (
              <Text size="sm">
                { LocalizeString(l10n.update_link_confirm, {name: record.name}) }
              </Text>
            ),
            centered: true,
            labels: { confirm: rootStore.l10n.components.actions.confirm, cancel: rootStore.l10n.components.actions.cancel },
            onConfirm: async () => {
              setLoading(true);
              try {
                await tenantStore.UpdateMarketplaceLink({versionHash: record.marketplaceHash, slug: record.slug});
              } catch(error) {
                rootStore.DebugLog({error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
              } finally {
                setLoading(false);
              }
            }
          })
        }
      >
        <IconUnlink size={20} />
      </ActionIcon>
    </Tooltip>
  );
};

const UnlinkButton = ({type, record}) => {
  const [loading, setLoading] = useState(false);

  const l10n = rootStore.l10n.pages.tenant.form[type === "marketplace" ? "marketplaces" : "sites"];
  return (
    <Tooltip label={LocalizeString(l10n.remove_link_label, {name: record.name})} events={{ hover: true, focus: true, touch: true }}>
      <ActionIcon
        loading={loading}
        title={LocalizeString(l10n.remove_link_label, {name: record.name})}
        aria-label={LocalizeString(l10n.remove_link_label, {name: record.name})}
        color="red.5"
        onClick={() =>
          modals.openConfirmModal({
            title: l10n.remove_link,
            children: (
              <Text size="sm">
                { LocalizeString(l10n.remove_link_confirm, {name: record.name}) }
              </Text>
            ),
            centered: true,
            labels: { confirm: rootStore.l10n.components.actions.confirm, cancel: rootStore.l10n.components.actions.cancel },
            confirmProps: { color: "red.6" },
            onConfirm: async () => {
              setLoading(true);
              try {
                await tenantStore.RemoveMarketplaceLink({slug: record.slug});
              } catch(error) {
                rootStore.DebugLog({error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
              } finally {
                setLoading(false);
              }
            }
          })
        }
      >
        <IconLinkOff size={20} />
      </ActionIcon>
    </Tooltip>
  );
};

const DeploymentStatus = observer(({mode}) => {
  const [deploying, setDeploying] = useState(false);
  const tenant = tenantStore[`${mode}Tenant`];

  const l10n = rootStore.l10n.pages.tenant.form;
  const deployed = tenantStore[`${mode}TenantDeployed`];

  return (
    <Paper withBorder p="xl" pt="md" mb="md">
      <Group position="apart" align="center">
        <Title order={6}>{ l10n.overview[mode] }</Title>
        <DeployedIcon deployed={deployed} />
      </Group>
      <Text fz={10} color="dimmed">{ tenant.versionHash }</Text>

      {
        deployed ? null :
          <Group mt={50} position="right">
            <Button
              loading={deploying}
              miw={150}
              onClick={async () => {
                try {
                  setDeploying(true);

                  await tenantStore.DeployTenant();
                } finally {
                  setDeploying(false);
                }
              }}
            >
              { l10n.overview.deploy }
            </Button>
          </Group>
      }
    </Paper>
  );
});

const Marketplaces = observer(() => {
  const [marketplaces, setMarketplaces] = useState(undefined);

  useEffect(() => {
    tenantStore.MarketplaceStatus()
      .then(marketplaces => setMarketplaces(marketplaces));
  }, [tenantStore.latestTenant, tenantStore.productionTenant, tenantStore.stagingTenant]);

  const l10n = rootStore.l10n.pages.tenant.form;

  return (
    <Container p={0} m={0} maw={800}>
      <DataTable
        maw={800}
        mih={300}
        withBorder
        withColumnBorders
        fetching={!marketplaces}
        idAccessor="slug"
        records={marketplaces || []}
        columns={[
          {
            accessor: "name",
            title: l10n.marketplaces.marketplace,
            render: record => (
              <Link to={UrlJoin("/marketplaces", record.marketplaceId)}>
                <Group spacing="lg">
                  <Image py="sm" width={60} height={60} fit="contain" src={record.imageUrl} alt={record.name} withPlaceholder />
                  <Container p={0} m={0}>
                    <Text>{ record.name }</Text>
                    <Text fz={11} color="dimmed">{ record.slug }</Text>
                  </Container>
                </Group>
              </Link>
            )
          },
          {
            accessor: "status",
            width: 175,
            title: l10n.marketplaces.status,
            render: record => (
              record.latestHash ?
                // Linked
                <Container p={0} m={0}>
                  <Group align="center" h={25} position="apart">
                    <Text fw={500}>{l10n.marketplaces.link}:</Text>
                    <DeployedIcon deployed={record.latestDeployed} />
                  </Group>
                  <Group align="center" h={25} position="apart">
                    <Text fw={500}>{l10n.marketplaces.production}:</Text>
                    <DeployedIcon deployed={record.productionDeployed} />
                  </Group>
                  <Group align="center" h={25} position="apart">
                    <Text fw={500}>{l10n.marketplaces.staging}:</Text>
                    <DeployedIcon deployed={record.stagingDeployed} />
                  </Group>
                </Container> :
                <Group spacing="xs">
                  <IconLinkOff size={20} color="red" />
                  <Text fw={500}>{ l10n.overview.not_linked}</Text>
                </Group>
            )
          },
          {
            accessor: "actions",
            textAlignment: "center",
            width: 120,
            render: record => (
              <Group position="center" align="center" spacing={5}>
                <UpdateLinkButton type="marketplace" record={record} />
                {
                  !record.latestHash ? null :
                    <UnlinkButton type="marketplace" record={record}/>
                }
              </Group>
            )
          }
        ]}

      />
    </Container>
  );
});

const TenantOverview = observer(() => {
  const tenant = tenantStore.latestTenant;

  const metadata = tenant?.metadata?.public?.asset_metadata || {};

  const l10n = rootStore.l10n.pages.tenant.form;

  return (
    <PageContent>
      <Container p={0} m={0} maw={600}>
        <Group w="100%" position="apart">
          <Title order={3}>{ metadata.info?.name }</Title>
          <Title order={6} color="dimmed">{ metadata.slug }</Title>
        </Group>
        <Text fz="xs" color="dimmed">{ metadata.info.tenant_id }</Text>
        <Text fz="xs" color="dimmed">{ tenantStore.tenantObjectId }</Text>

        <Title order={5} mt={50} mb="md">{ l10n.overview.status }</Title>

        <DeploymentStatus mode="production" />
        <DeploymentStatus mode="staging" />
      </Container>

      <Title order={5} mt={50} mb="md">{ l10n.marketplaces.marketplaces }</Title>
      <Marketplaces />
    </PageContent>
  );
});

export default TenantOverview;
