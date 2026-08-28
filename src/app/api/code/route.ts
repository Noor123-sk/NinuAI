import { NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { aiClient } from "@/lib/ai/client";
import { AI_MODELS } from "@/lib/ai/models";
import { AI_LIMITS } from "@/lib/ai/limits";
import { getAIErrorMessage } from "@/lib/ai/errors";

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

    const response = await aiClient.chat.completions.create({
      model: AI_MODELS.code,
      max_tokens: AI_LIMITS.code,
      messages,
    });

    const reply =
      response.choices[0]?.message?.content ||
      "Ninu Code AI could not analyze the code.";

    return NextResponse.json({
      reply,
    });
  } catch (error: unknown) {
    console.error("Code AI Error:", error);

    return NextResponse.json(
      {
        error: getAIErrorMessage(error),
      },
      {
        status: 500,
      }
    );
  }
}
