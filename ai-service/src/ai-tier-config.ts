export interface AiTier {
  key: string;
  displayName: string;
  model: string;
  creditsPerCell: number;
}

export const AI_TIERS: Record<string, AiTier> = {
  nano: { key: 'nano', displayName: 'Tiny AI Nano', model: 'gpt-4.1-nano', creditsPerCell: 1 },
  mini: { key: 'mini', displayName: 'Tiny AI Mini', model: 'gpt-4.1-mini', creditsPerCell: 5 },
  pro:  { key: 'pro',  displayName: 'Tiny AI Pro',  model: 'gpt-4o',       creditsPerCell: 10 },
  max:  { key: 'max',  displayName: 'Tiny AI Max',  model: 'gpt-4.1',      creditsPerCell: 20 },
};

export const DEFAULT_TIER = 'mini';

export function resolveTier(tierKey: string | undefined | null): AiTier {
  return AI_TIERS[tierKey || DEFAULT_TIER] || AI_TIERS[DEFAULT_TIER];
}
