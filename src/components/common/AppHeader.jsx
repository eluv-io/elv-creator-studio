import {Button, Flex, Header, ActionIcon, Box, Group, Image} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {editStore, uiStore} from "@/stores";

import {IconBrightnessUpFilled} from "@tabler/icons-react";
import EluvioLogo from "@/assets/images/eluvio-logo-icon.png";

const Logo = () => (
  <svg aria-label="Eluvio" height="100%" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 697.75 154.95">
    <circle fill="currentColor" cx="482.27" cy="139.27" r="11.8"/>
    <g>
      <path stroke="currentColor" fill="currentColor" d="M102.49,4.09v11.94H15v53.11H96.93v11.94H15v58.05H103.52v11.94H1V4.09H102.49Z"/>
      <path stroke="currentColor" fill="currentColor" d="M134.8,4.09V139.13h82.34v11.94H120.81V4.09h14Z"/>
      <path stroke="currentColor" fill="currentColor" d="M241.64,4.09V95.08c0,8.51,.96,15.75,2.88,21.72,1.92,5.97,4.73,10.84,8.44,14.62,3.71,3.78,8.23,6.52,13.59,8.23,5.35,1.72,11.39,2.57,18.12,2.57s12.97-.86,18.32-2.57c5.35-1.71,9.88-4.46,13.59-8.23,3.71-3.77,6.52-8.65,8.44-14.62,1.92-5.97,2.88-13.21,2.88-21.72V4.09h14V98.16c0,7.55-1.06,14.72-3.19,21.51-2.13,6.79-5.49,12.73-10.09,17.81-4.6,5.08-10.5,9.09-17.7,12.04-7.21,2.95-15.95,4.43-26.25,4.43s-18.84-1.48-26.04-4.43c-7.2-2.95-13.11-6.96-17.7-12.04-4.6-5.08-7.96-11.01-10.09-17.81-2.13-6.79-3.19-13.96-3.19-21.51V4.09h14Z"/>
      <path stroke="currentColor" fill="currentColor" d="M366.59,4.09l47.76,131.54h.41L462.11,4.09h14.82l-54.55,146.98h-16.26L351.77,4.09h14.82Z"/>
      <path stroke="currentColor" fill="currentColor" d="M537.63,4.09V151.07h-14V4.09h14Z"/>
      <path stroke="currentColor" fill="currentColor" d="M562.53,48.55c2.88-9.19,7.21-17.32,12.97-24.39,5.76-7.07,13-12.69,21.72-16.88,8.71-4.19,18.84-6.28,30.36-6.28s21.61,2.09,30.26,6.28c8.65,4.19,15.85,9.81,21.61,16.88,5.76,7.07,10.09,15.2,12.97,24.39,2.88,9.2,4.32,18.87,4.32,29.03s-1.44,19.83-4.32,29.03c-2.88,9.2-7.21,17.29-12.97,24.29-5.76,7-12.97,12.59-21.61,16.78-8.65,4.18-18.73,6.28-30.26,6.28s-21.65-2.09-30.36-6.28c-8.72-4.18-15.95-9.78-21.72-16.78s-10.09-15.09-12.97-24.29c-2.88-9.19-4.32-18.87-4.32-29.03s1.44-19.83,4.32-29.03Zm12.87,52.6c2.13,7.75,5.42,14.69,9.88,20.79,4.46,6.11,10.19,11.01,17.19,14.72,7,3.71,15.37,5.56,25.12,5.56s18.08-1.85,25.01-5.56c6.93-3.71,12.62-8.61,17.09-14.72,4.46-6.1,7.75-13.04,9.88-20.79,2.13-7.75,3.19-15.61,3.19-23.57s-1.06-15.99-3.19-23.67c-2.13-7.68-5.42-14.58-9.88-20.69-4.46-6.11-10.16-11.01-17.09-14.72-6.93-3.71-15.27-5.56-25.01-5.56s-18.12,1.85-25.12,5.56-12.73,8.61-17.19,14.72c-4.46,6.11-7.75,13-9.88,20.69-2.13,7.69-3.19,15.58-3.19,23.67s1.06,15.82,3.19,23.57Z"/>
    </g>
  </svg>
);

const AppHeader = observer(() => {
  return (
    <Header height={60} pl="sm" pr="xl">
      <Group h="100%" w="100%" spacing="lg" noWrap>
        <Image src={EluvioLogo} alt="Eluvio" height={45} fit="contain" width="auto" />
        <Box
          w="max-content"
          h="100%"
          sx={theme => ({
            color: theme.colorScheme === "dark" ? theme.colors.gray[5] : theme.colors.dark[5],
            padding: `${theme.spacing.md} 0`
          })}
        >
          <Logo />
        </Box>
        <Flex justify="flex-end" align="center" h="100%" w="100%" gap={50}>
          {
            !editStore.hasUnsavedChanges ? null :
              <Button onClick={() => editStore.ToggleSaveModal(true)}>
                Save
              </Button>
          }
          <ActionIcon onClick={() => uiStore.SetTheme(uiStore.theme === "light" ? "dark" : "light")}>
            <IconBrightnessUpFilled />
          </ActionIcon>
        </Flex>
      </Group>
    </Header>
  );
});

export default AppHeader;
