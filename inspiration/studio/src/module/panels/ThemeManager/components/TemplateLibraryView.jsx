import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import ThemePreviewCard from "./ThemePreviewCard";

const TemplateLibraryView = ({
  themes = [],
  selectedThemeId,
  onApplyTheme,
  onEditTheme,
}) => {
  if (!themes || themes.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-0">
          <Empty className="py-16 rounded-2xl border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-16 rounded-2xl mb-5">
                <span className="text-3xl">🎨</span>
              </EmptyMedia>
              <EmptyTitle className="text-base font-semibold">
                No templates available
              </EmptyTitle>
              <EmptyDescription>
                Templates will appear here when added
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
        {themes.map((theme) => {
          const themeId = theme._id || theme.id;
          return (
            <ThemePreviewCard
              key={themeId}
              theme={theme}
              isSelected={selectedThemeId === themeId}
              onApply={onApplyTheme}
              onEditTheme={onEditTheme}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TemplateLibraryView;
