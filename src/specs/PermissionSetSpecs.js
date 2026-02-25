const PermissionItemDisplaySpec = {
  title: "",
  subtitle: "",
  description: ""
};

const PermissionItemBaseSpec = {
  id: undefined,
  label: "",
  alternate_displays: [],
  ...PermissionItemDisplaySpec
};

export const PermissionItemOwnedSpec = {
  ...PermissionItemBaseSpec,
  type: "owned_item",
  marketplace_id: undefined,
  marketplace_sku: undefined
};

export const PermissionItemLinkSpec = {
  ...PermissionItemBaseSpec,
  type: "external",
  link: "",
  price: {}
};

export const PermissionItemAlternateDisplaySpec = {
  id: undefined,
  permission_item_id: "",
  ...PermissionItemDisplaySpec
};

export const PermissionSetSpec = {
  id: undefined,
  name: "",
  description: "",
  image: undefined,
  permission_items: {}
};
