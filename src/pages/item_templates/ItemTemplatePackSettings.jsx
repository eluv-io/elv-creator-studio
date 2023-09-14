import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, itemTemplateStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js";

const ItemTemplatePackSettings = observer(() => {
  const { itemTemplateId } = useParams();

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];

  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};
  const packOptions = info.pack_options || {};

  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    category: l10n.categories.pack_settings,
    path: "/public/asset_metadata/nft/pack_options"
  };

  return (
    <PageContent
      title={`${info.display_name || itemTemplate.display_name || "Item Template"} - ${l10n.categories.pack_settings}`}
      section="itemTemplate"
      useHistory
    >
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.pack_options.is_openable}
        subcategory={l10n.categories.pack_settings}
        field="is_openable"
        defaultValue={false}
      />

      {
        !packOptions.is_openable ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.pack_options.generator}
              subcategory={l10n.categories.pack_settings}
              field="pack_generator"
              defaultValue="random"
              options={[
                { label: "Random", value: "random" },
                { label: "Preset", value: "preset" }
              ]}
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.pack_options.open_button_text}
              subcategory={l10n.categories.pack_settings}
              field="open_button_text"
            />

            <Title order={3} mt={50} mb="md">{l10n.categories.pack_open_status_page}</Title>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.pack_options.hide_info}
              subcategory={l10n.categories.pack_open_status_page}
              field="hide_text"
              defaultValue={false}
            />

            {
              packOptions.hide_text ? null :
                <>
                  <Inputs.Checkbox
                    {...inputProps}
                    {...l10n.pack_options.use_custom_open_text}
                    subcategory={l10n.categories.pack_open_status_page}
                    field="use_custom_open_text"
                    defaultValue={false}
                  />

                  {
                    !packOptions.use_custom_open_text ? null :
                      <>
                        <Inputs.Text
                          {...inputProps}
                          {...l10n.pack_options.minting_header}
                          subcategory={l10n.categories.pack_open_status_page}
                          path="/public/asset_metadata/nft/pack_options/minting_text"
                          field="minting_header"
                        />
                        <Inputs.Text
                          {...inputProps}
                          {...l10n.pack_options.minting_subheader1}
                          subcategory={l10n.categories.pack_open_status_page}
                          path="/public/asset_metadata/nft/pack_options/minting_text"
                          field="minting_subheader1"
                        />
                        <Inputs.TextArea
                          {...inputProps}
                          {...l10n.pack_options.minting_subheader2}
                          subcategory={l10n.categories.pack_open_status_page}
                          path="/public/asset_metadata/nft/pack_options/minting_text"
                          field="minting_subheader2"
                        />
                        <Inputs.Text
                          {...inputProps}
                          {...l10n.pack_options.reveal_header}
                          subcategory={l10n.categories.pack_open_status_page}
                          path="/public/asset_metadata/nft/pack_options/minting_text"
                          field="reveal_header"
                        />
                        <Inputs.Text
                          {...inputProps}
                          {...l10n.pack_options.reveal_subheader}
                          subcategory={l10n.categories.pack_open_status_page}
                          path="/public/asset_metadata/nft/pack_options/minting_text"
                          field="reveal_subheader"
                        />
                      </>
                  }
                </>
            }
            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.pack_options.open_animation}
              subcategory={l10n.categories.pack_open_status_page}
              field="open_animation"
              previewable
              previewIsAnimation
            />

            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.pack_options.open_animation_mobile}
              subcategory={l10n.categories.pack_open_status_page}
              field="open_animation_mobile"
              previewable
              previewIsAnimation
            />

            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.pack_options.reveal_animation}
              subcategory={l10n.categories.pack_open_status_page}
              field="reveal_animation"
              previewable
              previewOptions={{
                muted: EluvioPlayerParameters.muted.OFF_IF_POSSIBLE,
                autoplay: EluvioPlayerParameters.autoplay.ON,
                controls: EluvioPlayerParameters.controls.OFF_WITH_VOLUME_TOGGLE,
                loop: EluvioPlayerParameters.loop.OFF
              }}
            />

            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.pack_options.reveal_animation_mobile}
              subcategory={l10n.categories.pack_open_status_page}
              field="reveal_animation_mobile"
              previewable
              previewOptions={{
                muted: EluvioPlayerParameters.muted.OFF_IF_POSSIBLE,
                autoplay: EluvioPlayerParameters.autoplay.ON,
                controls: EluvioPlayerParameters.controls.OFF_WITH_VOLUME_TOGGLE,
                loop: EluvioPlayerParameters.loop.OFF
              }}
            />

            <Title order={3} mt={50} mb="md">{l10n.categories.pack_items}</Title>
            <Inputs.List
              {...inputProps}
              {...l10n.pack_options.item_slots}
              subcategory={l10n.categories.pack_items}
              field="item_slots"
              fields={[
                { field: "id", InputComponent: Inputs.UUID, hidden: true, ...l10n.common.id },
                { field: "name", InputComponent: Inputs.Text, ...l10n.common.name },
                {
                  ...l10n.pack_options.items,
                  field: "possible_items",
                  InputComponent: Inputs.List,
                  fields: [
                    { field: "id", InputComponent: Inputs.UUID, hidden: true, ...l10n.common.id },
                    { field: "nft", InputComponent: Inputs.FabricBrowser, ...l10n.pack_options.item_template },
                    { field: "probability", InputComponent: Inputs.Integer, ...l10n.pack_options.probability }
                  ]
                }
              ]}
            />
          </>
      }
    </PageContent>
  );
});

export default ItemTemplatePackSettings;
