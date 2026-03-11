import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import TemplateLibraryView from "./TemplateLibraryView";
import { icons } from "@/components/icons";

const CustomThemeListView = ({
  userThemes = [],
  searchQuery = "",
  onSearchChange,
  selectedThemeId,
  onApplyTheme,
  onEditTheme,
  onCreateNewTheme,
}) => {
  const SearchIcon = icons?.search;
  const AddIcon = icons?.add;

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex gap-2 shrink-0">
        <div className="relative flex-1 min-w-0">
          {SearchIcon ? (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <SearchIcon className="size-4" />
            </span>
          ) : null}
          <Input
            type="text"
            placeholder="Search themes"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={SearchIcon ? "pl-9" : ""}
          />
        </div>
        <Button type="button" size="default" onClick={onCreateNewTheme} className="shrink-0 gap-1.5">
          {AddIcon ? <AddIcon className="size-4" /> : null}
          Create theme
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {userThemes && userThemes.length > 0 ? (
          <>
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your saved themes
            </CardTitle>
            <TemplateLibraryView
              themes={userThemes}
              selectedThemeId={selectedThemeId}
              onApplyTheme={onApplyTheme}
              onEditTheme={onEditTheme}
            />
          </>
        ) : (
          <Empty className="py-8 rounded-2xl border-0">
            <EmptyHeader>
              <EmptyTitle className="text-sm font-semibold">
                No saved themes yet
              </EmptyTitle>
              <EmptyDescription>
                Create a theme using the button above or edit a template from the library
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
};

export default CustomThemeListView;
