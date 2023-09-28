import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {rootStore, tenantStore, uiStore, databaseStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {
  Title,
  Text,
  Paper,
  Group,
  Container,
  Button,
  Image
} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {IconButton, LocalizeString, TooltipIcon} from "@/components/common/Misc.jsx";
import UrlJoin from "url-join";
import {Link} from "react-router-dom";
import {Confirm, ConfirmDelete} from "@/components/inputs/Inputs.jsx";

import {IconUnlink, IconLinkOff, IconEqual, IconEqualNot, IconInputSearch} from "@tabler/icons-react";

const DeployedIcon = ({deployed}) =>
  <TooltipIcon
    label={rootStore.l10n.pages.tenant.form.overview[deployed ? "deployed" : "not_deployed"]}
    Icon={deployed ? IconEqual : IconEqualNot}
    size={20}
    color={deployed ? "green" : "red"}
  />;

const UpdateLinkButton = ({type, record}) => {
  const [loading, setLoading] = useState(false);

  const l10n = rootStore.l10n.pages.tenant.form.overview;
  const linked = !!record.latestHash;
  return (
    <IconButton
      label={LocalizeString(linked ? l10n.update_link_label : l10n.add_link_label, {name: record.name})}
      variant="transparent"
      disabled={record.latestDeployed}
      loading={loading}
      color="blue.5"
      Icon={IconUnlink}
      onClick={() =>
        Confirm({
          title: linked ? l10n.update_link : l10n.add_link,
          text: LocalizeString(linked ? l10n.update_link_confirm : l10n.add_link_label_confirm, {name: record.name}),
          onConfirm: async () => {
            setLoading(true);
            try {
              await tenantStore.UpdateLink({
                type,
                name: record.name,
                slug: record.slug,
                versionHash: record[type === "site" ? "siteHash" : "marketplaceHash"]
              });
            } catch(error) {
              rootStore.DebugLog({error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
            } finally {
              setLoading(false);
            }
          }
        })
      }
    />
  );
};

const UnlinkButton = ({type, record}) => {
  const [loading, setLoading] = useState(false);

  const l10n = rootStore.l10n.pages.tenant.form.overview;
  return (
    <IconButton
      label={LocalizeString(l10n.remove_link_label, {name: record.name})}
      variant="transparent"
      loading={loading}
      color="red.5"
      Icon={IconUnlink}
      onClick={() =>
        ConfirmDelete({
          title: l10n.remove_link,
          itemName: record.name,
          onConfirm: async () => {
            setLoading(true);
            try {
              await tenantStore.RemoveLink({type, name: record.name, slug: record.slug});
            } catch(error) {
              rootStore.DebugLog({error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
            } finally {
              setLoading(false);
            }
          }
        })
      }
    />
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

const Sites = observer(() => {
  const [sites, setSites] = useState(undefined);

  useEffect(() => {
    tenantStore.SiteStatus()
      .then(sites => setSites(sites));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantStore.latestTenant, tenantStore.productionTenant, tenantStore.stagingTenant]);

  const l10n = rootStore.l10n.pages.tenant.form;

  return (
    <Container p={0} m={0} maw={uiStore.inputWidthWide}>
      <DataTable
        minHeight={150}
        withBorder
        withColumnBorders
        fetching={!sites}
        idAccessor="slug"
        records={sites || []}
        columns={[
          {
            accessor: "name",
            title: l10n.sites.site,
            render: record => (
              <Link to={UrlJoin("/sites", record.siteId)}>
                <Group spacing="lg" pl="xs">
                  <Image py="sm" width={150} fit="contain" src={record.imageUrl} alt={record.name} withPlaceholder />
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
            title: l10n.overview.status,
            render: record => (
              record.latestHash ?
                // Linked
                <Container p={0} m={0}>
                  <Group align="center" h={25} position="apart">
                    <Text fw={500}>{l10n.overview.link}:</Text>
                    <DeployedIcon deployed={record.latestDeployed} />
                  </Group>
                  <Group align="center" h={25} position="apart">
                    <Text fw={500}>{l10n.overview.production}:</Text>
                    <DeployedIcon deployed={record.productionDeployed} />
                  </Group>
                  <Group align="center" h={25} position="apart">
                    <Text fw={500}>{l10n.overview.staging}:</Text>
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
                <UpdateLinkButton type="site" record={record} />
                {
                  !record.latestHash ? null :
                    <UnlinkButton type="site" record={record}/>
                }
              </Group>
            )
          }
        ]}

      />
    </Container>
  );
});

const Marketplaces = observer(() => {
  const [marketplaces, setMarketplaces] = useState(undefined);

  useEffect(() => {
    tenantStore.MarketplaceStatus()
      .then(marketplaces => setMarketplaces(marketplaces));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantStore.latestTenant, tenantStore.productionTenant, tenantStore.stagingTenant]);

  const l10n = rootStore.l10n.pages.tenant.form;

  return (
    <Container p={0} m={0} maw={uiStore.inputWidthWide}>
      <DataTable
        minHeight={150}
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
                  <Image py="sm" width={100} height={100} fit="contain" src={record.imageUrl} alt={record.name} withPlaceholder />
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
            title: l10n.overview.status,
            render: record => (
              record.latestHash ?
                // Linked
                <Container p={0} m={0}>
                  <Group align="center" h={25} position="apart">
                    <Text fw={500}>{l10n.overview.link}:</Text>
                    <DeployedIcon deployed={record.latestDeployed} />
                  </Group>
                  <Group align="center" h={25} position="apart">
                    <Text fw={500}>{l10n.overview.production}:</Text>
                    <DeployedIcon deployed={record.productionDeployed} />
                  </Group>
                  <Group align="center" h={25} position="apart">
                    <Text fw={500}>{l10n.overview.staging}:</Text>
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
      <Container p={0} m={0} maw={uiStore.inputWidth}>
        <Group w="100%" position="apart">
          <Title order={3}>{ metadata.info?.name }</Title>
          <Group spacing="xl">
            <Title order={6} color="dimmed">{ metadata.slug }</Title>
            <IconButton
              label={rootStore.l10n.components.actions.scan_content}
              color="blue.5"
              Icon={IconInputSearch}
              onClick={async () => {
                uiStore.SetLoading(true);
                try {
                  await databaseStore.ScanContent({force: true});
                } catch(error) {
                  rootStore.DebugLog({
                    message: "Failed to scan for content:",
                    error,
                    level: rootStore.logLevels.DEBUG_LEVEL_ERROR
                  });
                } finally {
                  uiStore.SetLoading(false);
                }
              }}
            />
          </Group>
        </Group>
        <Text fz="xs" color="dimmed">{ metadata.info.tenant_id }</Text>
        <Text fz="xs" color="dimmed">{ tenantStore.tenantObjectId }</Text>

        <Title order={3} mt={50} mb="md">{ l10n.overview.status }</Title>

        <DeploymentStatus mode="production" />
        <DeploymentStatus mode="staging" />
      </Container>

      <Title order={3} mt={50} mb="md">{ l10n.sites.sites }</Title>
      <Sites />

      <Title order={3} mt={50} mb="md">{ l10n.marketplaces.marketplaces }</Title>
      <Marketplaces />
    </PageContent>
  );
});

export default TenantOverview;
