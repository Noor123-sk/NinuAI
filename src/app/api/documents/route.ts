import { NextResponse } from "next/server";
import { aiClient } from "@/lib/ai/client";
import { AI_MODELS } from "@/lib/ai/models";
import { AI_LIMITS } from "@/lib/ai/limits";
import { getAIErrorMessage } from "@/lib/ai/errors";

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

    const response = await aiClient.chat.completions.create({
      model: AI_MODELS.documents,
      max_tokens: AI_LIMITS.documents,
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

    console.log(
      "DOCUMENT AI RAW RESPONSE:",
      JSON.stringify(response, null, 2)
    );

    const reply =
      response.choices[0]?.message?.content ||
      "Ninu Documents AI could not analyze the document.";

    return NextResponse.json({
      fileName: file.name,
      reply,
    });
  } catch (error: unknown) {
    console.error("Documents AI Error:", error);

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
