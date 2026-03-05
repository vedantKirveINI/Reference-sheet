export const filePickerValidation = (ref) => {
  let error = ref.validateFileUpload();
  return error;
};
