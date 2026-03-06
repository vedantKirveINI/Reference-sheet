import { mimeTypeToExtension } from "./mimeTypeExtensions";
import { FILE_SIZE_LIMIT } from "./constants";

const getFileExtension = (file) => {
  // First, try to get extension from filename (most reliable for Windows)
  const fileExt = file?.name?.split(".").pop()?.toLowerCase();
  
  // If we have a valid file extension, use it
  if (fileExt && fileExt.length > 0) {
    return fileExt;
  }
  
  // Fallback to MIME type mapping
  let mimeType = file?.type || file?.mimeType;
  let fileExtension = mimeTypeToExtension[mimeType];
  
  // If MIME type mapping fails, try to extract from MIME type
  if (!fileExtension) {
    fileExtension = mimeType?.split("/").pop();
  }
  
  return fileExtension;
};

export const validateFileUpload = ({ files, settings }) => {
  if (settings?.required) {
    if (files?.length === 0) {
      return "This field is required";
    }
  }

  const noOfFilesAllowed = settings?.noOfFilesAllowed;

  const allowedFileTypes = settings?.allowedFileTypes?.map(
    (file) => file?.extension
  );

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
      let fileExtension = getFileExtension(files[i]);
      
      // Handle case where fileExtension is an array (multiple possible extensions)
      if (Array.isArray(fileExtension)) {
        // Check if any of the possible extensions is allowed
        if (!fileExtension.some(ext => allowedFileTypes.includes(ext))) {
          return `Please select only ${allowedFileTypes.join(", ")} files`;
        }
      } else {
        // Handle case where fileExtension is a string
        if (!allowedFileTypes.includes(fileExtension)) {
          return `Please select only ${allowedFileTypes.join(", ")} files`;
        }
      }
    }
  }

  return null;
};
