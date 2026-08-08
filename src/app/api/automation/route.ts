import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

// GET — Fetch all workflows with execution history
export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        executions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({
      workflows,
    });
  } catch (error) {
    console.error("Automation GET Error:", error);

    return NextResponse.json(
      {
        error: "Ninu Automation could not load workflows.",
      },
      {
        status: 500,
      }
    );
  }
}

// POST — Create workflow
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

    const workflow = await prisma.workflow.create({
      data: {
        name,
        trigger,
        action,
        status: "active",
      },
    });

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
    console.error("Automation POST Error:", error);

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

// PUT — Execute workflow
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

    const workflow = await prisma.workflow.findUnique({
      where: {
        id: workflowId,
      },
    });

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

    // Save successful execution to database
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: "completed",
        result,
      },
    });

    return NextResponse.json({
      message: "Workflow executed successfully.",
      workflowId: workflow.id,
      executionId: execution.id,
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
