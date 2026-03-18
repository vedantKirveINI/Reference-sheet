import TinyCommandAuthController from '@oute/oute-ds.common.molecule.tiny-auth';
import { useDecodedUrlParams } from '@/hooks/useDecodedUrlParams';
import { SheetsContextProvider } from '@/context/SheetsContext';
import { AuthRoute } from '@/components/AuthRoute';
import { SheetOrGetStartedGate } from '@/components/SheetOrGetStartedGate';
import { AiEnrichmentPage } from './views/ai-enrichment/ai-enrichment-page';
import { EmbedRoute } from '@/embed/EmbedRoute';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CoachMarkProvider } from '@/coach-marks';

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
  <CoachMarkProvider>
    <SheetsContextProvider>
      <Routes>
        <Route path="/" element={<AuthRoute><SheetOrGetStartedGate /></AuthRoute>} />
        <Route path="/ai-enrichment" element={<AuthRoute><AiEnrichmentPage /></AuthRoute>} />
      </Routes>
    </SheetsContextProvider>
  </CoachMarkProvider>
);

export function RootApp() {
  const location = useLocation();
  const { assetId } = useDecodedUrlParams();

  // Embed mode: bypass all auth, render stripped-down embed shell
  if (location.pathname === '/embed' || location.pathname === '/embed/') {
    return (
      <Routes>
        <Route path="/embed" element={<EmbedRoute />} />
        <Route path="/embed/" element={<EmbedRoute />} />
      </Routes>
    );
  }

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
