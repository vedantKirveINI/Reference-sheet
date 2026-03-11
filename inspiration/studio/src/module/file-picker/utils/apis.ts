import { toast } from "sonner";
import { uploadFile } from "./fileUploadApi";

const uploadFiles = async ({ files, onSuccess }) => {
  try {
    const uploadPromises = files.map((file) => uploadFile(file));
    const urls = await Promise.all(uploadPromises);
    if (onSuccess) {
      onSuccess(urls);
    }
    return urls;
  } catch (error) {
    toast.error("File Upload Error", {
      description: error.message,
    });
    throw error;
  }
};

export { uploadFiles };
