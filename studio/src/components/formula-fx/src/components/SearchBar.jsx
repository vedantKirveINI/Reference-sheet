import React from "react";
import { Input } from "@/components/ui/input";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search",
  onKeyDown,
  onFocus,
}) => {
  const handleFocus = (e) => {
    e.stopPropagation();
    if (onFocus) onFocus(e);
  };

  return (
    <div className="flex items-center py-2 px-3 bg-muted border border-border rounded-md h-9 gap-2 transition-all hover:border-primary/25 hover:shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background">
      <div className="flex items-center justify-center text-muted-foreground w-5 h-5 shrink-0 focus-within:text-primary">
        {<icons.search />}
      </div>
      <Input
        type="text"
        className={cn(
          "flex-1 p-0 text-sm text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground",
          "border-0 shadow-none focus-visible:ring-0 h-auto min-h-0"
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={handleFocus}
      />
    </div>
  );
};

export default SearchBar;
