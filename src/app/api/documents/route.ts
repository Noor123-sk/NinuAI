import { NextResponse } from "next/server";
import OpenAI from "openai";

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
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Please upload a document.",
        },
        {
          status: 400,
        }
      );
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
      return NextResponse.json(
        {
          error: "Phase 1 supports TXT files only.",
        },
        {
          status: 400,
        }
      );
    }

    const text = await file.text();

    if (!text.trim()) {
      return NextResponse.json(
        {
          error: "The uploaded document is empty.",
        },
        {
          status: 400,
        }
      );
    }

    const limitedText = text.slice(0, 30000);

    const response = await client.chat.completions.create({
      model: "openai/gpt-4.1-mini",
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content:
            "You are Ninu Documents AI, an intelligent document analysis assistant. " +
            "Analyze the provided document carefully. " +
            "Give a clear summary, identify the main points, and highlight important information. " +
            "Use headings and bullet points where helpful. " +
            "Do not invent information that is not present in the document.",
        },
        {
          role: "user",
          content:
            `Analyze the following document:\n\n${limitedText}\n\n` +
            "Provide:\n" +
            "1. A concise summary\n" +
            "2. Main points\n" +
            "3. Important details\n" +
            "4. Any notable conclusions or action items",
        },
      ],
    });

    const reply =
      response.choices[0]?.message?.content ||
      "Ninu Documents AI could not analyze the document.";

    return NextResponse.json({
      fileName: file.name,
      reply,
    });
  } catch (error: any) {
    console.error("Documents AI Error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Ninu Documents AI is temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}