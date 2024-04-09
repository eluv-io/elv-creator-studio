import {observer} from "mobx-react-lite";
import Inputs from "@/components/inputs/Inputs";
import {permissionSetStore} from "@/stores/index.js";

const PermissionItemSelect = observer(({permissionSetIds=[], defaultFirst, multiple=false, ...inputProps}) => {
  const permissionItems = Object.values(permissionSetStore.allPermissionItems || {})
    .filter(permissionItem => permissionSetIds.includes(permissionItem.permissionSetId))
    .map(permissionItem => ({
      label: permissionItem.label || permissionItem.id,
      value: permissionItem.id
    }));

  if(!permissionItems) { return null; }

  if(multiple) {
    return (
      <Inputs.MultiSelect
        options={permissionItems}
        {...inputProps}
      />
    );
  }

  return (
    <Inputs.Select
      options={permissionItems}
      defaultValue={defaultFirst ? permissionItems?.[0]?.value : undefined}
      {...inputProps}
    />
  );
});

export default PermissionItemSelect;
