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

export const DISCOVERY_STEPS = [
  { label: 'Configure Search', description: 'Set your search criteria' },
  { label: 'Preview & Create', description: 'Review results and create table' },
];

export const FIELDS_PAYLOAD = [
  {
    name: 'Title',
    type: 'SHORT_TEXT',
    options: { reference: 'title' },
  },
  {
    name: 'Url',
    type: 'SHORT_TEXT',
    options: { reference: 'url' },
  },
  {
    name: 'Content',
    type: 'SHORT_TEXT',
    options: { reference: 'content' },
  },
];

export const BUSINESS_DISCOVERY_FIELDS_PAYLOAD = [
  { name: 'Name', type: 'SHORT_TEXT', options: { reference: 'name' } },
  { name: 'Address', type: 'SHORT_TEXT', options: { reference: 'address' } },
  { name: 'Phone', type: 'SHORT_TEXT', options: { reference: 'phone' } },
  { name: 'Website', type: 'SHORT_TEXT', options: { reference: 'website' } },
  { name: 'Rating', type: 'SHORT_TEXT', options: { reference: 'rating' } },
  { name: 'Categories', type: 'SHORT_TEXT', options: { reference: 'categories' } },
];

export const INFLUENCER_DISCOVERY_FIELDS_PAYLOAD = [
  { name: 'Handle', type: 'SHORT_TEXT', options: { reference: 'handle' } },
  { name: 'Name', type: 'SHORT_TEXT', options: { reference: 'name' } },
  { name: 'Followers', type: 'SHORT_TEXT', options: { reference: 'followers' } },
  { name: 'Bio', type: 'SHORT_TEXT', options: { reference: 'bio' } },
  { name: 'Profile URL', type: 'SHORT_TEXT', options: { reference: 'profileUrl' } },
  { name: 'Platform', type: 'SHORT_TEXT', options: { reference: 'platform' } },
];

export const PEOPLE_SEARCH_FIELDS_PAYLOAD = [
  { name: 'Name', type: 'SHORT_TEXT', options: { reference: 'name' } },
  { name: 'Title', type: 'SHORT_TEXT', options: { reference: 'title' } },
  { name: 'Company', type: 'SHORT_TEXT', options: { reference: 'company' } },
  { name: 'Location', type: 'SHORT_TEXT', options: { reference: 'location' } },
  { name: 'Seniority', type: 'SHORT_TEXT', options: { reference: 'seniority' } },
  { name: 'Industry', type: 'SHORT_TEXT', options: { reference: 'industry' } },
  { name: 'Skills', type: 'SHORT_TEXT', options: { reference: 'skills' } },
  { name: 'LinkedIn', type: 'SHORT_TEXT', options: { reference: 'linkedin_url' } },
];

export const FUNDING_DISCOVERY_FIELDS_PAYLOAD = [
  { name: 'Company', type: 'SHORT_TEXT', options: { reference: 'name' } },
  { name: 'Round', type: 'SHORT_TEXT', options: { reference: 'round' } },
  { name: 'Amount', type: 'SHORT_TEXT', options: { reference: 'amount' } },
  { name: 'Investors', type: 'SHORT_TEXT', options: { reference: 'investors' } },
  { name: 'Date', type: 'SHORT_TEXT', options: { reference: 'date' } },
  { name: 'Industry', type: 'SHORT_TEXT', options: { reference: 'industry' } },
  { name: 'Location', type: 'SHORT_TEXT', options: { reference: 'location' } },
  { name: 'Description', type: 'SHORT_TEXT', options: { reference: 'description' } },
];

export const AGENCY_DISCOVERY_FIELDS_PAYLOAD = [
  { name: 'Name', type: 'SHORT_TEXT', options: { reference: 'name' } },
  { name: 'Services', type: 'SHORT_TEXT', options: { reference: 'services' } },
  { name: 'Rating', type: 'SHORT_TEXT', options: { reference: 'rating' } },
  { name: 'Reviews', type: 'SHORT_TEXT', options: { reference: 'reviewCount' } },
  { name: 'Location', type: 'SHORT_TEXT', options: { reference: 'location' } },
  { name: 'Website', type: 'SHORT_TEXT', options: { reference: 'website' } },
  { name: 'Phone', type: 'SHORT_TEXT', options: { reference: 'phone' } },
];

export const HIRING_DISCOVERY_FIELDS_PAYLOAD = [
  { name: 'Company', type: 'SHORT_TEXT', options: { reference: 'company' } },
  { name: 'Roles', type: 'SHORT_TEXT', options: { reference: 'roles' } },
  { name: 'Tools', type: 'SHORT_TEXT', options: { reference: 'tools_mentioned' } },
  { name: 'Signal', type: 'SHORT_TEXT', options: { reference: 'signal_strength' } },
  { name: 'Department', type: 'SHORT_TEXT', options: { reference: 'department' } },
  { name: 'Location', type: 'SHORT_TEXT', options: { reference: 'location' } },
];

export const PREVIEW_FIELDS = ['Title', 'Url', 'Content'];

export const BUSINESS_PREVIEW_FIELDS = ['Name', 'Address', 'Phone', 'Website', 'Rating'];
export const INFLUENCER_PREVIEW_FIELDS = ['Handle', 'Name', 'Followers', 'Bio', 'Profile URL'];
export const PEOPLE_PREVIEW_FIELDS = ['Name', 'Title', 'Company', 'Location', 'Seniority'];
export const FUNDING_PREVIEW_FIELDS = ['Company', 'Round', 'Amount', 'Industry', 'Location'];
export const AGENCY_PREVIEW_FIELDS = ['Name', 'Rating', 'Location', 'Website', 'Services'];
export const HIRING_PREVIEW_FIELDS = ['Company', 'Tools', 'Signal', 'Roles', 'Location'];

export const AI_ENRICHMENT_OPTIONS = [
  { label: 'Find Customer (Company)', value: 'companies', creditCost: '10 credits / record' },
  { label: 'Find Customer (People)', value: 'people', creditCost: '20 credits / record' },
  { label: 'Find Competitors (Company)', value: 'competitors', creditCost: '10 credits / record' },
  { label: 'Find Businesses', value: 'businesses', icon: 'Building2', creditCost: '20 credits / search' },
  { label: 'Find Influencers', value: 'influencers', icon: 'Users', creditCost: '20 credits / search' },
  { label: 'Find People', value: 'people_search', creditCost: '20 credits / search' },
  { label: 'Find Funded Startups', value: 'funding', creditCost: '20 credits / search' },
  { label: 'Find Agencies', value: 'agencies', creditCost: '20 credits / search' },
  { label: 'Find Hiring Signals', value: 'hiring', creditCost: '20 credits / search' },
];

export const DISCOVERY_TYPES = ['businesses', 'influencers', 'people_search', 'funding', 'agencies', 'hiring'] as const;
export type DiscoveryType = (typeof DISCOVERY_TYPES)[number];

export function isDiscoveryType(type: string): type is DiscoveryType {
  return DISCOVERY_TYPES.includes(type as DiscoveryType);
}

export const COUNTRY_OPTIONS = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'UK' },
  { label: 'Germany', value: 'DE' },
  { label: 'India', value: 'IN' },
  { label: 'Canada', value: 'CA' },
  { label: 'Australia', value: 'AU' },
];

export const PLATFORM_OPTIONS = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Twitter', value: 'twitter' },
];

export const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export const SENIORITY_OPTIONS = [
  { label: 'C-Suite (CEO, CTO, CFO...)', value: 'c-suite' },
  { label: 'VP / SVP', value: 'vp' },
  { label: 'Director / Head of', value: 'director' },
  { label: 'Manager', value: 'manager' },
  { label: 'Senior / Lead', value: 'senior' },
  { label: 'Entry / Associate', value: 'entry' },
];

export const FUNDING_ROUND_OPTIONS = [
  { label: 'Seed', value: 'seed' },
  { label: 'Series A', value: 'series A' },
  { label: 'Series B', value: 'series B' },
  { label: 'Series C+', value: 'series C+' },
];

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
