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
  allowGradient,
  allowBorderWidth,
  ...wrapperProps
}) => {
  const path = UrlJoin(wrapperProps.path, wrapperProps.field);

  const inputProps = {
    ...wrapperProps,
    subcategory: wrapperProps.subcategory || wrapperProps.label,
    description: undefined,
    hint: undefined
  };

  const info = wrapperProps.store.GetMetadata({...inputProps});

  let exampleStyle = {
    width: "100%",
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none",
    fontSize: 18,
    color: info?.text_color || placeholders.text_color,
    backgroundColor: info?.background_color || placeholders.background_color,
    border: `${allowBorderWidth && typeof info?.border_width === "number" ? info?.border_width || 0 : 1}px solid ${info?.border_color || placeholders.border_color}`,
    borderRadius: typeof info?.border_radius === "number" ? info.border_radius : placeholders.border_radius || 0
  };

  if(info?.background_type === "gradient") {
    exampleStyle.background = `linear-gradient(${info.background_gradient_angle || 0}deg, ${info.background_color || placeholders["background_color"]}, ${info.background_color_2 || placeholders["background_color_2"]})`;
  }


  return (
    <Inputs.InputWrapper maw={300} mb="md" {...wrapperProps}>
      <Stack mt="md" spacing={5}>
        {
          !includeTextField ? null :
            <Inputs.Text
              {...inputProps}
              {...rootStore.l10n.components.button_config.text}
              localizable
              path={path}
              field="text"
              defaultValue={defaultValues["text"]}
              placeholder={placeholders["text"]}
              componentProps={{mb: 0}}
            />
        }
        <Inputs.Color
          {...inputProps}
          {...rootStore.l10n.components.button_config.text_color}
          path={path}
          field="text_color"
          defaultValue={defaultValues["text_color"]}
          placeholder={placeholders["text_color"]}
          componentProps={{mb: 0}}
        />
        {
          !allowGradient ? null :
            <Inputs.Select
              {...inputProps}
              {...rootStore.l10n.components.button_config.background_type}
              path={path}
              field="background_type"
              defaultValue="solid"
              componentProps={{mb: 0}}
              options={[
                { label: "Solid", value: "solid" },
                { label: "Gradient", value: "gradient" },
              ]}
            />
        }
        <Inputs.Color
          {...inputProps}
          {...rootStore.l10n.components.button_config.background_color}
          path={path}
          field="background_color"
          defaultValue={defaultValues["background_color"]}
          placeholder={placeholders["background_color"]}
          componentProps={{mb: 0}}
        />
        {
          !allowGradient || info?.background_type !== "gradient" ? null :
            <>
              <Inputs.Color
                {...inputProps}
                {...rootStore.l10n.components.button_config.background_color_2}
                path={path}
                field="background_color_2"
                defaultValue={defaultValues["background_color"]}
                placeholder={placeholders["background_color"]}
                componentProps={{mb: 0}}
              />
              <Inputs.Number
                {...inputProps}
                {...rootStore.l10n.components.button_config.background_gradient_angle}
                path={path}
                field="background_gradient_angle"
                defaultValue={0}
                min={0}
                max={359}
                componentProps={{mb: 0}}
              />
            </>
        }
        <Inputs.Color
          {...inputProps}
          {...rootStore.l10n.components.button_config.border_color}
          path={path}
          field="border_color"
          defaultValue={defaultValues["border_color"]}
          placeholder={placeholders["border_color"]}
          componentProps={{mb: 0}}
        />
        {
          !allowBorderWidth ? null :
            <Inputs.Integer
              {...inputProps}
              {...rootStore.l10n.components.button_config.border_width}
              path={path}
              field="border_width"
              defaultValue={defaultValues["border_width"]}
              placeholder={placeholders["border_width"]}
              min={0}
              max={10}
              componentProps={{mb: includeIcon ? "md" : 0}}
            />
        }
        <Inputs.Integer
          {...inputProps}
          {...rootStore.l10n.components.button_config.border_radius}
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
              {...rootStore.l10n.components.button_config.icon}
              path={path}
              field="icon"
            />
        }
      </Stack>
      <div style={{marginTop: 10, padding: 20, borderRadius: 5, backgroundColor: "#ddd"}}>
        <div key={info?.background_type} style={exampleStyle}>
          Example
        </div>
      </div>
    </Inputs.InputWrapper>
  );
});

export default ColorOptions;
