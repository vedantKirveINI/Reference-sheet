export const AI_TIERS = [
  { key: 'nano', displayName: 'Tiny AI Nano', creditsPerCell: 1, description: 'Fastest, basic tasks' },
  { key: 'mini', displayName: 'Tiny AI Mini', creditsPerCell: 5, description: 'Balanced speed & quality' },
  { key: 'pro',  displayName: 'Tiny AI Pro',  creditsPerCell: 10, description: 'High quality output' },
  { key: 'max',  displayName: 'Tiny AI Max',  creditsPerCell: 20, description: 'Most capable model' },
] as const;

export const DEFAULT_TIER = 'mini';
export type AiTierKey = typeof AI_TIERS[number]['key'];
