import { z } from 'zod';

export const IcpBuildSchema = z
  .object({
    domain: z.string().min(1, 'Domain is required'),
    force_refresh: z.boolean().optional().default(false),
  })
  .passthrough();

export type IcpBuildDTO = z.infer<typeof IcpBuildSchema>;
