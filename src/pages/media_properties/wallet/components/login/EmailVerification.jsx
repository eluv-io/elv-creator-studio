import {PageLoader} from "Components/common/Loaders";

const params = new URLSearchParams(window.location.search);

import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {rootStore} from "Stores";
import {LoginGate} from "Components/common/LoginGate";
import {Navigate} from "react-router-dom";
import {MediaPropertyBasePath} from "../../utils/MediaPropertyUtils";

const EmailVerification = observer(() => {
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if(!rootStore.loggedIn) { return; }

    rootStore.SendLoginEmail({type: "confirm_email", code: params.get("code")})
      .finally(() => setFinished(true));
  }, [rootStore.loggedIn]);

  if(finished) {
    return <Navigate to={params.get("next") || MediaPropertyBasePath(rootStore.routeParams)} />;
  }

  return (
    <LoginGate>
      <PageLoader />
    </LoginGate>
  );
});

export default EmailVerification;
