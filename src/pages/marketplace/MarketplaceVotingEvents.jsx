import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/inputs/Inputs";
import MarketplaceItemInput from "../../components/inputs/MarketplaceItemInput.jsx";
import UrlJoin from "url-join";
import {Title} from "@mantine/core";

const votingEventSpec = {
  id: "",
  title: "<New Voting Event>",
  description: "",
  exclusive: false,
  start_date: undefined,
  end_date: undefined,
  type: "specified",
  items: []
};

export const MarketplaceVotingEvent = observer(() => {
  const { marketplaceId, votingEventId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};
  const votingEventIndex = info.voting_events?.findIndex(event => event.id === votingEventId);
  const votingEvent = info.voting_events[votingEventIndex];

  if(!votingEvent) {
    return (
      <div>
        Voting Event not found
      </div>
    );
  }

  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: UrlJoin("/public/asset_metadata/info/voting_events", votingEventIndex.toString())
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Voting Events - ${votingEvent.title}`}
      section="marketplace"
      backLink={UrlJoin("/marketplaces", marketplaceId, "voting-events")}
      useHistory
    >
      <Title order={3} mt={50} mb="md">Basic Info</Title>
      <Inputs.UUID
        {...inputProps}
        field="id"
        label="ID"
      />
      <Inputs.Text
        {...inputProps}
        field="title"
        label="Title"
      />
      <Inputs.RichText
        {...inputProps}
        field="description"
        label="Description"
      />

      <Title order={3} mt={50} mb="md">Voting Event Settings</Title>

      <Inputs.DateTime
        {...inputProps}
        field="start_date"
        label="Start Date"
      />
      <Inputs.DateTime
        {...inputProps}
        field="end_date"
        label="End Date"
      />
      <Inputs.Checkbox
        {...inputProps}
        field="exclusive"
        label="Exclusive"
        defaultValue={false}
        description="If a user vote on multiple items"
      />
      <Inputs.Select
        {...inputProps}
        field="type"
        label="Type"
        description="Can a user vote on all items in a marketplace, or only specific items?"
        defaultValue="specified"
        options={[
          {label: "Specified Items", value: "specified"},
          {label: "All Items", value: "all"}
        ]}
      />
      {
        votingEvent.type === "all" ? null :
          <MarketplaceItemInput
            {...inputProps}
            field="items"
            label="Votable Items"
            searchable
          />
      }

    </PageContent>
  );
});

const MarketplaceVotingEvents = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const inputProps = { store: marketplaceStore, objectId: marketplaceId };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Voting Events`}
      section="marketplace"
      useHistory
    >
      <Inputs.CollectionTable
        {...inputProps}
        path="/public/asset_metadata/info"
        field="voting_events"
        fieldLabel="Voting Event"
        idField="id"
        columns={[
          { label: "Title", field: "title" },
          { label: "Type", field: "type" },
        ]}
        newEntrySpec={votingEventSpec}
      />
    </PageContent>
  );
});

export default MarketplaceVotingEvents;
