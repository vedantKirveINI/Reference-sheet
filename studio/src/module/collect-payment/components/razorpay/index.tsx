import React, { useState } from "react";
import useScriptLoader from "./useScriptLoader";
import styles from "./index.module.css";
import { getAmount } from "../../utils";

export default function RazorpayPaymentForm({
  assetId,
  settings,
  isCreator,
  onChange,
}) {
  const razorpayLoaded = useScriptLoader(
    "https://checkout.razorpay.com/v1/checkout.js"
  );

  const amtInPaise = getAmount(settings?.amount);
  const handlePayment = async () => {
    if (!settings?.authorization_data_id) return;
    const res = await fetch(
      "https://2pssm1f94e.execute-api.ap-south-1.amazonaws.com/prod/api/razorpay/create-payment-order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorizationDataId: settings?.authorization_data_id,
          amount: amtInPaise,
          currency: settings?.currency,
        }),
      }
    );

    const { data: { order_id, key_id } = {} } = await res.json();

    const options = {
      key: key_id,
      amount: amtInPaise,
      currency: settings?.currency,
      name: "TinyForms Payment",
      description: "Form Submission Fee",
      order_id: order_id,
      prefill: {},
      handler: async function (response) {
        // Send verification data to backend
        const verifyRes = await fetch(
          "https://2pssm1f94e.execute-api.ap-south-1.amazonaws.com/prod/api/razorpay/verify-payment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              authorizationDataId: settings?.authorization_data_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          }
        );

        const result = await verifyRes.json();
        if (result.status === "success") {
          onChange({
            paymentId: response.razorpay_payment_id,
          });
          // alert("✅ Payment successful and verified!");
        } else {
          // alert("❌ Payment verification failed");
        }
      },
      theme: {
        color: "#0f9d58",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <img
          src={"https://cdn-icons-png.flaticon.com/512/633/633611.png"}
          alt="Card Icon"
          className={styles.cardIcon}
        />
        Pay securely with Razorpay
      </div>

      <div className={styles.infoBox}>
        You'll be redirected to Razorpay to pay ₹{amtInPaise / 100}.
        <br />
        Your details are safe and encrypted.
      </div>

      <button
        className={styles.payButton}
        disabled={!razorpayLoaded || isCreator}
        onClick={handlePayment}
      >
        Pay {settings?.currency} {amtInPaise / 100} Now
      </button>
      <div className={styles.razorpayBadge}>
        <span>🔒 Powered by</span>
        <img src={"https://cdn.razorpay.com/logo.svg"} alt="Razorpay" />
      </div>
    </div>
  );
}
