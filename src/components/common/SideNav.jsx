import NavStyles from "@/assets/stylesheets/modules/nav.module.scss";

import {observer} from "mobx-react-lite";
import {Navbar, Title, Tooltip} from "@mantine/core";
import {NavLink, useLocation} from "react-router-dom";
import {rootStore} from "@/stores";

import {
  IconBuildingStore,
  IconSitemap,
  IconArrowBackUp,
  IconTemplate,
  IconPlaylist,
  IconBrandPagekit,
  IconLockOpen
} from "@tabler/icons-react";


const S = (...classes) => classes.map(c => NavStyles[c] || "").join(" ");

const mainLinks = [
  { label: rootStore.l10n.components.nav.home, icon: <IconSitemap />, path: "/tenant"},
  { label: rootStore.l10n.components.nav.media_properties, icon: <IconBrandPagekit />, path: "/media-properties"},
  { label: rootStore.l10n.components.nav.media_catalogs, icon: <IconPlaylist />, path: "/media-catalogs"},
  { label: rootStore.l10n.components.nav.marketplaces, icon: <IconBuildingStore />, path: "/marketplaces"},
  { label: rootStore.l10n.components.nav.item_templates, icon: <IconTemplate />, path: "/item-templates"},
  { label: rootStore.l10n.components.nav.permission_sets, icon: <IconLockOpen />, path: "/permission-sets"}
];

const SideNav = observer(({links, backLink}) => {
  const location = useLocation();
  const activeLocation = links.find(link => link.path === location.pathname);

  return (
    <Navbar className={S("nav", links.length > 0 ? "nav--with-links" : "")}>
      <Navbar.Section grow className={S("wrapper")}>
        <div className={S("icons")}>
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
                  className={({isActive}) => S("icon", isActive ? "icon--active" : "")}
                  to={path}
                >
                  { icon }
                </NavLink>
              </Tooltip>
            )
          }
        </div>
        {
          !(links?.length > 0) ? null :
            <div className={S("links")}>
              <Title order={4} className={S("title")}>
                { activeLocation?.title }
              </Title>
              {
                !backLink ? null :
                  <NavLink
                    end
                    className={S("link", "link--back")}
                    to={backLink.path}
                  >
                    <IconArrowBackUp size={18} />
                    { backLink.label }
                  </NavLink>
              }
              {
                links.map(({root, navRoute, label, path}) =>
                  !navRoute ? null :
                    <NavLink
                      to={path}
                      key={`nav-link-${path}`}
                      className={({isActive}) => S("link", (!root && isActive) || activeLocation?.path === path ? "link--active" : "")}
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
