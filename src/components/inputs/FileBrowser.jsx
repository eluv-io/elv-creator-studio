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
  RingProgress,
  Text,
  TextInput, Tooltip,
  UnstyledButton
} from "@mantine/core";
import {Dropzone} from "@mantine/dropzone";
import { modals } from "@mantine/modals";
import {useForm} from "@mantine/form";
import {useEffect, useState} from "react";
import {rootStore, fileBrowserStore, uiStore} from "@/stores";
import {DataTable} from "mantine-datatable";
import PrettyBytes from "pretty-bytes";
import {LocalizeString} from "@/components/common/Misc";
import {SortTable} from "@/helpers/Misc";
import UrlJoin from "url-join";
import {useDebouncedValue} from "@mantine/hooks";
import {ConfirmDelete} from "./Inputs.jsx";
import {ScaleImage} from "@/helpers/Fabric.js";

import {
  IconArrowBackUp as IconBackArrow,
  IconEditCircle,
  IconFileDownload,
  IconCircleCheck as IconDownloadCompleted,
  IconFolder as IconDirectory,
  IconFile,
  IconFiles,
  IconLockSquare as IconFileEncrypted,
  IconPhoto,
  IconTrashX as IconDelete,
  IconX,
  IconUpload
} from "@tabler/icons-react";



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
      height={Math.max(250, uiStore.viewportHeight - 600)}
      records={records}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      columns={[
        { accessor: "filename", title: rootStore.l10n.components.file_browser.columns.filename, sortable: true, render: ({filename}) => <Text style={{wordWrap: "anywhere"}}>{filename}</Text> },
        { accessor: "size", title: rootStore.l10n.components.file_browser.columns.size, sortable: true, render: ({total, size}) => PrettyBytes(total || size), width: 100 },
        {
          accessor: "uploaded",
          sortable: true,
          title: rootStore.l10n.components.file_browser.columns.progress,
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
      title={LocalizeString(rootStore.l10n.components.file_browser.upload_files, {path})}
    >
      <Container py="xl">
        <Dropzone
          multiple
          maw={600}
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
              <IconUpload />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconFiles />
            </Dropzone.Idle>

            <Text size="xl" inline>
              { rootStore.l10n.components.file_browser.upload_instructions_drag }
            </Text>
          </Group>
          <Group position="center" align="center">
            <Text size="sm" mt="sm" inline color="dimmed">
              { rootStore.l10n.components.file_browser.upload_instructions_click }
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
            { uploading ? "" : rootStore.l10n.components.actions.done }
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
      filename: value => value ? null : rootStore.l10n.components.file_browser.validation.filename_must_be_specified
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
          label={rootStore.l10n.components.file_browser.directory_name}
          {...form.getInputProps("filename")}
        />
        <Group mt="md">
          <Button
            w="100%"
            loading={renaming}
            type="submit"
          >
            { rootStore.l10n.components.actions.submit }
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
      newFilename: value => value ? null : rootStore.l10n.components.file_browser.validation.filename_must_be_specified
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
          label={rootStore.l10n.components.file_browser.new_filename}
          {...form.getInputProps("newFilename")}
        />
        <Group mt="md">
          <Button
            w="100%"
            loading={renaming}
            type="submit"
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </form>
    </Container>
  );
};

const DownloadFileButton = ({objectId, path, filename, url, encrypted}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const commonProps = {
    color: "blue.5",
    "aria-label": LocalizeString(rootStore.l10n.components.file_browser.download, {filename})
  };

  if(encrypted) {
    return (
      <Tooltip label={commonProps["aria-label"]} events={{ hover: true, focus: true, touch: true }}>
        <ActionIcon
          {...commonProps}
          sx={{"&[data-loading]::before": { backgroundColor: "rgba(0,0,0,0)"}}}
          onClick={async () => {
            try {
              if(downloading) { return; }

              setDownloading(true);

              await fileBrowserStore.DownloadEncryptedFile({
                objectId,
                path,
                filename,
                callback: ({bytesFinished, bytesTotal}) => setProgress((bytesFinished || 0) / (bytesTotal || 1) * 100)
              });
            } catch(error) {
              rootStore.DebugLog({error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
            }
          }}
        >
          {
            !downloading ? <IconFileDownload /> :
              progress >= 100 ?
                <IconDownloadCompleted /> :
                <RingProgress size={30} thickness={4} rootColor="gray.5" sections={[{value: progress, color: "blue.5"}]}/>
          }
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={commonProps["aria-label"]} events={{ hover: true, focus: true, touch: true }}>
      <ActionIcon
        {...commonProps}
        component="a"
        href={url}
        target="_blank"
      >
        <IconFileDownload/>
      </ActionIcon>
    </Tooltip>
  );
};

const DeleteFileButton = ({filename, Delete}) => {
  const [deleting, setDeleting] = useState(false);

  return (
    <Tooltip label={LocalizeString(rootStore.l10n.components.file_browser.delete, {filename})} events={{ hover: true, focus: true, touch: true }}>
      <ActionIcon
        aria-label={LocalizeString(rootStore.l10n.components.file_browser.delete, {filename})}
        color="red.5"
        loading={deleting}
        onClick={() => {
          ConfirmDelete({
            title: LocalizeString(rootStore.l10n.components.file_browser.delete, {filename}),
            itemName: filename,
            modalProps: {
              overlayProps: {
                zIndex: 202
              }
            },
            onConfirm: () => {
              setDeleting(true);
              Delete()
                .finally(() => setDeleting(false));
            }
          });
        }}
      >
        <IconDelete/>
      </ActionIcon>
    </Tooltip>
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

  let directory = fileBrowserStore.Directory({objectId, path})
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

  const isRecordSelectable = ({encrypted, type, ext}) =>
    !encrypted && type !== "directory" && (!extensions || extensions.length === 0 || extensions.includes(ext));

  return (
    <DataTable
      fetching={loading}
      onRowClick={(record) => {
        if(record.type === "directory") {
          setPath(UrlJoin(path, record.filename));
        } else if(isRecordSelectable({type: record.type, ext: record.ext})) {
          if(selectedRecords.find(selectedRecord => selectedRecord.fullPath === record.fullPath)) {
            setSelectedRecords(selectedRecords.filter(selectedRecord => selectedRecord.fullPath !== record.fullPath));
          } else {
            setSelectedRecords(multiple ? [...selectedRecords, record] : [record]);
          }
        }
      }}
      height={Math.max(250, uiStore.viewportHeight - 500)}
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
      isRecordSelectable={isRecordSelectable}
      columns={[
        {
          accessor: "type",
          title: rootStore.l10n.components.file_browser.columns.type,
          width: 85,
          sortable: true,
          render: ({filename, type, encrypted, url}) => {
            if(type !== "image" || encrypted) {
              return (
                type === "directory" ? <IconDirectory /> :
                  encrypted ? <IconFileEncrypted /> : <IconFile />
              );
            }

            return (
              <HoverCard width={200} shadow="md">
                <HoverCard.Target>
                  <Container p={0} style={{cursor: "pointer"}}>
                    <IconPhoto />
                  </Container>
                </HoverCard.Target>
                <HoverCard.Dropdown ml={85} bg="gray.1" p="xl" >
                  <Image
                    caption={<Text style={{wordWrap: "anywhere"}}>{ filename }</Text>}
                    alt={filename}
                    src={ScaleImage(url, 200)}
                    fit="contain"
                  />
                </HoverCard.Dropdown>
              </HoverCard>
            );
          }
        },
        { accessor: "filename", title: rootStore.l10n.components.file_browser.columns.filename, sortable: true, render: ({filename}) => <Text style={{wordWrap: "anywhere"}}>{filename}</Text> },
        { accessor: "size", width: 100, title: rootStore.l10n.components.file_browser.columns.size, sortable: true, render: ({size}) => typeof size === "number" ? PrettyBytes(size) : "" },
        {
          accessor: "actions",
          title: rootStore.l10n.components.file_browser.columns.actions,
          textAlignment: "center",
          render: ({type, filename, url, fullPath, encrypted}) => {
            return (
              <Group spacing={6} position="center" noWrap onClick={event => event.stopPropagation()}>
                {
                  type === "directory" ? null :
                    <Tooltip label={LocalizeString(rootStore.l10n.components.file_browser.rename, {filename})} events={{ hover: true, focus: true, touch: true }}>
                      <ActionIcon
                        aria-label={LocalizeString(rootStore.l10n.components.file_browser.rename, {filename})}
                        color="green.5"
                        onClick={() =>
                          modals.open({
                            title: LocalizeString(rootStore.l10n.components.file_browser.rename, {filename}),
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
                        <IconEditCircle/>
                      </ActionIcon>
                    </Tooltip>
                }
                {
                  type === "directory" ? null :
                    <DownloadFileButton
                      objectId={objectId}
                      path={path}
                      filename={filename}
                      encrypted={encrypted}
                      url={url}
                    />
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

const FileBrowser = observer(({objectId, multiple, title, extensions, opened=true, Close, Submit}) => {
  const [path, setPath] = useState("/");
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  if(extensions === "image") {
    extensions = fileBrowserStore.imageTypes;
  }

  const pathTokens = path.replace(/^\//, "").split("/");

  return (
    <Modal opened={opened} onClose={Close} centered size={1000} title={title} padding="xl">
      { showUploadForm ? <UploadForm objectId={objectId} path={path} Close={() => setShowUploadForm(false)} /> : null }
      <Container px={0}>
        <Group mb="xs" align="center" spacing="xs">
          <Tooltip label={rootStore.l10n.components.file_browser.directory_back} events={{ hover: true, focus: true, touch: true }}>
            <ActionIcon aria-label={rootStore.l10n.components.file_browser.directory_back} disabled={path === "/"} variant="transparent" onClick={() => setPath(UrlJoin("/", ...pathTokens.slice(0, -1)))}>
              <IconBackArrow />
            </ActionIcon>
          </Tooltip>
          {
            pathTokens.map((token, index) =>
              <Group spacing="xs" key={`path-token-${token}-${index}`}>
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
        <TextInput mb="md" label={rootStore.l10n.components.fabric_browser.filter} value={filter} onChange={event => setFilter(event.target.value)} />
        <Container px={0}>
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
                      <Tooltip label={LocalizeString(rootStore.l10n.components.file_browser.remove_selection, {filename: fullPath})} events={{ hover: true, focus: true, touch: true }}>
                        <ActionIcon onClick={() => setSelectedRecords(selectedRecords.filter(record => record.fullPath !== fullPath))}>
                          <IconX size={15} />
                        </ActionIcon>
                      </Tooltip>
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
              { rootStore.l10n.components.actions.upload }
            </Button>
            <Button
              variant="light"
              onClick={() =>
                modals.open({
                  title: rootStore.l10n.components.file_browser.create_directory,
                  centered: true,
                  children:
                    <CreateDirectoryForm Create={async ({filename}) => await fileBrowserStore.CreateDirectory({objectId, path, filename})} />,
                  overlayProps: {
                    zIndex: 202
                  }
                })
              }
            >
              { rootStore.l10n.components.file_browser.create_directory }
            </Button>
          </Group>
          <Group>
            <Button variant="subtle" w={200} onClick={Close}>
              { rootStore.l10n.components.actions.cancel }
            </Button>
            <Button
              w={200}
              disabled={selectedRecords.length === 0}
              onClick={() => {
                Submit(multiple ? selectedRecords : selectedRecords[0]);
                Close();
              }}
            >
              { rootStore.l10n.components.actions.submit }
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
