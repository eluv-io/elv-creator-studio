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
  Stack, Modal, Loader, Accordion
} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import UrlJoin from "url-join";
import {Link} from "react-router-dom";
import {Confirm, ConfirmDelete} from "@/components/inputs/Inputs.jsx";

import {
  IconUnlink,
  IconLinkOff,
  IconWorldUpload,
  IconClock, IconEdit, IconLink
} from "@tabler/icons-react";
import Markdown from "@/components/common/Markdown.jsx";

const Version = observer(({record, version, Submit, Close}) => {
  const l10n = rootStore.l10n.pages.tenant.form.overview;
  const [loading, setLoading] = useState(false);

  return (
    <Paper withBorder p="md" mb="md" style={{position: "relative"}}>
      <Stack spacing={0}>
        <Text fz="md">
          { version.commit?.message || "No Commit Message" }
        </Text>
        <Text fz="xs">
          by {version.commit?.author}
        </Text>
        {
          !version.commitDate ? null :
            <Text fz="xs" className="ellipsis">
              { version.commitDate.toLocaleString("en-uk", {dateStyle: "full", timeStyle: "long"}) }
            </Text>
        }
        <Text fz={10} className="ellipsis" color="gray.6">
          { version.versionHash }
        </Text>
      </Stack>
      {
        !version.commitHistoryEntry ? null :
          <Accordion mt="md" variant="contained">
            <Accordion.Item value="default">
              <Accordion.Control icon={<IconEdit />}>
                { rootStore.l10n.components.save_modal.changelist }
              </Accordion.Control>
              <Accordion.Panel mx="md">
                <Markdown
                  content={version.commitHistoryEntry.changelist}
                  className="changelist"
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
      }

      <IconButton
        label={LocalizeString(l10n.update_link, {name: record.name})}
        disabled={record.linkedHash === version.versionHash}
        variant="transparent"
        color="purple.6"
        loading={loading}
        Icon={IconLink}
        style={{
          position: "absolute",
          top: 10,
          right: 10
        }}
        onClick={async () => {
          await Confirm({
            title: LocalizeString(l10n.select_link, {name: record.name}),
            text: LocalizeString(l10n.select_link_confirm, {name: record.name}),
            onConfirm: async () => {
              setLoading(true);

              try {
                await Submit(version.versionHash);
                Close();
              } catch(error) {
                tenantStore.DebugLog({error});
              } finally {
                setLoading(false);
              }
            }
          });
        }}
      />
    </Paper>
  );
});

const VersionSelectModal = observer(({record, Submit, Close}) => {
  const l10n = rootStore.l10n.pages.tenant.form.overview;

  const [versionHistory, setVersionHistory] = useState(undefined);

  useEffect(() => {
    tenantStore.LoadVersionHistory({objectId: record.objectId})
      .then(setVersionHistory);
  }, []);

  return (
    <Modal
      opened
      onClose={Close}
      centered
      size={uiStore.inputWidth + 40}
      title={LocalizeString(l10n.select_link, {name: record.name})}
      padding="xl"
    >
      {
        !versionHistory ? <Group py="xl" position="center"><Loader/></Group> :
          versionHistory.map(version =>
            <Version
              key={`version-${version.versionHash}`}
              record={record}
              version={version}
              Submit={Submit}
              Close={Close}
            />
          )
      }
    </Modal>
  );
});

const SelectVersionButton = ({type, record}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const l10n = rootStore.l10n.pages.tenant.form.overview;
  return (
    <>
      <IconButton
        label={LocalizeString(l10n.select_link_label, {name: record.name})}
        variant="transparent"
        loading={loading}
        color="blue.3"
        Icon={IconClock}
        onClick={() => setShowModal(true)}
      />
      {
        !showModal ? null :
          <VersionSelectModal
            type={type}
            record={record}
            Submit={async versionHash => {
              setLoading(true);
              try {
                await tenantStore.UpdateLink({
                  type,
                  name: record.name,
                  slug: record.slug,
                  versionHash,
                  skipDeployCallbacks: true
                });
              } catch(error) {
                rootStore.DebugLog({error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
              } finally {
                setLoading(false);
              }
            }}
            Close={() => setShowModal(false)}
          />
      }
    </>
  );
};

const DeployStatus = ({linked=true, deployed, mediaCatalogsBehind, permissionSetsBehind, hash, isTenantLink}) => {
  let labelKey = "not_linked";
  let indicatorColor = "#AAA";
  if(linked) {
    indicatorColor = "#CC0000";

    if(deployed) {
      if(mediaCatalogsBehind) {
        labelKey = "media_catalog_behind";
      } else if(permissionSetsBehind) {
        labelKey = "permission_set_behind";
      } else {
        indicatorColor = "#00CC00";
        labelKey = isTenantLink ? "link_deployed" : "deployed";
      }
    } else {
      if(isTenantLink) {
        labelKey = "link_not_deployed";
      } else {
        labelKey = hash ? "previous_deployed" : "not_deployed";
      }
    }
  }

  const label = rootStore.l10n.pages.tenant.form.overview[labelKey];

  return (
    <Group align="center" spacing="xs" noWrap>
      <div
        style={{
          height: 8,
          width: 8,
          minWidth: 8,
          borderRadius: "100%",
          backgroundColor: indicatorColor
        }}
      />
      <Text fz="xs">{ label }</Text>
    </Group>
  );
};

const UpdateLinkButton = ({type, record}) => {
  const [loading, setLoading] = useState(false);

  const l10n = rootStore.l10n.pages.tenant.form.overview;
  const linked = !!record?.linkedHash;
  return (
    <IconButton
      label={LocalizeString(linked ? l10n.update_link_label : l10n.add_link_label, {name: record.name})}
      variant="transparent"
      disabled={record.latestDeployed && !record.mediaCatalogsBehind && !record.permissionSetsBehind}
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
        verticalSpacing={0}
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
            render: record =>
              <DeployStatus
                linked={!!record.linkedHash}
                deployed={record.latestDeployed}
                mediaCatalogsBehind={record.mediaCatalogsBehind}
                permissionSetsBehind={record.permissionSetsBehind}
                isTenantLink
              />
          },
          {
            accessor: "record.stagingDeployed",
            title: l10n.overview.status.staging,
            render: record => (
              !record.linkedHash ? null :
                <DeployStatus
                  linked={!!record.linkedHash}
                  deployed={record.stagingDeployed}
                  mediaCatalogsBehind={record.mediaCatalogsBehind}
                  permissionSetsBehind={record.permissionSetsBehind}
                  hash={record.stagingHash}
                />
            )
          },
          {
            accessor: "record.productionDeployed",
            title: l10n.overview.status.production,
            render: record => (
              !record.linkedHash ? null :
                <DeployStatus
                  linked={!!record.linkedHash}
                  deployed={record.productionDeployed}
                  mediaCatalogsBehind={record.mediaCatalogsBehind}
                  permissionSetsBehind={record.permissionSetsBehind}
                  hash={record.productionHash}
                />
            )
          },
          {
            accessor: "actions",
            textAlignment: "center",
            width: 120,
            render: record => (
              <Group position="center" align="center" spacing={5}>
                <UpdateLinkButton type={type} record={record} />
                <SelectVersionButton type={type} record={record} />
                {
                  !record.linkedHash ? null :
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

      <Title fw={500} order={3} mt={50} mb="md">{ l10n.pocketProperty.plural }</Title>
      <StatusTable type="pocketProperty" path="/pocket" Load={async () => await tenantStore.PocketPropertyStatus()} />

      <Title fw={500} order={3} mt={50} mb="md">{ l10n.marketplace.plural }</Title>
      <StatusTable type="marketplace" path="/marketplaces" Load={async () => await tenantStore.MarketplaceStatus()} />

    </PageContent>
  );
});

export default TenantOverview;
