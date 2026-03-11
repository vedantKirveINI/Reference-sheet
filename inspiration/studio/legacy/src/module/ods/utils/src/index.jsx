export * as dateUtils from './date-utils/index.jsx';
export * as serverConfig from './server-configs/index.jsx';
export * as constants from './constants/index.jsx';
export * as cookieUtils from './cookie-utils/index.jsx';

/**
 *
 * @param {HTMLElement} el
 * @param {string} block
 * @param {string} behaviour
 * @param {string} inline
 * @returns
 */
export const executeScroll = (
  el,
  block = "nearest",
  behaviour = "smooth",
  inline = "nearest"
) => {
  if (!el) return;
  el.scrollIntoView({
    block,
    behaviour,
    inline,
  });
};

const replaceNonLatin1Characters = (str, replacement = "") => {
  // Replace characters outside the Latin1 range with the specified replacement
  return str.replace(/[^\u0000-\u00FF]/g, replacement);
};
export const base64Decode = (str) => {
  // // First we decode the Base64 string to a binary string
  // let binaryString = atob(str);
  // // Then we convert the binary string to a Uint8Array
  // let uint8Array = new Uint8Array(
  //   [...binaryString].map((char) => char.charCodeAt(0))
  // );
  // // Finally, we use TextDecoder to convert the Uint8Array back to a string
  // return new TextDecoder().decode(uint8Array);
  if (!str) return null;
  return atob(str);
};
export const base64Encode = (str) => {
  if (!str) return null;
  // // First we convert the string to an array of bytes
  // let uint8Array = new TextEncoder().encode(str);
  // // Then we convert the Uint8Array to a string of binary data
  // let binaryString = String.fromCharCode(...uint8Array);
  // // Finally, we use btoa to encode the binary string to Base64
  // return btoa(binaryString);
  str = replaceNonLatin1Characters(str);
  return btoa(str);
};
