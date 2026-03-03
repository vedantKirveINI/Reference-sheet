export const STEPS = [
  {
    label: 'Configure AI Enrichment',
    description: 'Set up your AI enrichment parameters and filters',
  },
  {
    label: 'Review ICP Data',
    description: 'Review and filter the generated ICP data',
  },
];

export const FIELDS_PAYLOAD = [
  { name: 'Title', type: 'SHORT_TEXT' },
  { name: 'Url', type: 'SHORT_TEXT' },
  { name: 'Content', type: 'LONG_TEXT' },
];

export const PREVIEW_FIELDS = ['Title', 'Url', 'Content'];

export const AI_ENRICHMENT_OPTIONS = [
  { label: 'Find Customer (Company)', value: 'companies' },
  { label: 'Find Customer (People)', value: 'people' },
];

export const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export const INDUSTRY_OPTIONS = [
  'SaaS',
  'Fintech',
  'Healthcare',
  'E-commerce',
  'Manufacturing',
  'Retail',
  'Media and Entertainment',
  'Education',
  'Real Estate',
  'Automotive',
  'Logistics and Supply Chain',
  'Banking and Financial Services',
  'Telecommunications',
  'Energy and Utilities',
  'Consulting',
  'Insurance',
  'Legal Services',
  'Government and Public Sector',
  'Non-profit',
  'Travel and Hospitality',
];

export const GEOGRAPHY_OPTIONS = [
  'United States',
  'Europe',
  'India',
  'Asia-Pacific',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Southeast Asia',
  'Latin America',
  'Middle East',
  'Africa',
  'France',
  'Japan',
  'Brazil',
];
