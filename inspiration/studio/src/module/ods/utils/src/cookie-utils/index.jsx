const COOKIE_NAME = "tinycommand_cookie";
const COOKIE_EXPIRY_DAYS = 7;

const getCurrentDomain = () => {
  if (typeof window !== "undefined") {
    return new URL(window.location.href).hostname;
  }
  return undefined;
};

const setCookie = (
  key,
  value,
  days = COOKIE_EXPIRY_DAYS,
  cookieName = COOKIE_NAME
) => {
  let cookieData = {};

  const match = document.cookie.match(
    new RegExp("(^| )" + cookieName + "=([^;]+)")
  );
  if (match) {
    try {
      cookieData = JSON.parse(decodeURIComponent(match[2]));
    } catch {
      cookieData = {};
      return false;
    }
  }

  // Create or update the key
  cookieData[key] = value;

  // Set updated cookie with reset expiry
  const domain = getCurrentDomain();
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  let cookieString = `${cookieName}=${encodeURIComponent(
    JSON.stringify(cookieData)
  )}; path=/; expires=${expires}; SameSite=Lax; domain=${domain}`;
  document.cookie = cookieString;
  return true;
};

const getAllCookies = (keys = [], cookieName = COOKIE_NAME) => {
  if (!Array.isArray(keys)) return [];
  const match = document.cookie.match(
    new RegExp("(^| )" + cookieName + "=([^;]+)")
  );
  let cookieData = {};

  if (match) {
    try {
      cookieData = JSON.parse(decodeURIComponent(match[2]));
    } catch (e) {
      cookieData = {};
    }
  }

  const cookiesKeyValueMap = {};

  for (const key of keys) {
    cookiesKeyValueMap[key] = cookieData[key];
  }

  return cookiesKeyValueMap;
};

const getCookie = (key, cookieName = COOKIE_NAME) => {
  const cookieData = getAllCookies([key], cookieName);
  return cookieData[key];
};

const deleteTinyCommandCookie = (cookieName = COOKIE_NAME) => {
  const domain = getCurrentDomain();
  if (domain) {
    document.cookie = `${cookieName}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
  }
};

const removeCookie = (
  key,
  days = COOKIE_EXPIRY_DAYS,
  cookieName = COOKIE_NAME
) => {
  const match = document.cookie.match(
    new RegExp("(^| )" + cookieName + "=([^;]+)")
  );
  if (!match) return;

  let cookieData = {};
  try {
    cookieData = JSON.parse(decodeURIComponent(match[2]));
  } catch {
    return;
  }

  delete cookieData[key];

  // Update cookie if any keys remain, else delete the entire cookie
  const domain = getCurrentDomain();
  if (Object.keys(cookieData).length > 0) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    let cookieString = `${cookieName}=${encodeURIComponent(
      JSON.stringify(cookieData)
    )}; path=/; expires=${expires}; SameSite=Lax; domain=${domain}`;
    document.cookie = cookieString;
  } else {
    // If object is empty, delete the whole cookie
    document.cookie = `${cookieName}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
  }
};

export {
  setCookie,
  getAllCookies,
  getCookie,
  deleteTinyCommandCookie,
  removeCookie,
};
