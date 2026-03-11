const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const getAccessToken = (): string | null => {
  if (window.accessToken) {
    return window.accessToken;
  }

  return null;
};

export { generateOTP, getAccessToken };
