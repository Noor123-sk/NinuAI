export function getAIErrorMessage(error: unknown): string {
  const message =
    error instanceof Error ? error.message : String(error);

  if (
    message.includes("402") ||
    message.toLowerCase().includes("more credits")
  ) {
    return "Ninu AI is temporarily unable to process this request. Please try again later.";
  }

  if (
    message.includes("429") ||
    message.toLowerCase().includes("rate limit")
  ) {
    return "Ninu AI is currently busy. Please try again in a moment.";
  }

  if (message.startsWith("5") || message.toLowerCase().includes("server error")) {
    return "Ninu AI is temporarily unavailable. Please try again shortly.";
  }

  return "Ninu AI could not process your request. Please try again.";
}
