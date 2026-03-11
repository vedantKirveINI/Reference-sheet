import { serverConfig } from "@src/module/ods";

const BASE_URL = serverConfig.FILE_UPLOAD_SERVER;
declare global {
  interface Window {
    accessToken?: string;
  }
}
const getToken = () => {
  return window.accessToken;
};

export const uploadFile = async (file: File) => {
  const fileName = file?.name;
  const fileType = file?.name.split(".").pop();
  const fileSize = file?.size;
  try {
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
  } catch (err) {
    throw err;
  }
};
