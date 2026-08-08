import { NextResponse } from "next/server";

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "paused";
  createdAt: string;
};

const workflows: Workflow[] = [];

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
        error: "Ninu Automation could not create the workflow.",
      },
      {
        status: 500,
      }
    );
  }
}