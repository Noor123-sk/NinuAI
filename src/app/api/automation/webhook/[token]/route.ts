import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { token } = await context.params;

    // 1. Validate webhook token
    if (!token || token.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Webhook token is required.",
        },
        {
          status: 400,
        }
      );
    }

    // 2. Find workflow by webhook token
    const workflow = await prisma.workflow.findUnique({
      where: {
        webhookToken: token,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: "Webhook workflow not found.",
        },
        {
          status: 404,
        }
      );
    }

    // 3. Only active workflows can execute
    if (
      workflow.status !== "active" ||
      !workflow.webhookEnabled
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "This webhook workflow is currently unavailable.",
        },
        {
          status: 409,
        }
      );
    }

    // 4. Read and validate incoming payload
    let input = "";

    const contentType =
      request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        const body = await request.json();

        if (body === null || body === undefined) {
          input = "";
        } else if (typeof body === "string") {
          input = body.trim();
        } else if (
          typeof body === "object" &&
          !Array.isArray(body) &&
          Object.keys(body).length === 0
        ) {
          input = "";
        } else if (
          Array.isArray(body) &&
          body.length === 0
        ) {
          input = "";
        } else {
          input = JSON.stringify(body, null, 2).trim();
        }
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid JSON payload.",
          },
          {
            status: 400,
          }
        );
      }
    } else {
      try {
        input = (await request.text()).trim();
      } catch {
        input = "";
      }
    }

    // 5. Reject completely empty webhook requests
    if (!input) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Webhook payload cannot be empty. Please provide JSON or text input.",
        },
        {
          status: 400,
        }
      );
    }

    const instructions =
      workflow.instructions?.trim() ||
      "No additional instructions were provided.";

    const prompt = `
You are Ninu AI Automation Engine.

Execute the following workflow using the data received from a webhook.

Workflow name:
${workflow.name}

Trigger:
${workflow.trigger}

Action:
${workflow.action}

AI Instructions:
${instructions}

Webhook Input:
${input}

Perform the requested action according to the workflow and its instructions.

If the action is "Ask Ninu AI", provide a helpful AI response.

If the action is "Analyze Document", analyze the provided information when possible. If the webhook did not provide enough information, clearly explain what input is required.

If the action is "Generate Report", create a concise useful report using the webhook input and workflow instructions.

If the action is "Generate Content", create useful content using the webhook input and workflow instructions.

Important:

- Follow the workflow instructions carefully.
- Use only information available in the webhook input and workflow.
- Do not invent facts.
- Do not claim an external service was contacted.
- Do not claim an external action was completed unless an actual integration exists.
- Return a useful result that demonstrates successful workflow execution.
`;

    // 6. Execute Ninu AI
    const response =
      await client.chat.completions.create({
        model: "openai/gpt-4.1-mini",
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "You are Ninu AI, an intelligent automation assistant. Execute webhook-triggered workflows safely and clearly. Follow workflow instructions carefully. Never pretend an external integration was performed when it was not.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const result =
      response.choices[0]?.message?.content?.trim() ||
      "Ninu AI could not generate a webhook workflow result.";

    // 7. Save successful execution with webhook details
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: "completed",
        result,
        input,
        source: "webhook",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook workflow executed successfully.",
      workflow: {
        id: workflow.id,
        name: workflow.name,
      },
      execution: {
        id: execution.id,
        status: execution.status,
        createdAt: execution.createdAt,
      },
      result,
    });
  } catch (error) {
    console.error(
      "Webhook Automation Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Ninu could not execute the webhook workflow.",
      },
      {
        status: 500,
      }
    );
  }
}
