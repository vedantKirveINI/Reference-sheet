export const filePickerValidation = (ref) => {
  const error = ref.validateFileUpload();
  return error;
};
