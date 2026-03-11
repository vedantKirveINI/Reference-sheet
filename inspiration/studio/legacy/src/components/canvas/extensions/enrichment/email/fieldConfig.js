const initializeFields = [
  {
    key: "enricherName",
    label: "Name Email Enricher",
    placeholder: "Enter name",
    description: "Give a suitable name for the email enricher",
    required: true,
  },
];

const configureFields = [
  {
    key: "domain",
    name: "Domain",
    label: "Company domain identifier",
    placeholder: "Enter company domain identifier",
    type: "fx",
    required: true,
    description:
      "The company domain is required to identify the organization and improve email accuracy.",
  },
  {
    key: "fullName",
    name: "Full Name",
    label: "Person's full name",
    placeholder: "Enter person's full name",
    type: "fx",
    required: true,
    description:
      "The person's full name is required to generate accurate email addresses.",
  },
];

export { initializeFields, configureFields };
