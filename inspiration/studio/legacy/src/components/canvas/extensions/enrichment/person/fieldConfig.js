const initializeFields = [
  {
    key: "enricherName",
    label: "Name Person Enricher",
    placeholder: "Enter name",
    description: "Give a suitable name for the person enricher",
    required: true,
  },
];

const configureFields = [
  {
    key: "fullName",
    name: "Person's Full Name",
    label: "Person's full name",
    placeholder: "Enter person's full name",
    type: "fx",
    required: true,
    description:
      "The person's full name is required for accurate data enrichment.",
  },
  {
    key: "domain",
    name: "Company Domain",
    label: "Company domain identifier",
    placeholder: "Enter company domain identifier",
    type: "fx",
    required: true,
    description:
      "The company domain helps identify the person's workplace and improves search accuracy.",
  },
  {
    key: "linkedinUrl",
    name: "LinkedIn URL",
    label: "LinkedIn profile URL",
    placeholder: "Enter LinkedIn profile URL",
    type: "fx",
    required: false,
    description:
      "Optional LinkedIn profile URL for direct data extraction. If not provided, will search for profile information.",
  },
];

export { initializeFields, configureFields };
