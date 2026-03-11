import html2canvas from "html2canvas";

interface domToImageOptions {
  input: string | HTMLElement;
  options?: any;
}

export const convertHtmlToImage = async (element, payloadOverrides = {}) => {
  const canvas = await html2canvas(element, {
    width: 900,
    height: 250,
    logging: false,
    ...payloadOverrides,
  });
  let dataURL = canvas.toDataURL("image/png");
  return dataURL;
};

export const domToImage = async ({ input }: domToImageOptions) => {
  try {
    const node =
      typeof input === "string" ? document.getElementById(input) : input;

    document.body.appendChild(node);
    const { width, height } = node.getBoundingClientRect();
    await new Promise((resolve) => setTimeout(resolve, 1));
    const src = await convertHtmlToImage(node, {
      width,
      height,
      scale: 1,
      useCORS: true,
      allowTaint: true,
    });
    document.body.removeChild(node);

    return src;
  } catch (error) {}
};

export const base64ToBlob = (
  base64: string,
  contentType = "image/webp"
): Blob => {
  if (!base64) return new Blob();
  const byteCharacters = atob(base64.split(",")[1]); // Decode Base64
  const byteNumbers = new Uint8Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  return new Blob([byteNumbers], { type: contentType });
};
