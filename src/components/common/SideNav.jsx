import {observer} from "mobx-react-lite";
import {createStyles, Navbar, rem, Title, Tooltip} from "@mantine/core";
import {NavLink, useLocation} from "react-router-dom";

import {Icon123, IconHome, IconBomb, IconArrowBackUp} from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
  },

  aside: {
    flex: `0 0 ${rem(60)}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRight: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[3]
    }`,
  },

  main: {
    flex: 1,
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
  },

  mainLink: {
    width: rem(44),
    height: rem(44),
    borderRadius: theme.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],

    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  },

  mainLinkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({ variant: "light", color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor }).color,
    },
  },

  title: {
    boxSizing: "border-box",
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    padding: theme.spacing.md,
    paddingTop: rem(18),
    height: rem(60),
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[3]
    }`,
  },

  logo: {
    boxSizing: "border-box",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    height: rem(60),
    paddingTop: theme.spacing.md,
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[3]
    }`,
    marginBottom: theme.spacing.xl,
  },

  link: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],
    padding: `0 ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    height: rem(44),
    lineHeight: rem(44),

    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },

  linkActive: {
    "&, &:hover": {
      borderLeftColor: theme.fn.variant({ variant: "filled", color: theme.primaryColor })
        .background,
      backgroundColor: theme.fn.variant({ variant: "filled", color: theme.primaryColor })
        .background,
      color: theme.white,
    },
  },
}));



const mainLinks = [
  { label: "Home", icon: <IconHome />, path: "/"},
  { label: "Marketplaces", icon: <IconBomb />, path: "/marketplaces"},
];

const SideNav = observer(({links, backLink}) => {
  const location = useLocation();
  const { classes, cx } = useStyles();
  const activeLocation = links.find(link => link.path === location.pathname);

  return (
    <Navbar width={{ sm: links?.length > 0 ? 300 : 60 }}>
      <Navbar.Section grow className={classes.wrapper}>
        <div className={classes.aside}>
          <div className={classes.logo}>
            <Icon123 size={30} />
          </div>
          {
            mainLinks.map(({label, icon, path}) =>
              <Tooltip
                label={label}
                position="right"
                withArrow
                transitionProps={{ duration: 0 }}
                key={label}
              >
                <NavLink
                  to={path}
                  className={
                    cx(
                      classes.mainLink,
                      { [classes.mainLinkActive]: path === "/" ? location.pathname === "/" : location.pathname.startsWith(path) }
                    )
                  }
                >
                  { icon }
                </NavLink>
              </Tooltip>
            )
          }
        </div>
        {
          !(links?.length > 0) ? null :
            <div className={classes.main}>
              <Title order={4} className={classes.title}>
                {activeLocation?.label}
              </Title>
              {
                !backLink ? null :
                  <NavLink
                    to={backLink.path}
                    className={cx(classes.link)}
                  >
                    <IconArrowBackUp size={18} />
                    { backLink.label }
                  </NavLink>
              }
              {
                links.map(({label, path}) =>
                  <NavLink
                    to={path}
                    key={`nav-link-${path}`}
                    className={cx(classes.link, {[classes.linkActive]: activeLocation?.path === path})}
                  >
                    {label}
                  </NavLink>
                )
              }
            </div>
        }
      </Navbar.Section>
    </Navbar>
  );
});

export default SideNav;
