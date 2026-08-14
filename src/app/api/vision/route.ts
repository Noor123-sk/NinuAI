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
    const body = await request.json();

    const image = body?.image;
    const question =
      typeof body?.question === "string" && body.question.trim()
        ? body.question.trim()
        : "Analyze this image and describe what you see.";

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        {
          error: "Please provide an image.",
        },
        {
          status: 400,
        }
      );
    }

    const response = await client.chat.completions.create({
      model: "google/gemini-2.5-flash",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: question,
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
    });

    const analysis = response.choices[0]?.message?.content;

    if (!analysis) {
      console.error("OpenRouter vision response:", response);

      return NextResponse.json(
        {
          error: "The vision model did not return an analysis.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error("Vision Analysis Error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Ninu AI could not analyze the image.",
      },
      {
        status: 500,
      }
    );
  }
}