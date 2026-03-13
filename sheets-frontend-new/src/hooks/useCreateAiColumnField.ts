import { useCallback } from 'react';
import useRequest from './useRequest';

export interface CreateAiColumnFieldPayload {
  tableId: string;
  baseId: string;
  viewId?: string;
  name: string;
  description?: string;
  type: 'AI_COLUMN';
  aiPrompt: string;
  aiModel?: string;
  sourceFields: { field_id: number; dbFieldName: string; name: string }[];
  autoUpdate: boolean;
  options?: Record<string, any>;
}

export function useCreateAiColumnField() {
  const [{ loading, data, error }, trigger] = useRequest(
    {
      method: 'post',
      url: '/field/create_ai_column_field',
    },
    { manual: true }
  );

  const createAiColumnField = useCallback(
    async (payload: CreateAiColumnFieldPayload) => {
      console.log('[AI_COLUMN][useCreateAiColumnField] Triggering POST /field/create_ai_column_field with:', JSON.stringify(payload, null, 2));
      try {
        const res = await trigger({ data: payload });
        console.log('[AI_COLUMN][useCreateAiColumnField] Response:', res);
        return res;
      } catch (err: any) {
        console.error('[AI_COLUMN][useCreateAiColumnField] Error:', err);
        console.error('[AI_COLUMN][useCreateAiColumnField] Error response:', err?.response?.data, 'status:', err?.response?.status);
        throw err;
      }
    },
    [trigger]
  );

  return {
    createAiColumnField,
    loading,
    error,
    data,
  };
}
