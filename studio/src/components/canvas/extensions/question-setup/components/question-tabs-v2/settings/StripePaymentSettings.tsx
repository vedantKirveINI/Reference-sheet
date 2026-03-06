import SettingSwitch from "../components/SettingSwitch";
import { DropdownV2 } from "../components/DropdownV2";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import StripeConnectionManager from "../../settings-footer/components/questions/stripe-payment/components/StripeConnectionManager";
import {
  DEFAULT_CURRENCY,
  STRIPE_PAYMENT_CURRENCIES,
} from "../../settings-footer/components/questions/stripe-payment/constants/currencies";
import { ERROR_MESSAGE } from "../../settings-footer/constants/errorMessages";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, CreditCard, Sliders, Copy } from "lucide-react";

const shouldShowStripeConnectionManager =
  process.env.REACT_APP_STRIPE_PAYMENT_PARENT_ID &&
  process.env.REACT_APP_STRIPE_PAYMENT_AUTHORIZATION_ID;

interface StripePaymentSettingsProps {
  question: any;
  onChange: (val: any) => void;
  workspaceId?: string;
}

const StripePaymentSettings = ({ question, onChange, workspaceId }: StripePaymentSettingsProps) => {
  const settings = question?.settings || {};
  const selectedConnectionId =
    settings?.stripe_connection_data?._id ||
    settings?.stripe_connection_data?.id;

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

  const handleConnectionChange = (connection: any) => {
    if (connection) {
      updateSettings("stripe_connection_data", {
        ...connection,
        id: connection._id || connection.id,
        _id: connection._id || connection.id,
      });
    } else {
      updateSettings("stripe_connection_data", "");
    }
  };

  const handleAmountChange = (value: string) => {
    let error = "";
    const MIN_AMOUNT = 1;
    const MAX_AMOUNT = 999999.99;

    if (value === "") {
      onChange({
        settings: {
          ...settings,
          amount: "",
          errors: { ...settings?.errors, amountError: "" },
        },
      });
      return;
    }

    const numericValue = value.replace(/[^0-9.]/g, "");
    if (numericValue.split(".").length > 2) return;

    if (numericValue.includes(".")) {
      const [, decimals] = numericValue.split(".");
      if (decimals && decimals.length > 2) return;
    }

    if (numericValue && !isNaN(Number(numericValue))) {
      const numValue = Number(numericValue);
      if (numValue < MIN_AMOUNT) {
        error = ERROR_MESSAGE.STRIPE_PAYMENT?.minAmountError || "Minimum amount is $1";
      } else if (numValue > MAX_AMOUNT) {
        error = ERROR_MESSAGE.STRIPE_PAYMENT?.maxAmountError || "Maximum amount exceeded";
      }
    }

    onChange({
      settings: {
        ...settings,
        amount: numericValue,
        errors: { ...settings?.errors, amountError: error },
      },
    });
  };

  const handleCurrencyChange = (currency: any) => {
    updateSettings("currency", currency?.code || currency);
  };

  const handleCopyKey = () => {
    if (settings?.accessKey) {
      navigator.clipboard.writeText(settings.accessKey);
    }
  };

  const selectedCurrency =
    STRIPE_PAYMENT_CURRENCIES.find(
      (curr: any) => curr.code === settings?.currency
    ) || STRIPE_PAYMENT_CURRENCIES[0];

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
            dataTestId="v2-stripe-payment-required"
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

      {shouldShowStripeConnectionManager && (
        <SettingsCard
          questionType={question?.type}
          title="Stripe Account"
          icon={CreditCard}
        >
          <StripeConnectionManager
            workspaceId={workspaceId}
            selectedConnectionId={selectedConnectionId}
            onConnectionChange={handleConnectionChange}
            onConnectionDelete={() => {
              onChange({
                settings: {
                  ...settings,
                  stripe_connection_data: null,
                  amount: "",
                  currency: DEFAULT_CURRENCY,
                  sendReceipt: false,
                },
              });
            }}
          />
          <HelperText>
            Configure your Stripe account for processing payments
          </HelperText>
        </SettingsCard>
      )}

      <SettingsCard
        questionType={question?.type}
        title="Payment Options"
        icon={CreditCard}
      >
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            value={settings?.amount || ""}
            placeholder="Enter amount"
            onChange={(e) => handleAmountChange(e.target.value)}
            data-testid="v2-stripe-payment-amount"
            className={
              settings?.errors?.amountError ? "border-destructive" : ""
            }
          />
          {settings?.errors?.amountError ? (
            <HelperText error>{settings.errors.amountError}</HelperText>
          ) : (
            <HelperText>
              Payment amount (minimum $1, maximum $999,999.99)
            </HelperText>
          )}
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <DropdownV2
            options={STRIPE_PAYMENT_CURRENCIES}
            value={selectedCurrency}
            onChange={(value: any) => handleCurrencyChange(value)}
            isOptionEqualToValue={(option: any, value: any) => {
              const optionCode =
                typeof option === "string" ? option : option?.code;
              const valueCode =
                typeof value === "string" ? value : value?.code;
              return optionCode === valueCode;
            }}
            getOptionLabel={(option: any) => {
              if (typeof option === "string") return option;
              return option?.name || option?.code || "";
            }}
            dataTestId="v2-stripe-payment-currency"
          />
          <HelperText>
            Currency for the payment (USD, EUR, GBP, etc.)
          </HelperText>
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Send receipt to customer"
            description="Email a payment receipt after successful payment"
            checked={settings?.sendReceipt || false}
            onChange={(checked) => updateSettings("sendReceipt", checked)}
            dataTestId="v2-stripe-payment-send-receipt"
          />
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
            placeholder="e.g., Enter your payment details"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-stripe-payment-tooltip"
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
              data-testid="v2-stripe-payment-access-key"
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

export default StripePaymentSettings;
