import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { decodeParams, encodeParams } from '@/services/url-params';
import { useCreateBlankSheet } from '@/hooks/useCreateBlankSheet';
import { GetStartedPage } from '@/views/get-started/GetStartedPage';
import App from '@/App';
import { Toaster, toast } from 'sonner';

/**
 * Gate that decides whether to show Get Started (no asset in URL) or the main sheet App.
 * Uses only URL decoding — does not mount App or call useSheetData when there is no asset ID,
 * so get_sheet is never called unnecessarily.
 */
export function SheetOrGetStartedGate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { createBlankSheet, creating: createBlankLoading } = useCreateBlankSheet();

  const q = searchParams.get('q') ?? '';
  const decoded = decodeParams<{ a?: string; [key: string]: string | undefined }>(q);
  const assetId = decoded?.a ?? '';

  const handleSelectOption = useCallback(
    (optionId: string) => {
      const decodedForNav = decodeParams<Record<string, string>>(q);
      if (optionId === 'find-customer-company') {
        const encoded = encodeParams({ ...decodedForNav, ai: 'companies' });
        navigate(`/ai-enrichment?q=${encoded}`);
      } else if (optionId === 'find-customer-people') {
        const encoded = encodeParams({ ...decodedForNav, ai: 'people' });
        navigate(`/ai-enrichment?q=${encoded}`);
      } else {
        toast.info('Coming soon — this option will be available shortly');
      }
    },
    [q, navigate]
  );

  const handleCreateBlank = useCallback(async () => {
    try {
      await createBlankSheet();
    } catch (e) {
      toast.error('Failed to create table');
    }
  }, [createBlankSheet]);

  if (!assetId) {
    return (
      <>
        <GetStartedPage
          onCreateBlank={handleCreateBlank}
          onSelectOption={handleSelectOption}
          creating={createBlankLoading}
        />
        <Toaster />
      </>
    );
  }

  return <App />;
}
