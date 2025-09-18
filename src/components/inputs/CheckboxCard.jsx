import {observer} from "mobx-react-lite";
import {Checkbox, UnstyledButton} from "@mantine/core";
import InputWrapper from "./InputWrapper.jsx";
import {uiStore} from "@/stores/index.js";

const CheckboxCard = observer(({
  INVERTED=false,
  label,
  description,
  hint,
  checked,
  onChange,
  disabled,
  ...componentProps
}) => {
  return (
    <UnstyledButton
      style={{display: "block"}}
      width="100%"
      w="100%"
      maw={uiStore.inputWidth}
      mb="md"
      onClick={() => onChange(!checked)}
      {...componentProps}
    >
      <InputWrapper
        label={label}
        description={description}
        hint={hint}
        flex
        mb={0}
        wrapperProps={{
          pr: 50,
          style: {
            opacity: disabled ? 0.5 : 1,
            cursor: "pointer"
          },
          labelProps: {
            style: {
              cursor: "pointer"
            }
          }
        }}
      >
        <Checkbox
          style={{position: "absolute", right: -25}}
          checked={INVERTED ? !checked : !!checked}
          onChange={() => {}}
          tabIndex={-1}
          size="md"
          mr="xl"
          disabled={disabled}
          styles={{ input: { cursor: "pointer" } }}
        />
      </InputWrapper>
    </UnstyledButton>
  );
});

export default CheckboxCard;
