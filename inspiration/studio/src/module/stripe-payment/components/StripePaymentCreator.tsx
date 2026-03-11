import React, { forwardRef, useMemo, useImperativeHandle } from "react";
import { StripePaymentFillerRef } from "../types";
import { getPaymentFormStyles } from "../styles";
import { getCurrencyDecimalPlaces } from "../utils";

export type StripePaymentCreatorProps = {
  question?: any;
  theme?: any;
};

export const StripePaymentCreator = forwardRef<
  StripePaymentFillerRef,
  StripePaymentCreatorProps
>(({ question, theme = {} }, ref) => {
  const settings = question?.settings || {};
  const amount = parseFloat(settings?.amount || "0");
  const currency = settings?.currency || "USD";
  const sendReceipt = settings?.sendReceipt || false;

  // Format amount with currency symbol
  const formattedAmount = useMemo(() => {
    if (amount <= 0) return "0";
    const decimalPlaces = getCurrencyDecimalPlaces(currency);
    if (decimalPlaces === 0) {
      return Math.round(amount).toString();
    }
    return amount.toFixed(decimalPlaces);
  }, [amount, currency]);

  // Display currency code (e.g., "USD", "EUR") to match the image format
  const currencyDisplay = useMemo(() => {
    return currency.toUpperCase();
  }, [currency]);

  useImperativeHandle(ref, () => ({
    validate: async () => "",
    getStripe: () => null,
    getElements: () => null,
    createPaymentIntent: async () => "",
  }));

  const labelColor = theme?.styles?.questions || "#0D9488"; // Teal-green default
  const primaryColor = theme?.styles?.buttons || "#000";

  return (
    <div style={getPaymentFormStyles()}>
      {/* Amount Display */}
      <div
        style={{
          fontSize: "1.5em",
          fontWeight: 600,
          color: theme?.styles?.questions || "#000",
          fontFamily: theme?.styles?.fontFamily || "Inter",
          marginBottom: "1.5em",
        }}
      >
        Pay {currencyDisplay} {formattedAmount}
      </div>

      {/* Payment Method Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5em",
          marginBottom: "1.5em",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Card Tab - Selected */}
        <div
          style={{
            padding: "0.75em 1.5em",
            borderBottom: `2px solid ${primaryColor}`,
            display: "flex",
            alignItems: "center",
            gap: "0.5em",
            cursor: "pointer",
            position: "relative",
            bottom: "-1px",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="5"
              width="20"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="2"
              y1="10"
              x2="22"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span
            style={{
              fontSize: "0.875em",
              fontWeight: 500,
              color: theme?.styles?.questions || "#000",
              fontFamily: theme?.styles?.fontFamily || "Inter",
            }}
          >
            Card
          </span>
        </div>

        {/* Cash App Pay Tab - Unselected */}
        <div
          style={{
            padding: "0.75em 1.5em",
            display: "flex",
            alignItems: "center",
            gap: "0.5em",
            cursor: "pointer",
            opacity: 0.6,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="#00D632" strokeWidth="2" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fontSize="12"
              fill="#00D632"
              fontWeight="bold"
            >
              $
            </text>
          </svg>
          <span
            style={{
              fontSize: "0.875em",
              fontWeight: 500,
              color: theme?.styles?.questions || "#000",
              fontFamily: theme?.styles?.fontFamily || "Inter",
            }}
          >
            Cash App Pay
          </span>
        </div>
      </div>

      {/* Card Number Field */}
      <div style={{ marginBottom: "1em" }}>
        <label
          style={{
            display: "block",
            marginBottom: "0.5em",
            fontSize: "0.875em",
            fontWeight: 500,
            color: labelColor,
            fontFamily: theme?.styles?.fontFamily || "Inter",
          }}
        >
          Card number
        </label>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="1234 1234 1234 1234"
            disabled
            style={{
              width: "100%",
              padding: "0.75em",
              border: "1px solid rgba(0, 0, 0, 0.2)",
              borderRadius: "0.375em",
              fontSize: "16px",
              fontFamily: theme?.styles?.fontFamily || "Inter",
              backgroundColor: "#f5f5f5",
              color: "#666",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "0.75em",
              display: "flex",
              gap: "0.25em",
              alignItems: "center",
            }}
          >
            {/* Card Logos */}
            <div
              style={{
                display: "flex",
                gap: "0.25em",
                alignItems: "center",
              }}
            >
              {/* Visa */}
              <div
                style={{
                  width: "32px",
                  height: "20px",
                  backgroundColor: "#1434CB",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                VISA
              </div>
              {/* Mastercard */}
              <div
                style={{
                  width: "32px",
                  height: "20px",
                  backgroundColor: "#EB001B",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-8px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#EB001B",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: "-8px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#F79E1B",
                  }}
                />
              </div>
              {/* AMEX */}
              <div
                style={{
                  width: "32px",
                  height: "20px",
                  backgroundColor: "#006FCF",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "8px",
                  fontWeight: "bold",
                }}
              >
                AMEX
              </div>
              {/* Discover */}
              <div
                style={{
                  width: "32px",
                  height: "20px",
                  backgroundColor: "#FF6000",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "7px",
                  fontWeight: "bold",
                }}
              >
                DISC
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expiration and Security Code Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1em",
          marginBottom: "1em",
        }}
      >
        {/* Expiration Date */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5em",
              fontSize: "0.875em",
              fontWeight: 500,
              color: labelColor,
              fontFamily: theme?.styles?.fontFamily || "Inter",
            }}
          >
            Expiration date
          </label>
          <input
            type="text"
            placeholder="MM / YY"
            disabled
            style={{
              width: "100%",
              padding: "0.75em",
              border: "1px solid rgba(0, 0, 0, 0.2)",
              borderRadius: "0.375em",
              fontSize: "16px",
              fontFamily: theme?.styles?.fontFamily || "Inter",
              backgroundColor: "#f5f5f5",
              color: "#666",
            }}
          />
        </div>

        {/* Security Code */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5em",
              fontSize: "0.875em",
              fontWeight: 500,
              color: labelColor,
              fontFamily: theme?.styles?.fontFamily || "Inter",
            }}
          >
            Security code
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="CVC"
              disabled
              style={{
                width: "100%",
                padding: "0.75em",
                border: "1px solid rgba(0, 0, 0, 0.2)",
                borderRadius: "0.375em",
                fontSize: "16px",
                fontFamily: theme?.styles?.fontFamily || "Inter",
                backgroundColor: "#f5f5f5",
                color: "#666",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "0.75em",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "help",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="14"
                  rx="2"
                  stroke="#666"
                  strokeWidth="1.5"
                />
                <line
                  x1="2"
                  y1="9"
                  x2="22"
                  y2="9"
                  stroke="#666"
                  strokeWidth="1.5"
                />
                <text
                  x="12"
                  y="16"
                  textAnchor="middle"
                  fontSize="8"
                  fill="#666"
                  fontWeight="bold"
                >
                  123
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Country Field */}
      <div style={{ marginBottom: "1em" }}>
        <label
          style={{
            display: "block",
            marginBottom: "0.5em",
            fontSize: "0.875em",
            fontWeight: 500,
            color: labelColor,
            fontFamily: theme?.styles?.fontFamily || "Inter",
          }}
        >
          Country
        </label>
        <div style={{ position: "relative" }}>
          <select
            disabled
            style={{
              width: "100%",
              padding: "0.75em",
              border: "1px solid rgba(0, 0, 0, 0.2)",
              borderRadius: "0.375em",
              fontSize: "16px",
              fontFamily: theme?.styles?.fontFamily || "Inter",
              backgroundColor: "#f5f5f5",
              color: "#666",
              appearance: "none",
              cursor: "not-allowed",
            }}
          >
            <option>India</option>
          </select>
          <div
            style={{
              position: "absolute",
              right: "0.75em",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Name on Card */}
      <div style={{ marginBottom: "1em" }}>
        <label
          style={{
            display: "block",
            marginBottom: "0.5em",
            fontSize: "0.875em",
            fontWeight: 500,
            color: labelColor,
            fontFamily: theme?.styles?.fontFamily || "Inter",
          }}
        >
          Name on card
        </label>
        <input
          type="text"
          placeholder="John Smith"
          disabled
          style={{
            width: "100%",
            padding: "0.75em",
            border: "1px solid rgba(0, 0, 0, 0.2)",
            borderRadius: "0.375em",
            fontSize: "16px",
            fontFamily: theme?.styles?.fontFamily || "Inter",
            backgroundColor: "#f5f5f5",
            color: "#666",
          }}
        />
      </div>

      {/* Email Field - Only if sendReceipt is true */}
      {sendReceipt && (
        <div style={{ marginBottom: "1em" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5em",
              fontSize: "0.875em",
              fontWeight: 500,
              color: labelColor,
              fontFamily: theme?.styles?.fontFamily || "Inter",
            }}
          >
            Email
          </label>
          <input
            type="email"
            placeholder="example@email.com"
            disabled
            style={{
              width: "100%",
              padding: "0.75em",
              border: "1px solid rgba(0, 0, 0, 0.2)",
              borderRadius: "0.375em",
              fontSize: "16px",
              fontFamily: theme?.styles?.fontFamily || "Inter",
              backgroundColor: "#f5f5f5",
              color: "#666",
            }}
          />
        </div>
      )}
    </div>
  );
});
