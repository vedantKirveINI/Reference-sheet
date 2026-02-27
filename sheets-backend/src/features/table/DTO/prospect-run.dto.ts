import { z } from 'zod';

export const ProspectRunSchema = z.object({
  domain: z.string(),
  prospecting_target: z.string(),
  webhook_url: z.string().optional(),
  meta: z.record(z.any()).optional(),
  mode: z.string().optional(),
  output: z.record(z.any()).optional(),
  override_icp: z.record(z.any()).optional(),
  initial_sent_results: z.array(z.string()).optional(),
});

export type ProspectRunDTO = z.infer<typeof ProspectRunSchema>;
