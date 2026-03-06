import { Suspense, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SuspenseComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const QuestionSkeleton = () => {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
};

export const SuspenseComponent = ({
  children,
  fallback,
}: SuspenseComponentProps) => (
  <Suspense fallback={fallback ?? <QuestionSkeleton />}>{children}</Suspense>
);
