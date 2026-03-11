export function extractErrorMessage(err: any, fallback: string, maxLength = 120): string {
  let message: unknown;

  if (err && typeof err === "object") {
    const responseData = (err as any).response?.data;
    const candidate = responseData?.message ?? (err as any).message ?? fallback;

    if (Array.isArray(candidate)) {
      message = candidate[0];
    } else if (candidate && typeof candidate === "object") {
      const nestedMessage = (candidate as any).message;
      message = typeof nestedMessage === "string" ? nestedMessage : JSON.stringify(candidate);
    } else {
      message = candidate;
    }
  } else if (typeof err === "string") {
    message = err;
  } else {
    message = fallback;
  }

  const finalMessage =
    typeof message === "string" && message.trim().length > 0 ? message.trim() : fallback;

  if (finalMessage.length > maxLength) {
    return finalMessage.slice(0, maxLength) + "...";
  }

  return finalMessage;
}

