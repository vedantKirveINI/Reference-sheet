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

const devBypassToken =
  import.meta.env.VITE_AUTH_TOKEN ||
  import.meta.env.REACT_APP_BYPASS_KEYCLOAK_TOKEN ||
  '';

if (devBypassToken && !(window as any).accessToken) {
  (window as any).accessToken = devBypassToken;
}

const AppRoutes = () => (
  <SheetsContextProvider>
    <Routes>
      <Route path="/" element={<AuthRoute><SheetOrGetStartedGate /></AuthRoute>} />
      <Route path="/ai-enrichment" element={<AuthRoute><AiEnrichmentPage /></AuthRoute>} />
    </Routes>
  </SheetsContextProvider>
);

export function RootApp() {
  const { assetId } = useDecodedUrlParams();

  if (devBypassToken) {
    return <AppRoutes />;
  }

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
      <AppRoutes />
    </TinyCommandAuthController>
  );
}
