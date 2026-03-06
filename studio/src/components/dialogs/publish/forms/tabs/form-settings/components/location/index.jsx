import FormSwitch from "../switchAccordian";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { icons } from "@/components/icons";

const SWITCH_IDS = {
  COLLECT_LOCATION: "collectLocation",
  COLLECT_IP: "collectIP",
};

const LocationSettings = ({ settings = {}, onSettingsChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <Alert className="bg-muted/50 border-border flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0">
        {icons.mapPin && <icons.mapPin className="h-4 w-4 shrink-0 mt-0.5" />}
        <div className="flex-1">
          <AlertTitle className="text-sm font-semibold">Location Data Collection</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Collect geographic and network information from form submissions. This data helps with analytics, fraud prevention, and regional insights.
          </AlertDescription>
        </div>
      </Alert>

      <Alert className="bg-amber-50 border-amber-200 flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0">
        {icons.alertTriangle && <icons.alertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />}
        <div className="flex-1">
          <AlertTitle className="text-xs font-semibold text-amber-800">Privacy Notice</AlertTitle>
          <AlertDescription className="text-xs text-amber-700">
            Location and IP address collection may be subject to privacy regulations (GDPR, CCPA). Ensure you have proper consent and privacy policies in place.
          </AlertDescription>
        </div>
      </Alert>

      <Card className="p-4 bg-muted/30 border-border">
        <div className="flex items-start gap-3">
          {icons.info && <icons.info className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />}
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-foreground mb-1.5">What Data is Collected?</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-foreground font-bold">•</span>
                <span><strong>Location:</strong> Approximate geographic location (city/region level)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground font-bold">•</span>
                <span><strong>IP Address:</strong> Network address for analytics and security</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <FormSwitch
        id={SWITCH_IDS.COLLECT_LOCATION}
        label="Collect Location"
        description="Collect the approximate geographic location of the responder when they submit the form."
        icon={icons.mapPin}
        tooltip="Location data is collected at the city/region level, not exact coordinates. Useful for regional analysis and event check-ins."
        isChecked={settings.collectLocation || false}
        onChange={(e) => onSettingsChange({ collectLocation: e.target.checked })}
        dataTestId="collect-location"
      >
        {settings.collectLocation && (
          <Card className="p-3 bg-muted/30 border-border mt-3">
            <div className="flex items-start gap-2">
              {icons.globe && <icons.globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground mb-1">Use Cases</p>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  <li>• Regional form analytics and insights</li>
                  <li>• Event check-ins and attendance tracking</li>
                  <li>• Location-based form customization</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </FormSwitch>

      <FormSwitch
        id={SWITCH_IDS.COLLECT_IP}
        label="Collect IP Address"
        description="Collect the IP address of the responder for analytics and security purposes."
        icon={icons.globe}
        tooltip="IP addresses help identify duplicate submissions, prevent fraud, and provide network-level analytics. Data is stored securely and anonymized."
        isChecked={settings.collectIP || false}
        onChange={(e) => onSettingsChange({ collectIP: e.target.checked })}
        dataTestId="collect-ip"
      >
        {settings.collectIP && (
          <Card className="p-3 bg-muted/30 border-border mt-3">
            <div className="flex items-start gap-2">
              {icons.alertCircle && <icons.alertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground mb-1">Use Cases</p>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  <li>• Fraud detection and prevention</li>
                  <li>• Duplicate submission detection</li>
                  <li>• Network-level analytics</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </FormSwitch>
    </div>
  );
};

export default LocationSettings;
