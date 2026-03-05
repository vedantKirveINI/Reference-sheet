const handlePhoneNumber = async ({ node, ref }) => {
  try {
    if (
      node?.config?.settings?.isPhoneValidationEnabled &&
      !ref?.current?.isOtpSent
    ) {
      await ref.current.sendOtp();
      return {
        earlyExit: true,
      };
    }
    if (
      node?.config?.settings?.isPhoneValidationEnabled &&
      ref?.current?.isOtpSent
    ) {
      const data = await ref.current.verifyOtp();
      if (!data?.status) {
        return {
          earlyExit: true,
          error: data?.message,
        };
      }
      // if (data) {
      //   if (data?.result !== "valid otp") {
      //     if (data?.response?.data?.result) {
      //       return {
      //         earlyExit: true,
      //         error: data?.result || data?.response?.data?.result,
      //       };
      //     }

      //     if (data?.response?.data?.error) {
      //       return {
      //         earlyExit: true,
      //         error: data?.response?.data?.error,
      //       };
      //     }
      //   }
      // }
    }

    return {};
  } catch (e) {
    return e;
  }
};

export { handlePhoneNumber };
