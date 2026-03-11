const initializeFields = [
  {
    key: "enricherName",
    label: "Name Company Enricher",
    placeholder: "Enter name",
    description: "Give a suitable name for the company enricher",
    required: true,
  },
];

const configureFields = [
  {
    key: "domain",
    name: "Domain",
    label: "Select domain identifier",
    placeholder: "Enter company domain identifier",
    type: "fx",
    required: true,
    description:
      "The company domain or website URL is the most effective identifier for company data enhancement.",
  },
];

export { initializeFields, configureFields };
