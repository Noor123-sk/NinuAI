import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is not configured.");
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        {
          error: "Please provide some code to analyze.",
        },
        {
          status: 400,
        }
      );
    }

    const selectedLanguage =
      typeof language === "string" ? language : "Unknown";

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are Ninu Code AI, an expert programming assistant. " +
          "Analyze the user's code carefully. " +
          "Explain what the code does, identify bugs or potential problems, " +
          "suggest improvements, and provide an improved version when useful. " +
          "Be practical and beginner-friendly. " +
          "Keep the response well structured. " +
          "Always respect the programming language provided by the user.",
      },
      {
        role: "user",
        content:
          `Programming language: ${selectedLanguage}\n\n` +
          `Here is the code:\n\n` +
          "```" +
          `${code}` +
          "\n```\n\n" +
          "Please analyze this code and provide:\n" +
          "1. What the code does\n" +
          "2. Bugs or issues\n" +
          "3. How to improve it\n" +
          "4. An improved version of the code when appropriate",
      },
    ];

    const response = await client.chat.completions.create({
      model: "openai/gpt-4.1-mini",
      max_tokens: 900,
      messages,
    });

    const reply =
      response.choices[0]?.message?.content ||
      "Ninu Code AI could not analyze the code.";

    return NextResponse.json({
      reply,
    });
  } catch (error: any) {
    console.error("Code AI Error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Ninu Code AI is temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}