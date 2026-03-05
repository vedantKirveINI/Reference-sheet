import React from "react";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const DeleteButton = ({ onClick, dataTestId }) => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
      )}
      aria-label="Delete row"
      data-testid={dataTestId}
    >
      {icons.trash2 && (
        <icons.trash2 className="h-4 w-4" />
      )}
    </Button>
  );
};

export default DeleteButton;