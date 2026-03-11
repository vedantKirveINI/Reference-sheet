/**
 * Formats a single-line cURL command into a readable multi-line format
 * with logical line breaks and proper indentation.
 *
 * @param {string} curlString - Single-line cURL command
 * @returns {string} - Formatted multi-line cURL command
 */
export const formatCurlCommand = (curlString) => {
  if (!curlString || typeof curlString !== "string") {
    return curlString || "";
  }

  // Trim whitespace
  const trimmed = curlString.trim();

  // Check if already formatted (contains line breaks)
  if (trimmed.includes("\n")) {
    return trimmed;
  }

  // Check if it's not a curl command
  if (!trimmed.toLowerCase().startsWith("curl")) {
    return trimmed;
  }

  try {
    // Tokenize the command while preserving quoted strings
    const tokens = [];
    let currentToken = "";
    let inQuotes = false;
    let quoteChar = null;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      const prevChar = i > 0 ? trimmed[i - 1] : null;

      // Handle quote characters (not escaped)
      if ((char === '"' || char === "'") && prevChar !== "\\") {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
          currentToken += char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = null;
          currentToken += char;
        } else {
          currentToken += char;
        }
      } else if (!inQuotes && char === " ") {
        // Space outside quotes - end of token
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = "";
        }
      } else {
        currentToken += char;
      }
    }

    // Add last token
    if (currentToken) {
      tokens.push(currentToken);
    }

    if (tokens.length === 0) {
      return trimmed;
    }

    // Parse tokens
    const formatted = [];
    let i = 0;
    let baseCommand = "curl";
    let url = "";
    const headers = [];
    let data = null;

    // Skip "curl"
    if (tokens[0].toLowerCase() === "curl") {
      i = 1;
    }

    // Collect base flags (-L, -X POST, etc.) until we hit URL or -H/-d
    const baseFlags = [];
    while (i < tokens.length) {
      const token = tokens[i];
      if (token.startsWith("http://") || token.startsWith("https://")) {
        url = token;
        i++;
        break;
      } else if (token === "-H" || token === "--header") {
        // Header flag - collect its value
        i++;
        if (i < tokens.length) {
          headers.push(tokens[i]);
          i++;
        }
      } else if (token === "-d" || token === "--data") {
        // Data flag - collect its value
        i++;
        if (i < tokens.length) {
          data = tokens[i];
          i++;
        }
        break;
      } else {
        baseFlags.push(token);
        i++;
      }
    }

    // Collect remaining headers and data
    while (i < tokens.length) {
      const token = tokens[i];
      if (token === "-H" || token === "--header") {
        i++;
        if (i < tokens.length) {
          headers.push(tokens[i]);
          i++;
        }
      } else if (token === "-d" || token === "--data") {
        i++;
        if (i < tokens.length) {
          data = tokens[i];
          i++;
        }
        break;
      } else {
        i++;
      }
    }

    // Build formatted command
    // First line: curl + flags + URL (if short enough)
    if (baseFlags.length > 0) {
      baseCommand += ` ${baseFlags.join(" ")}`;
    }

    if (url) {
      const urlWithCommand = `${baseCommand} ${url}`;
      if (urlWithCommand.length <= 80) {
        formatted.push(urlWithCommand);
      } else {
        formatted.push(baseCommand);
        formatted.push(`  ${url}`);
      }
    } else {
      formatted.push(baseCommand);
    }

    // Add headers, each on its own line
    headers.forEach((header) => {
      // Preserve original quotes if present
      const hasQuotes =
        (header.startsWith('"') && header.endsWith('"')) ||
        (header.startsWith("'") && header.endsWith("'"));
      if (hasQuotes) {
        formatted.push(`  -H ${header}`);
      } else {
        formatted.push(`  -H '${header}'`);
      }
    });

    // Add data
    if (data) {
      // Try to format JSON if it's JSON
      let formattedData = data;
      try {
        // Remove surrounding quotes if present to parse JSON
        let jsonStr = data;
        const hasQuotes =
          (data.startsWith('"') && data.endsWith('"')) ||
          (data.startsWith("'") && data.endsWith("'"));
        if (hasQuotes) {
          jsonStr = data.slice(1, -1);
        }

        // Unescape escaped quotes
        jsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\'/g, "'");

        // Try to parse and format JSON
        const parsed = JSON.parse(jsonStr);
        const formattedJson = JSON.stringify(parsed, null, 2);
        // If JSON is short, keep on one line, otherwise format
        if (formattedJson.length < 100) {
          formattedData = data;
        } else {
          // Format with indentation
          const lines = formattedJson.split("\n");
          formattedData = lines
            .map((line, idx) => (idx === 0 ? line : `    ${line}`))
            .join("\n");
          // Preserve original quote style
          formattedData = hasQuotes
            ? `${data[0]}${formattedData}${data[data.length - 1]}`
            : `'${formattedData}'`;
        }
      } catch {
        // Not JSON, use as-is
        formattedData = data;
      }

      formatted.push(`  -d ${formattedData}`);
    }

    // Join with backslashes for line continuation
    return formatted.join(" \\\n");
  } catch (error) {
    // If parsing fails, return original
    console.warn("Failed to format cURL command:", error);
    return trimmed;
  }
};
