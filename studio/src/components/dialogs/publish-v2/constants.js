export const Mode = {
  CARD: "CARD",
  CLASSIC: "CLASSIC",
  CHAT: "CHAT",
};

export const ViewPort = {
  DESKTOP: "DESKTOP",
  MOBILE: "MOBILE",
};

export const MODE_OPTIONS = [
  { value: Mode.CARD, label: "Card" },
  { value: Mode.CLASSIC, label: "Classic" },
  { value: Mode.CHAT, label: "Chat" },
];

export const VIEWPORT_OPTIONS = [
  { value: ViewPort.DESKTOP, label: "Desktop" },
  { value: ViewPort.MOBILE, label: "Mobile" },
];

export const TABS = {
  SHARE: "share",
  ACCESS: "access",
  CUSTOMIZE: "customize",
  TRACKING: "tracking",
};

export const TAB_CONFIG = [
  { id: TABS.SHARE, label: "Share", description: "Share your form with the world" },
  { id: TABS.ACCESS, label: "Access", description: "Control who can respond" },
  { id: TABS.CUSTOMIZE, label: "Customize", description: "Brand your form" },
  { id: TABS.TRACKING, label: "Tracking", description: "Analytics & tracking" },
];

export const EMBED_MODES = {
  FULL_PAGE: "fullpage",
  STANDARD: "standard",
  POPUP: "popup",
  SLIDER: "slider",
  POPOVER: "popover",
  SIDE_TAB: "sidetab",
};

export const DEFAULT_SETTINGS = {
  isPasswordProtected: false,
  password: "",
  isScheduled: false,
  scheduleDate: null,
  scheduleTime: null,
  isRespondentLimitEnabled: false,
  respondentLimit: 100,
  isAutoCloseEnabled: false,
  autoCloseDate: null,
  autoCloseTime: null,
  removeBranding: false,
  customLogo: null,
  customDomain: "",
  notifyOnResponse: false,
  notifyEmail: "",
  gtmId: "",
  gtmEnabled: false,
  gaId: "",
  gaEnabled: false,
  metaPixelId: "",
  metaPixelEnabled: false,
  collectLocation: false,
  collectIP: false,
};
