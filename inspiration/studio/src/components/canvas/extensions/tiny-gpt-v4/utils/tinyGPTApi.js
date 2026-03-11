const TINYGPT_PROXY_URL = "/api/canvas-assistant/tinygpt-test";

export const executeTinyGPTTest = async (goData, stateValues = {}) => {
  const response = await fetch(TINYGPT_PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ goData, stateValues }),
  });

  if (!response.ok) {
    let errorMessage = `Server error (${response.status})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(result.message || "TinyGPT test failed");
  }

  return result;
};

export default executeTinyGPTTest;
