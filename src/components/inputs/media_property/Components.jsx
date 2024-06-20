import {observer} from "mobx-react-lite";
import UrlJoin from "url-join";
import {Stack} from "@mantine/core";
import {rootStore} from "@/stores/index.js";
import Inputs from "@/components/inputs/Inputs.jsx";

const ColorOptions = observer(({
  includeTextField,
  includeIcon,
  defaultValues={},
  ...inputProps
}) => {
  const path = UrlJoin(inputProps.path, inputProps.field);

  return (
    <Inputs.InputWrapper {...inputProps} maw={300} mb={0}>
      <Stack mt="md" spacing={5}>
        {
          !includeTextField ? null :
            <Inputs.Text
              {...inputProps}
              {...rootStore.l10n.pages.media_property.form.theme.text}
              path={path}
              field="text"
              defaultValue={defaultValues["text"]}
              componentProps={{mb: 0}}
            />
        }
        <Inputs.Color
          {...inputProps}
          {...rootStore.l10n.pages.media_property.form.theme.colors.background_color}
          path={path}
          field="background_color"
          defaultValue={defaultValues["background_color"]}
          componentProps={{mb: 0}}
        />
        <Inputs.Color
          {...inputProps}
          {...rootStore.l10n.pages.media_property.form.theme.colors.text_color}
          path={path}
          field="text_color"
          defaultValue={defaultValues["text_color"]}
          componentProps={{mb: 0}}
        />
        <Inputs.Color
          {...inputProps}
          {...rootStore.l10n.pages.media_property.form.theme.colors.border_color}
          path={path}
          field="border_color"
          defaultValue={defaultValues["border_color"]}
          componentProps={{mb: 0}}
        />
        <Inputs.Integer
          {...inputProps}
          {...rootStore.l10n.pages.media_property.form.theme.border_radius}
          path={path}
          field="border_radius"
          defaultValue={defaultValues["border_radius"]}
          min={0}
          componentProps={{mb: includeIcon ? "md" : 0}}
        />
        {
          !includeIcon ? null :
            <Inputs.SingleImageInput
              {...inputProps}
              {...rootStore.l10n.pages.media_property.form.theme.icon}
              path={path}
              field="icon"
            />
        }
      </Stack>
    </Inputs.InputWrapper>
  );
});

export default ColorOptions;
