export const Mode = {
  CARD: "CARD",
  CLASSIC: "CLASSIC",
  CHAT: "CHAT",
} as const;

export const ViewPort = {
  DESKTOP: "DESKTOP",
  MOBILE: "MOBILE",
} as const;

export type ModeType = (typeof Mode)[keyof typeof Mode];
export type ViewPortType = (typeof ViewPort)[keyof typeof ViewPort];

export const DEVICE_DIMENSIONS = {
  MOBILE: {
    width: 390,
    height: 844,
  },
  DESKTOP: {
    width: 1280,
    height: 800,
  },
} as const;

export const MODE_OPTIONS = [
  { value: Mode.CARD, label: "Card" },
  { value: Mode.CLASSIC, label: "Classic" },
  { value: Mode.CHAT, label: "Chat" },
] as const;

export const VIEWPORT_OPTIONS = [
  { value: ViewPort.DESKTOP, label: "Desktop" },
  { value: ViewPort.MOBILE, label: "Mobile" },
] as const;
