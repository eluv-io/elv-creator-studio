import {observer} from "mobx-react-lite";
import {MultiSelect as MantineMultiselect, Select as MantineSelect} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import {permissionSetStore} from "@/stores/index.js";

const PermissionItemSelect = observer(({permissionSetIds=[], defaultFirst, multiple=false, connectedInput=true, ...inputProps}) => {
  let permissionItems = Object.values(permissionSetStore.allPermissionItems || {})
    .filter(permissionItem => permissionSetIds.includes(permissionItem.permissionSetId))
    .map(permissionItem => ({
      label: permissionItem.label || permissionItem.id,
      value: permissionItem.id
    }));

  if(!permissionItems) { return null; }

  if(multiple) {
    if(connectedInput) {
      return (
        <Inputs.MultiSelect
          searchable
          options={permissionItems}
          {...inputProps}
        />
      );
    } else {
      return (
        <MantineMultiselect
          searchable
          data={permissionItems}
          {...inputProps}
        />
      );
    }
  }

  if(!defaultFirst) {
    permissionItems.unshift({label: "<Select Permission Item>", value: ""});
  }

  if(connectedInput) {
    return (
      <Inputs.Select
        options={permissionItems}
        searchable
        defaultValue={defaultFirst ? permissionItems?.[0]?.value : undefined}
        {...inputProps}
      />
    );
  } else {
    return (
      <MantineSelect
        data={permissionItems}
        searchable
        {...inputProps}
      />
    );
  }
});

export default PermissionItemSelect;
