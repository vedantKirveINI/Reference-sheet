export type EnrichmentKey = 'company' | 'person' | 'email' | 'business_discovery' | 'influencer_discovery' | 'social_media' | 'email_to_profile';

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
  key: EnrichmentKey;
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
  {
    key: 'business_discovery',
    label: 'Find Businesses',
    subtitle: 'Discover businesses by location and category',
    description: 'Find businesses using Google Maps data — get names, addresses, phone numbers, websites, ratings, and more',
    inputFields: [],
    outputFields: [
      {
        key: 'name',
        name: 'Business Name',
        type: 'SHORT_TEXT',
        description: 'Business Name',
      },
      {
        key: 'address',
        name: 'Address',
        type: 'SHORT_TEXT',
        description: 'Address',
      },
      {
        key: 'phone',
        name: 'Phone Number',
        type: 'SHORT_TEXT',
        description: 'Phone Number',
      },
      {
        key: 'website',
        name: 'Website',
        type: 'SHORT_TEXT',
        description: 'Website',
      },
      {
        key: 'rating',
        name: 'Rating',
        type: 'SHORT_TEXT',
        description: 'Rating',
      },
      {
        key: 'ratingCount',
        name: 'Review Count',
        type: 'SHORT_TEXT',
        description: 'Review Count',
      },
      {
        key: 'categories',
        name: 'Categories',
        type: 'SHORT_TEXT',
        description: 'Categories',
      },
      {
        key: 'placeId',
        name: 'Google Place ID',
        type: 'SHORT_TEXT',
        description: 'Google Place ID',
      },
      {
        key: 'latitude',
        name: 'Latitude',
        type: 'SHORT_TEXT',
        description: 'Latitude',
      },
      {
        key: 'longitude',
        name: 'Longitude',
        type: 'SHORT_TEXT',
        description: 'Longitude',
      },
    ],
  },
  {
    key: 'influencer_discovery',
    label: 'Find Influencers',
    subtitle: 'Discover content creators on social media',
    description: 'Find influencers on Instagram, YouTube, TikTok, or Twitter — get handles, follower counts, bios, and profile links',
    inputFields: [],
    outputFields: [
      {
        key: 'handle',
        name: 'Handle',
        type: 'SHORT_TEXT',
        description: 'Handle',
      },
      {
        key: 'name',
        name: 'Name',
        type: 'SHORT_TEXT',
        description: 'Name',
      },
      {
        key: 'bio',
        name: 'Bio',
        type: 'LONG_TEXT',
        description: 'Bio',
      },
      {
        key: 'followers',
        name: 'Followers',
        type: 'SHORT_TEXT',
        description: 'Followers',
      },
      {
        key: 'following',
        name: 'Following',
        type: 'SHORT_TEXT',
        description: 'Following',
      },
      {
        key: 'posts',
        name: 'Posts',
        type: 'SHORT_TEXT',
        description: 'Posts',
      },
      {
        key: 'profileUrl',
        name: 'Profile URL',
        type: 'SHORT_TEXT',
        description: 'Profile URL',
      },
      {
        key: 'platform',
        name: 'Platform',
        type: 'SHORT_TEXT',
        description: 'Platform',
      },
    ],
  },
  {
    key: 'social_media',
    label: 'Social Media Enrichment',
    subtitle: 'Cross-platform deep enrichment for a profile',
    description: 'Get email, all social links, agency, brand collaborations, niche tags, and per-platform follower counts. Works with any social media handle.',
    inputFields: [
      {
        key: 'handle',
        name: 'Handle',
        label: 'Social Handle',
        type: 'SHORT_TEXT',
        required: true,
        description: 'Social media handle (e.g., @kayla_itsines)',
      },
      {
        key: 'name',
        name: 'Name',
        label: 'Display Name',
        type: 'SHORT_TEXT',
        required: false,
        description: 'Display name (helps find cross-platform profiles)',
      },
      {
        key: 'platform',
        name: 'Platform',
        label: 'Primary Platform',
        type: 'SHORT_TEXT',
        required: false,
        description: 'Primary platform (instagram, youtube, tiktok, twitter)',
      },
      {
        key: 'followers',
        name: 'Followers',
        label: 'Known Followers',
        type: 'SHORT_TEXT',
        required: false,
        description: 'Known follower count (helps with enrichment)',
      },
    ],
    outputFields: [
      { key: 'email', name: 'Email', type: 'SHORT_TEXT', description: 'Email address' },
      { key: 'website', name: 'Website', type: 'SHORT_TEXT', description: 'Personal/business website' },
      { key: 'location', name: 'Location', type: 'SHORT_TEXT', description: 'City, country' },
      { key: 'bio', name: 'Bio', type: 'LONG_TEXT', description: 'Clean bio' },
      { key: 'instagram_followers', name: 'Instagram Followers', type: 'SHORT_TEXT', description: 'Instagram follower count' },
      { key: 'youtube_subscribers', name: 'YouTube Subscribers', type: 'SHORT_TEXT', description: 'YouTube subscriber count' },
      { key: 'tiktok_followers', name: 'TikTok Followers', type: 'SHORT_TEXT', description: 'TikTok follower count' },
      { key: 'twitter_followers', name: 'Twitter/X Followers', type: 'SHORT_TEXT', description: 'Twitter/X follower count' },
      { key: 'linkedin_url', name: 'LinkedIn', type: 'SHORT_TEXT', description: 'LinkedIn profile URL' },
      { key: 'linkedin_title', name: 'LinkedIn Title', type: 'SHORT_TEXT', description: 'Professional title from LinkedIn' },
      { key: 'youtube_url', name: 'YouTube', type: 'SHORT_TEXT', description: 'YouTube channel URL' },
      { key: 'tiktok_url', name: 'TikTok', type: 'SHORT_TEXT', description: 'TikTok profile URL' },
      { key: 'twitter_url', name: 'Twitter/X', type: 'SHORT_TEXT', description: 'Twitter/X profile URL' },
      { key: 'facebook_url', name: 'Facebook', type: 'SHORT_TEXT', description: 'Facebook page URL' },
      { key: 'agency', name: 'Agency', type: 'SHORT_TEXT', description: 'Talent agency or management' },
      { key: 'brand_collabs', name: 'Brand Collaborations', type: 'SHORT_TEXT', description: 'Known brand partnerships' },
      { key: 'niche_tags', name: 'Niche Tags', type: 'SHORT_TEXT', description: 'Content categories (fitness, wellness, etc.)' },
      { key: 'podcast', name: 'Podcast', type: 'SHORT_TEXT', description: 'Podcast name if they have one' },
    ],
  },
  {
    key: 'email_to_profile',
    label: 'Email to Profile',
    subtitle: 'Reverse lookup — find the person behind an email',
    description: 'Enter an email address and get the full professional profile — name, title, company, LinkedIn, skills',
    inputFields: [
      { key: 'email', name: 'Email', label: 'Email Address', type: 'SHORT_TEXT', required: true, description: 'Email address to look up' },
    ],
    outputFields: [
      { key: 'name', name: 'Name', type: 'SHORT_TEXT', description: 'Full name' },
      { key: 'title', name: 'Title', type: 'SHORT_TEXT', description: 'Job title' },
      { key: 'company', name: 'Company', type: 'SHORT_TEXT', description: 'Company' },
      { key: 'location', name: 'Location', type: 'SHORT_TEXT', description: 'Location' },
      { key: 'linkedin_url', name: 'LinkedIn', type: 'SHORT_TEXT', description: 'LinkedIn URL' },
      { key: 'bio', name: 'Bio', type: 'LONG_TEXT', description: 'Bio' },
      { key: 'skills', name: 'Skills', type: 'SHORT_TEXT', description: 'Skills' },
      { key: 'seniority', name: 'Seniority', type: 'SHORT_TEXT', description: 'Seniority level' },
      { key: 'industry', name: 'Industry', type: 'SHORT_TEXT', description: 'Industry' },
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
