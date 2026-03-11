const handleEmail = async ({ node, ref }) => {
  try {
    if (node?.config?.settings?.verifyEmail && !ref?.current?.isOtpSent) {
      await ref.current.sendOtp();
      return {
        earlyExit: true,
      };
    }
    if (node?.config?.settings?.verifyEmail && ref?.current?.isOtpSent) {
      const data = await ref.current.verifyOtp();
      if (!data?.status) {
        return {
          earlyExit: true,
          error: data?.message,
        };
      }
    }

    return {};
  } catch (e) {
    return e;
  }
};

export { handleEmail };
