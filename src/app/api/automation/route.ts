import { NextResponse } from "next/server";
import OpenAI from "openai";

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "paused";
  createdAt: string;
};

const workflows: Workflow[] = [];

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function GET() {
  return NextResponse.json({
    workflows,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const trigger =
      typeof body.trigger === "string"
        ? body.trigger.trim()
        : "";

    const action =
      typeof body.action === "string"
        ? body.action.trim()
        : "";

    if (!name || !trigger || !action) {
      return NextResponse.json(
        {
          error:
            "Workflow name, trigger and action are required.",
        },
        {
          status: 400,
        }
      );
    }

    const workflow: Workflow = {
      id: crypto.randomUUID(),
      name,
      trigger,
      action,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    workflows.unshift(workflow);

    return NextResponse.json(
      {
        message: "Workflow created successfully.",
        workflow,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Automation API Error:", error);

    return NextResponse.json(
      {
        error:
          "Ninu Automation could not create the workflow.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const workflowId =
      typeof body.workflowId === "string"
        ? body.workflowId
        : "";

    if (!workflowId) {
      return NextResponse.json(
        {
          error: "Workflow ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const workflow = workflows.find(
      (item) => item.id === workflowId
    );

    if (!workflow) {
      return NextResponse.json(
        {
          error: "Workflow not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (workflow.status !== "active") {
      return NextResponse.json(
        {
          error: "This workflow is currently paused.",
        },
        {
          status: 400,
        }
      );
    }

    const prompt = `
You are Ninu AI Automation Engine.

Execute the following workflow action.

Workflow name: ${workflow.name}
Trigger: ${workflow.trigger}
Action: ${workflow.action}

Perform the requested action conceptually and return a useful result.

If the action is "Ask Ninu AI", provide a helpful AI response.

If the action is "Analyze Document", explain that a document would need to be provided for analysis.

If the action is "Generate Report", create a concise sample report demonstrating the workflow.

If the action is "Generate Content", create useful sample content demonstrating the workflow.

Do not claim that an external service was actually contacted or that an external action was completed if no such integration exists.
`;

    const response =
      await client.chat.completions.create({
        model: "openai/gpt-4.1-mini",
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "You are Ninu AI, an intelligent automation assistant. " +
              "Execute workflow actions safely and clearly. " +
              "Never pretend an external integration was performed when it was not.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const result =
      response.choices[0]?.message?.content ||
      "Ninu AI could not generate a workflow result.";

    return NextResponse.json({
      message: "Workflow executed successfully.",
      workflowId: workflow.id,
      result,
    });
  } catch (error) {
    console.error(
      "Workflow Execution Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Ninu Automation could not execute the workflow.",
      },
      {
        status: 500,
      }
    );
  }
}