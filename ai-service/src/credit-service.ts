import { AiTier } from './ai-tier-config';

export interface CreditEvent {
  userId: string | null;
  source: 'ai_column' | 'ai_chat';
  baseId?: string;
  tableId?: string;
  fieldId?: string;
  recordId?: string;
  conversationId?: string;
  tierKey?: string;
  model: string;
  creditsConsumed: number;
  timestamp: string;
}

/** Flat credit cost for a single AI chat message. */
export const AI_CHAT_CREDITS = 10;

/**
 * Check whether the user/space has enough credits.
 * Placeholder — always allows. Replace with external endpoint call.
 */
export async function checkCredits(
  userId: string | null,
  cost: number
): Promise<{ allowed: boolean; remaining?: number }> {
  console.log(`[CREDITS] checkCredits: userId=${userId}, cost=${cost}`);
  // TODO: Call external credit balance endpoint
  // e.g. const res = await axios.get(`${CREDIT_ENDPOINT}/balance?userId=${userId}`);
  // return { allowed: res.data.balance >= cost, remaining: res.data.balance };
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
