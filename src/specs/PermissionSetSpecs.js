const PermissionItemBaseSpec = {
  id: undefined,
  label: "",
  title: "",
  subtitle: "",
  description: "",
  permissions: {},
  display: {
    title: "",
    subtitle: "",
    headers: [],
    description: "",
    thumbnail_image_portrait: undefined
  }
};

export const PermissionItemOwnedSpec = {
  ...PermissionItemBaseSpec,
  type: "owned_item",
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
