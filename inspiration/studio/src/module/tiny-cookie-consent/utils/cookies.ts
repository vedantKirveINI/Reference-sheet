import type { TinyCookieConsentValue, TinyCookieCategories } from "../types";

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function parseCookieValue(
  raw: string | null | undefined
): TinyCookieConsentValue | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as TinyCookieConsentValue;
    if (typeof parsed?.accepted === "boolean") {
      const categories: TinyCookieCategories = {
        necessary: true,
        analytics: parsed.categories?.analytics ?? false,
        functional: parsed.categories?.functional ?? false,
        advertising: parsed.categories?.advertising ?? false,
      };
      return { ...parsed, categories };
    }
    return null;
  } catch {
    if (raw === "true" || raw === "false") {
      return { accepted: raw === "true" };
    }
    return null;
  }
}

export function readCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const idx = cookie.indexOf("=");
    const key = idx > -1 ? decodeURIComponent(cookie.slice(0, idx)) : cookie;
    const val = idx > -1 ? cookie.slice(idx + 1) : "";
    if (key === name) return decodeURIComponent(val);
  }
  return null;
}

export function deriveCookieDomain(): string | undefined {
  if (!isBrowser()) return undefined;
  const host = location.hostname;
  if (host === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    return undefined;
  }
  const parts = host.split(".");
  if (parts.length >= 2) {
    const sldTld = parts.slice(-2).join(".");
    return `.${sldTld}`;
  }
  return undefined;
}

export function writeCookie(
  name: string,
  value: string,
  options: {
    maxAgeDays?: number;
    domain?: string;
    path?: string;
    sameSite?: "Lax" | "Strict" | "None";
    secure?: boolean;
  } = {}
): void {
  if (!isBrowser()) return;
  const segments: string[] = [];
  segments.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
  if (options.maxAgeDays && Number.isFinite(options.maxAgeDays)) {
    const maxAge = Math.round((options.maxAgeDays as number) * 24 * 60 * 60);
    segments.push(`Max-Age=${maxAge}`);
  }
  segments.push(`Path=${options.path ?? "/"}`);
  if (options.domain) segments.push(`Domain=${options.domain}`);
  const sameSite = options.sameSite ?? "Lax";
  segments.push(`SameSite=${sameSite}`);
  const secureFlag =
    options.secure ?? (isBrowser() && window.location.protocol === "https:");
  if (secureFlag) segments.push("Secure");
  document.cookie = segments.join("; ");
}
