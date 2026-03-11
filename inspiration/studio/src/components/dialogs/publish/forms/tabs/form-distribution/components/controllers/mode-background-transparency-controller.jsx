import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
import { Input } from "@/components/ui/input";
import classes from "../embed-settings.module.css";

const ModeBackgroundTransparencyController = () => {
  const { embedSettings, setEmbedSettings } = useFormPublishContext();

  const handleSettingChange = useCallback(
    (field, value) => {
      setEmbedSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setEmbedSettings],
  );

  return (
    <div className={classes.dimensionGroup}>
      <label className={classes.label}>Background Transparency</label>
      <div className={classes.inputGroup}>
        <Input
          value={embedSettings?.backgroundTransparency}
          onChange={(e) =>
            handleSettingChange("backgroundTransparency", e.target.value)
          }
          className="rounded-md border-[#cfd8dc] font-sans text-base leading-6 tracking-wide"
          data-testid="background-transparency-input"
        />
      </div>
    </div>
  );
};

export default ModeBackgroundTransparencyController;
