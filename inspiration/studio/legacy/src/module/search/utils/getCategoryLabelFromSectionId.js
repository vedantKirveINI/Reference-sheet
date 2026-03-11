import snakeCase from "lodash/snakeCase";

const getCategoryLabelFromSectionId = ({ tabData, sectionId }) => {
  // Handle special case for recent section
  if (sectionId === "section_recent") {
    return "All";
  }

  // Extract the section key (e.g., "ai" from "section_ai")
  const sectionKey = sectionId.replace(/^section[-_]/, "");

  // Find matching category from filteredTabData or tabData
  const matchingCategory = tabData.find((tab) => {
    const tabKey = snakeCase(tab.label);
    return tabKey === sectionKey;
  });

  return matchingCategory ? matchingCategory.label : null;
};

export default getCategoryLabelFromSectionId;
