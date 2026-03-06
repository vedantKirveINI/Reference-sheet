export const handleSignatureUpload = async ({ ref }) => {
  try {
    const url = await ref.current.uploadSignature();
    return { url: url };
  } catch (e) {
    return { error: e.message || "File upload failed" };
  }
};
