import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshProps {
  onClick?: () => Promise<void> | void;
}

export const Refresh = ({ onClick = () => {} }: RefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefreshClick = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onClick();
    } finally {
      setIsRefreshing(false);
    }
  }, [onClick, isRefreshing]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onRefreshClick}
      disabled={isRefreshing}
      aria-label="Refresh options"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
    >
      <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
    </Button>
  );
};
