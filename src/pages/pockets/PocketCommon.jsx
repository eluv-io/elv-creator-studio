import {observer} from "mobx-react-lite";
import {Title} from "@mantine/core";
import {rootStore, uiStore} from "@/stores/index.js";
import Inputs from "@/components/inputs/Inputs.jsx";
import UrlJoin from "url-join";

export const PocketPostContentScreenSettings = observer(({info, inputProps, subtitle}) => {
  const l10n = rootStore.l10n.pages.pocket.form;
  return (
    <>
      <Title order={3} fw={500} mt={50} maw={uiStore.inputWidth} mb={subtitle ? 0 : "md"}>{l10n.categories.post_content_screen}</Title>
      {
        !subtitle ? null :
          <Title order={6} fw={400} color="gray.6" maw={uiStore.inputWidth} mb="md">{subtitle}</Title>
      }

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.post_content_screen_toggle}
        path={UrlJoin(inputProps.path, "post_content_screen")}
        subcategory={l10n.categories.post_content_screen_toggle}
        field="enabled"
      />

      {
        !info.post_content_screen?.enabled ? null :
          <>
            <Inputs.ImageInput
              {...inputProps}
              {...l10n.general.post_content_screen_images}
              path={UrlJoin(inputProps.path, "post_content_screen")}
              subcategory={l10n.categories.post_content_screen}
              componentProps={{maw: uiStore.inputWidthWide}}
              altTextField="background_alt"
              fields={[
                { field: "background", aspectRatio: 3/2, ...l10n.general.post_content_screen_background },
                { field: "background_mobile", aspectRatio: 1, ...l10n.general.post_content_screen_background_mobile },
              ]}
            />

            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.general.post_content_screen_video}
              path={UrlJoin(inputProps.path, "post_content_screen")}
              subcategory={l10n.categories.post_content_screen}
              field="video"
              previewable
              previewOptions={{
                controls: false,
                autoplay: true
              }}
            />

            <Inputs.URL
              {...inputProps}
              {...l10n.general.post_content_screen_link}
              path={UrlJoin(inputProps.path, "post_content_screen")}
              subcategory={l10n.categories.post_content_screen}
              field="link"
            />
          </>
      }
    </>
  );
});
