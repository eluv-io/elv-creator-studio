import {observer} from "mobx-react-lite";
import {Checkbox, UnstyledButton} from "@mantine/core";
import InputWrapper from "./InputWrapper.jsx";

const CheckboxCard = observer(({
  INVERTED=false,
  label,
  description,
  hint,
  checked,
  onChange,
  ...componentProps
}) => {
  return (
    <UnstyledButton
      style={{display: "block"}}
      width="100%"
      w="100%"
      maw={600}
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
          styles={{ input: { cursor: "pointer" } }}
        />
      </InputWrapper>
    </UnstyledButton>
  );
});

export default CheckboxCard;
