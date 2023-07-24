import { UnstyledButton, Checkbox, Text, Select, TextInput, createStyles, rem } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import { DatePickerInput, DateTimePicker } from "@mantine/dates";

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
  },

  input: {
    height: rem(60),
    paddingTop: rem(18),
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },

  label: {
    position: "absolute",
    pointerEvents: "none",
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: `calc(${theme.spacing.sm} / 2)`,
    zIndex: 1,
  },
}));

export function ContainedInputs() {
  const { classes } = useStyles();

  return (
    <div>
      <TextInput label="Shipping address" placeholder="15329 Huston 21st" classNames={classes} />

      <Select
        mt="md"
        withinPortal
        data={["React", "Angular", "Svelte", "Vue"]}
        placeholder="Pick one"
        label="Your favorite library/framework"
        classNames={classes}
      />

      <DateTimePicker
        mt="md"
        popoverProps={{ withinPortal: true }}
        label="Departure date"
        placeholder="When will you leave?"
        classNames={classes}
        clearable={false}
      />
    </div>
  );
}

const checkboxCardStyles = createStyles((theme) => ({
  button: {
    display: "flex",
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[3]
    }`,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.xl,
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.gray[0],
    },
  },
}));

export const CheckboxCard = ({
  checked,
  defaultChecked,
  onChange,
  title,
  description,
  className,
  ...args
}) => {
  const { classes, cx } = checkboxCardStyles();

  const [value, handleChange] = useUncontrolled({
    value: checked,
    defaultValue: defaultChecked,
    finalValue: false,
    onChange,
  });

  return (
    <UnstyledButton
      {...args}
      onClick={() => handleChange(!value)}
      className={cx(classes.button, className)}
    >
      <Checkbox
        checked={value}
        onChange={() => {}}
        tabIndex={-1}
        size="md"
        mr="xl"
        styles={{ input: { cursor: "pointer" } }}
      />
      <div>
        <Text fw={500} mb={7} sx={{ lineHeight: 1 }}>
          {title}
        </Text>
        <Text fz="sm" c="dimmed">
          {description}
        </Text>
      </div>
    </UnstyledButton>
  );
}
