import React, { useState, useEffect, useMemo, startTransition } from "react";
import {
  PillTabs,
  PillTabsList,
  PillTabsTrigger,
  PillTabsContent,
} from "@/components/ui/pill-tabs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import TemplateLibraryView from "./components/TemplateLibraryView";
import CustomThemeView from "./components/CustomThemeView";
import CustomThemeListView from "./components/CustomThemeListView";
import ThemeManagerSkeleton from "./components/ThemeManagerSkeleton";
import { icons } from "@/components/icons";
import { toast } from "sonner";

// Create a default theme in SDK format
function getDefaultTheme() {
  return {
    _id: `theme-${Date.now()}`,
    name: "Custom Theme",
    type: "user",
    theme: {
      logo: {
        image: null,
        position: "left",
        size: "M",
      },
      background: {
        color: "#FFFFFF",
        image: null,
      },
      font: {
        question: {
          color: "#212121",
          family: "Inter",
        },
        answer: {
          color: "#666666",
        },
        size: "M",
        alignment: "left",
      },
      components: {
        button: {
          background: "#1C3693",
          text: "#FFFFFF",
          borderRadius: "8px",
          label: "Next",
        },
      },
    },
  };
}

// Helper to get theme ID from either SDK or legacy format
function getThemeId(theme) {
  return theme?._id || theme?.id;
}

const ThemeManagerBody = ({
  theme,
  onChange,
  templateThemes = [],
  userThemes = [],
  onSaveTheme,
  onDeleteTheme,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState("library");
  const [localTheme, setLocalTheme] = useState(theme || getDefaultTheme());
  const [customTabView, setCustomTabView] = useState("list");
  const [themeToEdit, setThemeToEdit] = useState(null);
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");
  const [customListSearchQuery, setCustomListSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredTemplateThemes = useMemo(() => {
    if (!librarySearchQuery.trim()) return templateThemes;
    const q = librarySearchQuery.trim().toLowerCase();
    return templateThemes.filter((t) => (t?.name ?? "").toLowerCase().includes(q));
  }, [templateThemes, librarySearchQuery]);

  const filteredUserThemes = useMemo(() => {
    if (!customListSearchQuery.trim()) return userThemes;
    const q = customListSearchQuery.trim().toLowerCase();
    return (userThemes || []).filter((t) => (t?.name ?? "").toLowerCase().includes(q));
  }, [userThemes, customListSearchQuery]);

  useEffect(() => {
    if (theme) {
      setLocalTheme(theme);
    }
  }, [theme]);

  const handleSelectGalleryTheme = (selectedTheme) => {
    setLocalTheme(selectedTheme);
    onChange?.(selectedTheme);
  };

  const handleCustomThemeChange = (updatedTheme) => {
    setLocalTheme(updatedTheme);
    onChange?.(updatedTheme);
  };

  const handleBackFromEditor = () => {
    setCustomTabView("list");
  };

  const handleDiscard = () => {
    setLocalTheme(theme || getDefaultTheme());
    setCustomTabView("list");
  };

  const handleSave = async () => {
    const newTheme = {
      ...localTheme,
      name: localTheme.name || `Custom Theme ${Date.now()}`,
    };
    onChange?.(newTheme);
    if (!onSaveTheme) {
      setCustomTabView("list");
      return;
    }
    setIsSaving(true);
    try {
      await onSaveTheme(newTheme);
      setCustomTabView("list");
    } catch (err) {
      toast.error("Failed to save theme. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTheme = (themeToEditPayload) => {
    setThemeToEdit(themeToEditPayload);
    setLocalTheme(themeToEditPayload);
    onChange?.(themeToEditPayload);
    setCustomTabView("editor");
    setActiveTab("custom");
  };

  const handleCreateNewTheme = () => {
    const defaultTheme = getDefaultTheme();
    setThemeToEdit(defaultTheme);
    setLocalTheme(defaultTheme);
    onChange?.(defaultTheme);
    setCustomTabView("editor");
    setActiveTab("custom");
  };

  const handleTabChange = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
      if (tab === "custom") {
        setCustomTabView("list");
      }
    });
  };

  return (
    <Card className="flex flex-col h-full border-0 bg-background shadow-none">
      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <PillTabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex-1 flex flex-col min-h-0"
        >
          <PillTabsList className="w-fit shrink-0 mx-5 mt-5" size="md">
            <PillTabsTrigger value="library" size="md">
              Template Library
            </PillTabsTrigger>
            <PillTabsTrigger value="custom" size="md">
              Custom Theme
            </PillTabsTrigger>
          </PillTabsList>

          <PillTabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-6 data-[state=inactive]:hidden">
            <div className="pt-5 px-5 pb-6 flex flex-col flex-1 min-h-0 gap-4">
              <div className="shrink-0 space-y-4">
                <div className="relative">
                  {(() => {
                    const SearchIcon = icons?.search;
                    return SearchIcon ? (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                        <SearchIcon className="size-4" />
                      </span>
                    ) : null;
                  })()}
                  <Input
                    type="text"
                    placeholder="Search themes"
                    value={librarySearchQuery}
                    onChange={(e) => setLibrarySearchQuery(e.target.value)}
                    className={icons?.search ? "pl-9" : ""}
                  />
                </div>
                {filteredTemplateThemes.length > 0 ? (
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Templates
                  </CardTitle>
                ) : null}
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto" style={{ contain: "layout" }}>
                {filteredTemplateThemes.length > 0 ? (
                  <TemplateLibraryView
                    themes={filteredTemplateThemes}
                    selectedThemeId={localTheme?._id || localTheme?.id}
                    onApplyTheme={handleSelectGalleryTheme}
                    onEditTheme={handleEditTheme}
                  />
                ) : (
                  <Empty className="py-10 rounded-2xl border-0">
                    <EmptyHeader>
                      <EmptyTitle className="text-sm font-semibold">
                        No templates match your search
                      </EmptyTitle>
                      <EmptyDescription>
                        Try a different search or clear the search bar
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
            </div>
          </PillTabsContent>

          <PillTabsContent value="custom" className="flex-1 flex flex-col min-h-0 mt-5 overflow-hidden data-[state=inactive]:hidden">
            {customTabView === "list" ? (
              <div className="pt-5 px-5 pb-6 flex flex-col flex-1 min-h-0 gap-4">
                <CustomThemeListView
                  userThemes={filteredUserThemes}
                  searchQuery={customListSearchQuery}
                  onSearchChange={setCustomListSearchQuery}
                  selectedThemeId={localTheme?._id || localTheme?.id}
                  onApplyTheme={handleSelectGalleryTheme}
                  onEditTheme={handleEditTheme}
                  onCreateNewTheme={handleCreateNewTheme}
                />
              </div>
            ) : (
              <CustomThemeView
                theme={localTheme}
                onChange={handleCustomThemeChange}
                onBack={handleBackFromEditor}
                onDiscard={handleDiscard}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
          </PillTabsContent>
        </PillTabs>
      </CardContent>
    </Card>
  );
};

export default ThemeManagerBody;
