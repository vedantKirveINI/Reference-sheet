export interface EnrichmentInputField {
  key: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  description: string;
}

export interface EnrichmentOutputField {
  key: string;
  name: string;
  type: string;
  description: string;
  properties?: Record<string, any>;
  items?: Record<string, any>;
}

export interface EnrichmentType {
  key: string;
  label: string;
  subtitle: string;
  description: string;
  inputFields: EnrichmentInputField[];
  outputFields: EnrichmentOutputField[];
}

export const ENRICHMENT_TYPES: EnrichmentType[] = [
  {
    key: 'company',
    label: 'Find Company Details',
    subtitle: 'Auto-fill company info from a website domain',
    description: 'Give us a company website and we\'ll pull in their name, industry, size, funding, tech stack, and more. Perfect for building lead lists or enriching your CRM.',
    inputFields: [
      {
        key: 'domain',
        name: 'Domain',
        label: 'Which column has the company website or domain?',
        type: 'string',
        required: true,
        description: 'We\'ll use this to look up company information',
      },
    ],
    outputFields: [
      {
        key: 'name',
        name: 'Company Name',
        type: 'SHORT_TEXT',
        description: 'Official company name as it appears on their website',
      },
      {
        key: 'website',
        name: 'Company Website',
        type: 'SHORT_TEXT',
        description: 'Verified company website URL',
      },
      {
        key: 'employeeCount',
        name: 'Employee Count',
        type: 'LIST',
        description: 'Team size range (e.g. 50-200)',
      },
      {
        key: 'industry',
        name: 'Industry',
        type: 'SHORT_TEXT',
        description: 'What sector they operate in (e.g. SaaS, Fintech)',
      },
      {
        key: 'foundedYear',
        name: 'Founded Year',
        type: 'SHORT_TEXT',
        description: 'Year the company was started',
      },
      {
        key: 'funding',
        name: 'Funding',
        type: 'SHORT_TEXT',
        description: 'Latest funding round and amount raised',
        properties: {
          amount: {
            type: 'string',
            description: "Funding amount (e.g., '$10M', '$50M')",
          },
          round: {
            type: 'string',
            description: "Funding round (e.g., 'Series A', 'Seed')",
          },
        },
      },
      {
        key: 'keyPeople',
        name: 'Key People',
        type: 'LIST',
        description: 'Leadership team names and titles',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: "Person's name",
            },
            title: {
              type: 'string',
              description: "Person's job title",
            },
          },
        },
      },
      {
        key: 'techStack',
        name: 'Tech Stack',
        type: 'LIST',
        description: 'Technologies and tools they use',
        items: {
          type: 'string',
          description: 'Technology name',
        },
      },
      {
        key: 'location',
        name: 'Location',
        type: 'SHORT_TEXT',
        description: 'Where their headquarters are based',
      },
      {
        key: 'socialLinks',
        name: 'Social Links',
        type: 'LIST',
        description: 'LinkedIn and Twitter/X profile URLs',
        properties: {
          linkedin: {
            type: 'string',
            description: 'LinkedIn company page URL',
          },
          twitter: {
            type: 'string',
            description: 'Twitter/X company profile URL',
          },
        },
      },
      {
        key: 'description',
        name: 'Description',
        type: 'SHORT_TEXT',
        description: 'One-line summary of what they do',
      },
    ],
  },
  {
    key: 'person',
    label: 'Discover Contact Info',
    subtitle: 'Enrich profiles with professional details',
    description: 'Turn a name and company into a full professional profile. Get their job title, bio, social links, and more — great for outreach and prospecting.',
    inputFields: [
      {
        key: 'name',
        name: "Person's Full Name",
        label: "Which column has the person's full name?",
        type: 'string',
        required: true,
        description: 'We need the full name to find the right profile',
      },
      {
        key: 'domain',
        name: 'Company Domain',
        label: 'Which column has their company website?',
        type: 'string',
        required: true,
        description: 'Helps match them to the right company',
      },
      {
        key: 'linkedinUrl',
        name: 'LinkedIn URL',
        label: 'Which column has their LinkedIn URL? (optional)',
        type: 'string',
        required: false,
        description: 'Speeds up finding the right person',
      },
    ],
    outputFields: [
      {
        key: 'fullName',
        name: 'Full Name',
        type: 'SHORT_TEXT',
        description: 'Verified full name',
      },
      {
        key: 'title',
        name: 'Job Title',
        type: 'SHORT_TEXT',
        description: 'Current role at their company',
      },
      {
        key: 'company',
        name: 'Company',
        type: 'SHORT_TEXT',
        description: 'Where they currently work',
      },
      {
        key: 'location',
        name: 'Location',
        type: 'SHORT_TEXT',
        description: 'City and country they\'re based in',
      },
      {
        key: 'email',
        name: 'Email Address',
        type: 'SHORT_TEXT',
        description: 'Professional email if available',
      },
      {
        key: 'socialLinks',
        name: 'Social Links',
        type: 'LIST',
        description: 'LinkedIn, Twitter, and other profiles',
        items: {
          type: 'string',
          description: 'Social media profile URL',
        },
      },
      {
        key: 'bio',
        name: 'Professional Bio',
        type: 'LONG_TEXT',
        description: 'Short summary of their background',
      },
      {
        key: 'education',
        name: 'Education',
        type: 'LIST',
        description: 'Schools and degrees',
        items: {
          type: 'object',
          properties: {
            institution: {
              type: 'string',
              description: 'Educational institution name',
            },
            degree: {
              type: 'string',
              description: 'Degree or qualification obtained',
            },
          },
        },
      },
    ],
  },
  {
    key: 'email',
    label: 'Find Email Addresses',
    subtitle: 'Generate verified emails for outreach',
    description: 'Give us a name and company domain, and we\'ll find their most likely professional email. Ideal for cold outreach and building prospect lists.',
    inputFields: [
      {
        key: 'domain',
        name: 'Domain',
        label: 'Which column has the company website?',
        type: 'string',
        required: true,
        description: 'We\'ll use this to figure out their email pattern',
      },
      {
        key: 'full_name',
        name: 'Full Name',
        label: 'Which column has their full name?',
        type: 'string',
        required: true,
        description: 'Combined with the domain to generate the email',
      },
    ],
    outputFields: [
      {
        key: 'validEmail',
        name: 'Email Address',
        type: 'SHORT_TEXT',
        description: 'Best-match professional email address',
      },
    ],
  },
];

export function getEnrichmentTypeByKey(key: string): EnrichmentType | undefined {
  return ENRICHMENT_TYPES.find((t) => t.key === key);
}

export const ENRICHMENT_TYPE_OPTIONS = ENRICHMENT_TYPES.map((t) => ({
  key: t.key,
  label: t.label,
  description: t.description,
}));
