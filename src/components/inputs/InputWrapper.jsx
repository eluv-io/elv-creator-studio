import {observer} from "mobx-react-lite";
import {Input as MantineInput, Group, Paper, Text, Tooltip} from "@mantine/core";
import {IconQuestionMark} from "@tabler/icons-react";
import {uiStore} from "@/stores/index.js";

// Icon with hint tooltip on hover
const HintIcon = ({hint, componentProps={}}) => {
  return (
    <Tooltip label={hint} multiline maw={350} w="max-content" withArrow position="top-start" events={{ hover: true, focus: true, touch: false }}>
      <Group {...componentProps} style={{cursor: "help", ...(componentProps?.style || {})}}>
        <IconQuestionMark alt={hint} size={12} color="#228be6" />
      </Group>
    </Tooltip>
  );
};

// Field label - includes hint icon if hint is specified
export const InputLabel = ({label, hint, centered}) => {
  if(!label && !hint) { return null; }

  return (
    !hint ? label :
      <Group
        align="center"
        mx={centered ? "auto" : 0}
        position={centered ? "center" : "left"}
        pr={15}
        pl={centered ? 15 : 0}
        style={{position: "relative"}}
        w="max-content"
        maw="100%"
      >
        <Text>{ label }</Text>
        <HintIcon hint={hint} componentProps={{style: {position: "absolute", right: 0}}} />
      </Group>
  );
};

const InputWrapper = observer(({label, description, hint, error, children, flex, wrapperProps={}, ...componentProps}) => {
  wrapperProps.style = wrapperProps.style ||
    (!flex ? { position: "relative" } : { position: "relative", display: "flex", flexDirection: "column", justifyContent: "center "});

  return (
    <Paper withBorder p="xl" py="md" mb="md" maw={uiStore.inputWidth} {...componentProps}>
      <MantineInput.Wrapper
        {...wrapperProps}
        label={<InputLabel label={label} hint={hint} />}
        description={description}
        error={error}
        style={{
          ...(wrapperProps.style || {}),
          ...(
            !flex ?
              { position: "relative" } :
              { position: "relative", display: "flex", flexDirection: "column", justifyContent: "center "}
          )
        }}
        styles={{
          description: {
            paddingRight: "50px"
          },
          error: {
            marginTop: "10px"
          }
        }}
      >
        { children }
      </MantineInput.Wrapper>
    </Paper>
  );
});

export default InputWrapper;
