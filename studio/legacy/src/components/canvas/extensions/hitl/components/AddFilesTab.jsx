import React, { useCallback, useRef, useState } from "react";
// import { showAlert } from "oute-ds-alert";
// import Button from "oute-ds-button";
// import Icon from "oute-ds-icon";
// import Label from "oute-ds-label";
import { showAlert, ODSButton as Button, ODSIcon as Icon, ODSLabel as Label } from "@src/module/ods";
import styles from "./AddFilesTab.module.css";
import FileList from "./FileList";
import storageSDKServices from "../../../services/storageSDKServices";

const AddFilesTab = ({
  files = [],
  variables,
  onCancel = () => {},
  onSave = () => {},
}) => {
  const fileUploadRef = useRef();
  const [currentFiles, setCurrentFiles] = useState(files);
  const [showUploadLink, setShowUploadLink] = useState(false);
  const [isUploading, setIsUploading] = useState("");
  const [isRemoving, setIsRemoving] = useState("");
  const reorderHandler = (reorderedItems) => {
    setCurrentFiles(reorderedItems);
  };
  const handleFileUploadSelection = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const getFileCategory = (file) => {
      const mimeType = file.type;

      if (mimeType.startsWith("image/")) return "image";
      if (mimeType.startsWith("video/")) return "video";
      if (mimeType.startsWith("audio/")) return "audio";
      if (mimeType === "application/pdf") return "pdf";
      if (mimeType.match(/application\/(zip|x-zip|gzip|x-tar)/))
        return "compressed";
      if (
        mimeType.match(
          /application\/(msword|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-powerpoint|vnd.openxmlformats-officedocument.presentationml.presentation|pdf|plain|rich-text)/
        )
      )
        return "document";

      return "other";
    };

    // Iterate over each file and process it
    for (const [index, file] of files.entries()) {
      let newFile = {
        source: "file",
        id: `${new Date().getTime()}_${index}`,
        isUploaded: false,
        name: file.name,
        type: getFileCategory(file),
        size: file.size,
      };

      try {
        setIsUploading(file);
        // If file size is too large, return an error object for that file
        if (file.size > 25 * 1024 * 1024) {
          throw new Error("File size is too large");
        }
        if (newFile.error) throw new Error(newFile.error);
        const response = await storageSDKServices.uploadFile({
          fileName: newFile.name,
          fileType: newFile.type,
          file_obj: file,
        });

        if (response.status === "success") {
          newFile = {
            ...newFile,
            url: response.result.cdn,
            filePath: response.result.filePath,
            isUploaded: true,
          };
          setIsUploading("");
          setCurrentFiles((prev) => [...prev, newFile]);
        }
      } catch (error) {
        setIsUploading("");
        setCurrentFiles((prev) => [
          ...prev,
          { ...newFile, error: error.message },
        ]);
      }
    }
    event.target.value = "";
  };

  const onLinkAdded = (link) => {
    setCurrentFiles((prev) => [
      ...prev,
      { ...link, id: `${new Date().getTime()}_${prev?.length}` },
    ]);
    setShowUploadLink(false);
  };

  const linkTypeChangedHandler = (id, type) => {
    setCurrentFiles((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, type };
        }
        return item;
      })
    );
  };

  const onLinkContentChanged = (id, content) => {
    setCurrentFiles((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, url: { type: "fx", blocks: content } };
        }
        return item;
      })
    );
  };

  const removeFileHandler = async (id) => {
    try {
      // const file = currentFiles.find((item) => item.id === id);
      // if (file?.isUploaded) {
      //   setIsRemoving(id);
      //   const response = await storageSDKServices.getUploadSignedUrl({
      //     filePath: file?.filePath,
      //     op: "delete",
      //   });
      //   if (response.status === "success") {
      //     setIsRemoving("");
      //   }
      // }
      setCurrentFiles((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setIsRemoving("");
      showAlert({ type: "error", message: "Error deleting file" });
    }
  };

  const uploadCTAClickHandler = (type) => {
    if (type === "file") {
      fileUploadRef.current.click();
    } else if (type === "link") {
      setShowUploadLink(true);
    }
  };

  const saveHandler = useCallback(async () => {
    onSave(currentFiles?.filter((item) => !item?.error));
  }, [currentFiles, onSave]);

  return (
    <div className={styles.container} data-testid="add-files-tab">
      <div className={styles.uploadCTAs}>
        <div
          className={styles.uploadCTA}
          onClick={() => uploadCTAClickHandler("file")}
          data-testid="upload-file-cta"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Icon
              outeIconName="UploadFileIcon"
              outeIconProps={{
                sx: { width: "1.5rem", height: "1.5rem", color: "#212121" },
              }}
            />
            <Label variant="caption" className={styles.title}>
              UPLOAD
            </Label>
          </div>
          <Label className={styles.desc}>
            Upload files from your local storage and use them in the HITL Node
          </Label>
        </div>
        <div
          className={styles.uploadCTA}
          onClick={() => uploadCTAClickHandler("link")}
          data-testid="add-file-link-cta"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Icon
              outeIconName="OUTEInsertLinkIcon"
              outeIconProps={{
                sx: { width: "1.5rem", height: "1.5rem", color: "#212121" },
              }}
            />
            <Label variant="caption" className={styles.title}>
              Add File Links
            </Label>
          </div>
          <Label className={styles.desc}>
            Add static or dynamic links to your files and use them in the HITL
            Node
          </Label>
        </div>
      </div>
      <FileList
        files={currentFiles}
        onReorder={reorderHandler}
        showUploadLink={showUploadLink}
        onLinkAdded={onLinkAdded}
        onLinkCancel={() => setShowUploadLink(false)}
        onTypeChange={linkTypeChangedHandler}
        onRemove={removeFileHandler}
        isUploading={isUploading}
        isRemoving={isRemoving}
        onLinkContentChanged={onLinkContentChanged}
        variables={variables}
      />
      <div className={styles.footer}>
        <Button
          label="Cancel"
          size="large"
          data-testid="cancel-button"
          variant="black-outlined"
          disabled={isUploading || isRemoving}
          onClick={onCancel}
        />
        <Button
          label="Save"
          size="large"
          data-testid="save-button"
          variant="black"
          disabled={isUploading || isRemoving}
          onClick={saveHandler}
        />
      </div>
      <input
        type="file"
        multiple
        style={{ display: "none" }}
        ref={fileUploadRef}
        onChange={handleFileUploadSelection}
      />
    </div>
  );
};

export default AddFilesTab;
