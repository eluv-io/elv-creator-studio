import {observer} from "mobx-react-lite";
import UrlJoin from "url-join";
import {Stack} from "@mantine/core";
import {rootStore} from "@/stores/index.js";
import Inputs from "@/components/inputs/Inputs.jsx";

const ColorOptions = observer(({
  includeTextField,
  includeIcon,
  defaultValues={},
  placeholders={},
  ...wrapperProps
}) => {
  const path = UrlJoin(wrapperProps.path, wrapperProps.field);

  const inputProps = {
    ...wrapperProps,
    description: undefined,
    hint: undefined
  };

  return (
    <Inputs.InputWrapper maw={300} mb="md" {...wrapperProps}>
      <Stack mt="md" spacing={5}>
        {
          !includeTextField ? null :
            <Inputs.Text
              {...inputProps}
              {...rootStore.l10n.pages.media_property.form.theme.text}
              path={path}
              field="text"
              defaultValue={defaultValues["text"]}
              placeholder={placeholders["text"]}
              componentProps={{mb: 0}}
            />
        }
        <Inputs.Color
          {...inputProps}
          {...rootStore.l10n.pages.media_property.form.theme.colors.text_color}
          path={path}
          field="text_color"
          defaultValue={defaultValues["text_color"]}
          placeholder={placeholders["text_color"]}
          componentProps={{mb: 0}}
        />
        <Inputs.Color
          {...inputProps}
          {...rootStore.l10n.pages.media_property.form.theme.colors.background_color}
          path={path}
          field="background_color"
          defaultValue={defaultValues["background_color"]}
          placeholder={placeholders["background_color"]}
          componentProps={{mb: 0}}
        />
        <Inputs.Color
          {...inputProps}
          {...rootStore.l10n.pages.media_property.form.theme.colors.border_color}
          path={path}
          field="border_color"
          defaultValue={defaultValues["border_color"]}
          placeholder={placeholders["border_color"]}
          componentProps={{mb: 0}}
        />
        <Inputs.Integer
          {...inputProps}
          {...rootStore.l10n.pages.media_property.form.theme.border_radius}
          path={path}
          field="border_radius"
          defaultValue={defaultValues["border_radius"]}
          placeholder={placeholders["border_radius"]}
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
