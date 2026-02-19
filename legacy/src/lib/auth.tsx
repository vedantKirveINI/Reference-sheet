import { createContext, useContext, ReactNode } from "react";

interface AuthContextValue {
  user: any;
  assetAccessDetails: any;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  assetAccessDetails: null,
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
  hubOrigin?: string;
  assetId?: string | null;
  assetServerUrl?: string;
  loginUrl?: string;
  clientId?: string;
  realm?: string;
  serverUrl?: string;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{ user: null, assetAccessDetails: null }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
