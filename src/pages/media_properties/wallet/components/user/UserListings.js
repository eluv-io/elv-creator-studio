import React from "react";
import {observer} from "mobx-react";
import {useResolvedPath} from "react-router-dom";
import {rootStore} from "Stores";
import Listings from "Components/listings/Listings";

const UserListings = observer(() => {
  const match = useResolvedPath("");
  const userProfile = rootStore.userProfiles[match.params.userId];

  return (
    <Listings
      includeActivity={false}
      initialFilters={{sellerAddress: userProfile.userAddress, includeCheckoutLocked: true}}
    />
  );
});

export default UserListings;
