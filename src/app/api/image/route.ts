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
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          error: "Please provide an image prompt.",
        },
        {
          status: 400,
        }
      );
    }

    const response = await client.chat.completions.create({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 4096,
    });

    const message = response.choices[0]?.message;

    const images = (message as any)?.images;

    if (!images || !Array.isArray(images) || images.length === 0) {
      console.error("OpenRouter response:", response);

      return NextResponse.json(
        {
          error: "The image model did not return an image.",
        },
        {
          status: 500,
        }
      );
    }

    const imageUrl =
      images[0]?.image_url?.url ??
      images[0]?.url ??
      null;

    if (!imageUrl) {
      console.error("Image response:", images);

      return NextResponse.json(
        {
          error: "Image was generated, but no image URL was returned.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      imageUrl,
    });
  } catch (error: any) {
    console.error("Image Generation Error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Ninu AI could not generate the image.",
      },
      {
        status: 500,
      }
    );
  }
}