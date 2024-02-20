import {observer} from "mobx-react-lite";
import Inputs from "@/components/inputs/Inputs.jsx";
import {useParams} from "react-router-dom";
import {mediaCatalogStore} from "@/stores/index.js";

const MediaItemSharedItemFields = observer(({type, l10n, inputProps}) => {
  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  return (
    <>
      <Inputs.Text
        {...inputProps}
        {...l10n.media.id}
        disabled
        field="id"
      />

      {
        type !== "media" ? null :
          <Inputs.Text
            {...inputProps}
            {...l10n.media.media_type}
            disabled
            field="media_type"
          />
      }

      <Inputs.Text
        {...inputProps}
        {...l10n.media.catalog_title}
        field="catalog_title"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media.title}
        field="title"
      />

      <Inputs.List
        {...inputProps}
        {...l10n.media.headers}
        field="headers"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media.subtitle}
        field="subtitle"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.media.description}
        field="description"
      />

      <Inputs.RichText
        {...inputProps}
        {...l10n.media.description_rich_text}
        field="description_rich_text"
      />

      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.media.tags}
        disabled={(info.tags || []).length === 0}
        field="tags"
        options={info.tags || []}
      />
    </>
  );
});

export default MediaItemSharedItemFields;
