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

type ColumnAnalysis = {
  name: string;
  dataType: string;
  totalValues: number;
  nonEmptyValues: number;
  missingValues: number;
  uniqueValues: number;
  statistics: {
    count: number;
    min: number;
    max: number;
    mean: number;
    median: number;
  } | null;
};

type InsightRequest = {
  fileName?: string;
  rows: number;
  columns: number;
  columnNames: string[];
  columnAnalysis: ColumnAnalysis[];
  preview: Record<string, unknown>[];
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as InsightRequest;

    if (
      !body ||
      typeof body !== "object" ||
      !Array.isArray(body.columnAnalysis)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid dataset analysis data.",
        },
        {
          status: 400,
        }
      );
    }

    const datasetSummary = {
      fileName: body.fileName ?? "Uploaded dataset",
      rows: body.rows,
      columns: body.columns,
      columnNames: body.columnNames,
      columnAnalysis: body.columnAnalysis,
      preview: body.preview?.slice(0, 10) ?? [],
    };

    const prompt = `
You are Ninu AI, an intelligent data analyst.

Analyze the structured dataset information below and provide useful,
accurate, business-friendly insights.

IMPORTANT RULES:
- Use ONLY the information provided.
- Do not invent trends or facts that cannot be supported by the data.
- Clearly distinguish observations from recommendations.
- Keep the response concise and easy to understand.
- Mention data quality issues if they exist.
- If the dataset is too small to support a strong conclusion, say so.

Return your response using exactly these sections:

📈 Key Insights
- 3 to 5 important observations.

💡 Business Insights
- 2 to 4 useful interpretations or recommendations.

⚠️ Data Quality
- Mention missing values, unusual issues, or limitations.

Dataset:
${JSON.stringify(datasetSummary, null, 2)}
`;

    const response =
      await client.chat.completions.create({
        model: "openai/gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Ninu AI's data analysis assistant. Be accurate, concise, and never invent information.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1200,
      });

    const insight =
      response.choices[0]?.message?.content;

    if (!insight) {
      return NextResponse.json(
        {
          error:
            "Ninu AI could not generate insights.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      insight,
    });
  } catch (error: any) {
    console.error(
      "Data Insights Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Ninu AI could not generate dataset insights.",
      },
      {
        status: 500,
      }
    );
  }
}