import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, marketplaceStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {MarketplaceItemMultiselect} from "@/components/inputs/MarketplaceItemInput.jsx";
import UrlJoin from "url-join";

import {MarketplaceVotingEventSpec} from "@/specs/MarketplaceSpecs.js";
import {ListItemCategory, LocalizeString, TooltipIcon} from "@/components/common/Misc.jsx";
import {IconCircleCheck, IconClock} from "@tabler/icons-react";
import {FormatDate, ParseDate} from "@/helpers/Misc.js";

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

  const l10n = rootStore.l10n.pages.marketplace.form;
  const listPath = "/public/asset_metadata/info/voting_events";
  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: UrlJoin(listPath, votingEventIndex.toString()),
    category: ListItemCategory({
      store: marketplaceStore,
      objectId: marketplaceId,
      listPath,
      id: votingEventId,
      labelField: "title",
      l10n: l10n.categories.voting_event_label
    }),
    subcategory: l10n.categories.voting_event_details
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Voting Events - ${votingEvent.title}`}
      section="marketplace"
      backLink={UrlJoin("/marketplaces", marketplaceId, "voting-events")}
      useHistory
    >
      <Inputs.UUID
        {...inputProps}
        {...l10n.voting_events.id}
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.voting_events.title}
        field="title"
      />
      <Inputs.RichText
        {...inputProps}
        {...l10n.voting_events.description}
        field="description"
      />
      <Inputs.DateTime
        {...inputProps}
        {...l10n.voting_events.start_date}
        field="start_date"
      />
      <Inputs.DateTime
        {...inputProps}
        {...l10n.voting_events.end_date}
        field="end_date"
      />
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.voting_events.exclusive}
        field="exclusive"
        defaultValue={false}
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.voting_events.type}
        field="type"
        defaultValue="specified"
        options={[
          {label: "Specified Items", value: "specified"},
          {label: "All Items", value: "all"}
        ]}
      />
      {
        votingEvent.type === "all" ? null :
          <MarketplaceItemMultiselect
            {...inputProps}
            {...l10n.voting_events.items}
            subcategory={l10n.categories.voting_event_items}
            field="items"
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

  const l10n = rootStore.l10n.pages.marketplace.form;
  const inputProps = { store: marketplaceStore, objectId: marketplaceId };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Voting Events`}
      section="marketplace"
      useHistory
    >
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.voting_events.voting_events}
        categoryFnParams={{fields: ["title", "id"], l10n: l10n.categories.voting_event_label}}
        path="/public/asset_metadata/info"
        field="voting_events"
        idField="id"
        columns={[
          { label: l10n.voting_events.voting_events.columns.title, field: "title" },
          { label: l10n.voting_events.voting_events.columns.type, field: "type", width: "80px", render: votingEvent => votingEvent.type?.capitalize() },
          { label: l10n.voting_events.voting_events.columns.items, field: "items", width: "80px", centered: true, render: votingEvent => votingEvent.type !== "specified" ? "N/A" : votingEvent?.items?.length || "0" },
          {
            label: l10n.voting_events.voting_events.columns.status,
            centered: true,
            field: "status",
            width: "120px",
            render: voting_event => {
              let status = l10n.voting_events.status.available;
              let Icon = IconCircleCheck;
              let color = "green";

              if(voting_event.start_date && ParseDate(voting_event.start_date) > new Date()) {
                status = LocalizeString(l10n.voting_events.status.unreleased, { date: FormatDate(voting_event.start_date)});
                color = "yellow";
                Icon = IconClock;
              } else if(voting_event.end_date && ParseDate(voting_event.end_date) < new Date()) {
                status = LocalizeString(l10n.voting_events.status.expired, { date: FormatDate(voting_event.end_date)});
                color = "red";
                Icon = IconClock;
              }

              return <TooltipIcon size={25} label={status} Icon={Icon} color={color} />;
            }
          }
        ]}
        newItemSpec={MarketplaceVotingEventSpec}
      />
    </PageContent>
  );
});

export default MarketplaceVotingEvents;
