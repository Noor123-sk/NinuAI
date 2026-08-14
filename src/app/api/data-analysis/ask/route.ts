import { NextResponse } from "next/server";
import OpenAI from "openai";

type DatasetRow = Record<string, unknown>;

type AskRequest = {
  question: string;
  rows: DatasetRow[];
  columnAnalysis?: {
    name: string;
    dataType: string;
  }[];
  aggregateStats?: {
    numericColumnTotals: Record<string, number>;
    numericColumnCounts: Record<string, number>;
  };
};

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
    const body = (await request.json()) as AskRequest;

    if (
      !body ||
      typeof body.question !== "string" ||
      !body.question.trim()
    ) {
      return NextResponse.json(
        {
          error: "Please provide a question.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Array.isArray(body.rows) || body.rows.length === 0) {
      return NextResponse.json(
        {
          error: "Please provide a dataset first.",
        },
        {
          status: 400,
        }
      );
    }

    const question = body.question.trim();

    const datasetSample = body.rows.slice(0, 100);

    const response = await client.chat.completions.create({
      model: "openai/gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are Ninu AI, an intelligent data analyst.

Answer the user's question using ONLY the provided dataset.

Rules:
- Do not invent numbers.
- Base conclusions on the provided data.
- Perform calculations when necessary.
- Be concise but useful.
- Explain the reasoning in simple business language.
- If the dataset does not contain enough information, say so clearly.
- Use ₹ when discussing monetary values if the dataset appears to contain Indian business data.
          `.trim(),
        },
        {
          role: "user",
          content: `
Dataset:

${JSON.stringify(datasetSample, null, 2)}

Column information:

${JSON.stringify(body.columnAnalysis ?? [], null, 2)}

EXACT DATASET AGGREGATES:
${JSON.stringify(body.aggregateStats ?? {}, null, 2)}

IMPORTANT:
- The aggregate totals above are calculated from the COMPLETE dataset.
- When the user asks for totals, sums, averages, counts, or other calculations that can be answered from these aggregates, TRUST THESE VALUES over calculating from the preview.
- Never recalculate a complete-dataset total using only the preview rows.

User question:

${question}
          `.trim(),
        },
      ],
      max_tokens: 1200,
    });

    const answer =
      response.choices[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json(
        {
          error: "Ninu could not generate an answer.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error: any) {
    console.error("Data Analysis Ask Error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Ninu could not answer the question.",
      },
      {
        status: 500,
      }
    );
  }
}
