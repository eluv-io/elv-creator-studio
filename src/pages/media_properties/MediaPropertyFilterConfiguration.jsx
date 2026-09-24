import Inputs from "@/components/inputs/Inputs.jsx";
import {MediaPropertySearchFilterSpec, MediaPropertySearchSecondaryFilterSpec} from "@/specs/MediaPropertySpecs.js";
import {useParams} from "react-router-dom";
import {mediaPropertyStore, rootStore} from "@/stores/index.js";
import {observer} from "mobx-react-lite";

const MediaPropertyFilterConfiguration = observer(({metadata, inputProps}) => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const l10n = rootStore.l10n.pages.media_property.form;
  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const attributes = mediaPropertyStore.GetMediaPropertyAttributes({mediaPropertyId});

  return (
    <>
      <Inputs.Select
        {...inputProps}
        {...l10n.general.search.primary_filter}
        field="primary_filter"
        searchable
        defaultValue=""
        options={[
          {label: "None", value: ""},
          {label: "Media Type", value: "__media-type"},
          {label: "Schedule Status", value: "__schedule"},
          ...(Object.keys(attributes).map(attributeId => ({
            label: attributes[attributeId].title || "Attribute",
            value: attributeId
          })))
        ]}
      />
      {
        !metadata?.primary_filter ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.general.search.primary_filter_style}
            field="primary_filter_style"
            defaultValue="box"
            options={[
              {label: "Box", value: "box"},
              {label: "Text", value: "text"},
              {label: "Image", value: "image"},
            ]}
          />
      }
      {
        metadata?.primary_filter_style !== "image" ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.general.search.primary_filter_card_theme}
            field="primary_filter_card_theme_id"
            defaultValue=""
            options={[
              { label: "Default", value: ""},
              ...(Object.keys(info?.styling?.card_themes || {}))
                .map(cardThemeId => ({
                  label: info.styling.card_themes[cardThemeId].label || "Theme",
                  value: cardThemeId
                }))
            ]}
          />
      }

      {
        !metadata?.primary_filter ? null :
          <Inputs.List
            {...inputProps}
            {...l10n.general.search.filter_options}
            field="filter_options"
            newItemSpec={MediaPropertySearchFilterSpec}
            renderItem={(props) => {
              const attributeValues =
                metadata.primary_filter === "__media-type" ?
                  ["Video", "Gallery", "Image", "Ebook"] :
                  metadata.primary_filter === "__schedule" ?
                    ["Live", "Upcoming", "VOD"] :
                    attributes[metadata.primary_filter]?.tags || [];

              return (
                <>
                  <Inputs.Select
                    {...props}
                    {...l10n.general.search.filter_option.primary_filter_value}
                    field="primary_filter_value"
                    searchable
                    defaultValue=""
                    options={[
                      {label: "All", value: ""},
                      ...attributeValues.map(tag => ({
                        label: tag || "",
                        value: tag
                      }))
                    ]}
                  />
                  {
                    metadata?.primary_filter_style !== "image" ? null :
                      <Inputs.ImageInput
                        {...props}
                        {...l10n.general.search.filter_option.images}
                        fields={[
                          { ...l10n.general.search.filter_option.primary_filter_image, field: "primary_filter_image", baseSize: 125 },
                          { ...l10n.general.search.filter_option.primary_filter_image_tv, field: "primary_filter_image_tv", baseSize: 125 }
                        ]}
                      />
                  }
                  <Inputs.Select
                    {...props}
                    {...l10n.general.search.filter_option.secondary_filter_attribute}
                    field="secondary_filter_attribute"
                    searchable
                    defaultValue=""
                    options={
                      [
                        {label: "None", value: ""},
                        {label: "Media Type", value: "__media-type"},
                        {label: "Schedule Status", value: "__schedule"},
                        ...(Object.keys(attributes).map(attributeId => ({
                          label: attributes[attributeId].title || "Attribute",
                          value: attributeId
                        })))
                      ].filter(({value}) => metadata.primary_filter !== value)
                    }
                  />

                  {
                    !props.item.secondary_filter_attribute ? null :
                      <>
                        <Inputs.Select
                          {...props}
                          {...l10n.general.search.filter_option.secondary_filter_style}
                          field="secondary_filter_style"
                          defaultValue="box"
                          options={[
                            {label: "Box", value: "box"},
                            {label: "Text", value: "text"},
                            {label: "Image", value: "image", disabled: props.item.secondary_filter_options.length === 0},
                          ]}
                        />
                        {
                          props.item?.secondary_filter_style !== "image" ? null :
                            <Inputs.Select
                              {...props}
                              {...l10n.general.search.filter_option.secondary_filter_card_theme}
                              field="secondary_filter_card_theme_id"
                              defaultValue=""
                              options={[
                                { label: "Default", value: ""},
                                ...(Object.keys(info?.styling?.card_themes || {}))
                                  .map(cardThemeId => ({
                                    label: info.styling.card_themes[cardThemeId].label || "Theme",
                                    value: cardThemeId
                                  }))
                              ]}
                            />
                        }
                        <Inputs.List
                          {...props}
                          {...l10n.general.search.filter_option.secondary_filter_options}
                          field="secondary_filter_options"
                          newItemSpec={MediaPropertySearchSecondaryFilterSpec}
                          renderItem={(secondaryFilterProps) => {
                            const secondaryAttributeValues =
                              props.item.secondary_filter_attribute === "__media-type" ?
                                ["Video", "Gallery", "Image", "Ebook"] :
                                props.item.secondary_filter_attribute === "__schedule" ?
                                  ["Live", "Upcoming", "VOD"] :
                                  attributes[props.item.secondary_filter_attribute]?.tags || [];

                            return (
                              <>
                                <Inputs.Select
                                  {...secondaryFilterProps}
                                  {...l10n.general.search.filter_option.secondary_filter_value}
                                  field="secondary_filter_value"
                                  searchable
                                  defaultValue=""
                                  options={[
                                    {label: "All", value: ""},
                                    ...secondaryAttributeValues.map(tag => ({
                                      label: tag || "",
                                      value: tag
                                    }))
                                  ]}
                                />
                                {
                                  props.item.secondary_filter_style !== "image" ? null :
                                    <Inputs.ImageInput
                                      {...secondaryFilterProps}
                                      {...l10n.general.search.filter_option.images}
                                      fields={[
                                        { ...l10n.general.search.filter_option.secondary_filter_image, field: "secondary_filter_image", baseSize: 125 },
                                        { ...l10n.general.search.filter_option.secondary_filter_image_tv, field: "secondary_filter_image_tv", baseSize: 125 }
                                      ]}
                                    />
                                }
                              </>
                            );
                          }}
                        />
                      </>
                  }
                </>
              );
            }}
          />
      }
    </>
  );
});

export default MediaPropertyFilterConfiguration;
