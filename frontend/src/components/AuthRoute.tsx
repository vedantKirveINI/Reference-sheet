import { useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeParams } from '@/services/url-params';
import { SheetsContext } from '@/context/SheetsContext';

/**
 * Syncs decoded `q` URL params (w, pr, pa, a) into SheetsContext.
 * No redirect when q is missing (deferred per plan).
 */
export function AuthRoute({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const context = useContext(SheetsContext);

  useEffect(() => {
    if (!context) return;
    const q = searchParams.get('q') || '';
    const decoded = decodeParams<{ w?: string; pr?: string; pj?: string; pa?: string; a?: string }>(q);
    const w = decoded?.w ?? null;
    const pr = decoded?.pr ?? decoded?.pj ?? null;
    const pa = decoded?.pa ?? decoded?.pr ?? null;
    const a = decoded?.a ?? null;
    context.updateWorkspaceId(w);
    context.updateProjectId(pr);
    context.updateParentId(pa);
    context.updateAssetId(a);
  }, [searchParams, context]);

  return <>{children}</>;
}
