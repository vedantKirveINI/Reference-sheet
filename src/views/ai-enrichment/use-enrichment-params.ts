import { useSearchParams } from 'react-router-dom';
import { decodeParams } from '@/services/url-params';

interface EnrichmentParams {
  workspaceId: string;
  projectId: string;
  parentId: string;
  assetId: string;
  aiOption: string;
  searchParams: ReturnType<typeof useSearchParams>[0];
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}

export function useEnrichmentParams(): EnrichmentParams {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') || '';
  const decoded = decodeParams<{
    w?: string;
    pj?: string;
    pr?: string;
    a?: string;
    t?: string;
    v?: string;
    ai?: string;
  }>(q);

  return {
    workspaceId: decoded.w || '',
    projectId: decoded.pj || '',
    parentId: decoded.pr || '',
    assetId: decoded.a || '',
    aiOption: decoded.ai || 'companies',
    searchParams,
    setSearchParams,
  };
}
