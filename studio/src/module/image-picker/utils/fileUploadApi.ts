import { serverConfig } from "@src/module/ods";

const BASE_URL = serverConfig.FILE_UPLOAD_SERVER;

declare global {
  interface Window {
    token?: string;
    accessToken?: string;
  }
}

const getToken = () => {
  return window.token ?? window.accessToken;
};

export const uploadFile = async (file: File): Promise<string | undefined> => {
  const fileName = file?.name;
  const fileType = file?.name.split(".").pop();
  try {
    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: getToken() ?? "",
      },
      body: JSON.stringify({
        fileName,
        fileType,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }

    const data = await response.json();
    const uploadUrl = data.upload;
    const cdnUrl = data.cdn;

    const putResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      redirect: "follow",
    });

    if (!putResponse.ok) {
      throw new Error("Failed to upload file");
    }

    return cdnUrl;
  } catch (err) {
    throw err;
  }
};
