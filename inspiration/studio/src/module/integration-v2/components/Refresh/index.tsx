import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { cn } from "@src/lib/utils";

export const Refresh = ({ onClick = () => {} }: any) => {
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

  const LoadingIcon = icons.loader2;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onRefreshClick}
      disabled={isRefreshing}
      aria-label="Refresh"
      className="pr-3 w-max h-max"
    >
      <LoadingIcon  className={cn("h-4 w-4", isRefreshing ? "animate-spin" : "")}/>
    </Button>
  );
};
