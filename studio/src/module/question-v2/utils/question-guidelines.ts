export const getMCQGuideline = ({ settings, value }) => {
  const selectionType = settings?.selection?.type;
  const exactNumber = settings?.selection?.exactNumber;
  const range = settings?.selection?.range;
  const selectedCount = value?.length || 0;

  if (selectionType === "Unlimited") {
    return "Select as many options as you wish.";
  }

  if (selectionType === "Exact Number") {
    if (selectedCount === 0 && exactNumber == 1) {
      return `You can select only one option`;
    }
    if (selectedCount === 0) {
      return `You must select a total of ${exactNumber} options`;
    }
    if (selectedCount < exactNumber) {
      return `Select ${exactNumber - selectedCount} more option`;
    }
  }

  if (selectionType === "Range") {
    const min = range?.start || 0;
    const max = range?.end || 0;

    if (selectedCount === 0) {
      return `Select a minimum of ${min} and a maximum of ${max} options.`;
    }
    if (selectedCount < min) {
      return `Select ${min - selectedCount} more option`;
    }
    if (selectedCount < max) {
      return `You can select ${max - selectedCount} more options.`;
    }
  }

  return null;
};
