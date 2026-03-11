import { Suspense, ReactNode } from "react";

interface SuspenseComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const SuspenseComponent = ({
  children,
  fallback = <div>Loading...</div>,
}: SuspenseComponentProps) => (
  <Suspense fallback={fallback}>{children}</Suspense>
);
