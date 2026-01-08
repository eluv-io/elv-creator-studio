import {observer} from "mobx-react-lite";
import {rootStore, uiStore} from "@/stores/index.js";
import Inputs from "@/components/inputs/Inputs.jsx";
import {PocketBumperSpec} from "@/specs/PocketSpecs.js";

export const PocketBumpers = observer(({inputProps}) => {
  const l10n = rootStore.l10n.pages.pocket.form;
  return (
    <>
      <Inputs.List
        {...inputProps}
        {...l10n.bumpers.bumpers}
        field="bumpers"
        subcategory={l10n.categories.bumpers}
        newItemSpec={PocketBumperSpec}
        renderItem={props =>
          <>
            <Inputs.UUID
              {...props}
              {...l10n.common.id}
              hidden
              field="id"
            />
            <Inputs.Text
              {...props}
              {...l10n.common.label}
              field="label"
            />
            <Inputs.Select
              {...props}
              {...l10n.bumpers.position}
              defaultValue="before"
              field="position"
              options={[
                { label: "Before", value: "before" },
                { label: "After", value: "after" }
              ]}
            />
            <Inputs.Checkbox
              {...props}
              {...l10n.bumpers.free_only}
              defaultValue={false}
              field="free_only"
            />
            <Inputs.FabricBrowser
              {...props}
              {...l10n.bumpers.video}
              field="video"
              fabricBrowserProps={{
                video: true,
                allowCompositions: true,
                allowClips: true
              }}
              previewable
              previewOptions={{
                controls: false,
                autoplay: true
              }}
            />
            <Inputs.ImageInput
              {...props}
              {...l10n.bumpers.images}
              componentProps={{w: uiStore.inputWidthWide}}
              altTextField="background_alt"
              fields={[
                { field: "background", aspectRatio: 3/2, ...l10n.bumpers.background },
                { field: "background_mobile", aspectRatio: 1, ...l10n.bumpers.background_mobile },
              ]}
            />
            {
              props.item.video ? null :
                <Inputs.Integer
                  {...props}
                  {...l10n.bumpers.duration}
                  min={0}
                  field="duration"
                />
            }
            <Inputs.URL
              {...props}
              {...l10n.bumpers.link}
              field="link"
            />
          </>
        }
      />
    </>
  );
});
