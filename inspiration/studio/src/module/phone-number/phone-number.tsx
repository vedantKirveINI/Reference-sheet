import {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useCallback,
} from "react";
import { PhoneCountryInput } from "./components";
import { sendOtp, verifyOtp } from "./apis";
import OtpInput from "react-otp-input";
import { Button } from "@/components/ui/button";
import { ViewPort } from "@src/module/constants";
import { OTP_SUPPORTED_COUNTRIES } from "@oute/oute-ds.core.constants/constants";

export type PhoneNumberProps = {
  value: any;
  onChange: any;
  placeholder?: string;
  viewPort?: any;
  isCreator?: boolean;
  settings?: any;
  isInputValid?: boolean;
  ref?: any;
  autoFocus?: boolean;
  disabled?: boolean;
  theme?: any;
  isAnswered?: boolean;
  onCountryClick?: () => void;
  isPreview?: boolean;
};

export const PhoneNumber = forwardRef(
  (
    {
      onChange,
      value,
      isCreator,
      isInputValid,
      placeholder,
      settings,
      viewPort,
      autoFocus = false,
      disabled = false,
      theme = {},
      isAnswered = false,
      onCountryClick = () => {},
      isPreview = false,
    }: PhoneNumberProps,
    ref
  ): any => {
    const { isCountryChangeEnabled, defaultCountry } = settings ?? {};
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(0);
    const [otpTimeStamp, setOtpTimeStamp] = useState(null);
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    useEffect(() => {
      if (
        !isCreator &&
        defaultCountry?.countryCode &&
        !isAnswered &&
        !value?.phoneNumber &&
        !value?.countryCode
      ) {
        onChange({ ...defaultCountry });
      }
    }, []);

    const onChangePhone = (inputValue, e) => {
      setIsOtpVerified(false);
      onChange(inputValue);
      setIsOtpSent(false);
      setOtp("");
    };

    useEffect(() => {
      let interval: NodeJS.Timeout;
      if (timer > 0) {
        interval = setInterval(() => {
          setTimer((prevTimer) => prevTimer - 1);
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = useCallback(async () => {
      let timeStamp = new Date().getTime();

      await sendOtp({
        phone: value?.countryNumber + value?.phoneNumber,
        onSuccess: () => {
          setIsOtpSent(true);
          setOtp("");
          setTimer(60);
        },
        requestTimestamp: timeStamp,
      });
      setOtpTimeStamp(timeStamp);
    }, [value]);

    useImperativeHandle(ref, () => {
      return {
        canSendOtp: OTP_SUPPORTED_COUNTRIES.includes(value?.countryCode),
        sendOtp: handleSendOtp,
        isOtpSent,
        verifyOtp: async () => {
          const data = await verifyOtp({
            phone: value?.countryNumber + value?.phoneNumber,
            otp,
            requestTimestamp: otpTimeStamp,
          });
          if (data?.status) {
            setIsOtpVerified(true);
          }
          return data;
        },
      };
    }, [isOtpSent, otp, value, handleSendOtp]);
    return (
      <>
        <PhoneCountryInput
          value={value}
          onChange={onChangePhone}
          disableInput={isCreator || disabled}
          isInputValid={isOtpSent ? true : isInputValid}
          placeholder={placeholder}
          disableCountrySelection={disabled || !isCountryChangeEnabled}
          viewPort={viewPort}
          autoFocus={autoFocus}
          theme={theme}
          isCreator={isCreator}
          isPreview={isPreview}
        />
        {isOtpSent && (
          <div
            style={{
              fontSize: "1em",
              marginTop: 5,
              color: theme?.styles?.buttons,
              fontFamily: theme?.styles?.fontFamily,
            }}
          >
            ✅ <i>Verification code sent to your phone.</i>
          </div>
        )}
        {isOtpSent ? (
          <div
            style={{
              display: "flex",
              flexDirection: viewPort === ViewPort.MOBILE ? "column" : "row",
              justifyContent: "space-between",
              alignItems: viewPort === ViewPort.MOBILE && "flex-start",
            }}
            data-testid="phone-number-otp-input-container"
          >
            <OtpInput
              onChange={(otpValue) => {
                onChange(value, { clearError: true }); // Just a way to clear the error state
                setOtp(otpValue);
              }}
              value={otp}
              numInputs={6}
              shouldAutoFocus={true}
              containerStyle={{ marginTop: 10 }}
              renderSeparator={<span>&nbsp; &nbsp;</span>}
              renderInput={(props, index) => (
                <input
                  {...props}
                  maxLength={1}
                  placeholder="-"
                  inputMode="numeric"
                  data-testid={`otp-input-${index}`}
                  style={{
                    width: "3.75rem",
                    height: "3.75rem",
                    textAlign: "center",
                    border: "0.75px solid rgba(0, 0, 0, 0.20)",
                    borderRadius: "0.375rem",
                    outline: "none",
                    background: `${theme?.styles?.buttons}1A`,
                    backdropFilter: "blur(10px)",
                    boxShadow: !isInputValid && "0px 0px 0px 0.125rem #C83C3C",
                    color: theme?.styles?.buttons,
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = `0px 0px 0px 0.125rem ${theme?.styles?.buttons}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                  }}
                  onInput={(e) => {
                    const value = e.currentTarget.value;
                    if (!/^\d?$/.test(value)) {
                      (e.target as HTMLInputElement).style.boxShadow =
                        "0px 0px 0px 0.125rem  #C83C3C";
                      e.currentTarget.value = ""; // block non-digit input
                    } else {
                      (e.target as HTMLInputElement).style.boxShadow =
                        `0px 0px 0px 0.125rem ${theme?.styles?.buttons}`;
                    }
                  }}
                />
              )}
            />
            {isOtpVerified ? null : (
              <Button
                type="button"
                variant="black-text"
                size="lg"
                onClick={handleSendOtp}
                disabled={timer > 0}
                className="mt-6"
                style={{
                  cursor: timer > 0 ? "default" : "pointer",
                  color: theme?.styles?.buttons,
                }}
              >
                {timer > 0 ? `RESEND CODE IN ${timer}s` : "RESEND OTP"}
              </Button>
            )}
          </div>
        ) : null}
      </>
    );
  }
);
