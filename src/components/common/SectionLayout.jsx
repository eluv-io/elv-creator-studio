import {observer} from "mobx-react-lite";
import {Flex} from "@mantine/core";
import {Outlet, useParams} from "react-router-dom";
import AsyncWrapper from "@/components/common/AsyncWrapper.jsx";
import SideNav from "@/components/common/SideNav.jsx";
import AppHeader from "@/components/common/AppHeader.jsx";

const SectionLayout = observer(({links=[], backLink, loadingMessage, Load}) => {
  const params = useParams();

  links = links.map(link => {
    let path = link.path;
    Object.keys(params || {}).forEach(paramName => path = path.replaceAll(`:${paramName}`, params[paramName]));
    return { ...link, path, title: link?.PageTitle?.(params) || link.title || link.label };
  });

  return (
    <Flex className="page-container">
      <SideNav links={links} backLink={backLink} />
      <div style={{flexGrow: "1", overflow: "hidden"}}>
        <AppHeader />
        <div className="page-content">
          {
            !Load ?
              <Outlet/> :
              <AsyncWrapper
                key="sections"
                loadingMessage={loadingMessage}
                Load={async () => Load(params)}
              >
                {() => <Outlet/>}
              </AsyncWrapper>
          }
        </div>
      </div>
    </Flex>
  );
});

export default SectionLayout;
