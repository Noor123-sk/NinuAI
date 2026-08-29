import { NextResponse } from "next/server";
import OpenAI from "openai";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { AI_MODELS } from "@/lib/ai/models";
import { AI_LIMITS } from "@/lib/ai/limits";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

// GET — Fetch all workflows
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

    const instructions =
      typeof body.instructions === "string"
        ? body.instructions.trim()
        : "";

    const scheduleType =
      typeof body.scheduleType === "string"
        ? body.scheduleType.trim()
        : "";

    const nextRunAt =
      typeof body.nextRunAt === "string" &&
      body.nextRunAt.trim()
        ? new Date(body.nextRunAt)
        : null;

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

    // Validate scheduled workflows
    if (
      trigger === "Scheduled" &&
      (!nextRunAt ||
        Number.isNaN(nextRunAt.getTime()))
    ) {
      return NextResponse.json(
        {
          error:
            "A valid schedule date and time are required for scheduled workflows.",
        },
        {
          status: 400,
        }
      );
    }

    // Webhook workflows receive a unique secure token.
    const isWebhook = trigger === "Webhook";

    const webhookToken = isWebhook
      ? randomUUID()
      : null;

    // Create workflow
    const workflow =
      await prisma.workflow.create({
        data: {
          name,
          trigger,
          action,
          instructions:
            instructions || null,
          status: "active",

          scheduleType:
            trigger === "Scheduled"
              ? scheduleType || null
              : null,

          nextRunAt:
            trigger === "Scheduled"
              ? nextRunAt
              : null,

          webhookEnabled:
            isWebhook,

          webhookToken,
        },
      });

    // Generate full webhook URL
    const webhookUrl = isWebhook
      ? `${new URL(request.url).origin}/api/automation/webhook/${webhookToken}`
      : null;

    return NextResponse.json(
      {
        message:
          "Workflow created successfully.",
        workflow,
        webhookUrl,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Automation POST Error:",
      error
    );

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

    const userInput =
      typeof body.input === "string"
        ? body.input.trim()
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

    const workflow =
      await prisma.workflow.findUnique({
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
          error:
            "This workflow is currently paused.",
        },
        {
          status: 400,
        }
      );
    }

    const instructions =
      workflow.instructions?.trim() ||
      "No additional instructions were provided.";

    const inputSection =
      userInput ||
      "No additional user input was provided.";

    const prompt = `
You are Ninu AI Automation Engine.

Execute the following workflow.

Workflow name:
${workflow.name}

Trigger:
${workflow.trigger}

Action:
${workflow.action}

Additional instructions:
${instructions}

User input:
${inputSection}

Perform the requested action according to the workflow, its instructions, and the user's input.

If the action is "Ask Ninu AI", provide a helpful AI response.

If the action is "Analyze Document", explain what can be analyzed from the provided input. If no document or useful content was provided, clearly say that input is required.

If the action is "Generate Report", create a concise useful report using the provided input and following the workflow instructions.

If the action is "Generate Content", create useful content using the provided input and following the workflow instructions.

Important:

- Follow the workflow instructions carefully.
- Use the user's input when it is provided.
- Do not invent information that is not available.
- Do not claim that an external service was contacted.
- Do not claim that an external action was completed if no integration exists.
- Return a useful result that demonstrates the workflow execution.
`;

    const response =
      await client.chat.completions.create({
        model: AI_MODELS.automation,
        max_tokens: AI_LIMITS.automation,
        messages: [
          {
            role: "system",
            content:
              "You are Ninu AI, an intelligent automation assistant. " +
              "Execute workflow actions safely and clearly. " +
              "Follow workflow instructions and user input carefully. " +
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

    const execution =
      await prisma.execution.create({
        data: {
          workflowId: workflow.id,
          status: "completed",
          result,
        },
      });

    return NextResponse.json({
      message:
        "Workflow executed successfully.",
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

// PATCH — Pause / Resume workflow
export async function PATCH(request: Request) {
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

    const workflow =
      await prisma.workflow.findUnique({
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

    const newStatus =
      workflow.status === "active"
        ? "paused"
        : "active";

    const updatedWorkflow =
      await prisma.workflow.update({
        where: {
          id: workflowId,
        },
        data: {
          status: newStatus,
        },
      });

    return NextResponse.json({
      message:
        newStatus === "active"
          ? "Workflow resumed successfully."
          : "Workflow paused successfully.",
      workflow: updatedWorkflow,
    });
  } catch (error) {
    console.error(
      "Workflow Status Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Ninu Automation could not update the workflow status.",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE — Delete workflow
export async function DELETE(request: Request) {
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

    const workflow =
      await prisma.workflow.findUnique({
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

    await prisma.workflow.delete({
      where: {
        id: workflowId,
      },
    });

    return NextResponse.json({
      message:
        "Workflow deleted successfully.",
      workflowId,
    });
  } catch (error) {
    console.error(
      "Workflow Delete Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Ninu Automation could not delete the workflow.",
      },
      {
        status: 500,
      }
    );
  }
}
