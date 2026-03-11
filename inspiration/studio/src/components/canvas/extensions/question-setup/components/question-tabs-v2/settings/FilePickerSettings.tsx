import SettingSwitch from "../components/SettingSwitch";
import { DropdownV2 } from "../components/DropdownV2";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { FILE_TYPES } from "../../settings-footer/components/questions/file-picker/fileTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, Upload, Sliders } from "lucide-react";

const FILE_COUNT_OPTIONS = ["1", "2", "3", "4", "5"];

interface FilePickerSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const FilePickerSettings = ({ question, onChange }: FilePickerSettingsProps) => {
  const settings = question?.settings || {};

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
            description="Users must upload a file before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-filepicker-required"
          />
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
        title="File Options"
        icon={Upload}
      >
        <div className="space-y-2">
          <Label>Allowed File Types</Label>
          <DropdownV2
            multiple={true}
            searchable={true}
            options={FILE_TYPES}
            value={settings?.allowedFileTypes || []}
            onChange={(value: any) =>
              updateSettings("allowedFileTypes", value)
            }
            isOptionEqualToValue={(option: any, value: any) =>
              option?.label === value?.label
            }
            renderTagKey="label"
            disableCloseOnSelect={true}
            placeholder="Select file types..."
            dataTestId="v2-filepicker-file-types"
          />
          <HelperText>
            Which file types users can upload (PDF, DOCX, images, etc.)
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Maximum Files Allowed</Label>
          <DropdownV2
            options={FILE_COUNT_OPTIONS}
            value={settings?.noOfFilesAllowed || "1"}
            onChange={(value: any) =>
              updateSettings("noOfFilesAllowed", value)
            }
            isOptionEqualToValue={(option: any, value: any) => option === value}
            placeholder="Select max files"
            dataTestId="v2-filepicker-file-count"
          />
          <HelperText>
            Maximum number of files a user can upload (1-5)
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
            placeholder="e.g., Upload your documents here"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-filepicker-tooltip"
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
              data-testid="v2-filepicker-access-key"
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

export default FilePickerSettings;
