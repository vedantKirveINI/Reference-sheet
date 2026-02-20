import { z } from "zod";

export const GetGroupPointsPayloadSchema = z.object({
	baseId: z.string(),
	tableId: z.string(),
	viewId: z.string(),
	__status: z.enum(["active", "inactive"]).optional(),
});

export type GetGroupPointsPayloadDTO = z.infer<
	typeof GetGroupPointsPayloadSchema
>;
