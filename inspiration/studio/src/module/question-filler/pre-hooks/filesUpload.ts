export const handleFilesUpload = async ({ node, ref }) => {
  try {
    const urls = await ref.current.uploadFiles();
    return { urls: urls };
  } catch (e) {
    return { error: e.message || "File upload failed" };
  }
};
