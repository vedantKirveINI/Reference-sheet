import { AiTier } from './ai-tier-config';

export interface CreditEvent {
  userId: string | null;
  baseId?: string;
  tableId?: string;
  fieldId?: string;
  recordId?: string;
  tierKey: string;
  model: string;
  creditsConsumed: number;
  timestamp: string;
}

/**
 * Check whether the user/space has enough credits for a generation.
 * Placeholder — always allows. Replace with external endpoint call.
 */
export async function checkCredits(
  userId: string | null,
  tier: AiTier
): Promise<{ allowed: boolean; remaining?: number }> {
  console.log(`[CREDITS] checkCredits: userId=${userId}, tier=${tier.key}, cost=${tier.creditsPerCell}`);
  // TODO: Call external credit balance endpoint
  // e.g. const res = await axios.get(`${CREDIT_ENDPOINT}/balance?userId=${userId}`);
  // return { allowed: res.data.balance >= tier.creditsPerCell, remaining: res.data.balance };
  return { allowed: true };
}

/**
 * Emit a credit consumption event to the external credit system.
 * Placeholder — logs to console. Wire to external endpoint/queue when ready.
 */
export async function emitCreditEvent(event: CreditEvent): Promise<void> {
  console.log('[CREDITS] Credit consumed:', JSON.stringify(event));
  // TODO: Push to external credit endpoint/queue
  // e.g. await axios.post(CREDIT_ENDPOINT, event);
}
