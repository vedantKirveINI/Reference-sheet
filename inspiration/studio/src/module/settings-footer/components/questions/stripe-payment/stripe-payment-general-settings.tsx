import QuestionAlignment from "../../common-settings/alignment";
import CTAEditor from "../../common-settings/cta-editor";
import SwitchOption from "../../common-settings/switch";
import { styles } from "./styles";
import { SettingsTextField } from "../../common-settings/settings-textfield";
import { DropdownV2 } from "../../common-settings/dropdown-v2";
import StripeConnectionManager from "./components/StripeConnectionManager";
import { DEFAULT_CURRENCY, STRIPE_PAYMENT_CURRENCIES,  } from "./constants/currencies";
import { ODSLabel } from "@src/module/ods";
import { ERROR_MESSAGE } from "../../../constants/errorMessages";

const shouldShowStripeConnectionManager =
  process.env.REACT_APP_STRIPE_PAYMENT_PARENT_ID &&
  process.env.REACT_APP_STRIPE_PAYMENT_AUTHORIZATION_ID;

const StripePaymentGeneralSettings = ({
  question,
  onChange,
  mode,
  disableQuestionAlignment,
  workspaceId,
}: any) => {
  const settings = question?.settings || {};
  const selectedConnectionId =
    settings?.stripe_connection_data?._id ||
    settings?.stripe_connection_data?.id;
  const hasConnection = !!selectedConnectionId;

  const updateSettings = (key, value) => {
    onChange?.({ settings: { ...settings, [key]: value } });
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

    // Allow empty input
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

    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    if (numericValue.split(".").length > 2) {
      return;
    }

    // Limit decimal places to 2
    if (numericValue.includes(".")) {
      const [, decimals] = numericValue.split(".");
      if (decimals && decimals.length > 2) {
        return;
      }
    }

    // Validate numeric value
    if (numericValue && !isNaN(Number(numericValue))) {
      const numValue = Number(numericValue);

      // Validate minimum
      if (numValue < MIN_AMOUNT) {
        error = ERROR_MESSAGE.STRIPE_PAYMENT.minAmountError;
      }
      // Validate maximum
      else if (numValue > MAX_AMOUNT) {
        error = ERROR_MESSAGE.STRIPE_PAYMENT.maxAmountError;
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

  const selectedCurrency =
    STRIPE_PAYMENT_CURRENCIES.find(
      (curr) => curr.code === settings?.currency
    ) || STRIPE_PAYMENT_CURRENCIES[0];

  return (
    <div style={styles.container} data-testid="stripe-payment-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          style={{ width: "100%" }}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          title="Required"
          variant="black"
          styles={{ width: "100%" }}
          checked={settings?.required || false}
          onChange={(e) => updateSettings("required", e.target.checked)}
          dataTestId="stripe-payment-settings-required-toggle"
        />
        <CTAEditor style={{}} />
      </div>
      {shouldShowStripeConnectionManager && (
        <div style={styles.wrapperContainer}>
          <StripeConnectionManager
            workspaceId={workspaceId}
            selectedConnectionId={selectedConnectionId}
            onConnectionChange={handleConnectionChange}
            onConnectionDelete={() => {
              onChange?.({
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

          {hasConnection && (
            <>
              <div style={{ position: "relative" }}>
                <SettingsTextField
                  label="Amount"
                  className="black"
                  value={settings?.amount || ""}
                  placeholder="Enter amount"
                  onChange={handleAmountChange}
                  dataTestId="stripe-payment-settings-amount"
                  type="number"
                  error={!!settings?.errors?.amountError}
                />
                {settings?.errors?.amountError && (
                  <ODSLabel
                    variant="body1"
                    color="error"
                    data-testid="stripe-payment-settings-amount-error"
                    style={{ position: "absolute", bottom: "-2em" }}
                  >
                    {settings.errors.amountError}
                  </ODSLabel>
                )}
              </div>

              <DropdownV2
                label="Currency"
                variant="black"
                options={STRIPE_PAYMENT_CURRENCIES}
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                isOptionEqualToValue={(option, value) => {
                  const optionCode =
                    typeof option === "string" ? option : option?.code;
                  const valueCode =
                    typeof value === "string" ? value : value?.code;
                  return optionCode === valueCode;
                }}
                getOptionLabel={(option) => {
                  if (typeof option === "string") return option;
                  return option?.name || option?.code || "";
                }}
                dataTestId="stripe-payment-settings-currency"
              />

              <SwitchOption
                title="Send receipt"
                variant="black"
                styles={{ width: "100%" }}
                checked={settings?.sendReceipt || false}
                onChange={(e) =>
                  updateSettings("sendReceipt", e.target.checked)
                }
                dataTestId="stripe-payment-settings-send-receipt-toggle"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StripePaymentGeneralSettings;
