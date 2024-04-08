import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, permissionSetStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";

const PermissionSetGeneralSettings = observer(() => {
  const { permissionSetId } = useParams();

  const permissionSet = permissionSetStore.permissionSets[permissionSetId];

  if(!permissionSet) { return null; }

  const info = permissionSet?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.permission_set.form;
  const inputProps = {
    store: permissionSetStore,
    objectId: permissionSetId,
    category: l10n.categories.general,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || permissionSet.name || "Permission Set"} - General`}
      section="permissionSet"
      useHistory
    >
      <Inputs.Text
        {...inputProps}
        {...l10n.common.name}
        field="name"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.common.description}
        field="description"
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.image}
        fields={[
          { field: "image", aspectRatio: 1 },
        ]}
      />
    </PageContent>
  );
});

export default PermissionSetGeneralSettings;
