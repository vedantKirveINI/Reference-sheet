import { MATCH_PATTERN_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";

const MATCH_PATTERN_NODE = {
  cmsId: "match-pattern",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742550293954/matchpattern.svg",
  name: "Match Pattern",
  type: MATCH_PATTERN_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(196deg, #0D5C2E 2.15%, #22C55E 77.96%)",
  dark: "#0D5C2E",
  light: "#22C55E",
  foreground: "#fff",
  hasTestModule: true,
  canSkipTest: true,
};

export const THEME = {
  primaryButtonBg: "#0D5C2E",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(13, 92, 46, 0.08)",
  iconBorder: "rgba(13, 92, 46, 0.15)",
  iconColor: "#0D5C2E",
  accentColor: "#0D5C2E",
  accentColorLight: "#22C55E",
};

export const TABS = {
  CONFIGURE: "configure",
  TEST: "test",
};

export const MATCH_PATTERN_TEMPLATES = [
  {
    id: "email",
    name: "Email",
    description: "Match email addresses",
    pattern: "[\\w.-]+@[\\w.-]+\\.[\\w]+",
    sampleText: "john@example.com",
  },
  {
    id: "phone-us",
    name: "Phone (US)",
    description: "US phone numbers",
    pattern: "\\d{3}[-.]?\\d{3}[-.]?\\d{4}",
    sampleText: "555-123-4567",
  },
  {
    id: "url",
    name: "URL",
    description: "Web URLs",
    pattern: "https?://[\\w.-]+\\.[\\w.-]+[^\\s]*",
    sampleText: "https://example.com",
  },
  {
    id: "digits",
    name: "Digits only",
    description: "One or more digits",
    pattern: "\\d+",
    sampleText: "42",
  },
  {
    id: "word",
    name: "Word characters",
    description: "Letters, numbers, underscore",
    pattern: "\\w+",
    sampleText: "hello_world",
  },
];

export default MATCH_PATTERN_NODE;
