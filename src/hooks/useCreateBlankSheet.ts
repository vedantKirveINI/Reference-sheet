import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeParams, encodeParams } from '../services/url-params';
import { EnrichmentKey, getEnrichmentTypeByKey } from '../config/enrichment-mapping';
import useRequest from './useRequest';

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
  const [{ loading }, trigger] = useRequest(
    {
      method: 'post',
      url: '/sheet/create_sheet',
    },
    { manual: true }
  );

  const createBlankSheet = useCallback(async (name?: string, enrichmentKey?: EnrichmentKey): Promise<CreateBlankSheetResult | null> => {
    if (loading) return null;

    try {
      const qParam =
        searchParams.get('q') ||
        ((import.meta as any).env?.VITE_DEFAULT_SHEET_PARAMS as string | undefined) ||
        '';
      const decoded = decodeParams<DecodedParams>(qParam);

      const workspaceId = decoded.w || '';
      const parentId = decoded.pr || '';

      const payload: Record<string, unknown> = {
        workspace_id: workspaceId,
        parent_id: parentId,
        name: name?.trim() || undefined,
      };

      if (enrichmentKey) {
        const enrichmentConfig = getEnrichmentTypeByKey(enrichmentKey);
        if (enrichmentConfig) {
          payload.enrichment = {
            key: enrichmentConfig.key,
            label: enrichmentConfig.label,
            description: enrichmentConfig.description,
            inputFields: enrichmentConfig.inputFields,
            outputFields: enrichmentConfig.outputFields,
          };
        }
      }

      const res = await trigger({ data: payload });

      const { base = null, table = null, view = null } = (res as any)?.data || {};
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
    }
  }, [loading, searchParams, setSearchParams, trigger]);

  return { createBlankSheet, creating: loading };
}

