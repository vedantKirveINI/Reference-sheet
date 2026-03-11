export const capitalizeWords = (str) => {
  const words = str.split(/\b/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Check if the word is alphabetic
    if (/[a-zA-Z]/.test(word.charAt(0))) {
      words[i] = word.charAt(0).toUpperCase() + word.slice(1);
    }
  }

  const capitalizedStr = words.join("");

  return capitalizedStr;
};

// When the blob is complete, make an anchor tag for it and use the tag to initiate a download
// Works in Chrome, Firefox, Safari, Edge, IE11
export const saveImage = (blob) => {
  var url = window.URL.createObjectURL(blob);
  var filename = "canvas.png";

  var a = document.createElement("a");
  a.href = url;
  a.style = "display: none";
  a.download = filename;

  // IE 11
  if (window.navigator.msSaveBlob !== undefined) {
    window.navigator.msSaveBlob(blob, filename);
    return;
  }

  document.body.appendChild(a);
  requestAnimationFrame(() => {
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  });
};

export const generateUID = () => {
  // The UID is generated from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
  // return Date.now()
};

export const getInitials = (value, seperator = " ", capitalize = true) => {
  if (!value) return "";
  return value
    .split(seperator)
    .map((x) => {
      let _value = x.substr(0, 1);
      if (capitalize) {
        return _value.toUpperCase();
      }
      return _value;
    })
    .join("");
};

const isSameType = (a, b) => {
  // console.log("type", a, b);
  return typeof a === typeof b;
};
export const compare = (a, b, skipKeys = []) => {
  if (!isSameType(a, b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!compare(a[i], b[i], skipKeys)) return false;
    }
    return true;
  } else if (typeof a === "object" && a !== null && b !== null) {
    // console.log("object", a, b);
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (skipKeys.includes(key)) continue;
      if (!compare(a[key], b[key], skipKeys)) return false;
    }
    return true;
  } else {
    // console.log("value", a, b);
    return a === b;
  }
};
