import { useAuth } from '@oute/oute-ds.common.molecule.tiny-auth';
import {
  createContext,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export interface SheetsContextValue {
  assetId: string | null;
  workspaceId: string | null;
  parentId: string | null;
  projectId: string | null;
  updateAssetId: (id: string | null) => void;
  updateWorkspaceId: (id: string | null) => void;
  updateParentId: (id: string | null) => void;
  updateProjectId: (id: string | null) => void;
  logout: () => Promise<void>;
  user: Record<string, unknown> | null | undefined;
  assetAccessDetails: unknown;
  isMobile: boolean;
  screenDimensions: { width: number; height: number };
  isTablet: boolean;
  isDesktop: boolean;
  isSmallMobile: boolean;
}

export const SheetsContext = createContext<SheetsContextValue | null>(null);

export function SheetsContextProvider({ children }: { children: ReactNode }) {
  const [assetId, setAssetId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [screenDimensions, setScreenDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const { user, assetAccessDetails } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logout = useCallback(async () => {}, []);

  const updateAssetId = useCallback((id: string | null) => {
    setAssetId(id);
  }, []);

  const updateWorkspaceId = useCallback((id: string | null) => {
    setWorkspaceId(id);
  }, []);

  const updateParentId = useCallback((id: string | null) => {
    setParentId(id);
  }, []);

  const updateProjectId = useCallback((id: string | null) => {
    setProjectId(id);
  }, []);

  const isMobile = screenDimensions.width <= 768;
  const isTablet =
    screenDimensions.width <= 1024 && screenDimensions.width > 768;
  const isDesktop = screenDimensions.width > 1024;
  const isSmallMobile = screenDimensions.width <= 480;

  return (
    <SheetsContext.Provider
      value={{
        assetId,
        updateAssetId,
        workspaceId,
        updateWorkspaceId,
        parentId,
        updateParentId,
        projectId,
        updateProjectId,
        logout,
        user,
        assetAccessDetails,
        isMobile,
        screenDimensions,
        isTablet,
        isDesktop,
        isSmallMobile,
      }}
    >
      {children}
    </SheetsContext.Provider>
  );
}
