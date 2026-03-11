import React, { useCallback, useRef, useState } from "react";
import { Upload, Link as LinkIcon, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import FileList from "../../hitl/components/FileList";
import storageSDKServices from "../../../services/storageSDKServices";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FILE_TYPES } from "../../hitl/constant";

const AddFilesTab = ({
  files = [],
  variables,
  onCancel = () => {},
  onSave = () => {},
}) => {
  const fileUploadRef = useRef(null);
  const [currentFiles, setCurrentFiles] = useState(files);
  const [showUploadLink, setShowUploadLink] = useState(false);
  const [isUploading, setIsUploading] = useState(null);
  const [isRemoving, setIsRemoving] = useState("");
  const [linkType, setLinkType] = useState(FILE_TYPES[0]?.value || "other");
  const [linkData, setLinkData] = useState([]);
  const linkFxRef = useRef(null);

  const reorderHandler = (reorderedItems) => {
    setCurrentFiles(reorderedItems);
  };

  const getFileCategory = (file) => {
    const mimeType = file.type;
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.match(/application\/(zip|x-zip|gzip|x-tar)/)) return "compressed";
    if (
      mimeType.match(
        /application\/(msword|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-powerpoint|vnd.openxmlformats-officedocument.presentationml.presentation|pdf|plain|rich-text)/
      )
    )
      return "document";
    return "other";
  };

  const handleFileUploadSelection = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    for (const [index, file] of selectedFiles.entries()) {
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
        if (file.size > 25 * 1024 * 1024) {
          throw new Error("File size is too large");
        }
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
          setIsUploading(null);
          setCurrentFiles((prev) => [...prev, newFile]);
        }
      } catch (error) {
        setIsUploading(null);
        setCurrentFiles((prev) => [
          ...prev,
          { ...newFile, error: error.message },
        ]);
        toast.error("File upload failed", {
          description: error.message,
        });
      }
    }
    event.target.value = "";
  };

  const onLinkAdded = () => {
    if (!linkData?.length) {
      toast.error("Please enter a valid link");
      return;
    }
    setCurrentFiles((prev) => [
      ...prev,
      {
        id: `${new Date().getTime()}_${prev?.length}`,
        url: { type: "fx", blocks: linkData },
        source: "link",
        type: linkType,
      },
    ]);
    setShowUploadLink(false);
    setLinkData([]);
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
      setCurrentFiles((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setIsRemoving("");
      toast.error("File Deletion Error", {
        description: "Error deleting file",
      });
    }
  };

  const saveHandler = useCallback(async () => {
    onSave(currentFiles?.filter((item) => !item?.error));
  }, [currentFiles, onSave]);

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden" data-testid="add-files-tab">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 border-b bg-white shrink-0">
        <h3 className="text-base font-semibold text-gray-900">Add Files</h3>
        <p className="text-xs text-gray-500 mt-1">Upload files or add file links to use in the HITL Node</p>
      </div>

      {/* Header Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border-b bg-gray-50/50 shrink-0">
        <button
          type="button"
          className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg bg-white cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => fileUploadRef.current?.click()}
          data-testid="upload-file-cta"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-blue-50">
              <Upload className="w-4 h-4 text-blue-600" />
            </div>
            <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Upload Files
            </Label>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Upload files from your local storage and use them in the HITL Node
          </p>
        </button>
        <button
          type="button"
          className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg bg-white cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => setShowUploadLink(true)}
          data-testid="add-file-link-cta"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-purple-50">
              <LinkIcon className="w-4 h-4 text-purple-600" />
            </div>
            <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Add File Links
            </Label>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Add static or dynamic links to your files and use them in the HITL Node
          </p>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 max-h-[50vh]">
          {showUploadLink && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Select
                  value={linkType}
                  onValueChange={setLinkType}
                >
                  <SelectTrigger className="w-full sm:w-36 h-9 text-xs border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1 min-w-0">
                  <FormulaBar
                    ref={linkFxRef}
                    variables={variables}
                    wrapContent
                    defaultInputContent={linkData}
                    placeholder="Enter link here"
                    onInputContentChanged={setLinkData}
                    slotProps={{
                      container: {
                        className: "min-h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400",
                      },
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onLinkAdded}
                    className="h-9 w-9 p-0 hover:bg-green-50 hover:text-green-600"
                    aria-label="Add link"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowUploadLink(false);
                      setLinkData([]);
                    }}
                    className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                    aria-label="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="w-full">
            <FileList
              files={currentFiles}
              onReorder={reorderHandler}
              showUploadLink={false}
              onLinkAdded={onLinkAdded}
              onLinkCancel={() => setShowUploadLink(false)}
              onTypeChange={linkTypeChangedHandler}
              onRemove={removeFileHandler}
              isUploading={isUploading}
              isRemoving={isRemoving}
              onLinkContentChanged={onLinkContentChanged}
              variables={variables}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50/50 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={!!isUploading || !!isRemoving}
          className="min-w-[80px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={saveHandler}
          disabled={!!isUploading || !!isRemoving}
          className="min-w-[80px]"
        >
          Save
        </Button>
      </div>

      <input
        type="file"
        multiple
        className="hidden"
        ref={fileUploadRef}
        onChange={handleFileUploadSelection}
        aria-label="File upload"
      />
    </div>
  );
};

export default AddFilesTab;
