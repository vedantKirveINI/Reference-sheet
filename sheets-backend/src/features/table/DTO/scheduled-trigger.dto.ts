import { z } from 'zod';

export const ScheduledTriggerStateEnum = z.enum([
  'PENDING',
  'PROCESSING',
  'FAILED',
  'FIRED',
  'CANCELLED',
]);

export const ScheduledTriggerStatusEnum = z.enum(['active', 'inactive']);

// Internal DTO for creating scheduled triggers
export const CreateScheduledTriggerSchema = z.object({
  dataStreamId: z.string(),
  triggerScheduleId: z.string(), // Required - link to TriggerSchedule
  recordId: z.number().int().positive(),
  tableId: z.string(),
  originalFieldId: z.number().int().positive(),
  scheduledTime: z.date(),
  originalTime: z.date(),
  maxRetries: z.number().int().nonnegative().default(3),
});

export type CreateScheduledTriggerDTO = z.infer<
  typeof CreateScheduledTriggerSchema
>;

// DTO for querying scheduled triggers (admin/monitoring)
export const QueryScheduledTriggersSchema = z.object({
  tableId: z.string().optional(),
  recordId: z.number().int().positive().optional(),
  state: ScheduledTriggerStateEnum.optional(),
  status: ScheduledTriggerStatusEnum.optional(),
  dataStreamId: z.string().optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  limit: z.number().int().positive().max(1000).default(100),
  offset: z.number().int().nonnegative().default(0),
});

export type QueryScheduledTriggersDTO = z.infer<
  typeof QueryScheduledTriggersSchema
>;

// DTO for updating trigger state/status
export const UpdateTriggerStateSchema = z.object({
  state: ScheduledTriggerStateEnum.optional(),
  status: ScheduledTriggerStatusEnum.optional(),
  lastError: z.string().optional(),
  nextRetryTime: z.date().optional(),
});

export type UpdateTriggerStateDTO = z.infer<typeof UpdateTriggerStateSchema>;
