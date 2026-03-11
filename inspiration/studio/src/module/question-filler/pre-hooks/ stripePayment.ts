const handleStripePayment = async ({ node, ref }) => {
  try {
    // Validate PaymentElement and form fields using the component's validate function
    if (ref?.current?.validate) {
      const error = await ref.current.validate();
      if (error) {
        return {
          error: error,
          earlyExit: false,
        };
      }
    }

    return {};
  } catch (e) {
    return {
      error: e?.message || "Payment validation failed",
      earlyExit: false,
    };
  }
};

export { handleStripePayment };
