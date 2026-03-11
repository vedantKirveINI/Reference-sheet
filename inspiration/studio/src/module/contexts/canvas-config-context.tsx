import { createContext, ReactNode, useContext } from "react";

interface CanvasConfigContextProps {
  assetId: string;
  projectId: string;
  workspaceId?: string;
  parentId?: string;
  variables: Record<string, any>;
}

const CanvasConfigContext = createContext<CanvasConfigContextProps | null>(
  null
);

interface QuestionTabsProviderProps extends CanvasConfigContextProps {
  children: ReactNode;
}

const CanvasConfigProvider = ({
  children,
  workspaceId,
  assetId,
  projectId,
  parentId,
  variables,
}: QuestionTabsProviderProps) => {
  return (
    <CanvasConfigContext.Provider
      value={{ workspaceId, assetId, projectId, parentId, variables }}
    >
      {children}
    </CanvasConfigContext.Provider>
  );
};

const useCanvasConfigContext = () => {
  const context = useContext(CanvasConfigContext);
  if (context === null) {
    throw new Error(
      "useCanvasConfigContext must be used within a CanvasConfigProvider"
    );
  }
  return context;
};

export { CanvasConfigProvider, useCanvasConfigContext };
