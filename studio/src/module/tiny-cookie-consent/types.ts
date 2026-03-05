export type TinyCookieCategories = {
  necessary: true; // always true and not toggleable
  analytics: boolean;
  functional: boolean;
  advertising: boolean;
};

export type TinyCookieConsentValue = {
  accepted: boolean;
  categories?: TinyCookieCategories;
  // ISO timestamp of last update. Useful for consumers to react to changes.
  updatedAt?: string;
};

export type TinyCookieConsentContextValue = {
  value: TinyCookieConsentValue;
  setAccepted: (accepted: boolean) => void;
  setCategories: (categories: Omit<TinyCookieCategories, "necessary">) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  refreshFromCookie: () => void;
};

export type TinyCookieConsentProviderProps = {
  children: React.ReactNode;
  /**
   * Cookie name to store consent under.
   * Default: "tiny_cookie_consent"
   */
  cookieName?: string;
  /**
   * Cookie max age in days.
   * Default: 365
   */
  maxAgeDays?: number;
  /**
   * Explicit cookie domain. If omitted, attempts to derive the eTLD+1 (e.g., .oute.app).
   * For localhost or IPs, no domain is set.
   */
  cookieDomain?: string;
  /**
   * Path scope for the cookie. Default: "/"
   */
  path?: string;
  /**
   * SameSite policy. Default: "Lax"
   */
  sameSite?: "Lax" | "Strict" | "None";
  /**
   * Force the Secure flag on the cookie. If omitted, inferred from location.protocol === 'https:' when available.
   */
  secure?: boolean;
  /**
   * Initial value used for SSR or before hydration. Default: { accepted: false }
   */
  initialValue?: TinyCookieConsentValue;
};
