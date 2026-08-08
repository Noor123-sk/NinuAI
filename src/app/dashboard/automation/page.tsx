"use client";

import { useEffect, useState } from "react";

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "paused";
  createdAt: string;
};

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("Manual");
  const [action, setAction] = useState("Ask Ninu AI");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadWorkflows() {
    try {
      const response = await fetch("/api/automation");
      const data = await response.json();

      if (response.ok) {
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error("Failed to load workflows:", error);
    }
  }

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function createWorkflow() {
    if (!name.trim() || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          trigger,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not create workflow."
        );
      }

      setWorkflows((previous) => [
        data.workflow,
        ...previous,
      ]);

      setName("");
      setTrigger("Manual");
      setAction("Ask Ninu AI");
      setShowForm(false);
    } catch (error: any) {
      console.error("Workflow Error:", error);

      setError(
        error?.message ||
          "Ninu Automation is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold text-gray-900">
          ⚡ Ninu Automation AI
        </h2>

        <p className="text-gray-500 mt-2">
          Automate your daily tasks with intelligent AI
          workflows
        </p>
      </div>

      {/* Create Automation */}
      <div className="mt-10 bg-black text-white rounded-3xl p-8 max-w-4xl">
        <h3 className="text-2xl font-bold">
          Create New Automation
        </h3>

        <p className="text-gray-300 mt-2">
          Let Ninu AI handle repetitive tasks automatically.
        </p>

        <button
          onClick={() => {
            setShowForm((previous) => !previous);
            setError("");
          }}
          className="mt-6 bg-white text-black px-8 py-3 rounded-full"
        >
          {showForm
            ? "Close Workflow Builder"
            : "+ Create Workflow"}
        </button>
      </div>

      {/* Workflow Builder */}
      {showForm && (
        <div className="mt-6 bg-white border rounded-3xl p-8 max-w-4xl">
          <h3 className="text-2xl font-bold">
            Create Workflow
          </h3>

          <div className="mt-6 space-y-5">
            <div>
              <label className="block font-medium mb-2">
                Workflow Name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Daily Report Assistant"
                className="w-full border rounded-xl px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Trigger
              </label>

              <select
                value={trigger}
                onChange={(event) =>
                  setTrigger(event.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 outline-none"
              >
                <option>Manual</option>
                <option>New Document</option>
                <option>New Message</option>
                <option>Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Action
              </label>

              <select
                value={action}
                onChange={(event) =>
                  setAction(event.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 outline-none"
              >
                <option>Ask Ninu AI</option>
                <option>Analyze Document</option>
                <option>Generate Report</option>
                <option>Generate Content</option>
              </select>
            </div>

            {error && (
              <p className="text-red-600">
                {error}
              </p>
            )}

            <button
              onClick={createWorkflow}
              disabled={loading || !name.trim()}
              className="bg-black text-white px-8 py-3 rounded-full disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "✨ Create Workflow"}
            </button>
          </div>
        </div>
      )}

      {/* Workflows */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-5">
          Your Workflows
        </h3>

        {workflows.length === 0 ? (
          <div className="bg-white border rounded-3xl p-8 text-gray-500">
            No workflows created yet.
            <br />
            Create your first workflow above.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white border rounded-3xl p-6"
              >
                <div className="text-3xl">
                  ⚡
                </div>

                <h3 className="font-bold text-xl mt-4">
                  {workflow.name}
                </h3>

                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    <strong>Trigger:</strong>{" "}
                    {workflow.trigger}
                  </p>

                  <p className="mt-2">
                    <strong>Action:</strong>{" "}
                    {workflow.action}
                  </p>
                </div>

                <span className="inline-block mt-5 bg-gray-100 px-4 py-2 rounded-full text-sm">
                  {workflow.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="mt-10 bg-white border rounded-3xl p-8">
        <h3 className="text-xl font-bold">
          How Ninu Automation Works
        </h3>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div>
            <div className="text-3xl">🎯</div>
            <h4 className="font-bold mt-3">
              Choose a Trigger
            </h4>
            <p className="text-gray-500 mt-2">
              Decide when your workflow should start.
            </p>
          </div>

          <div>
            <div className="text-3xl">🤖</div>
            <h4 className="font-bold mt-3">
              Choose an AI Action
            </h4>
            <p className="text-gray-500 mt-2">
              Let Ninu AI perform the selected task.
            </p>
          </div>

          <div>
            <div className="text-3xl">⚡</div>
            <h4 className="font-bold mt-3">
              Run Your Workflow
            </h4>
            <p className="text-gray-500 mt-2">
              Your workflow is ready to be automated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}