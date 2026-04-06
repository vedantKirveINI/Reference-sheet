import { Injectable, Logger } from '@nestjs/common';

// Lazy-loaded SDK to avoid blocking app startup
let _TrackSDK: any = null;
function getTrackSDK() {
  if (!_TrackSDK) {
    _TrackSDK = require('oute-services-track-sdk');
  }
  return _TrackSDK;
}

function isInsufficientCreditsError(error: any): boolean {
  const msg = (error?.result?.message || error?.message || '').toLowerCase();
  return msg.includes('not enough credits') || msg.includes('insufficient');
}

export class CreditError extends Error {
  public creditsRequired?: number;
  public available?: number;

  constructor(message: string, creditsRequired?: number, available?: number) {
    super(message);
    this.name = 'CreditError';
    this.creditsRequired = creditsRequired;
    this.available = available;
  }
}

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);

  private getTrackInstance(token: string) {
    const url = process.env.OUTE_SERVER;
    if (!url) {
      this.logger.warn('OUTE_SERVER not set — credit operations will be skipped');
      return null;
    }
    const TrackSDK = getTrackSDK();
    return new TrackSDK({ url, token });
  }

  private resolveToken(token?: string): string {
    if (token) return token;
    return process.env.TRACK_SERVICE_TOKEN || process.env.TRACK_TOKEN || '';
  }

  /**
   * Atomically check balance and deduct credits in one call.
   * Only throws CreditError on "insufficient credits".
   * Service errors are logged but don't stop processing.
   */
  async spendCredits(params: {
    token?: string;
    workspaceId: string;
    feature: string;
    amount: number;
    description?: string;
    referenceId?: string;
    metadata?: Record<string, string>;
  }): Promise<boolean> {
    const { workspaceId, feature, amount, description, referenceId, metadata } = params;
    const token = this.resolveToken(params.token);

    if (!workspaceId || !token) {
      this.logger.warn(`No workspaceId or token — skipping credit deduction for ${feature}`);
      return true;
    }

    const instance = this.getTrackInstance(token);
    if (!instance) return true; // No credit service configured — allow operation

    try {
      await instance.useCredits({
        externalId: workspaceId,
        type: 'api_calls',
        amount,
        feature,
        description: description || undefined,
        referenceId: referenceId || undefined,
        metadata: metadata || undefined,
      });
      this.logger.log(`Deducted ${amount} credits for ${feature} (workspace: ${workspaceId})`);
      return true;
    } catch (error: any) {
      if (isInsufficientCreditsError(error)) {
        // This is the ONLY case where we block the operation
        this.logger.warn(`Insufficient credits for ${feature} (workspace: ${workspaceId}, needed: ${amount})`);
        throw new CreditError('Insufficient credits', amount);
      }
      // Any other error (service down, network issue, etc.) — log and allow
      this.logger.error(
        `Credit service error (non-blocking): ${error?.result?.message || error?.message || error} — allowing operation for ${feature}`,
      );
      return true;
    }
  }

  /**
   * Get available credit balance for a workspace. Used for bulk pre-checks.
   * Returns Infinity on service errors so bulk operations aren't blocked.
   */
  async getBalance(params: {
    token?: string;
    workspaceId: string;
  }): Promise<number> {
    const { workspaceId } = params;
    const token = this.resolveToken(params.token);

    if (!workspaceId || !token) return Infinity;

    const instance = this.getTrackInstance(token);
    if (!instance) return Infinity;

    try {
      const { result } = await instance.getCredits({
        externalId: workspaceId,
        summaryOnly: true,
      });
      return result?.data?.availableCredits ?? result?.available ?? Infinity;
    } catch (error: any) {
      this.logger.error(`Balance check failed (non-blocking): ${error?.message || error}`);
      return Infinity; // Don't block on service errors
    }
  }

  /**
   * Resolve workspaceId (spaceId) from a baseId using Prisma.
   */
  async resolveWorkspaceId(baseId: string, prisma: any): Promise<string> {
    const base = await prisma.base.findUnique({
      where: { id: baseId },
      select: { spaceId: true },
    });
    if (!base?.spaceId) {
      throw new CreditError(`Cannot resolve workspace for base ${baseId}`);
    }
    return base.spaceId;
  }
}
