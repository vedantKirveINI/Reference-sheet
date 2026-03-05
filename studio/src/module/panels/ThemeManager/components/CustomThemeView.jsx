import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { icons } from "@/components/icons";
import { themeToLegacyShape } from "../utils/themeShapeUtils";
import LegacyStyleThemeForm from "./LegacyStyleThemeForm";

const CustomThemeView = ({
  theme = {},
  onChange,
  onBack,
  onDiscard,
  onSave,
  isSaving = false,
}) => {
  const legacyTheme = useMemo(() => themeToLegacyShape(theme), [theme]);

  const handleFormChange = (updatedTheme) => {
    onChange?.(updatedTheme);
  };

  const ArrowLeftIcon = icons.arrowLeft;

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 pt-5">
      <Card className="flex flex-col flex-1 min-h-0 border-0 shadow-none bg-transparent">
        <CardContent className="flex flex-col flex-1 min-h-0 p-0">
          <div className="flex-1 min-h-0 flex flex-col">
            <LegacyStyleThemeForm theme={legacyTheme} onChange={handleFormChange} />
          </div>
        </CardContent>

        <CardFooter className="shrink-0 flex items-center justify-between gap-4 py-3 px-0 mt-auto border-t border-border bg-muted/30">
          <div className="flex items-center gap-4 px-5 w-full">
            <Button variant="ghost" onClick={onBack} size="sm" className="gap-1.5" disabled={isSaving}>
              {ArrowLeftIcon ? <ArrowLeftIcon className="w-4 h-4" /> : null}
              Back
            </Button>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onDiscard} size="sm" disabled={isSaving}>
                Discard
              </Button>
              <Button variant="default" onClick={onSave} size="sm" disabled={isSaving} className="gap-1.5">
                {(() => {
                  const LoaderIcon = icons?.loader2;
                  return isSaving && LoaderIcon ? <LoaderIcon className="size-4 animate-spin" /> : null;
                })()}
                Save and apply
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomThemeView;
