import { useState, useEffect } from "react";
import SettingSwitch from "../components/SettingSwitch";
import { DropdownV2 } from "../components/DropdownV2";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { countries } from "@oute/oute-ds.core.constants";
import { getAuthorizations } from "../../settings-footer/components/questions/collect-payments/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, CreditCard, Sliders, Copy } from "lucide-react";

const PAYMENT_METHODS = [
  { label: "Razorpay", value: "RAZORPAY" },
];

interface CollectPaymentsSettingsProps {
  question: any;
  onChange: (val: any) => void;
  workspaceId?: string;
}

const CollectPaymentsSettings = ({ question, onChange, workspaceId }: CollectPaymentsSettingsProps) => {
  const settings = question?.settings || {};
  const [authorizations, setAuthorizations] = useState<any[]>([]);

  const currencies = [
    ...new Set(
      Object.values(countries)?.map((country: any) => country?.currencyCode)
    ),
  ].filter(Boolean);

  useEffect(() => {
    const fetchAuths = async () => {
      const auths = await getAuthorizations({
        paymentMethod: settings?.paymentMethod,
        workspaceId,
      });
      setAuthorizations(auths || []);
    };
    if (settings?.paymentMethod) {
      fetchAuths();
    }
  }, [settings?.paymentMethod, workspaceId]);

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

  const selectedPaymentMethod = PAYMENT_METHODS.find(
    (pm) => pm.value === settings?.paymentMethod
  );

  const selectedAuthorization = authorizations?.find(
    (auth: any) => auth?.value === settings?.authorization_data_id
  );

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
            description="Users must complete payment before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-collect-payments-required"
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
        title="Payment Options"
        icon={CreditCard}
      >
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <DropdownV2
            value={selectedPaymentMethod || null}
            options={PAYMENT_METHODS}
            onChange={(value: any) =>
              updateSettings("paymentMethod", value?.value)
            }
            isOptionEqualToValue={(option: any, value: any) =>
              option?.value === value?.value
            }
            getOptionLabel={(option: any) => option?.label || ""}
            placeholder="Select payment method"
            dataTestId="v2-collect-payments-method"
          />
          <HelperText>
            Payment gateway provider (e.g., Razorpay)
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Account</Label>
          <DropdownV2
            value={selectedAuthorization || null}
            options={authorizations}
            onChange={(value: any) =>
              updateSettings("authorization_data_id", value?.value)
            }
            isOptionEqualToValue={(option: any, value: any) =>
              option?.value === value?.value
            }
            getOptionLabel={(option: any) => option?.label || option?.name || ""}
            placeholder="Select account"
            dataTestId="v2-collect-payments-account"
          />
          <HelperText>
            Payment account for processing
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <DropdownV2
            value={settings?.currency || null}
            options={currencies}
            onChange={(value: any) => updateSettings("currency", value)}
            isOptionEqualToValue={(option: any, value: any) => option === value}
            getOptionLabel={(option: any) => option || ""}
            placeholder="Select currency"
            searchable
            dataTestId="v2-collect-payments-currency"
          />
          <HelperText>
            Currency for the payment (USD, EUR, INR, etc.)
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            value={settings?.amount || ""}
            placeholder="Enter amount"
            onChange={(e) => updateSettings("amount", e.target.value)}
            data-testid="v2-collect-payments-amount"
          />
          <HelperText>
            Payment amount in the selected currency
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
            placeholder="e.g., Complete payment to continue"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-collect-payments-tooltip"
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
              data-testid="v2-collect-payments-access-key"
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

export default CollectPaymentsSettings;
