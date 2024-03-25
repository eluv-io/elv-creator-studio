import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Paper, Button, Group, Container, TextInput, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import {useForm} from "@mantine/form";
import {modals} from "@mantine/modals";
import UrlJoin from "url-join";
import Set from "lodash/set";
import {Slugify} from "@/components/common/Validation.jsx";

const CreateTagForm = ({Create}) => {
  const l10n = rootStore.l10n.pages.media_catalog.form;

  const form = useForm({
    initialValues: {
      tag: "",
    },
    validate: {
      tag: value => value ? null : l10n.tags.create.validation
    }
  });

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(async values => {
          await Create({tag: values.tag});
          modals.closeAll();
        })}
      >
        <TextInput
          data-autofocus
          mb="md"
          {...l10n.tags.create.tag}
          {...form.getInputProps("tag")}
        />
        <Group mt="md">
          <Button
            w="100%"
            type="submit"
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </form>
    </Container>
  );
};

const CreateAttributeForm = ({attributes, Create}) => {
  const l10n = rootStore.l10n.pages.media_catalog.form;

  const form = useForm({
    initialValues: {
      id: "",
      title: ""
    },
    validate: {
      id: value => {
        value = value || Slugify(form.values.title);
        if(!value) {
          return l10n.attributes.create.validation.id;
        } else if(attributes[value]) {
          return l10n.attributes.create.validation.id_unique;
        }
      },
      title: value => value ? undefined : l10n.attributes.create.validation.title
    }
  });

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(async values => {
          await Create({id: values.id || Slugify(values.title), title: values.title});
          modals.closeAll();
        })}
      >
        <TextInput
          data-autofocus
          mb="md"
          {...l10n.attributes.create.title}
          {...form.getInputProps("title")}
        />
        <TextInput
          mb="md"
          {...l10n.attributes.create.id}
          {...form.getInputProps("id")}
          placeholder={Slugify(form.values.title)}
        />
        <Group mt="md">
          <Button
            w="100%"
            type="submit"
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </form>
    </Container>
  );
};

const TagsTable = observer(({
  mediaCatalogId,
  tags,
  inputProps
}) => {
  const l10n = rootStore.l10n.pages.media_catalog.form;
  const sortedTags = [...tags].sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);

  const pathComponents = UrlJoin(inputProps.path, "tags").replace(/^\//, "").replace(/\/$/, "").split("/");

  return (
    <>
      <Inputs.List
        {...inputProps}
        {...l10n.tags.tags}
        filterable
        sortable
        simpleList
        field="tags"
        AddItem={async () => {
          return new Promise((resolve) => {
            modals.open({
              title: l10n.tags.create.title,
              centered: true,
              onCancel: () => resolve(),
              children: <CreateTagForm Create={({tag}) => resolve(tag)} />
            });
          });
        }}
        renderItem={props =>
          <Paper withBorder px="xs" py={5} fz="sm" bg="gray.1">
            { tags[props.index] }
          </Paper>
        }
        maw={400}
        miw={400}
      />
      <Group position="right" maw={400}>
        <Button
          disabled={JSON.stringify(tags) === JSON.stringify(sortedTags)}
          variant="outline"
          size="xs"
          onClick={() => {
            mediaCatalogStore.ApplyAction({
              ...inputProps,
              actionType: "CUSTOM",
              changelistLabel: l10n.tags.alphabetize,
              objectId: mediaCatalogId,
              page: location.pathname,
              label: l10n.tags.tags.label,
              Apply: () => Set(mediaCatalogStore.mediaCatalogs[mediaCatalogId].metadata, pathComponents, sortedTags),
              Undo: () => Set(mediaCatalogStore.mediaCatalogs[mediaCatalogId].metadata, pathComponents, tags),
              Write: async (objectParams) =>{
                await mediaCatalogStore.client.ReplaceMetadata({
                  ...objectParams,
                  metadataSubtree: UrlJoin(inputProps.path, "tags"),
                  metadata: sortedTags
                });
              }
            });
          }}
        >
          { l10n.tags.alphabetize }
        </Button>
      </Group>
    </>
  );
});

const AttributesTable = observer(({mediaCatalogId, info}) => {
  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: l10n.categories.attributes,
    path: "/public/asset_metadata/info"
  };

  return (
    <Inputs.ReferenceTable
      {...inputProps}
      {...l10n.attributes.attributes}
      field="attributes"
      nameField="title"
      filterable
      filterFields={["title"]}
      AddItem={async () => {
        return new Promise((resolve) => {
          modals.open({
            title: l10n.attributes.create.form_title,
            centered: true,
            onCancel: () => resolve(),
            children:
              <CreateAttributeForm
                attributes={info.attributes || {}}
                Create={async ({id, title}) => {
                  mediaCatalogStore.CreateAttribute({
                    page: location.pathname,
                    mediaCatalogId,
                    id,
                    title
                  });

                  resolve(id);
                }}
              />
          });
        });
      }}
      columns={[
        {
          accessor: "title",
          sortable: true,
          title: l10n.attributes.title.label
        },
        {
          accessor: "tags",
          title: l10n.attributes.tags.label,
          render: attribute => attribute.tags?.length || 0
        }
      ]}
    />
  );
});

export const MediaCatalogAttribute = observer(() => {
  const { mediaCatalogId, attributeId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const attribute = info.attributes?.[attributeId];

  if(!attribute) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: l10n.categories.attributes,
    subcategory: mediaCatalogStore.MediaItemCategory({
      category: "attribute_label",
      type: "attributes",
      mediaCatalogId,
      id: attributeId,
      title: attribute.title
    }),
    path: UrlJoin("/public/asset_metadata/info/attributes", attributeId)
  };

  return (
    <PageContent
      backLink={UrlJoin("/media-catalogs", mediaCatalogId, "tags")}
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - Attributes - ${attribute.title || ""}`}
      section="mediaCatalog"
      useHistory
    >
      <Inputs.Text
        {...l10n.common.id}
        {...inputProps}
        disabled
        field="id"
      />
      <Inputs.Text
        {...l10n.attributes.title}
        {...inputProps}
        field="title"
      />

      <Title order={4} mt={50}>{l10n.tags.tags.label}</Title>
      <TagsTable
        mediaCatalogId={mediaCatalogId}
        tags={[...(attribute.tags || [])]}
        inputProps={inputProps}
      />
    </PageContent>
  );
});

const MediaCatalogTags = observer(() => {
  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};
  const l10n = rootStore.l10n.pages.media_catalog.form;

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - ${l10n.categories.tags_and_attributes}`}
      section="mediaCatalog"
      useHistory
    >

      <Title order={3} mb="md">{l10n.attributes.attributes.label}</Title>
      <AttributesTable mediaCatalogId={mediaCatalogId} info={info} />

      <Title order={3} mb="md" mt={50}>{l10n.tags.tags.label}</Title>
      <TagsTable
        mediaCatalogId={mediaCatalogId}
        tags={[...(info.tags || [])]}
        inputProps={{
          store: mediaCatalogStore,
          objectId: mediaCatalogId,
          category: l10n.categories.tags,
          path: "/public/asset_metadata/info"
        }}
      />
    </PageContent>
  );
});

export default MediaCatalogTags;
