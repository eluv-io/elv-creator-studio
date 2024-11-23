import React, {useEffect} from "react";
import {observer} from "mobx-react";
import {
  Switch,
  Route,
  Navigate, useResolvedPath,
} from "react-router-dom";

import {rootStore} from "Stores/index";

import RenderRoutes from "Routes";
import MediaPropertiesBrowser from "Components/properties/MediaPropertiesBrowser";
import Header from "Components/header/Header";

const WalletWrapper = ({children}) => {
  useEffect(() => {
    rootStore.ClearCustomizationOptions();
  }, []);

  return children;
};

const GlobalWrapper = ({children}) => {
  const match = useResolvedPath("");

  useEffect(() => {
    rootStore.ClearCustomizationOptions();
    rootStore.SetRouteParams(match.params);
  }, [match.params]);

  return children;
};

const Wallet = observer(() => {
  if(rootStore.hideGlobalNavigation && rootStore.specifiedMarketplaceId) {
    //return <Navigate to={UrlJoin("/marketplace", rootStore.specifiedMarketplaceId, "store")} />;
  }

  return (
    <div className="page-container">
      <Header key="header" />

      <Switch>
        <Route path="/wallet" exact>
          <Navigate to="/" />
        </Route>

        <Route path="/" exact>
          <GlobalWrapper>
            <MediaPropertiesBrowser />
          </GlobalWrapper>
        </Route>

        <RenderRoutes
          routeList="wallet"
          basePath="/wallet"
          Wrapper={WalletWrapper}
        />
      </Switch>
    </div>
  );
});

export default Wallet;
