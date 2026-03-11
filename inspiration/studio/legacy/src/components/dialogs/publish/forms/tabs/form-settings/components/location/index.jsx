import FormSwitch from "../form-switchh";
import classes from "./index.module.css";

const SWITCH_IDS = {
  COLLECT_LOCATION: "collectLocation",
  COLLECT_IP: "collectIP",
};

const LocationSettings = ({ settings, onSettingsChange }) => {
  return (
    <div
      className={classes.locationSettingsContainer}
      data-testid="location-settings-container"
    >
      <FormSwitch
        id={SWITCH_IDS.COLLECT_LOCATION}
        label="Collect Location"
        description="Collect the location of the responder when they submit the form."
        isChecked={settings.collectLocation}
        onChange={onSettingsChange(SWITCH_IDS.COLLECT_LOCATION)}
      />

      <FormSwitch
        id={SWITCH_IDS.COLLECT_IP}
        label="Collect IP Address"
        description="Collect the IP address of the responder when they submit the form."
        isChecked={settings.collectIP}
        onChange={onSettingsChange(SWITCH_IDS.COLLECT_IP)}
      />
    </div>
  );
};

export default LocationSettings;
