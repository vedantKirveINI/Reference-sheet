import TinyCommandAuthController from '@oute/oute-ds.common.molecule.tiny-auth';
import { useDecodedUrlParams } from '@/hooks/useDecodedUrlParams';
import { SheetsContextProvider } from '@/context/SheetsContext';
import { AuthRoute } from '@/components/AuthRoute';
import { SheetOrGetStartedGate } from '@/components/SheetOrGetStartedGate';
import { AiEnrichmentPage } from './views/ai-enrichment/ai-enrichment-page';
import { Routes, Route } from 'react-router-dom';

const assetServerUrl =
  import.meta.env.VITE_OUTE_SERVER ??
  import.meta.env.REACT_APP_OUTE_SERVER ??
  '';

export function RootApp() {
  const { assetId } = useDecodedUrlParams();

  return (
    <TinyCommandAuthController
      assetId={assetId || undefined}
      assetServerUrl={assetServerUrl}
      loginUrl={import.meta.env.REACT_APP_LOGIN_URL}
      clientId={import.meta.env.REACT_APP_KEYCLOAK_RESOURCE}
      realm={import.meta.env.REACT_APP_KEYCLOAK_REALM}
      serverUrl={import.meta.env.REACT_APP_KEYCLOAK_AUTH_SERVER_URL}
      hubOrigin={import.meta.env.REACT_APP_HUB_ORIGIN ?? ''}
    >
      <SheetsContextProvider>
        <Routes>
          <Route path="/" element={<AuthRoute><SheetOrGetStartedGate /></AuthRoute>} />
          <Route path="/ai-enrichment" element={<AuthRoute><AiEnrichmentPage /></AuthRoute>} />
        </Routes>
      </SheetsContextProvider>
    </TinyCommandAuthController>
  );
}
