import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Loader2, Settings, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderItem {
  name: string;
  url: string;
}

interface LoadingSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const LOADERS_JSON_URL = "https://ccc.oute.app/forms/loader-question-type/loaders.json";

const LoadingSettings = ({ question, onChange }: LoadingSettingsProps) => {
  const settings = question?.settings || {};
  const [loaders, setLoaders] = useState<LoaderItem[]>([]);
  const [isLoadingLoaders, setIsLoadingLoaders] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchLoaders = async () => {
      try {
        setFetchError(false);
        const response = await fetch(LOADERS_JSON_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        const data = await response.json();
        setLoaders(data?.loaders || []);
      } catch (error) {
        console.error("Failed to fetch loaders:", error);
        setFetchError(true);
      } finally {
        setIsLoadingLoaders(false);
      }
    };
    fetchLoaders();
  }, []);

  const updateSettings = (
    key: string,
    value: any,
    errors?: Record<string, string>
  ) => {
    onChange({
      settings: {
        ...settings,
        [key]: value,
        errors: { ...settings?.errors, ...errors },
      },
    });
  };

  const updateLoadingUrl = (url: string) => {
    onChange({
      loadingUrl: url,
    });
  };

  const currentLoaderUrl = question?.loadingUrl || "";

  return (
    <div className="space-y-4">
      <SettingsCard
        questionType={question?.type}
        title="Basic Settings"
        icon={Settings}
      >
        <div className="space-y-2">
          <Label>Min Loading Time (seconds)</Label>
          <Input
            type="number"
            min="0"
            value={settings?.minLoadingTime || ""}
            placeholder="e.g., 3"
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                updateSettings("minLoadingTime", value);
              }
            }}
            data-testid="v2-loading-min-time"
          />
          <HelperText>
            Minimum time the loading screen will be displayed
          </HelperText>
        </div>
      </SettingsCard>

      <SettingsCard
        questionType={question?.type}
        title="Loader Animation"
        icon={Loader2}
      >
        <div className="space-y-3">
          <Label>Select Animation Style</Label>
          {isLoadingLoaders ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">Unable to load animations</p>
              <button
                type="button"
                onClick={() => {
                  setIsLoadingLoaders(true);
                  fetch(LOADERS_JSON_URL)
                    .then(res => res.json())
                    .then(data => {
                      setLoaders(data?.loaders || []);
                      setFetchError(false);
                    })
                    .catch(() => setFetchError(true))
                    .finally(() => setIsLoadingLoaders(false));
                }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : loaders.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">No animations available</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3" data-testid="v2-loading-loader-grid">
              {loaders.map((loader, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => updateLoadingUrl(loader.url)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-primary/50",
                    currentLoaderUrl === loader.url
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  )}
                  data-testid={`v2-loading-loader-${index}`}
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img
                      src={loader.url}
                      alt={loader.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground text-center truncate w-full">
                    {loader.name}
                  </span>
                </button>
              ))}
            </div>
          )}
          <HelperText>
            Choose the animation style shown during loading
          </HelperText>
        </div>
      </SettingsCard>

      <CollapsibleSettingsCard
        questionType={question?.type}
        title="Advanced"
        icon={Sliders}
        defaultOpen={false}
      >
        <div className="space-y-2">
          <Label>Tooltip Text</Label>
          <Textarea
            value={settings?.toolTipText || ""}
            placeholder="e.g., Please wait while we process your response"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-loading-tooltip"
          />
          <HelperText>
            Help text that appears when users hover over the question
          </HelperText>
        </div>
      </CollapsibleSettingsCard>
    </div>
  );
};

export default LoadingSettings;
