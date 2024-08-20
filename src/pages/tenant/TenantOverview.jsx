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
  Image,
  Stack
} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import UrlJoin from "url-join";
import {Link} from "react-router-dom";
import {Confirm, ConfirmDelete} from "@/components/inputs/Inputs.jsx";

import {
  IconUnlink,
  IconLinkOff,
  IconWorldUpload
} from "@tabler/icons-react";

const DeployStatus = ({linked=true, deployed, hash, isLink}) => {
  const label = rootStore.l10n.pages.tenant.form.overview[
    !linked ? "not_linked" :
      (isLink ?
        (deployed ? "link_deployed" : "link_not_deployed") :
        (deployed ? "deployed" : hash ? "previous_deployed" : "not_deployed"))
    ];

  return (
    <Group align="center" spacing="xs" noWrap>
      <div style={{height: 8, width: 8, minWidth: 8, borderRadius: "100%", backgroundColor: !linked ? "#AAA" : (deployed ? "#00CC00" : "#CC0000")}} />
      <Text fz="xs">{ label }</Text>
    </Group>
  );
};

const UpdateLinkButton = ({type, record}) => {
  const [loading, setLoading] = useState(false);

  const l10n = rootStore.l10n.pages.tenant.form.overview;
  const linked = !!record?.latestHash;
  return (
    <IconButton
      label={LocalizeString(linked ? l10n.update_link_label : l10n.add_link_label, {name: record.name})}
      variant="transparent"
      disabled={record.latestDeployed}
      loading={loading}
      color="purple.6"
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
                versionHash: record.versionHash
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
      Icon={IconLinkOff}
      onClick={() =>
        ConfirmDelete({
          title: l10n.remove_link,
          itemName: record.name,
          onConfirm: async () => {
            setLoading(true);
            try {
              await tenantStore.RemoveLink({
                type,
                name: record.name,
                slug: record.slug,
                versionHash: record.versionHash
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

const DeploymentStatus = observer(({mode}) => {
  const [deploying, setDeploying] = useState(false);
  const tenant = tenantStore[`${mode}Tenant`] || {};

  const l10n = rootStore.l10n.pages.tenant.form;
  const deployed = tenantStore[`${mode}TenantDeployed`];

  return (
    <Paper withBorder p="xl" pt="md" mb="md" maw={uiStore.inputWidthWide}>
      <Group position="apart" align="center">
        <Stack spacing={0}>
          <Title order={6} fw={500}>{ l10n.overview[mode] }</Title>
          <Text maw={300} truncate fz={10} color="dimmed">{ tenant.versionHash }</Text>
        </Stack>
        <DeployStatus deployed={deployed} hash={tenantStore[`${mode}Tenant`]?.versionHash} />
        <IconButton
          disabled={deployed}
          Icon={IconWorldUpload}
          loading={deploying}
          label={l10n.overview.deploy}
          color="#00CC00"
          onClick={() =>
            Confirm({
              title: l10n.overview.deploy,
              text: l10n.overview.deploy_confirm,
              itemName: mode,
              onConfirm: async () => {
                try {
                  setDeploying(true);

                  await tenantStore.DeployTenant({mode});
                } finally {
                  setDeploying(false);
                }
              }
            })
          }
        />
      </Group>
    </Paper>
  );
});

const StatusTable = observer(({Load, type, path, aspectRatio=1}) => {
  const [items, setItems] = useState(undefined);

  useEffect(() => {
    Load()
      .then(content => setItems(content));

  }, [tenantStore.latestTenant, tenantStore.productionTenant, tenantStore.stagingTenant]);

  const l10n = rootStore.l10n.pages.tenant.form;

  return (
    <Container p={0} m={0} maw={1200}>
      <DataTable
        minHeight={150}
        fetching={!items}
        idAccessor="slug"
        records={items || []}
        columns={[
          {
            accessor: "name",
            title: l10n[type].singular,
            width: 400,
            render: record => (
              <Link to={UrlJoin(path, record.objectId)}>
                <Group spacing="lg" noWrap>
                  <Image py="sm" width={60} height={60 / aspectRatio} miw={60} fit="contain" src={record.imageUrl} alt={record.name} withPlaceholder />
                  <Container p={0} m={0}>
                    <Text>{ record.name }</Text>
                    <Text fz={11} color="dimmed">{ record.slug }</Text>
                  </Container>
                </Group>
              </Link>
            )
          },
          {
            accessor: "record.latestDeployed",
            title: l10n.overview.status.link,
            render: record => <DeployStatus linked={!!record.latestHash} deployed={record.latestDeployed} isLink />
          },
          {
            accessor: "record.productionDeployed",
            title: l10n.overview.status.production,
            render: record => (
              !record.latestHash ? null :
                <DeployStatus linked={!!record.latestHash} deployed={record.productionDeployed} hash={record.productionHash} />
            )
          },
          {
            accessor: "record.stagingDeployed",
            title: l10n.overview.status.staging,
            render: record => (
              !record.latestHash ? null :
                <DeployStatus linked={!!record.latestHash} deployed={record.stagingDeployed} hash={record.stagingHash} />
            )
          },
          {
            accessor: "actions",
            textAlignment: "center",
            width: 120,
            render: record => (
              <Group position="center" align="center" spacing={5}>
                <UpdateLinkButton type={type} record={record} />
                {
                  !record.latestHash ? null :
                    <UnlinkButton type={type} record={record}/>
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
      <Container p={0} m={0} maw={1200}>
        <Group w="100%" position="apart">
          <Title order={3}>{ metadata.info?.name }</Title>
          <Button
            color="purple.6"
            variant="outline"
            onClick={async () => {
              uiStore.SetLoading(true);
              uiStore.SetLoadingMessage(rootStore.l10n.stores.initialization.loading.scanning);

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
          >
            {rootStore.l10n.components.actions.scan_content}
          </Button>
        </Group>
        <Text fz="xs" color="dimmed">{ tenantStore.tenantSlug }</Text>
        <Text fz="xs" color="dimmed">{ tenantStore.tenantObjectId }</Text>

        <Title order={3} mt={50} fw={500} mb="md">{ l10n.overview.deployment }</Title>

        <DeploymentStatus mode="production"/>
        {
          rootStore.network !== "main" ? null :
            <DeploymentStatus mode="staging" />
        }
      </Container>

      <Title fw={500} order={3} mt={50} mb="md">{ l10n.mediaProperty.plural }</Title>
      <StatusTable type="mediaProperty" path="/media-properties" Load={async () => await tenantStore.MediaPropertyStatus()} />

      <Title fw={500} order={3} mt={50} mb="md">{ l10n.marketplace.plural }</Title>
      <StatusTable type="marketplace" path="/marketplaces" Load={async () => await tenantStore.MarketplaceStatus()} />

      <Title fw={500} order={3} mt={50} mb="md">{ l10n.site.plural }</Title>
      <StatusTable type="site" path="/sites" aspectRatio={16/9} Load={async () => await tenantStore.SiteStatus()} />
    </PageContent>
  );
});

export default TenantOverview;
