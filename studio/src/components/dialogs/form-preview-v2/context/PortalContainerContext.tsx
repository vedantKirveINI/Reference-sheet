import React, { createContext, useContext, RefObject } from "react";

interface PortalContainerContextValue {
  containerRef: RefObject<HTMLDivElement> | null;
  isPreviewMode: boolean;
}

const PortalContainerContext = createContext<PortalContainerContextValue>({
  containerRef: null,
  isPreviewMode: false,
});

export function usePortalContainer() {
  const { containerRef, isPreviewMode } = useContext(PortalContainerContext);
  return {
    container: containerRef?.current ?? null,
    isPreviewMode,
  };
}

interface PortalContainerProviderProps {
  containerRef: RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

export function PortalContainerProvider({
  containerRef,
  children,
}: PortalContainerProviderProps) {
  return (
    <PortalContainerContext.Provider value={{ containerRef, isPreviewMode: true }}>
      {children}
    </PortalContainerContext.Provider>
  );
}
