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

function base64ToBlob(base64: string, mimeType: string): Blob {
  // Remove Data URL prefix if present
  if (base64.startsWith("data:")) {
    base64 = base64.split(",")[1];
  }

  // Decode Base64 string
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

export const uploadSignature = async (base64Data) => {
  const fileName = "signature.png";
  const fileType = "image/png";
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
    const binaryData = base64ToBlob(base64Data, fileType);

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: binaryData,
      redirect: "follow",
    });

    return cdnUrl;
  } catch (err) {
    throw err;
  }
};
