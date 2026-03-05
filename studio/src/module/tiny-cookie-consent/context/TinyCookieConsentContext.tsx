import React from "react";
import type {
  TinyCookieConsentContextValue,
  TinyCookieConsentProviderProps,
  TinyCookieConsentValue,
  TinyCookieCategories,
} from "../types";
import {
  deriveCookieDomain,
  parseCookieValue,
  readCookie,
  writeCookie,
} from "../utils/cookies";

const DEFAULT_COOKIE_NAME = "tiny_cookie_consent";

const TinyCookieConsentContext = React.createContext<
  TinyCookieConsentContextValue | undefined
>(undefined);

export function TinyCookieConsentProvider(
  props: TinyCookieConsentProviderProps
): JSX.Element {
  const {
    children,
    cookieName = DEFAULT_COOKIE_NAME,
    maxAgeDays = 365,
    cookieDomain,
    path = "/",
    sameSite = "Lax",
    secure,
    initialValue = { accepted: false },
  } = props;

  const initialFromCookie = React.useMemo<TinyCookieConsentValue>(() => {
    const raw = readCookie(cookieName);
    const parsed = parseCookieValue(raw);
    return parsed ?? initialValue;
  }, [cookieName, initialValue]);

  const [value, setValue] =
    React.useState<TinyCookieConsentValue>(initialFromCookie);

  const resolvedDomain = React.useMemo(
    () => cookieDomain ?? deriveCookieDomain(),
    [cookieDomain]
  );

  const setAccepted = React.useCallback(
    (accepted: boolean) => {
      const categories: TinyCookieCategories = {
        necessary: true,
        analytics: value.categories?.analytics ?? false,
        functional: value.categories?.functional ?? false,
        advertising: value.categories?.advertising ?? false,
      };
      const next: TinyCookieConsentValue = {
        accepted,
        categories,
        updatedAt: new Date().toISOString(),
      };
      setValue(next);
      writeCookie(cookieName, JSON.stringify(next), {
        maxAgeDays,
        domain: resolvedDomain,
        path,
        sameSite,
        secure,
      });
    },
    [cookieName, maxAgeDays, path, resolvedDomain, sameSite, secure, value]
  );

  const acceptAll = React.useCallback(() => {
    const categories: TinyCookieCategories = {
      necessary: true,
      analytics: true,
      functional: true,
      advertising: true,
    };
    const next: TinyCookieConsentValue = {
      accepted: true,
      categories,
      updatedAt: new Date().toISOString(),
    };
    setValue(next);
    writeCookie(cookieName, JSON.stringify(next), {
      maxAgeDays,
      domain: resolvedDomain,
      path,
      sameSite,
      secure,
    });
  }, [cookieName, maxAgeDays, path, resolvedDomain, sameSite, secure]);

  const rejectAll = React.useCallback(() => {
    const categories: TinyCookieCategories = {
      necessary: true,
      analytics: false,
      functional: false,
      advertising: false,
    };
    const next: TinyCookieConsentValue = {
      accepted: false,
      categories,
      updatedAt: new Date().toISOString(),
    };
    setValue(next);
    writeCookie(cookieName, JSON.stringify(next), {
      maxAgeDays,
      domain: resolvedDomain,
      path,
      sameSite,
      secure,
    });
  }, [cookieName, maxAgeDays, path, resolvedDomain, sameSite, secure]);

  const setCategories = React.useCallback(
    (categoriesUpdate: Omit<TinyCookieCategories, "necessary">) => {
      const categories: TinyCookieCategories = {
        necessary: true,
        analytics: !!categoriesUpdate.analytics,
        functional: !!categoriesUpdate.functional,
        advertising: !!categoriesUpdate.advertising,
      };
      const next: TinyCookieConsentValue = {
        accepted:
          categories.analytics ||
          categories.functional ||
          categories.advertising,
        categories,
        updatedAt: new Date().toISOString(),
      };
      setValue(next);
      writeCookie(cookieName, JSON.stringify(next), {
        maxAgeDays,
        domain: resolvedDomain,
        path,
        sameSite,
        secure,
      });
    },
    [cookieName, maxAgeDays, path, resolvedDomain, sameSite, secure]
  );

  const refreshFromCookie = React.useCallback(() => {
    const raw = readCookie(cookieName);
    const parsed = parseCookieValue(raw);
    if (parsed) setValue(parsed);
  }, [cookieName]);

  const ctxValue = React.useMemo<TinyCookieConsentContextValue>(
    () => ({
      value,
      setAccepted,
      setCategories,
      acceptAll,
      rejectAll,
      refreshFromCookie,
    }),
    [value, setAccepted, setCategories, acceptAll, rejectAll, refreshFromCookie]
  );

  return (
    <TinyCookieConsentContext.Provider value={ctxValue}>
      {children}
    </TinyCookieConsentContext.Provider>
  );
}

export function useTinyCookieConsent(): TinyCookieConsentContextValue {
  const ctx = React.useContext(TinyCookieConsentContext);
  if (!ctx) {
    throw new Error(
      "useTinyCookieConsent must be used within a TinyCookieConsentProvider"
    );
  }
  return ctx;
}
