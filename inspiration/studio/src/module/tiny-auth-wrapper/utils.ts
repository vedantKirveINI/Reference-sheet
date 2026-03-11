function parseCookie() {
  return document.cookie.split("; ").reduce((acc, cookie) => {
    const [name, ...rest] = cookie.split("=");
    acc[name] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function setCookie(name, value, options = {}) {
  let cookieStr = `${name}=${encodeURIComponent(value)}`;
  if (options.expires) {
    cookieStr += `; expires=${options.expires.toUTCString()}`;
  }
  if (options.path) {
    cookieStr += `; path=${options.path}`;
  } else {
    cookieStr += `; path=/`;
  }
  if (options.secure) {
    cookieStr += `; secure`;
  }
  if (options.sameSite) {
    cookieStr += `; samesite=${options.sameSite}`;
  }
  document.cookie = cookieStr;
}

function isAccessTokenExpired(expires_at) {
  if (!expires_at) return true;
  const expiryDate = new Date(expires_at); // Convert the string to Date
  return Date.now() > expiryDate.getTime(); // Compare current time with expiry time
}

function getTokensFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  const id_token = params.get("id_token");
  const access_token_expires_at = params.get("access_token_expires_at");
  const refresh_token_expires_at = params.get("refresh_token_expires_at");
  // console.log(
  //   access_token,
  //   refresh_token,
  //   id_token,
  //   access_token_expires_at,
  //   refresh_token_expires_at,
  //   "tokens harsh_test"
  // );
  return {
    access_token,
    refresh_token,
    id_token,
    access_token_expires_at: access_token_expires_at
      ? decodeURIComponent(access_token_expires_at.replace(/\+/g, " "))
      : "",
    refresh_token_expires_at: refresh_token_expires_at
      ? decodeURIComponent(refresh_token_expires_at.replace(/\+/g, " "))
      : "",
  };
}

function setTokensInCookies({
  access_token,
  id_token,
  refresh_token,
  access_token_expires_at,
  refresh_token_expires_at,
}: any) {
  if (!access_token_expires_at) {
    return;
  }

  if (access_token) {
    setCookie("access_token", access_token, {
      secure: true,
      sameSite: "Lax",
      expires: access_token_expires_at, // new Date(Number(expires_at)),
    });
  }
  if (id_token) {
    setCookie("id_token", id_token, {
      secure: true,
      sameSite: "Lax",
      expires: refresh_token_expires_at, // new Date(Number(expires_at)),
    });
  }
  if (refresh_token) {
    setCookie("refresh_token", refresh_token, {
      secure: true,
      sameSite: "Lax",
      expires: refresh_token_expires_at, // new Date(Number(expires_at) + 86400000),
    });
  }
  if (access_token_expires_at) {
    setCookie("access_token_expires_at", access_token_expires_at, {
      secure: true,
      sameSite: "Lax",
      expires: access_token_expires_at, // new Date(Number(expires_at)),
    });
  }
  if (refresh_token_expires_at) {
    setCookie("refresh_token_expires_at", refresh_token_expires_at, {
      secure: true,
      sameSite: "Lax",
      expires: refresh_token_expires_at,
    });
  }
}

function setSessionIdCookie({
  sessionId,
  expires_at,
}: {
  sessionId: string;
  expires_at?: Date;
}) {
  const expiry =
    expires_at ||
    new Date(
      Date.now() +
        24 * 60 * 60 * 1000 // default 1 day fallback
    );
  setCookie("session_id", sessionId, {
    secure: true,
    sameSite: "Lax",
    expires: expiry,
  });
}

function cleanUpUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  window.history.replaceState(
    {},
    document.title,
    q ? `${window.location.pathname}?q=${q}` : window.location.pathname
  );
}

export {
  parseCookie,
  isAccessTokenExpired,
  setTokensInCookies,
  setSessionIdCookie,
  cleanUpUrl,
  getTokensFromUrl,
};
