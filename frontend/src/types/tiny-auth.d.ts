declare module '@oute/oute-ds.common.molecule.tiny-auth' {
  import { ReactNode } from 'react';

  export interface TinyCommandAuthControllerProps {
    assetId?: string | null;
    assetServerUrl: string;
    loginUrl?: string;
    clientId?: string;
    realm?: string;
    serverUrl?: string;
    hubOrigin?: string;
    children: ReactNode;
  }

  export default function TinyCommandAuthController(
    props: TinyCommandAuthControllerProps
  ): JSX.Element;

  export function useAuth(): {
    user?: Record<string, unknown> | null;
    assetAccessDetails?: unknown;
    logout?: () => void;
  };
}
