import { EMBED_MODES } from "../constants";

const BASE_SCRIPT = `<script src="https://form-embed.s3.us-west-2.amazonaws.com/embed.js"></script>`;

const generateFullPageProperties = (
  formId,
  domain,
  formMode,
  embedSettings = {},
) => {
  return {
    tag: "div",
    attributes: {
      "data-tf-mode": "full-page", // embed mode name
      "data-tf-form": formId, // Form ID
      "data-tf-form-mode": formMode, // Form mode
      "data-tf-domain": domain, // Domain
      "data-tf-width": "100%", // Width is in percent
      "data-tf-height": "100%", // Height is in percent
    },
  };
};

const generateStandardProperties = (
  formId,
  domain,
  formMode,
  embedSettings = {},
) => {
  const {
    width = { value: "100", unit: "%" },
    height = { value: "580", unit: "px" },
    // backgroundTransparency = "100",
    // fullscreenMobile = true,
    // hideHeaders = false,
  } = embedSettings;

  return {
    tag: "div",
    attributes: {
      "data-tf-form-mode": formMode, // Form mode
      "data-tf-mode": "standard",
      "data-tf-form": formId, // Form ID
      "data-tf-domain": domain, // Domain
      "data-tf-width": `${width.value}${width.unit}`, // Width is in px or %
      "data-tf-height": `${height.value}${height.unit}`, // Height is in px or %
      // "data-tf-background-transparency": backgroundTransparency, // Background transparency is in %
      // "data-tf-fullscreen-mobile": fullscreenMobile, // Fullscreen mobile is in boolean
      // "data-tf-hide-headers": hideHeaders, // Hide headers is in boolean
    },
  };
};

const generatePopupProperties = (
  formId,
  domain,
  formMode,
  embedSettings = {},
) => {
  const {
    buttonText = "Open Popup Form",
    buttonColor = "#212121",
    fontSize = "16",
    roundedCorners = "16",

    changeToTextLink = false,
  } = embedSettings;

  return {
    tag: "div",
    attributes: {
      "data-tf-form-mode": formMode, // Form mode
      "data-tf-mode": "popup", // embed mode name
      "data-tf-form": formId, // Form ID
      "data-tf-domain": domain, // Domain
      "data-tf-button-text": buttonText, // Button text for pop button
      "data-tf-button-color": buttonColor, // Button color is in hex color code for pop button
      "data-tf-font-size": `${fontSize}px`, // Font size is in px for pop button
      "data-tf-rounded-corners": `${roundedCorners}px`, // Rounded corners is in px for pop button
      "data-tf-change-to-text-link": changeToTextLink, // Change to text link is in boolean(optional)
    },
  };
};

const generateSliderProperties = (
  formId,
  domain,
  formMode,
  embedSettings = {},
) => {
  const {
    buttonText = "Open Slider Form",
    buttonColor = "#212121",
    fontSize = "16",
    roundedCorners = "16",
    sliderPosition = "right",
    changeToTextLink = false,
  } = embedSettings;

  return {
    tag: "div",
    attributes: {
      "data-tf-form-mode": formMode, // Form mode
      "data-tf-mode": "slider", // embed mode name
      "data-tf-form": formId, // Form ID
      "data-tf-domain": domain, // Domain
      "data-tf-button-text": buttonText, // Button text for slider button
      "data-tf-position": sliderPosition, // Slider position is in right or left
      "data-tf-button-color": buttonColor, // Button color is in hex color code for slider button
      "data-tf-font-size": `${fontSize}px`, // Font size is in px for slider button
      "data-tf-rounded-corners": `${roundedCorners}px`, // Rounded corners is in px for slider button
      "data-tf-change-to-text-link": changeToTextLink, // Change to text link is in boolean(optional)
    },
  };
};

const generatePopoverProperties = (
  formId,
  domain,
  formMode,
  embedSettings = {},
) => {
  const {
    buttonColor = "#212121",
    callout = "Confused? Tell us what you need",
  } = embedSettings;

  return {
    tag: "div",
    attributes: {
      "data-tf-form-mode": formMode, // Form mode
      "data-tf-mode": "popover", // embed mode name
      "data-tf-form": formId, // Form ID
      "data-tf-domain": domain, // Domain
      "data-tf-callout": callout, // Callout is in string(optional)
      "data-tf-button-color": buttonColor, // Button color is in hex color code for popover button
    },
  };
};

const generateSideTabProperties = (
  formId,
  domain,
  formMode,
  embedSettings = {},
) => {
  const {
    buttonText = "Contact",
    buttonColor = "#212121",
    fontSize = "16",
    roundedCorners = "16",
    sliderPosition = "right",
  } = embedSettings;

  return {
    tag: "div",
    attributes: {
      "data-tf-form-mode": formMode, // Form mode
      "data-tf-mode": "sidetab", // embed mode name
      "data-tf-form": formId, // Form ID
      "data-tf-domain": domain, // Domain
      "data-tf-position": sliderPosition, // Slider position is in right or left
      "data-tf-button-text": buttonText, // Button text for side tab button
      "data-tf-button-color": buttonColor, // Button color is in hex color code for side tab button
      "data-tf-font-size": `${fontSize}px`, // Font size is in px for side tab button
      "data-tf-rounded-corners": `${roundedCorners}px`, // Rounded corners is in px for side tab button
    },
  };
};

const getFillerEmbedModeLayoutProperties = (
  embedMode,
  formId,
  domain,
  formMode,
  embedSettings = {},
) => {
  let properties = {};
  switch (embedMode) {
    case EMBED_MODES.FULL_PAGE:
      properties = generateFullPageProperties(
        formId,
        domain,
        formMode,
        embedSettings,
      );
      break;

    case EMBED_MODES.STANDARD:
      properties = generateStandardProperties(
        formId,
        domain,
        formMode,
        embedSettings,
      );
      break;

    case EMBED_MODES.POPUP:
      properties = generatePopupProperties(
        formId,
        domain,
        formMode,
        embedSettings,
      );
      break;

    case EMBED_MODES.SLIDER:
      properties = generateSliderProperties(
        formId,
        domain,
        formMode,
        embedSettings,
      );
      break;

    case EMBED_MODES.POPOVER:
      properties = generatePopoverProperties(
        formId,
        domain,
        formMode,
        embedSettings,
      );
      break;

    case EMBED_MODES.SIDE_TAB:
      properties = generateSideTabProperties(
        formId,
        domain,
        formMode,
        embedSettings,
      );
      break;

    default:
      properties = generateStandardProperties(
        formId,
        domain,
        formMode,
        embedSettings,
      );
  }
  return properties;
};

const extractDomainFromUrl = (url) => {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    // If URL parsing fails, try to extract domain manually
    const domainMatch = url.match(
      /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/,
    );
    return domainMatch ? domainMatch[1] : url;
  }
};

const generateHtmlFromProperties = (properties) => {
  const { tag, attributes } = properties;

  const attributesString = Object.entries(attributes)
    .map(([key, value]) => (value ? `${key}="${value}"` : key))
    .join("\n    ");

  if (attributesString) {
    return `<${tag}
    ${attributesString}
></${tag}>`;
  }

  return `<${tag}></${tag}>`;
};

const generateEmbedScript = (
  embedMode,
  formId,
  domain,
  formMode,
  embedSettings = {},
) => {
  let properties = getFillerEmbedModeLayoutProperties(
    embedMode,
    formId,
    domain,
    formMode,
    embedSettings,
  );

  return generateHtmlFromProperties(properties);
};
export {
  generateFullPageProperties,
  generateStandardProperties,
  generatePopupProperties,
  generateSliderProperties,
  generatePopoverProperties,
  generateSideTabProperties,
  BASE_SCRIPT,
  extractDomainFromUrl,
  generateEmbedScript,
  generateHtmlFromProperties,
  getFillerEmbedModeLayoutProperties,
};
