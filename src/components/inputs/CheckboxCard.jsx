import {observer} from "mobx-react-lite";
import {Checkbox, UnstyledButton} from "@mantine/core";
import InputWrapper from "./InputWrapper.jsx";

const CheckboxCard = observer(({
  INVERTED=false,
  label,
  description,
  hint,
  componentProps={},
  checked,
  onChange
}) => {
  return (
    <UnstyledButton
      style={{display: "block"}}
      width="100%"
      w="100%"
      maw={600}
      onClick={onChange}
    >
      <InputWrapper
        label={label}
        description={description}
        hint={hint}
        flex
        wrapperProps={{pr: 50}}
      >
        <Checkbox
          style={{position: "absolute", right: -25}}
          {...componentProps}
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