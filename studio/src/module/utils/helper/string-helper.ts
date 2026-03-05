export const checkWhetherStringContainsNewLineCharacters = (text: string) => {
  return /\r?\n/.test(text);
};

export const splitStringIntoOptionsByNewLineChar = (text: string) => {
  const options = [];
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n" || (text[i] === "\r" && text[i + 1] !== "\n")) {
      options.push(text.slice(start, i));
      start = i + 1;
    } else if (text[i] === "\r" && text[i + 1] === "\n") {
      // Handle Windows-style \r\n
      options.push(text.slice(start, i));
      start = i + 2;
      i++; // Skip the next \n
    }
  }

  // Add the last segment if there's remaining text
  if (start < text.length) {
    options.push(text.slice(start));
  }

  return options;
};
