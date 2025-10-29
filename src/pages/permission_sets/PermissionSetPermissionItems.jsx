import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, permissionSetStore, marketplaceStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {modals} from "@mantine/modals";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {useEffect, useState} from "react";
import {useForm} from "@mantine/form";
import {Button, Container, Group, Select, TextInput} from "@mantine/core";
import {MarketplaceItemSelect} from "@/components/inputs/marketplace/MarketplaceItemInput.jsx";

const CreatePermissionSetItemForm = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const l10n = rootStore.l10n.pages.permission_set.form;
  const marketplaces = marketplaceStore.allMarketplaces || [];

  const form = useForm({
    initialValues: {
      label: "",
      type: "owned_item",
      marketplace_id: "",
      marketplace_sku: ""
    },
    validate: {
      label: value => value ? null : l10n.permission_items.create.validation.label,
      marketplace_id: value => value ? null : l10n.permission_items.create.validation.marketplace_id,
      marketplace_sku: value => value ? null : l10n.permission_items.create.validation.marketplace_sku,
    }
  });

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(values => {
          setCreating(true);
          Create({label: values.label, type: values.type, marketplaceId: values.marketplace_id, marketplaceSKU: values.marketplace_sku})
            .catch(error => {
              rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
              setCreating(false);
            })
            .then(() => {
              modals.closeAll();
            });
        })}
      >
        <Select
          {...l10n.permission_items.create.type}
          {...form.getInputProps("type")}
          disabled
          mb="md"
          data={[{label: "Owned Item", value: "owned_item"}]}
        />
        <TextInput
          data-autofocus
          mb="md"
          {...l10n.permission_items.create.label}
          {...form.getInputProps("label")}
        />
        <Select
          withinPortal
          mb="md"
          {...l10n.permission_items.create.marketplace}
          {...form.getInputProps("marketplace_id")}
          data={marketplaces.map(marketplace => ({label: marketplace.brandedName || marketplace.name, value: marketplace.objectId}))}
        />
        <MarketplaceItemSelect
          key={form.values.marketplaceId}
          marketplaceId={form.values.marketplace_id}
          useBasicInput
          componentProps={{
            withBorder: false,
            p: 0,
            pt: 0,
            pb: 0,
            mb:0
          }}
          inputProps={{
            withinPortal: true,
            mb: form.values.marketplace_sku ? "xs" : 0,
            ...l10n.permission_items.create.marketplace_sku,
            ...form.getInputProps("marketplace_sku")
          }}
        />
        <Group mt="md">
          <Button
            w="100%"
            loading={creating}
            type="submit"
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </form>
    </Container>
  );
};

const PermissionSetPermissionItems = observer(() => {
  const { permissionSetId } = useParams();

  const permissionSet = permissionSetStore.permissionSets[permissionSetId];

  useEffect(() => {
    marketplaceStore.LoadMarketplaces();
  }, []);

  if(!permissionSet) { return null; }

  const info = permissionSet?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.permission_set.form;
  const inputProps = {
    store: permissionSetStore,
    objectId: permissionSetId,
    category: l10n.categories.permission_items,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || permissionSet.name || "Permission Set"} - ${l10n.categories.permission_items}`}
      section="permissionSet"
      useHistory
    >
      <Inputs.ReferenceTable
        {...inputProps}
        {...l10n.permission_items.permission_items}
        field="permission_items"
        fieldLabel={l10n.categories.permission_item}
        nameField="label"
        filterable
        filterFields={["label", "description"]}
        AddItem={async () => {
          return new Promise((resolve) => {
            modals.open({
              title: LocalizeString(l10n.permission_items.create.title),
              centered: true,
              onCancel: () => resolve(),
              children:
                <CreatePermissionSetItemForm
                  Create={async ({label, marketplaceId, marketplaceSKU}) => {
                    const id = permissionSetStore.CreatePermissionItem({
                      label,
                      page: location.pathname,
                      permissionSetId,
                      marketplaceId,
                      marketplaceSKU
                    });

                    modals.closeAll();

                    resolve(id);
                  }}
                />
            });
          });
        }}
        columns={[
          {
            accessor: "label",
            sortable: true,
            title: l10n.permission_item.label.label
          },
          {
            accessor: "description",
            title: l10n.permission_item.description.label
          },
          {
            accessor: "priority",
            sortable: true,
            title: l10n.permission_item.priority.label,
            centered: true
          },
        ]}
      />
    </PageContent>
  );
});

export default PermissionSetPermissionItems;
