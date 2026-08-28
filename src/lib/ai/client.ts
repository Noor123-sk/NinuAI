import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is not configured.");
}

export const aiClient = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
});
