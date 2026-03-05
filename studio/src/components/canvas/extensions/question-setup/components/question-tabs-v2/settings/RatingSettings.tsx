import SettingSwitch from "../components/SettingSwitch";
import { DropdownV2 } from "../components/DropdownV2";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { RATING_OPTIONS } from "../../settings-footer/constants/constants";
import { RATING_EMOJIS } from "@src/module/constants";
import { ODSIcon as Icon } from "@src/module/ods";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { icons } from "@/components/icons";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, Star, Sliders } from "lucide-react";

interface RatingSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const RatingSettings = ({ question, onChange }: RatingSettingsProps) => {
  const settings = question?.settings || {};
  const maxRate = settings?.maxRating || 5;

  const filteredMaxRating = RATING_OPTIONS.filter(
    (option) => Number(option) <= maxRate
  );

  const ICON_OPTIONS = Object.entries(RATING_EMOJIS).map(
    ([id, { label, emoji }]) => ({
      id,
      label,
      emoji,
    })
  );

  const updateSettings = (
    key: string,
    value: any,
    errors?: Record<string, string>
  ) => {
    let updatedSettings = { ...settings, [key]: value };

    if (key === "maxRating") {
      const newMax = value;
      const currentDefault = settings?.defaultRating;
      if (currentDefault >= newMax) {
        updatedSettings.defaultRating = newMax;
      }
    }

    onChange({
      settings: {
        ...updatedSettings,
        errors: { ...settings?.errors, ...errors },
      },
    });
  };

  const handleCopyKey = () => {
    if (settings?.accessKey) {
      navigator.clipboard.writeText(settings.accessKey);
    }
  };

  return (
    <div className="space-y-4">
      <SettingsCard
        questionType={question?.type}
        title="Basic Settings"
        icon={Settings}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Required"
            description="Users must select a rating before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-rating-required"
          />
        </div>

        <div className="space-y-2">
          <Label>Default Rating</Label>
          <DropdownV2
            value={settings?.defaultRating || null}
            options={filteredMaxRating}
            onChange={(value: any) => updateSettings("defaultRating", value)}
            isOptionEqualToValue={(option: any, value: any) => option === value}
            clearOnEscape
            disableClearable={false}
            placeholder="Select default rating..."
            dataTestId="v2-rating-default"
          />
          <HelperText>
            Pre-select a rating value when the form loads
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Button Label</Label>
          <CTAEditor style={{}} hideLabel />
          <HelperText>
            Text shown on the button to proceed to the next question
          </HelperText>
        </div>
      </SettingsCard>

      <SettingsCard
        questionType={question?.type}
        title="Rating Options"
        icon={Star}
      >
        <div className="space-y-2">
          <Label>Maximum Rating</Label>
          <DropdownV2
            value={settings?.maxRating || 5}
            options={RATING_OPTIONS}
            onChange={(value: any) => updateSettings("maxRating", value)}
            isOptionEqualToValue={(option: any, value: any) => option === value}
            placeholder="Select max rating"
            dataTestId="v2-rating-max"
            disableClearable={true}
          />
          <HelperText>
            Highest rating value available (e.g., 5 for a 1-5 scale)
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Rating Icon</Label>
          <div className="relative">
            <Select
              value={settings?.ratingEmoji || ""}
              onValueChange={(value) =>
                updateSettings("ratingEmoji", value || null)
              }
            >
              <SelectTrigger className="w-full justify-between">
                <div className="flex-1 min-w-0 text-left">
                  <SelectValue placeholder="Select icon">
                    {settings?.ratingEmoji ? (
                      <div className="flex items-center gap-2">
                        <Icon
                          outeIconName={
                            RATING_EMOJIS[settings.ratingEmoji]?.emoji
                          }
                          outeIconProps={{
                            sx: { color: "#212121", fontSize: 16 },
                          }}
                        />
                        <span>{RATING_EMOJIS[settings.ratingEmoji]?.label}</span>
                      </div>
                    ) : (
                      "Select icon"
                    )}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex items-center gap-2">
                      <Icon
                        outeIconName={option.emoji}
                        outeIconProps={{
                          sx: { color: "#212121", fontSize: 16 },
                        }}
                      />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <HelperText>
            Choose the icon style (stars, hearts, thumbs, etc.)
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
            placeholder="e.g., Rate from 1 to 5"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-rating-tooltip"
          />
          <HelperText>
            Help text that appears when users hover over the question
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Internal Key</Label>
          <div className="flex items-center gap-2">
            <Input
              value={settings?.accessKey || ""}
              placeholder="Enter a key"
              onChange={(e) => updateSettings("accessKey", e.target.value)}
              data-testid="v2-rating-access-key"
              className="flex-1"
            />
            {settings?.accessKey && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyKey}
                type="button"
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
          <HelperText>
            Unique identifier for this field in API responses and data exports
          </HelperText>
        </div>
      </CollapsibleSettingsCard>
    </div>
  );
};

export default RatingSettings;
