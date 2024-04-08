const PermissionItemBaseSpec = {
  id: undefined,
  label: "",
  title: "",
  subtitle: "",
  description: "",
  image: undefined,
  permissions: {}
};

export const PermissionItemOwnedSpec = {
  ...PermissionItemBaseSpec,
  marketplace_id: undefined,
  marketplace_sku: undefined
};

export const PermissionSetSpec = {
  id: undefined,
  name: "",
  description: "",
  image: undefined,
  permission_items: {}
};
