import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";
import Clone from "lodash/clone";
import {GenerateUUID} from "@/helpers/Misc.js";
import UrlJoin from "url-join";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {PermissionItemOwnedSpec, PermissionSetSpec} from "@/specs/PermissionSetSpecs.js";

class PermissionSetStore {
  allPermissionSets;
  permissionSets = {};

  ID_PREFIXES = {
    "permission_item_owned": "prmo",
  };

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  LoadPermissionSets = flow(function * (force=false) {
    if(this.allPermissionSets && !force) { return; }

    this.allPermissionSets = yield this.rootStore.databaseStore.GetCollection({collection: "permissionSets"});
  });

  LoadPermissionSet = flow(function * ({permissionSetId, force=false}) {
    if(this.permissionSets[permissionSetId] && !force) { return; }

    yield this.LoadPermissionSets();

    const info = this.allPermissionSets.find(permissionSet => permissionSet.objectId === permissionSetId);

    const libraryId = yield this.rootStore.LibraryId({objectId: permissionSetId});

    yield this.rootStore.mediaCatalogStore.LoadMediaCatalogs();
    yield this.rootStore.marketplaceStore.LoadMarketplaces();

    yield Promise.all(
      this.rootStore.mediaCatalogStore.allMediaCatalogs.map(async ({objectId}) =>
        await this.rootStore.mediaCatalogStore.LoadMediaCatalog({mediaCatalogId: objectId})
      )
    );

    this.permissionSets[permissionSetId] = {
      ...info,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: permissionSetId,
          metadataSubtree: "public",
          produceLinkUrls: true
        }))
      }
    };
  });


  CreatePermissionSet = flow(function * ({name="New Permission Set"}) {
    const libraryId = this.rootStore.tenantInfo.propertiesLibraryId;
    const response = yield this.client.CreateAndFinalizeContentObject({
      libraryId,
      options: {
        type: this.rootStore.typeInfo.permissionSet
      },
      callback: async ({objectId, writeToken}) => {
        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadata: {
            public: {
              name: `Permission Set - ${name}`,
              asset_metadata: {
                info: {
                  ...PermissionSetSpec,
                  id: objectId,
                  name
                }
              }
            }
          }
        });
      }
    });

    const objectId = response.id;

    yield this.client.SetPermission({objectId, permission: "listable"});

    yield this.rootStore.databaseStore.AddGroupPermissions({objectId});

    yield Promise.all([
      this.UpdateDatabaseRecord({objectId}),
      this.LoadPermissionSet({permissionSetId: objectId}),
    ]);

    yield this.LoadPermissionSets(true);

    return objectId;
  });

  CreatePermissionItem({page, permissionSetId, label}) {
    let id = `${this.ID_PREFIXES["permission_item_owned"]}${GenerateUUID()}`;

    const spec = Clone(PermissionItemOwnedSpec);
    spec.id = id;
    spec.label = label || spec.label;

    this.AddField({
      objectId: permissionSetId,
      page,
      path: "/public/asset_metadata/info/permission_items",
      field: id,
      value: spec,
      category: this.PermissionItemCategory({permissionSetId, permissionItemId: id, label}),
      label: spec.label
    });

    return id;
  }

  PermissionItemCategory({permissionSetId, permissionItemId, label}) {
    return () => {
      label = this.GetMetadata({objectId: permissionSetId, path: UrlJoin("/public/asset_metadata/info/permission_items", permissionItemId), field: "label"}) || label;
      return LocalizeString(this.rootStore.l10n.pages.permission_set.form.categories.permission_item_label, { label: label });
    };
  }

  Reload = flow(function * ({objectId}) {
    yield this.LoadPermissionSet({permissionSetId: objectId, force: true});
  });

  UpdateDatabaseRecord = flow(function * ({objectId}) {
    yield this.rootStore.databaseStore.SavePermissionSet({permissionSetId: objectId});
  });

  DeployedHash({environment, permissionSetId}) {
    return this.rootStore.tenantStore[`tenant${environment.capitalize()}`]?.permissionSets?.[permissionSetId]?.versionHash;
  }

  get client() {
    return this.rootStore.client;
  }

  get utils() {
    return this.rootStore.utils;
  }

  get l10n() {
    return this.rootStore.l10n;
  }

  get logLevels() {
    return this.rootStore.logLevels;
  }

  DebugLog() {
    this.rootStore.DebugLog(...arguments);
  }
}

AddActions(PermissionSetStore, "permissionSets");

export default PermissionSetStore;

