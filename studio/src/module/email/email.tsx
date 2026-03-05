import { TextField } from "@src/module/text-field";
import { QuestionType } from "@src/module/constants";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import isEmpty from "lodash-es/isEmpty";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
import { sendOtp, verifyOtp as verifyOtpFn } from "./apis";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EmailProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value, options?: Record<string, any>) => void;
  isCreator?: boolean;
  setValue?: any;
  theme?: any;
  question?: any;
  error?: string | undefined;
  autoFocus?: boolean;
  disabled?: boolean;
  answers?: any;
  state?: any;
  isAnswered?: boolean;
  onFocus?: any;
  viewPort?: any;
};

export const Email = forwardRef(
  (
    {
      placeholder,
      value,
      onChange,
      isCreator,
      theme,
      question,
      error,
      autoFocus = false,
      disabled = false,
      answers,
      state = {},
      isAnswered = false,
      onFocus = () => {},
      viewPort,
    }: EmailProps,
    ref
  ) => {
    const [userOtp, setUserOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [otpTimeStamp, setOtpTimeStamp] = useState(null);
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    // const [showDomainList, setShowDomainList] = useState(false);
    // const domainList = question?.settings?.suggestDomains;
    const defaultValue = question?.settings?.defaultValue;

    const onEmailChange = (_event: unknown, val: string) => {
      setIsOtpVerified(false);
      onChange(val);
      setIsOtpSent(false);
      setUserOtp("");
    };

    const resolveFX = () => {
      try {
        const res = OuteServicesFlowUtility?.resolveValue(
          { ...answers, ...state },
          "",
          defaultValue,
          "string"
        );
        return res?.value;
      } catch (error) {
      }
    };

    useEffect(() => {
      if (!isEmpty(defaultValue) && !isCreator && !isAnswered) {
        const resolvedValue = resolveFX();
        const trimmedValue = resolvedValue?.trim();

        if (trimmedValue) {
          onChange(trimmedValue);
        }
      }
    }, []);

    useEffect(() => {
      let interval;
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
        email: value,
        onSuccess: () => {
          setIsOtpSent(true);
          setTimer(60);
        },
        requestTimestamp: timeStamp,
      });
      setOtpTimeStamp(timeStamp);
    }, [value]);

    useImperativeHandle(ref, () => {
      return {
        sendOtp: handleSendOtp,
        isOtpSent,
        verifyOtp: async () => {
          const data = await verifyOtpFn({
            email: value,
            otp: userOtp,
            requestTimestamp: otpTimeStamp,
          });
          if (data?.status) {
            setIsOtpVerified(true);
          }
          return data;
        },
      };
    }, [isOtpSent, value, userOtp]);

    return (
      <div style={{ position: "relative" }}>
        <TextField
          textType={QuestionType.SHORT_TEXT}
          type="email"
          value={value ?? ""}
          placeholder={placeholder || "name@example.com"}
          onChange={onEmailChange}
          theme={theme}
          isCreator={isCreator}
          testId="email"
          isRequired={question?.settings?.required}
          error={!!error}
          autoFocus={autoFocus}
          isDisabled={
            (question?.settings?.isReadOnly && !isCreator) || disabled
          }
          onFocus={onFocus}
        />
        {question?.settings?.verifyEmail && !isCreator && isOtpSent && (
          <div className="text-sm mt-2" style={{ color: theme?.styles?.buttons }}>
            ✅ <i>Verification code sent to your email.</i>
          </div>
        )}
        {question?.settings?.verifyEmail && !isCreator && isOtpSent && (
          <div
            className={cn(
              "flex flex-col gap-2 mt-2 items-center",
              viewPort === "MOBILE" ? "flex-col" : "flex-row"
            )}
          >
            <div
              style={
                {
                  ["--theme-otp"]: theme?.styles?.buttons ?? "#000",
                } as React.CSSProperties
              }
              className={cn(
                "mt-2 [&_div.relative]:!border-[var(--theme-otp)] [&_div.relative]:!text-[var(--theme-otp)] [&_div.relative]:!ring-[var(--theme-otp)]",
                error &&
                  "[&_div.relative]:!border-[#C83C3C] [&_div.relative]:!ring-[#C83C3C]"
              )}
              data-testid="phone-number-otp-input"
            >
              <InputOTP
                maxLength={4}
                value={userOtp}
                onChange={(otpValue) => {
                  onChange(value, { clearError: true });
                  setUserOtp(otpValue);
                }}
                containerClassName="gap-2"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot
                    index={0}
                    className="h-10 w-10 text-base font-medium !rounded-[0.375rem] !border !border-solid !border-[var(--theme-otp)] first:!rounded-[0.375rem] last:!rounded-[0.375rem] shadow-sm"
                    data-testid="otp-input-0"
                  />
                  <InputOTPSlot
                    index={1}
                    className="h-10 w-10 text-base font-medium !rounded-[0.375rem] !border !border-solid !border-[var(--theme-otp)] first:!rounded-[0.375rem] last:!rounded-[0.375rem] shadow-sm"
                    data-testid="otp-input-1"
                  />
                  <InputOTPSlot
                    index={2}
                    className="h-10 w-10 text-base font-medium !rounded-[0.375rem] !border !border-solid !border-[var(--theme-otp)] first:!rounded-[0.375rem] last:!rounded-[0.375rem] shadow-sm"
                    data-testid="otp-input-2"
                  />
                  <InputOTPSlot
                    index={3}
                    className="h-10 w-10 text-base font-medium !rounded-[0.375rem] !border !border-solid !border-[var(--theme-otp)] first:!rounded-[0.375rem] last:!rounded-[0.375rem] shadow-sm"
                    data-testid="otp-input-3"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {isOtpVerified ? null : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendOtp}
                disabled={timer > 0}
                className="mt-2 !rounded-[0.375em]"
                style={{
                  borderColor: theme?.styles?.buttons ?? undefined,
                  color: theme?.styles?.buttons ?? undefined,
                  cursor: timer > 0 ? "default" : "pointer",
                }}
                data-testid="resend-otp-button"
              >
                {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);
