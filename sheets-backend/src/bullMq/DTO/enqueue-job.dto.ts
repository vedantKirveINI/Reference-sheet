import { z } from 'zod';

export const EnqueueJobSchema = z.object({
  jobName: z.string(),
  data: z.record(z.any()),
  options: z.record(z.any()).optional(),
});

export type EnqueueJobDTO = z.infer<typeof EnqueueJobSchema>;
