import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

function getNextRunAt(
  scheduleType: string | null,
  currentRun: Date
) {
  const nextRun = new Date(currentRun);

  if (scheduleType === "Daily") {
    nextRun.setDate(nextRun.getDate() + 1);
    return nextRun;
  }

  if (scheduleType === "Weekly") {
    nextRun.setDate(nextRun.getDate() + 7);
    return nextRun;
  }

  return null;
}

export async function GET(request: Request) {
  try {
    // Optional scheduler authentication
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (
      cronSecret &&
      authHeader !== `Bearer ${cronSecret}`
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized scheduler request.",
        },
        {
          status: 401,
        }
      );
    }

    const now = new Date();

    // Find all scheduled workflows that are due
    const workflows = await prisma.workflow.findMany({
      where: {
        status: "active",
        trigger: "Scheduled",
        nextRunAt: {
          lte: now,
        },
      },
      orderBy: {
        nextRunAt: "asc",
      },
    });

    if (workflows.length === 0) {
      return NextResponse.json({
        message: "No scheduled workflows are due.",
        executed: 0,
      });
    }

    const results = [];

    // Execute each scheduled workflow
    for (const workflow of workflows) {
      try {
        const instructions =
          workflow.instructions?.trim() ||
          "No additional instructions were provided.";

        const prompt = `
You are Ninu AI Automation Engine.

Automatically execute the following scheduled workflow.

Workflow name:
${workflow.name}

Trigger:
${workflow.trigger}

Action:
${workflow.action}

Additional instructions:
${instructions}

This workflow was triggered automatically by its schedule.

Perform the requested action according to the workflow and its instructions.

If the action is "Ask Ninu AI", provide a helpful AI response.

If the action is "Analyze Document", explain what can be analyzed from the available workflow information. If no document or useful content was provided, clearly say that input is required.

If the action is "Generate Report", create a concise useful report using the available workflow information and following the workflow instructions.

If the action is "Generate Content", create useful content using the available workflow information and following the workflow instructions.

Important:

- Follow the workflow instructions carefully.
- Do not invent information that is not available.
- Do not claim that an external service was contacted.
- Do not claim that an external action was completed if no integration exists.
- This is an automatic scheduled execution.
- Return a useful result that demonstrates the workflow execution.
`;

        const response =
          await client.chat.completions.create({
            model: "openai/gpt-4.1-mini",
            max_tokens: 1200,
            messages: [
              {
                role: "system",
                content:
                  "You are Ninu AI, an intelligent automation assistant. Execute scheduled workflows safely and clearly. Follow workflow instructions carefully. Never pretend an external integration was performed when it was not.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

        const result =
          response.choices[0]?.message?.content ||
          "Ninu AI could not generate a scheduled workflow result.";

        // Save execution history
        await prisma.execution.create({
          data: {
            workflowId: workflow.id,
            status: "completed",
            result,
          },
        });

        // Calculate next scheduled run
        const nextRunAt = getNextRunAt(
          workflow.scheduleType,
          workflow.nextRunAt || now
        );

        // Update workflow schedule
        await prisma.workflow.update({
          where: {
            id: workflow.id,
          },
          data: {
            nextRunAt,
          },
        });

        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          status: "completed",
          nextRunAt,
        });
      } catch (error) {
        console.error(
          `Scheduler execution failed for workflow ${workflow.id}:`,
          error
        );

        // Save failed execution
        await prisma.execution.create({
          data: {
            workflowId: workflow.id,
            status: "failed",
            result:
              "Ninu could not complete this scheduled workflow.",
          },
        });

        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          status: "failed",
        });
      }
    }

    return NextResponse.json({
      message:
        "Scheduled workflows processed successfully.",
      executed: results.length,
      results,
    });
  } catch (error) {
    console.error(
      "Automation Scheduler Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Ninu Scheduler could not process scheduled workflows.",
      },
      {
        status: 500,
      }
    );
  }
}
