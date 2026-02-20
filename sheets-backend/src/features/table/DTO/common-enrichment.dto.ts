import { z } from 'zod';

export const IcpProspectDataSchema = z.object({
  icp_inputs: z
    .object({
      domain: z.string(),
      force_refresh: z.boolean().optional().default(false),
    })
    .passthrough(),
  prospect_inputs: z.object({
    domain: z.string(),
    prospecting_target: z.string(),
    sync: z.boolean().optional().default(true),
  }),
});

export type IcpProspectDataDTO = z.infer<typeof IcpProspectDataSchema>;
