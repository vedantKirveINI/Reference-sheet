import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { decodeParams, encodeParams } from '@/services/url-params';

interface DecodedParams {
  w?: string;
  pj?: string;
  pr?: string;
  a?: string;
  t?: string;
  v?: string;
}

interface CreateBlankSheetResult {
  base: any | null;
  table: any | null;
  view: any | null;
  encodedParams: string;
}

export function useCreateBlankSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creating, setCreating] = useState(false);

  const createBlankSheet = useCallback(async (): Promise<CreateBlankSheetResult | null> => {
    if (creating) return null;

    setCreating(true);
    try {
      const qParam = searchParams.get('q') || import.meta.env.VITE_DEFAULT_SHEET_PARAMS || '';
      const decoded = decodeParams<DecodedParams>(qParam);

      const workspaceId = decoded.w || '';
      const parentId = decoded.pr || '';

      const res = await apiClient.post('/sheet/create_sheet', {
        workspace_id: workspaceId,
        parent_id: parentId,
      });

      const { base = null, table = null, view = null } = res.data || {};
      const assetId = base?.id || '';
      const tableId = table?.id || '';
      const viewId = view?.id || '';

      const newParams = new URLSearchParams();
      newParams.set(
        'q',
        encodeParams({
          w: workspaceId,
          pj: decoded.pj || '',
          pr: parentId,
          a: assetId,
          t: tableId,
          v: viewId,
        }),
      );

      const encodedParams = newParams.get('q') || '';
      setSearchParams(newParams, { replace: true });

      return { base, table, view, encodedParams };
    } catch (err) {
      // Surface in console; UI surfaces error via calling code if needed
      console.error('[useCreateBlankSheet] Failed to create blank sheet', err);
      throw err;
    } finally {
      setCreating(false);
    }
  }, [creating, searchParams, setSearchParams]);

  return { createBlankSheet, creating };
}

