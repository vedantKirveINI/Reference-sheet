import { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { serverConfig } from "@src/module/ods";

const FILE_SIZE_LIMIT = 25;

const uploadFile = async (file: File) => {
  const BASE_URL = serverConfig.FILE_UPLOAD_SERVER;
  const getToken = () => (window as any).accessToken;
  
  const fileName = file?.name;
  const fileType = file?.name.split(".").pop();
  const fileSize = file?.size;
  
  const response = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: {
      token: getToken(),
    },
    body: JSON.stringify({
      fileName: fileName,
      fileType: fileType,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  const data = await response.json();
  const uploadUrl = data.upload;
  const cdnUrl = data.cdn;

  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    redirect: "follow",
  });

  return {
    name: fileName,
    url: cdnUrl,
    size: fileSize,
    mimeType: file?.type,
  };
};

const uploadFiles = async ({ files, onSuccess }: { files: File[]; onSuccess?: (urls: any[]) => void }) => {
  try {
    const uploadPromises = files.map((file) => uploadFile(file));
    const urls = await Promise.all(uploadPromises);
    if (onSuccess) {
      onSuccess(urls);
    }
    return urls;
  } catch (error: any) {
    toast.error("File Upload Error", {
      description: error.message,
    });
    throw error;
  }
};

const validateFileUpload = ({ files, settings }: { files: any[]; settings: any }) => {
  if (settings?.required) {
    if (files?.length === 0) {
      return "This field is required";
    }
  }

  const noOfFilesAllowed = settings?.noOfFilesAllowed;
  const allowedFileTypes = settings?.allowedFileTypes?.map((file: any) => file?.extension);

  if (noOfFilesAllowed && files?.length > noOfFilesAllowed) {
    return `Please select only ${noOfFilesAllowed} files`;
  }

  let totalSize = 0;
  for (let i = 0; i < files?.length; i++) {
    totalSize = totalSize + files[i]?.size / (1024 * 1024);
  }
  if (totalSize > FILE_SIZE_LIMIT) {
    return `Please select file size less than ${FILE_SIZE_LIMIT} MB`;
  }

  if (
    Array.isArray(allowedFileTypes) &&
    allowedFileTypes?.length > 0 &&
    Array.isArray(files) &&
    files?.length > 0
  ) {
    for (let i = 0; i < files.length; i++) {
      const fileExt = files[i]?.name?.split(".").pop()?.toLowerCase();
      if (fileExt && !allowedFileTypes.includes(fileExt)) {
        return `Please select only ${allowedFileTypes.join(", ")} files`;
      }
    }
  }

  return null;
};

export interface FilePickerProps {
  isCreator?: boolean;
  settings?: any;
  onChange?: (value: any) => void;
  value?: any[];
  disabled?: boolean;
  error?: string;
}

interface FileItemProps {
  file: any;
  onRemove: (file: any) => void;
  isUploaded?: boolean;
}

const FileItem = ({ file, onRemove, isUploaded }: FileItemProps) => {
  const fileName = typeof file === "string" ? file : file?.name || file?.url;
  const displayName = fileName?.split("/").pop() || "File";
  
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border/50 group">
      <File className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm truncate flex-1" title={displayName}>
        {displayName}
      </span>
      {isUploaded && (
        <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
          Uploaded
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(file)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export const FilePicker = forwardRef<any, FilePickerProps>(
  ({ isCreator, settings, onChange, value: valueFromProps = [], disabled = false, error }, ref) => {
    const [files, setFiles] = useState<File[]>([]);
    const [value, setValue] = useState(valueFromProps);
    const [uploading, setUploading] = useState(false);
    
    const totalLengthOfFiles = files?.length + value?.length;
    const isLengthExceeded = totalLengthOfFiles >= (settings?.noOfFilesAllowed || Infinity);

    const handleFilesChange = useCallback((newFiles: File[]) => {
      setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const onRemoveFile = useCallback((file: File) => {
      setFiles((prev) => prev.filter((f) => f !== file));
    }, []);

    const onRemoveFromValue = useCallback((file: any) => {
      const newUrls = value?.filter((f: any) => f !== file);
      onChange?.(newUrls);
      setValue(newUrls);
    }, [value, onChange]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
      handleFilesChange(acceptedFiles);
    }, [handleFilesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      disabled: disabled || isCreator,
      accept: settings?.allowedFileTypes?.reduce((acc: any, type: any) => {
        acc[`.${type.extension}`] = [];
        return acc;
      }, {}),
    });

    useImperativeHandle(
      ref,
      () => ({
        uploadFiles: async () => {
          if (files.length === 0) return value;
          setUploading(true);
          try {
            const urls = await uploadFiles({
              files: files,
              onSuccess: (urls: any) => {
                setFiles([]);
                setValue((prev) => [...prev, ...urls]);
              },
            });
            return [...value, ...urls];
          } finally {
            setUploading(false);
          }
        },
        urls: [...value, ...files],
        validateFileUpload: () => {
          return validateFileUpload({
            files: [...value, ...files],
            settings,
          });
        },
      }),
      [files, value, settings]
    );

    const allowedFileTypes = settings?.allowedFileTypes?.map((file: any) => `.${file?.extension}`);

    return (
      <div className="space-y-3">
        {(files?.length > 0 || value?.length > 0) && (
          <div className={cn(
            "space-y-2 p-3 rounded-lg border",
            error ? "border-destructive/50 bg-destructive/5" : "border-border bg-muted/30"
          )}>
            {value?.map((file: any, index: number) => (
              <FileItem
                key={`value-${index}`}
                file={file}
                onRemove={onRemoveFromValue}
                isUploaded
              />
            ))}
            {files?.map((file: File, index: number) => (
              <FileItem
                key={`file-${index}`}
                file={file}
                onRemove={onRemoveFile}
              />
            ))}
          </div>
        )}

        {!isLengthExceeded && (
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed transition-all cursor-pointer",
              isDragActive && "border-primary bg-primary/5",
              error && "border-destructive/50",
              !isDragActive && !error && "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
              (disabled || isCreator) && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} accept={allowedFileTypes?.join(", ")} />
            
            {uploading ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <Upload className={cn(
                "h-8 w-8 transition-colors",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )} />
            )}
            
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">
                {isDragActive ? "Drop files here" : "Drag & Drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                or <span className="text-primary font-medium">choose file</span>
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Size Limit: {FILE_SIZE_LIMIT}MB
            </p>
            
            {allowedFileTypes && allowedFileTypes.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Allowed: {allowedFileTypes.join(", ")}
              </p>
            )}
          </div>
        )}
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

FilePicker.displayName = "FilePicker";

export default FilePicker;
