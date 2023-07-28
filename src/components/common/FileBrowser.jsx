import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  Button,
  Container,
  Group,
  HoverCard,
  Image,
  Modal,
  Text,
  UnstyledButton
} from "@mantine/core";
import {useEffect, useState} from "react";
import {fileBrowserStore} from "Stores";
import {DataTable} from "mantine-datatable";
import PrettyBytes from "pretty-bytes";

import {
  ArrowBackUp as BackIcon,
  Folder as FolderIcon,
  File as FileIcon,
  Photo as PhotoIcon
} from "tabler-icons-react";
import UrlJoin from "url-join";


const FileBrowser = observer(({objectId, writeToken, multiple, title, extensions, Cancel, Submit}) => {
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState("/");
  const [sortStatus, setSortStatus] = useState({columnAccessor: "name", direction: "asc"});

  useEffect(() => {
    fileBrowserStore.LoadFiles({objectId, writeToken})
      .then(() => setLoading(false));
  }, []);

  const directory = fileBrowserStore.Directory({objectId, writeToken, path})
    .sort((a, b) => {
      if(sortStatus.columnAccessor !== "type" && a.type === "directory" && b.type !== "directory") {
        return -1;
      } else if(sortStatus.columnAccessor !== "type" && a.type !== "directory" && b.type === "directory") {
        return 1;
      }

      a = a[sortStatus.columnAccessor];
      b = b[sortStatus.columnAccessor];

      if(typeof a === "number") {
        a = a || 0;
        b = b || 0;
      } else {
        a = a?.toLowerCase?.() || a || "";
        b = b?.toLowerCase?.() || b || "";
      }

      return (a < b ? -1 : 1) * (sortStatus.direction === "asc" ? 1 : -1);
    });

  const pathTokens = path.replace(/^\//, "").split("/");
  return (
    <Modal opened onClose={Cancel} centered size={1000} title={title} padding="xl">
      <Container px={0} mih={600}>
        <Group mb="xl" align="center">
          <ActionIcon ariaLabel="Back to previous directory" disabled={path === "/"} variant="transparent" onClick={() => setPath(UrlJoin("/", ...pathTokens.slice(0, -1)))}>
            <BackIcon />
          </ActionIcon>
          {
            pathTokens.map((token, index) =>
              <>
                <Text key={`path-text-${index}`}>/</Text>
                <UnstyledButton key={`path-button-${index}`} onClick={() => setPath(UrlJoin("/", ...pathTokens.slice(0, index + 1)))}>
                  <Text fw={index === pathTokens.length - 1 ? 600 : 400} color="blue.5">
                    {token}
                  </Text>
                </UnstyledButton>
              </>
            )
          }
        </Group>
        <Container px={0} h={600}>
          <DataTable
            fetching={loading}
            onRowClick={row => {
              if(row.type === "directory") {
                setPath(UrlJoin(path, row.name));
              }
            }}
            columns={[
              {
                accessor: "type",
                title: "Type",
                width: 85,
                sortable: true,
                render: ({name, type, url}) => {
                  if(type !== "image") {
                    return (
                      type === "directory" ? <FolderIcon /> : <FileIcon />
                    );
                  }

                  return (
                    <HoverCard width={200} shadow="md">
                      <HoverCard.Target>
                        <Container p={0} style={{cursor: "pointer"}}>
                          <PhotoIcon />
                        </Container>
                      </HoverCard.Target>
                      <HoverCard.Dropdown ml={50} bg="gray.1" p="xl" >
                        <Image
                          caption={<Text style={{wordWrap: "anywhere"}}>{ name }</Text>}
                          alt={name}
                          src={url}
                          fit="contain"
                        />
                      </HoverCard.Dropdown>
                    </HoverCard>
                  );
                }
              },
              { accessor: "name", title: "Filename", sortable: true },
              { accessor: "size", title: "Size", sortable: true, render: ({size}) => typeof size === "number" ? PrettyBytes(size) : "" },
            ]}
            records={directory}
            idAccessor={({name}) => name}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
          />
        </Container>
      </Container>
    </Modal>
  );
});

export const FileBrowserButton = observer(({fileBrowserProps, ...props}) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button {...props} onClick={() => setShow(true)} />
      { show ? <FileBrowser {...fileBrowserProps} Cancel={() => setShow(false)} /> : null }
    </>
  );
});

export default FileBrowser;
