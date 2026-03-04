import { useCallback } from 'react';
import useRequest from './useRequest';

export interface CreateEnrichmentFieldPayload {
  tableId: string;
  baseId: string;
  viewId?: string;
  name: string;
  description?: string;
  type: 'ENRICHMENT';
  entityType: string;
  identifier: any[];
  fieldsToEnrich: any[];
  options?: Record<string, any>;
}

export function useCreateEnrichmentField() {
  const [{ loading, data, error }, trigger] = useRequest(
    {
      method: 'post',
      url: '/field/create_enrichment_field',
    },
    { manual: true }
  );

  const createEnrichmentField = useCallback(
    async (payload: CreateEnrichmentFieldPayload) => {
      try {
        const res = await trigger({ data: payload });
        return res;
      } catch (err) {
        // Let callers handle surfacing errors in UI
        throw err;
      }
    },
    [trigger]
  );

  return {
    createEnrichmentField,
    loading,
    error,
    data,
  };
}

