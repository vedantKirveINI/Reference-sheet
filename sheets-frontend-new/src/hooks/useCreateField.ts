import { useCallback } from 'react';
import { toast } from 'sonner';
import useRequest from './useRequest';
import { extractErrorMessage } from '@/utils/error-message';

export interface CreateFieldPayload {
  baseId: string;
  tableId: string;
  viewId: string;
  name: string;
  type: string;
  order?: number;
  options?: any;
  description?: string;
  expression?: any;
}

export function useCreateField() {
  const [{ loading }, trigger] = useRequest(
    {
      method: 'post',
      url: '/field/create_field',
    },
    { manual: true }
  );

  const createField = useCallback(
    async (payload: CreateFieldPayload) => {
      try {
        await trigger({ data: payload });
      } catch (err) {
        const message = extractErrorMessage(err, 'Failed to create field');
        toast.error(message);
        throw err;
      }
    },
    [trigger]
  );

  return {
    createField,
    loading,
  };
}

