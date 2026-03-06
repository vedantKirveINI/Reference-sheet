import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import classes from './index.module.css';

const ODSSpeedDial = ({ icon, actions = [], className, ...props }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "absolute bottom-4 right-4 flex flex-col items-end gap-2",
        className
      )}
      {...props}
    >
      {open && actions.map((action) => (
        <Button
          key={action.id}
          variant="default"
          size="medium"
          className="text-base"
          data-testid={`action-${action.name}`}
          onClick={() => {
            action?.onActionClick && action.onActionClick(action);
          }}
          {...action?.FabProps}
        >
          <div className={classes["speed-dial-action-container"]}>
            {action.name}
            {action.icon}
          </div>
        </Button>
      ))}
      <Button
        data-testid="speed-dial"
        onClick={() => setOpen((prev) => !prev)}
        className="h-14 w-14 rounded-full"
        style={{ backgroundColor: "#2196F3" }}
      >
        {icon || (open ? <X className="h-10 w-10" /> : <Plus className="h-10 w-10" />)}
      </Button>
    </div>
  );
};

export default ODSSpeedDial;
