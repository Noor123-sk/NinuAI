import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
  apiKey,
});

type VideoRequest = {
  prompt?: string;
  aspectRatio?: "16:9" | "9:16";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VideoRequest;

    if (
      !body ||
      typeof body.prompt !== "string" ||
      !body.prompt.trim()
    ) {
      return NextResponse.json(
        {
          error: "Please provide a video prompt.",
        },
        {
          status: 400,
        }
      );
    }

    const prompt = body.prompt.trim();
    const aspectRatio =
      body.aspectRatio === "9:16" ? "9:16" : "16:9";

    let operation = await ai.models.generateVideos({
      model: "veo-3.1-fast-generate-preview",
      prompt,
      config: {
        aspectRatio,
      },
    });

    while (!operation.done) {
      await new Promise((resolve) =>
        setTimeout(resolve, 10000)
      );

      operation = await ai.operations.getVideosOperation({
        operation,
      });
    }

    const generatedVideo =
      operation.response?.generatedVideos?.[0];

    const videoUri = generatedVideo?.video?.uri;

    if (!videoUri) {
      return NextResponse.json(
        {
          error: "Veo did not return a generated video.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      video: {
        uri: videoUri,
      },
    });
  } catch (error: any) {
    console.error("Video Generation Error:", error);

    const message = String(
      error?.message || error || ""
    );

    const isQuotaError =
      message.includes("429") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.toLowerCase().includes("quota");

    return NextResponse.json(
      {
        error: isQuotaError
          ? "Video generation is temporarily unavailable because the Gemini video API quota has been reached. Please check your Google AI billing/quota and try again."
          : message || "Ninu could not generate the video.",
      },
      {
        status: isQuotaError ? 429 : 500,
      }
    );
  }
}
