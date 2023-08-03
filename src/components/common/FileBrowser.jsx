import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  Button,
  Code,
  Container,
  Group,
  HoverCard,
  Image,
  Modal,
  Progress,
  Text,
  TextInput,
  UnstyledButton
} from "@mantine/core";
import {Dropzone} from "@mantine/dropzone";
import { modals } from "@mantine/modals";
import {useForm} from "@mantine/form";
import {useEffect, useState} from "react";
import {rootStore, fileBrowserStore} from "Stores";
import {DataTable} from "mantine-datatable";
import PrettyBytes from "pretty-bytes";
import {LocalizeString} from "Components/common/Misc";
import {SortTable} from "Helpers/Misc";

import {
  ArrowBackUp as BackIcon,
  EditCircle as EditIcon,
  FileDownload as DownloadIcon,
  Folder as FolderIcon,
  File as FileIcon,
  Photo as PhotoIcon,
  TrashX as DeleteIcon,
  X as XIcon,
  Upload as UploadIcon,
} from "tabler-icons-react";
import UrlJoin from "url-join";
import {useDebouncedValue} from "@mantine/hooks";

// Table showing the status of file uploads in the upload form
const UploadStatus = observer(({selectedFiles, fileStatus}) => {
  const [records, setRecords] = useState([]);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "progress", direction: "asc"});

  useEffect(() => {
    setRecords(
      selectedFiles
        .map(file => ({
          ...file,
          ...(fileStatus[file.filename] || {})
        }))
        .map(record => ({
          ...record,
          total: record.total || record.size,
          progress: (record.uploaded || 0) / (record.total || record.size) * 100
        }))
        .sort(SortTable({sortStatus}))
    );
  }, [selectedFiles, fileStatus, sortStatus]);

  if(records.length === 0) {
    return null ;
  }

  return (
    <DataTable
      highlightOnHover
      idAccessor="filename"
      height={310}
      records={records}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      columns={[
        { accessor: "filename", title: rootStore.l10n.ui.file_browser.columns.filename, sortable: true, render: ({filename}) => <Text style={{wordWrap: "anywhere"}}>{filename}</Text> },
        { accessor: "size", title: rootStore.l10n.ui.file_browser.columns.size, sortable: true, render: ({total, size}) => PrettyBytes(total || size), width: 100 },
        {
          accessor: "uploaded",
          sortable: true,
          title: rootStore.l10n.ui.file_browser.columns.progress,
          width: 150,
          render: ({progress}) => {
            return <Progress value={progress} />;
          }
        }
      ]}
    />
  );
});

// Form for uploading files
const UploadForm = observer(({objectId, path, Close}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileStatus = rootStore.fileBrowserStore.uploadStatus[objectId] || {};
  const uploading = fileBrowserStore.activeUploadJobs[objectId] > 0;

  return (
    <Modal
      opened
      centered
      size={800}
      overlayProps={{zIndex: 201}}
      onClose={uploading ? () => {} : Close}
      withCloseButton={!uploading}
      title={LocalizeString(rootStore.l10n.ui.file_browser.upload_files, {path})}
    >
      <Container py="xl">
        <Dropzone
          multiple
          maw={500}
          py={50}
          mx="auto"
          onDrop={async (files) => {
            if(!files || files.length === 0) { return; }

            let formattedFiles = [];

            setSelectedFiles([
              ...files.map(file => {
                const filename = (file.webkitRelativePath || file.name);
                const filepath = UrlJoin(path, filename.replace(/^\/+/g, ""));

                // Formatted request to send to client
                formattedFiles.push({
                  path: filepath,
                  type: "file",
                  mime_type: file.type,
                  size: file.size,
                  data: file,
                });

                // Add to list of files added
                return {
                  filename: (file.webkitRelativePath || file.name),
                  filepath,
                  size: file.size
                };
              }),
              ...selectedFiles
            ]);

            fileBrowserStore.UploadFiles({objectId, files: formattedFiles});
          }}
        >
          <Group position="center" align="center">
            <Dropzone.Accept>
              <UploadIcon />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <XIcon />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <PhotoIcon />
            </Dropzone.Idle>

            <Text size="xl" inline>
              { rootStore.l10n.ui.file_browser.upload_instructions }
            </Text>
          </Group>
        </Dropzone>
        {
          selectedFiles.length === 0 ? null :
            <Container mt={50}>
              <UploadStatus selectedFiles={selectedFiles} fileStatus={fileStatus} />
            </Container>
        }
        <Group position="right" mt={50}>
          <Button w={200} disabled={uploading} loading={uploading} onClick={Close}>
            { uploading ? "" : rootStore.l10n.ui.actions.done }
          </Button>
        </Group>
      </Container>
    </Modal>
  );
});

// Form for creating directories
const CreateDirectoryForm = ({Create}) => {
  const [renaming, setRenaming] = useState(false);

  const form = useForm({
    initialValues: { filename: "" },
    validate: {
      filename: value => value ? null : rootStore.l10n.ui.file_browser.validation.filename_must_be_specified
    }
  });

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(values => {
          setRenaming(true);
          Create({filename: values.filename})
            .catch(error => {
              rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
              setRenaming(false);
            })
            .then(() => {
              modals.closeAll();
            });
        })}
      >
        <TextInput
          data-autofocus
          label={rootStore.l10n.ui.file_browser.directory_name}
          {...form.getInputProps("filename")}
        />
        <Group mt="md">
          <Button
            w="100%"
            loading={renaming}
            type="submit"
          >
            { rootStore.l10n.ui.actions.submit }
          </Button>
        </Group>
      </form>
    </Container>
  );
};

// Form for renaming files
const RenameFileForm = ({filename, Rename}) => {
  const [renaming, setRenaming] = useState(false);

  const form = useForm({
    initialValues: { newFilename: filename },
    validate: {
      newFilename: value => value ? null : rootStore.l10n.ui.file_browser.validation.filename_must_be_specified
    }
  });

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(values => {
          setRenaming(true);
          Rename({newFilename: values.newFilename})
            .catch(error => {
              rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
              setRenaming(false);
            })
            .then(() => {
              modals.closeAll();
            });
        })}
      >
        <TextInput
          data-autofocus
          label={rootStore.l10n.ui.file_browser.new_filename}
          {...form.getInputProps("newFilename")}
        />
        <Group mt="md">
          <Button
            w="100%"
            loading={renaming}
            type="submit"
          >
            { rootStore.l10n.ui.actions.submit }
          </Button>
        </Group>
      </form>
    </Container>
  );
};

const DeleteFileButton = ({filename, Delete}) => {
  const [deleting, setDeleting] = useState(false);

  return (
    <ActionIcon
      title={LocalizeString(rootStore.l10n.ui.file_browser.delete, {filename}, {stringOnly: true})}
      aria-label={LocalizeString(rootStore.l10n.ui.file_browser.delete, {filename})}
      color="red.5"
      loading={deleting}
      onClick={() => {
        modals.openConfirmModal({
          title: LocalizeString(rootStore.l10n.ui.file_browser.delete, {filename}),
          centered: true,
          children: (
            <Text size="sm">
              { rootStore.l10n.ui.file_browser.delete_confirm }
            </Text>
          ),
          labels: { confirm: rootStore.l10n.ui.actions.delete, cancel: rootStore.l10n.ui.actions.cancel },
          confirmProps: { color: "red.5" },
          overlayProps: {
            zIndex: 202
          },
          onConfirm: () => {
            setDeleting(true);
            Delete()
              .finally(() => setDeleting(false));
          }
        });
      }}
    >
      <DeleteIcon/>
    </ActionIcon>
  );
};

const FileBrowserTable = observer(({
  objectId,
  extensions,
  multiple,
  path,
  filter,
  setPath,
  selectedRecords,
  setSelectedRecords
}) => {
  const [loading, setLoading] = useState(true);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "filename", direction: "asc"});

  useEffect(() => {
    fileBrowserStore.LoadFiles({objectId})
      .then(() => setLoading(false));
  }, [objectId]);

  const directory = fileBrowserStore.Directory({objectId, path})
    .filter(record => !filter || record.filename.toLowerCase().includes(filter))
    .sort(
      SortTable({
        sortStatus,
        AdditionalCondition: (a, b) => {
          // Unless specifically sorting on type, keep directories at the top of the list
          if(sortStatus.columnAccessor === "type") { return; }

          if(a.type === "directory" && b.type !== "directory") {
            return -1;
          } else if(a.type !== "directory" && b.type === "directory") {
            return 1;
          }
        }
      })
    )
    .map(file => ({...file, actions: ""}));

  return (
    <DataTable
      fetching={loading}
      onRowClick={(record) => {
        if(record.type === "directory") {
          setPath(UrlJoin(path, record.filename));
        } else {
          if(selectedRecords.find(selectedRecord => selectedRecord.fullPath === record.fullPath)) {
            setSelectedRecords(selectedRecords.filter(selectedRecord => selectedRecord.fullPath !== record.fullPath));
          } else {
            setSelectedRecords(multiple ? [...selectedRecords, record] : [record]);
          }
        }
      }}
      withBorder
      highlightOnHover
      idAccessor="filename"
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      records={directory}
      selectedRecords={selectedRecords}
      onSelectedRecordsChange={newSelectedRecords => {
        if(multiple) {
          setSelectedRecords(newSelectedRecords);
        } else {
          // Only allow one selection
          setSelectedRecords(newSelectedRecords.filter(newRecord => !selectedRecords.find(record => record.filename === newRecord.filename)));
        }
      }}
      // Hide select all if not multiple
      allRecordsSelectionCheckboxProps={{style: multiple ? {} : {display: "none"}}}
      // Hide directory selection checkbox
      getRecordSelectionCheckboxProps={({type}) => ({style: type === "directory" ? {display: "none"} : {}})}
      isRecordSelectable={({type, ext}) => type !== "directory" && (!extensions || extensions.length === 0 || extensions.includes(ext))}
      columns={[
        {
          accessor: "type",
          title: rootStore.l10n.ui.file_browser.columns.type,
          width: 85,
          sortable: true,
          render: ({filename, type, url}) => {
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
                <HoverCard.Dropdown ml={85} bg="gray.1" p="xl" >
                  <Image
                    caption={<Text style={{wordWrap: "anywhere"}}>{ filename }</Text>}
                    alt={filename}
                    src={url}
                    fit="contain"
                  />
                </HoverCard.Dropdown>
              </HoverCard>
            );
          }
        },
        { accessor: "filename", title: rootStore.l10n.ui.file_browser.columns.filename, sortable: true, render: ({filename}) => <Text style={{wordWrap: "anywhere"}}>{filename}</Text> },
        { accessor: "size", width: 100, title: rootStore.l10n.ui.file_browser.columns.size, sortable: true, render: ({size}) => typeof size === "number" ? PrettyBytes(size) : "" },
        {
          accessor: "actions",
          title: rootStore.l10n.ui.file_browser.columns.actions,
          textAlignment: "center",
          render: ({type, filename, url, fullPath}) => {
            return (
              <Group spacing={6} position="center" noWrap onClick={event => event.stopPropagation()}>
                {
                  type === "directory" ? null :
                    <ActionIcon
                      title={LocalizeString(rootStore.l10n.ui.file_browser.rename, {filename}, {stringOnly: true})}
                      aria-label={LocalizeString(rootStore.l10n.ui.file_browser.rename, {filename})}
                      color="green.5"
                      onClick={() =>
                        modals.open({
                          title: LocalizeString(rootStore.l10n.ui.file_browser.rename, {filename}),
                          centered: true,
                          children:
                            <RenameFileForm
                              filename={filename}
                              Rename={async ({newFilename}) => {
                                await fileBrowserStore.RenameFile({objectId, path, filename, newFilename});

                                // If record was selected, remove from selection
                                setSelectedRecords(selectedRecords.filter(selectedRecord => selectedRecord.fullPath !== fullPath));
                              }}
                            />,
                          overlayProps: {
                            zIndex: 202
                          }
                        })
                      }
                    >
                      <EditIcon/>
                    </ActionIcon>
                }
                {
                  type === "directory" ? null :
                    <ActionIcon
                      color="blue.5"
                      component="a"
                      href={url}
                      target="_blank"
                      title={LocalizeString(rootStore.l10n.ui.file_browser.download, {filename}, {stringOnly: true})}
                      aria-label={LocalizeString(rootStore.l10n.ui.file_browser.download, {filename})}
                    >
                      <DownloadIcon/>
                    </ActionIcon>
                }
                <DeleteFileButton
                  filename={filename}
                  Delete={async () => {
                    await fileBrowserStore.DeleteFile({objectId, path, filename});

                    // If record was selected, remove from selection
                    setSelectedRecords(selectedRecords.filter(selectedRecord => selectedRecord.fullPath !== fullPath));
                  }}
                />
              </Group>
            );
          },
        },
      ]}
    />
  );
});

const FileBrowser = observer(({objectId, multiple, title, extensions, Close, Submit}) => {
  const [path, setPath] = useState("/");
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const pathTokens = path.replace(/^\//, "").split("/");

  return (
    <Modal opened onClose={Close} centered size={1000} title={title} padding="xl">
      { showUploadForm ? <UploadForm objectId={objectId} path={path} Close={() => setShowUploadForm(false)} /> : null }
      <Container px={0}>
        <Group mb="xl" align="center">
          <ActionIcon aria-label={rootStore.l10n.ui.file_browser.directory_back} disabled={path === "/"} variant="transparent" onClick={() => setPath(UrlJoin("/", ...pathTokens.slice(0, -1)))}>
            <BackIcon />
          </ActionIcon>
          {
            pathTokens.map((token, index) =>
              <Group key={`path-token-${token}-${index}`}>
                <Text>/</Text>
                <UnstyledButton onClick={() => setPath(UrlJoin("/", ...pathTokens.slice(0, index + 1)))}>
                  <Text fw={index === pathTokens.length - 1 ? 600 : 400} color="blue.5">
                    {token}
                  </Text>
                </UnstyledButton>
              </Group>
            )
          }
        </Group>
        <TextInput mb="md" label={rootStore.l10n.ui.fabric_browser.filter} value={filter} onChange={event => setFilter(event.target.value)} />
        <Container px={0} h={550}>
          <FileBrowserTable
            objectId={objectId}
            multiple={multiple}
            extensions={extensions}
            path={path}
            filter={debouncedFilter}
            setPath={setPath}
            selectedRecords={selectedRecords}
            setSelectedRecords={setSelectedRecords}
          />
        </Container>
        {
          selectedRecords.length === 0 ? null :
            <Container my="xl" p={0}>
              <Text mb="sm">Selected Files:</Text>
              <Container p={0}>
                {
                  selectedRecords.map(({fullPath}) =>
                    <Group key={`selected-file-${fullPath}`}>
                      <ActionIcon
                        onClick={() => setSelectedRecords(selectedRecords.filter(record => record.fullPath !== fullPath))}
                      >
                        <XIcon size={15} />
                      </ActionIcon>
                      <Code bg="transparent" >{ fullPath }</Code>
                    </Group>
                  )
                }
              </Container>
            </Container>
        }
        <Group mt="xl" position="apart">
          <Group>
            <Button variant="light" onClick={() => setShowUploadForm(true)}>
              { rootStore.l10n.ui.actions.upload }
            </Button>
            <Button
              variant="light"
              onClick={() =>
                modals.open({
                  title: rootStore.l10n.ui.file_browser.create_directory,
                  centered: true,
                  children:
                    <CreateDirectoryForm Create={async ({filename}) => await fileBrowserStore.CreateDirectory({objectId, path, filename})} />,
                  overlayProps: {
                    zIndex: 202
                  }
                })
              }
            >
              { rootStore.l10n.ui.file_browser.create_directory }
            </Button>
          </Group>
          <Group>
            <Button variant="subtle" w={200} onClick={Close}>
              { rootStore.l10n.ui.actions.cancel }
            </Button>
            <Button
              w={200}
              disabled={selectedRecords.length === 0}
              onClick={() => {
                Submit(multiple ? selectedRecords : selectedRecords[0]);
                Close();
              }}
            >
              { rootStore.l10n.ui.actions.submit }
            </Button>
          </Group>
        </Group>
      </Container>
    </Modal>
  );
});

export const FileBrowserButton = observer(({fileBrowserProps, ...props}) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button {...props} onClick={() => setShow(true)} />
      { show ? <FileBrowser {...fileBrowserProps} Close={() => setShow(false)} /> : null }
    </>
  );
});

export default FileBrowser;
