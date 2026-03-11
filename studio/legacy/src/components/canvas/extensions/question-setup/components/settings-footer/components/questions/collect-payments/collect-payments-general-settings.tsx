/** @jsxImportSource @emotion/react **/
import { COUNTRY_SELECTION_FOR } from "../../../constants/constants";
import QuestionAlignment from "../../common-settings/alignment";
import CountryPicker from "../../common-settings/country-picker";
import CTAEditor from "../../common-settings/cta-editor";
import { DropdownV2 } from "../../common-settings/dropdown-v2";
import SwitchOption from "../../common-settings/switch";
import { styles } from "./styles";
import { ODSLabel } from "@src/module/ods";
import { countries } from "@oute/oute-ds.core.constants";
import { SettingsTextField } from "../../common-settings/settings-textfield";
import { useEffect, useState } from "react";
import { getAuthorizations } from "./utils";

const PAYMENT_METHODS = [
  { label: "Razorpay", value: "RAZORPAY" },
  // { label: "Stripe", value: "STRIPE" },
];

const CollectPaymentsGeneralSettings = ({
  question,
  onChange,
  mode,
  disableQuestionAlignment,
  workspaceId,
}) => {
  const settings = question?.settings;
  const [authorizations, setAuthorizations] = useState([]);

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  useEffect(() => {
    const fetchAuths = async () => {
      const auths = await getAuthorizations({
        paymentMethod: settings?.paymentMethod,
        workspaceId,
      });
      setAuthorizations(auths);
      // if (auths?.length > 0 && !settings?.authorization_data_id) {
      // updateSettings("authorization_data_id", auths[0]?.value);
      // }
    };
    if (settings?.paymentMethod) {
      fetchAuths();
    }
  }, [settings?.paymentMethod]);
  console.log(authorizations, "authorizationsauthorizationsauthorizations");
  const currencies = [
    ...new Set(
      Object.values(countries)?.map((country) => country?.currencyCode)
    ),
  ];

  return (
    <div css={styles.container} data-testid="short-text-general-settings">
      <div css={styles.wrapperContainer}>
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
          checked={settings?.required}
          onChange={(e) => updateSettings("required", e.target.checked)}
          dataTestId="question-settings-required-toggle"
        />
        <SettingsTextField
          label="Tooltip Text"
          className="black"
          value={settings?.toolTipText || ""}
          placeholder="Enter tooltip text here"
          onChange={(val) => updateSettings("toolTipText", val)}
          dataTestId="short-text-settings-tooltip"
        />
        <CTAEditor style={{}} />
      </div>
      <div css={styles.wrapperContainer}>
        <DropdownV2
          label="Payment Method"
          variant="black"
          value={settings?.paymentMethod}
          options={PAYMENT_METHODS}
          onChange={(value) => {
            updateSettings("paymentMethod", value?.value);
          }}
          isOptionEqualToValue={(option, value) => {
            return option?.label === value;
          }}
          placeholder="Select payment method"
          dataTestId="collect-payment-payment-method-selector"
        />
        <DropdownV2
          label="Select Account"
          variant="black"
          value={authorizations?.find(
            (auth) => auth?.value === settings?.authorization_data_id
          )}
          options={authorizations}
          onChange={(value) => {
            updateSettings("authorization_data_id", value?.value);
          }}
          isOptionEqualToValue={(option, value) => {
            return option?.value === value?.value;
          }}
          placeholder="Select account"
          dataTestId="collect-payment-account-selector"
          // getOptionLabel={(option) => option?.name}
        />

        <DropdownV2
          label="Currency"
          variant="black"
          value={settings?.currency}
          options={currencies}
          onChange={(_value) => {
            updateSettings("currency", _value);
          }}
          isOptionEqualToValue={(option, value) => {
            return option === value;
          }}
          placeholder="Select currency"
          dataTestId="collect-payment-currency-selector"
          searchable
        />

        <SettingsTextField
          label="Amount"
          value={settings?.amount || ""}
          className="black"
          placeholder=""
          onChange={(val) => {
            updateSettings("amount", val);
          }}
          //   InputProps={{
          //     sx: styles.getInputStyle(),
          //   }}
        />
      </div>
    </div>
  );
};

export default CollectPaymentsGeneralSettings;
