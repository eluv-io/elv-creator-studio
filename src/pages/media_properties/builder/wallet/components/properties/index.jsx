import PropertyStyles from "Assets/stylesheets/media_properties/property-page.module.scss";

import React, {useEffect, useState} from "react";
import {mediaPropertyStore, rootStore} from "Stores/index";
import {Navigate, Switch, useResolvedPath} from "react-router-dom";
import {observer} from "mobx-react";
import AsyncComponent from "Components/common/AsyncComponent";
import {PageLoader} from "Components/common/Loaders";
import RenderRoutes from "Routes";
import MediaPropertyHeader from "Components/properties/MediaPropertyHeader";
import {LoginGate} from "Components/common/LoginGate";
import {PurchaseGate} from "Components/properties/Common";
import MediaPropertyFooter from "Components/properties/MediaPropertyFooter";
import {SetHTMLMetaTags} from "../../utils/Utils";
import PreviewPasswordGate from "Components/login/PreviewPasswordGate";

const PropertyWrapper = observer(({children}) => {
  const match = useResolvedPath("");
  const [itemLoaded, setItemLoaded] = useState(!match.params.propertyItemContractId);
  const [redirect, setRedirect] = useState(false);

  const { parentMediaPropertySlugOrId, mediaPropertySlugOrId, pageSlugOrId } = match.params;
  const mediaProperty = mediaPropertyStore.MediaProperty({mediaPropertySlugOrId});

  const isWrongPropertyInCustomDomain = (
    rootStore.isCustomDomain &&
    (
      ![rootStore.customDomainPropertySlug, rootStore.customDomainPropertyId].includes(parentMediaPropertySlugOrId) &&
        ![rootStore.customDomainPropertySlug, rootStore.customDomainPropertyId].includes(mediaPropertySlugOrId)
    )
  );

  useEffect(() => {
    if(match.params.propertyItemContractId) {
      rootStore.LoadNFTData({
        contractId: match.params.propertyItemContractId,
        tokenId: match.params.propertyItemTokenId
      })
        .then(data => {
          // Redirect if trying to view a bundle you don't own
          setRedirect(
            !data ||
            !rootStore.client.utils.EqualAddress(data?.details?.TokenOwner, rootStore.CurrentAddress())
          );
          setItemLoaded(true);
        });
    }
  }, []);

  useEffect(() => {
    if(!mediaProperty || isWrongPropertyInCustomDomain) {
      return;
    }

    rootStore.SetDomainCustomization(mediaProperty.mediaPropertyId);

    return () => {
      setTimeout(() => {
        if(!rootStore.routeParams.mediaPropertySlugOrId) {
          rootStore.ClearDomainCustomization();
          SetHTMLMetaTags();
        }
      }, 500);
    };
  }, [mediaProperty]);

  if(isWrongPropertyInCustomDomain){
    return <Navigate to={rootStore.customDomainPropertySlug || rootStore.customDomainPropertyId} />;
  }

  if(!rootStore.loaded  || !itemLoaded) {
    return <PageLoader />;
  }

  if(redirect) {
    return <Navigate to="/wallet/users/me/items" />;
  }

  if(mediaPropertySlugOrId) {
    const mediaProperty = mediaPropertyStore.MediaProperty({mediaPropertySlugOrId});
    const parentProperty = mediaPropertyStore.MediaProperty({mediaPropertySlugOrId: parentMediaPropertySlugOrId});
    const page = mediaPropertyStore.MediaPropertyPage({mediaPropertySlugOrId, pageSlugOrId});

    return (
      <AsyncComponent
        // Store info is cleared when logged in
        cacheSeconds={20}
        key={`property-${mediaPropertySlugOrId}-${rootStore.CurrentAddress()}`}
        loadKey={`property-${mediaPropertySlugOrId}-${rootStore.CurrentAddress()}`}
        Load={async () => {
          await mediaPropertyStore.LoadMediaProperty({mediaPropertySlugOrId});

          const property = mediaPropertyStore.MediaProperty({mediaPropertySlugOrId});

          if(!property) { return; }

          if(parentMediaPropertySlugOrId) {
            await mediaPropertyStore.LoadMediaProperty({mediaPropertySlugOrId: parentMediaPropertySlugOrId});
          }

          const parentProperty = mediaPropertyStore.MediaProperty({mediaPropertySlugOrId: parentMediaPropertySlugOrId});

          rootStore.checkoutStore.SetCurrency({
            currency: property?.metadata?.currency || parentProperty?.metadata?.currency || "USD"
          });

          SetHTMLMetaTags({
            metaTags: property.metadata?.meta_tags
          });

          const provider = rootStore.AuthInfo()?.provider || "external";
          const propertyProvider = property?.metadata?.login?.settings?.provider || "auth0";
          if(
            rootStore.loggedIn &&
            provider !== propertyProvider &&
            // Only allow metamask for auth0
            !(provider === "external" && propertyProvider === "auth0")
          ) {
            rootStore.Log("Signing out due to mismatched login provider with property");
            await rootStore.SignOut({reload: false});
          }
        }}
        loadingClassName="page-loader content"
      >
        <PreviewPasswordGate
          id={parentProperty?.mediaPropertyId}
          name={parentProperty?.metadata?.title || parentProperty?.metadata?.name}
          digest={parentProperty?.metadata?.preview_password_digest}
        >
          <PreviewPasswordGate
            id={mediaProperty?.mediaPropertyId}
            name={mediaProperty?.metadata?.title || mediaProperty?.metadata?.name}
            digest={mediaProperty?.metadata?.preview_password_digest}
          >
            <LoginGate Condition={() => mediaProperty?.metadata?.require_login}>
              <PurchaseGate id={mediaProperty?.mediaPropertyId} permissions={mediaProperty?.permissions}>
                <PurchaseGate id={page?.id} permissions={page?.permissions}>
                  <div className={PropertyStyles["property"]}>
                    { children }
                  </div>
                  <MediaPropertyFooter />
                </PurchaseGate>
              </PurchaseGate>
            </LoginGate>
          </PreviewPasswordGate>
        </PreviewPasswordGate>
      </AsyncComponent>
    );
  }

  return children;
});

export const PropertyRoutes = observer(({basePath}) => {
  return (
    <div className="page-container property-page">
      <MediaPropertyHeader />
      <Switch>
        <RenderRoutes
          basePath={basePath}
          routeList="property"
          Wrapper={PropertyWrapper}
        />
      </Switch>
    </div>
  );
});

export const BundledPropertyRoutes = observer(() => {
  return (
    <LoginGate backPath="/">
      <div className="page-container property-page">
        <MediaPropertyHeader />
        <Switch>
          <RenderRoutes
            basePath="/"
            routeList="bundledProperty"
            Wrapper={PropertyWrapper}
          />
        </Switch>
      </div>
    </LoginGate>
  );
});
