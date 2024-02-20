import {observer} from "mobx-react-lite";
import {Link, useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Flex, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import UrlJoin from "url-join";
import {IconExternalLink} from "@tabler/icons-react";

const MediaCatalogTags = observer(() => {
  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: l10n.categories.tags,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - Tags`}
      section="mediaCatalog"
      useHistory
    >
      <Inputs.List
        {...inputProps}
        {...l10n.tags.tags}
        sortable={false}
        simpleList
        field="tags"
        renderItem={props => {
          const tag = info.tags[props.index];
          return (
            <Flex align="center" gap="md">
              <Inputs.Text
                {...inputProps}
                actionLabel={l10n.tags.tags.fieldLabel}
                path="/public/asset_metadata/info/tags"
                field={props.index.toString()}
                componentProps={{
                  mb: 0,
                  style: {flexGrow: 1}
                }}
              />
              {
                !tag ? null :
                  <IconButton
                    label={LocalizeString(l10n.tags.view, {tag})}
                    component={Link}
                    to={UrlJoin("/media-catalogs", mediaCatalogId, `media?tags=${tag}`)}
                    color="blue.5"
                    Icon={IconExternalLink}
                  />
              }
            </Flex>
          );
        }}
      />

    </PageContent>
  );
});

export default MediaCatalogTags;
