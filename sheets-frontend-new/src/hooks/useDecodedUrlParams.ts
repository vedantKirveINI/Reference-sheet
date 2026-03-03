import { useSearchParams } from 'react-router-dom';
import { decodeParams } from '@/services/url-params';

export interface DecodedUrlParams {
  workspaceId: string;
  projectId: string;
  parentId: string;
  assetId: string;
  tableId: string;
  viewId: string;
  aiOption: string;
  decodedParams: Record<string, string>;
}

export function useDecodedUrlParams(): DecodedUrlParams & {
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
} {
  const [searchParams, setSearchParams] = useSearchParams();
  // Use only URL q (reference: no default). Ensures no assetId when URL has no q.
  const q = searchParams.get('q') ?? '';
  const decoded = decodeParams<Record<string, string>>(q) || {};

  const workspaceId = decoded.w ?? '';
  const projectId = decoded.pr ?? decoded.pj ?? '';
  const parentId = decoded.pa ?? decoded.pr ?? '';
  const assetId = decoded.a ?? '';
  const tableId = decoded.t ?? '';
  const viewId = decoded.v ?? '';
  const aiOption = decoded.ai ?? 'companies';

  return {
    workspaceId,
    projectId,
    parentId,
    assetId,
    tableId,
    viewId,
    aiOption,
    decodedParams: decoded,
    searchParams,
    setSearchParams,
  };
}
