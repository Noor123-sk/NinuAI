"use client";

import { useEffect, useState } from "react";

type Execution = {
  id: string;
  status: string;
  result: string | null;
  input: string | null;
  source: string;
  createdAt: string;
};

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  instructions: string | null;
  status: "active" | "paused";
  scheduleType: string | null;
  nextRunAt: string | null;
  webhookToken: string | null;
  webhookEnabled: boolean;
  createdAt: string;
  executions?: Execution[];
};

type ExecutionStep =
  | "idle"
  | "starting"
  | "processing"
  | "completed";

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedHistory, setExpandedHistory] =
    useState<string | null>(null);

  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("Manual");
  const [action, setAction] = useState("Ask Ninu AI");
  const [instructions, setInstructions] = useState("");

  const [scheduleType, setScheduleType] = useState("Once");
  const [nextRunAt, setNextRunAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [runningId, setRunningId] =
    useState<string | null>(null);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [inputWorkflowId, setInputWorkflowId] =
    useState<string | null>(null);

  const [workflowInput, setWorkflowInput] =
    useState("");

  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [resultWorkflowName, setResultWorkflowName] =
    useState("");

  const [executionStep, setExecutionStep] =
    useState<ExecutionStep>("idle");

  const [executionMessage, setExecutionMessage] =
    useState("");

  async function loadWorkflows() {
    try {
      const response = await fetch(
        "/api/automation",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not load workflows."
        );
      }

      setWorkflows(data.workflows || []);
    } catch (error: any) {
      console.error(
        "Failed to load workflows:",
        error
      );

      setError(
        error?.message ||
          "Ninu could not load your workflows."
      );
    }
  }

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function createWorkflow() {
    if (!name.trim() || loading) {
      return;
    }

    if (
      trigger === "Scheduled" &&
      !nextRunAt
    ) {
      setError(
        "Please select a schedule date and time."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setExecutionStep("idle");
    setExecutionMessage("");

    try {
      const response = await fetch(
        "/api/automation",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            trigger,
            action,
            instructions:
              instructions.trim(),

            scheduleType:
              trigger === "Scheduled"
                ? scheduleType
                : null,

            nextRunAt:
              trigger === "Scheduled"
                ? new Date(
                    nextRunAt
                  ).toISOString()
                : null,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not create workflow."
        );
      }

      setWorkflows((previous) => [
        data.workflow,
        ...previous,
      ]);

      setName("");
      setTrigger("Manual");
      setAction("Ask Ninu AI");
      setInstructions("");
      setScheduleType("Once");
      setNextRunAt("");
      setShowForm(false);
    } catch (error: any) {
      console.error(
        "Workflow Error:",
        error
      );

      setError(
        error?.message ||
          "Ninu Automation is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  async function runWorkflow(
    workflowId: string
  ) {
    if (
      runningId ||
      updatingId ||
      deletingId
    ) {
      return;
    }

    const workflow =
      workflows.find(
        (item) =>
          item.id === workflowId
      );

    if (!workflow) {
      setError(
        "Workflow not found."
      );
      return;
    }

    if (
      workflow.status !== "active"
    ) {
      setError(
        "This workflow is currently paused."
      );
      return;
    }

    if (!workflowInput.trim()) {
      setError(
        "Please provide some input before executing the workflow."
      );
      return;
    }

    setRunningId(workflowId);
    setError("");
    setResult("");

    setResultWorkflowName(
      workflow.name || "Workflow"
    );

    setExecutionStep("starting");

    setExecutionMessage(
      "Starting your workflow..."
    );

    try {
      await new Promise(
        (resolve) =>
          setTimeout(resolve, 350)
      );

      setExecutionStep(
        "processing"
      );

      setExecutionMessage(
        "Ninu received your input and is processing it..."
      );

      const response =
        await fetch(
          "/api/automation",
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              workflowId,
              input:
                workflowInput.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Workflow execution failed."
        );
      }

      setExecutionStep(
        "completed"
      );

      setExecutionMessage(
        "Workflow completed successfully."
      );

      setResult(
        data.result ||
          "Workflow completed successfully."
      );

      setWorkflowInput("");
      setInputWorkflowId(null);

      await loadWorkflows();

      setExpandedHistory(
        workflowId
      );
    } catch (error: any) {
      console.error(
        "Workflow Execution Error:",
        error
      );

      setExecutionStep("idle");
      setExecutionMessage("");

      setError(
        error?.message ||
          "Ninu could not execute the workflow."
      );
    } finally {
      setRunningId(null);
    }
  }

  async function toggleWorkflow(
    workflowId: string
  ) {
    if (
      updatingId ||
      deletingId ||
      runningId
    ) {
      return;
    }

    setUpdatingId(workflowId);
    setError("");

    try {
      const response =
        await fetch(
          "/api/automation",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              workflowId,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not update workflow."
        );
      }

      setWorkflows(
        (previous) =>
          previous.map(
            (workflow) =>
              workflow.id ===
              workflowId
                ? {
                    ...workflow,
                    status:
                      data
                        .workflow
                        .status,
                  }
                : workflow
          )
      );
    } catch (error: any) {
      console.error(
        "Workflow Status Error:",
        error
      );

      setError(
        error?.message ||
          "Ninu could not update the workflow."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteWorkflow(
    workflowId: string
  ) {
    if (
      deletingId ||
      updatingId ||
      runningId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this workflow? Its execution history will also be deleted."
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(workflowId);
    setError("");

    try {
      const response =
        await fetch(
          "/api/automation",
          {
            method: "DELETE",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              workflowId,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not delete workflow."
        );
      }

      setWorkflows(
        (previous) =>
          previous.filter(
            (workflow) =>
              workflow.id !==
              workflowId
          )
      );

      if (
        expandedHistory ===
        workflowId
      ) {
        setExpandedHistory(null);
      }

      if (
        inputWorkflowId ===
        workflowId
      ) {
        setInputWorkflowId(null);
        setWorkflowInput("");
      }

      setResult("");
      setResultWorkflowName("");
      setExecutionStep("idle");
      setExecutionMessage("");
    } catch (error: any) {
      console.error(
        "Workflow Delete Error:",
        error
      );

      setError(
        error?.message ||
          "Ninu could not delete the workflow."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleString();
  }

  function toggleHistory(
    workflowId: string
  ) {
    setExpandedHistory(
      (previous) =>
        previous === workflowId
          ? null
          : workflowId
    );
  }

  async function copyText(
    value: string
  ) {
    try {
      await navigator.clipboard.writeText(
        value
      );
    } catch (error) {
      console.error(
        "Failed to copy:",
        error
      );
    }
  }

  async function copyResult() {
    if (!result) {
      return;
    }

    await copyText(result);
  }

  function getWebhookUrl(
    workflow: Workflow
  ) {
    if (
      typeof window ===
        "undefined" ||
      !workflow.webhookToken
    ) {
      return "";
    }

    return `${window.location.origin}/api/automation/webhook/${workflow.webhookToken}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            ⚡ Ninu Automation AI
          </h1>

          <p className="text-gray-500 mt-2">
            Automate your daily tasks
            with intelligent AI
            workflows.
          </p>
        </div>

        {/* Create Automation */}
        <div className="mt-10 bg-black text-white rounded-3xl p-8 max-w-4xl">
          <h3 className="text-2xl font-bold">
            Create New Automation
          </h3>

          <p className="text-gray-300 mt-2">
            Let Ninu AI handle
            repetitive tasks
            automatically.
          </p>

          <button
            onClick={() => {
              setShowForm(
                (previous) =>
                  !previous
              );
              setError("");
            }}
            className="mt-6 bg-white text-black px-8 py-3 rounded-full hover:bg-gray-100 transition"
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

              {/* Workflow Name */}
              <div>
                <label className="block font-medium mb-2">
                  Workflow Name
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Weekly Sales Report"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="block font-medium mb-2">
                  Trigger
                </label>

                <select
                  value={trigger}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setTrigger(value);

                    if (
                      value !==
                      "Scheduled"
                    ) {
                      setScheduleType(
                        "Once"
                      );
                      setNextRunAt("");
                    }

                    setError("");
                  }}
                  className="w-full border rounded-xl px-4 py-3 outline-none"
                >
                  <option>
                    Manual
                  </option>

                  <option>
                    New Document
                  </option>

                  <option>
                    New Message
                  </option>

                  <option>
                    Scheduled
                  </option>

                  <option>
                    Webhook
                  </option>
                </select>
              </div>

              {/* Webhook Info */}
              {trigger ===
                "Webhook" && (
                <div className="bg-gray-50 border rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                      🔗
                    </div>

                    <div>
                      <h4 className="font-bold">
                        Webhook Workflow
                      </h4>

                      <p className="text-sm text-gray-500 mt-1">
                        After creating
                        this workflow,
                        Ninu will
                        generate a
                        unique webhook
                        URL for it.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Scheduled Settings */}
              {trigger ===
                "Scheduled" && (
                <div className="bg-gray-50 border rounded-2xl p-5">
                  <h4 className="font-bold">
                    ⏰ Schedule Workflow
                  </h4>

                  <p className="text-sm text-gray-500 mt-1">
                    Choose when Ninu
                    should run this
                    workflow.
                  </p>

                  <div className="mt-4">
                    <label className="block font-medium mb-2">
                      Schedule Type
                    </label>

                    <select
                      value={
                        scheduleType
                      }
                      onChange={(event) =>
                        setScheduleType(
                          event.target.value
                        )
                      }
                      className="w-full border rounded-xl px-4 py-3 outline-none bg-white"
                    >
                      <option>
                        Once
                      </option>

                      <option>
                        Daily
                      </option>

                      <option>
                        Weekly
                      </option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block font-medium mb-2">
                      Date & Time
                    </label>

                    <input
                      type="datetime-local"
                      value={
                        nextRunAt
                      }
                      onChange={(event) =>
                        setNextRunAt(
                          event.target.value
                        )
                      }
                      min={new Date()
                        .toISOString()
                        .slice(
                          0,
                          16
                        )}
                      className="w-full border rounded-xl px-4 py-3 outline-none bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Action */}
              <div>
                <label className="block font-medium mb-2">
                  Action
                </label>

                <select
                  value={action}
                  onChange={(event) =>
                    setAction(
                      event.target.value
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3 outline-none"
                >
                  <option>
                    Ask Ninu AI
                  </option>

                  <option>
                    Analyze Document
                  </option>

                  <option>
                    Generate Report
                  </option>

                  <option>
                    Generate Content
                  </option>
                </select>
              </div>

              {/* Instructions */}
              <div>
                <label className="block font-medium mb-2">
                  AI Instructions
                </label>

                <textarea
                  value={
                    instructions
                  }
                  onChange={(event) =>
                    setInstructions(
                      event.target.value
                    )
                  }
                  placeholder="Tell Ninu exactly how you want this workflow to behave..."
                  rows={5}
                  className="w-full border rounded-xl px-4 py-3 outline-none resize-none"
                />

                <p className="text-sm text-gray-500 mt-2">
                  Example: "Keep
                  the report under
                  200 words and
                  include 3
                  recommendations."
                </p>
              </div>

              {error && (
                <p className="text-red-600">
                  {error}
                </p>
              )}

              <button
                onClick={
                  createWorkflow
                }
                disabled={
                  loading ||
                  !name.trim()
                }
                className="bg-black text-white px-8 py-3 rounded-full disabled:opacity-50 hover:bg-gray-800 transition"
              >
                {loading
                  ? "Creating..."
                  : "✨ Create Workflow"}
              </button>
            </div>
          </div>
        )}

        {/* Global Error */}
        {error &&
          !showForm && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 max-w-4xl">
              <div className="flex items-start gap-3">
                <span className="text-lg">
                  ⚠️
                </span>

                <div>
                  <p className="font-semibold">
                    Ninu couldn't
                    complete the
                    request
                  </p>

                  <p className="text-sm mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Live Execution Status */}
        {runningId && (
          <div className="mt-8 max-w-4xl">
            <div className="bg-white border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-2xl">
                  🤖
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Ninu AI
                  </p>

                  <h3 className="text-xl font-bold">
                    Ninu is working...
                  </h3>
                </div>
              </div>

              <div className="mt-6 space-y-3">

                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                      executionStep ===
                        "starting" ||
                      executionStep ===
                        "processing"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {executionStep ===
                      "starting" ||
                    executionStep ===
                      "processing"
                      ? "✓"
                      : "○"}
                  </div>

                  <span
                    className={
                      executionStep ===
                        "starting" ||
                      executionStep ===
                        "processing"
                        ? "text-gray-900 font-medium"
                        : "text-gray-400"
                    }
                  >
                    Workflow started
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                      executionStep ===
                      "processing"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {executionStep ===
                    "processing"
                      ? "✓"
                      : "○"}
                  </div>

                  <span
                    className={
                      executionStep ===
                      "processing"
                        ? "text-gray-900 font-medium"
                        : "text-gray-400"
                    }
                  >
                    Input received
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                      executionStep ===
                      "processing"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {executionStep ===
                    "processing"
                      ? "⏳"
                      : "○"}
                  </div>

                  <span
                    className={
                      executionStep ===
                      "processing"
                        ? "text-gray-900 font-medium"
                        : "text-gray-400"
                    }
                  >
                    Generating result
                  </span>
                </div>
              </div>

              <div className="mt-5 bg-gray-50 rounded-2xl px-4 py-3">
                <p className="text-sm text-gray-600">
                  {executionMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completed Execution Status */}
        {!runningId &&
          executionStep ===
            "completed" &&
          result && (
            <div className="mt-8 max-w-4xl">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                    ✓
                  </div>

                  <div>
                    <p className="font-semibold text-green-800">
                      Workflow completed
                    </p>

                    <p className="text-sm text-green-700 mt-0.5">
                      Ninu successfully
                      generated your
                      result.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Workflow Result */}
        {result && (
          <div className="mt-6 max-w-4xl">
            <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">

              <div className="bg-black text-white p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
                      🤖
                    </div>

                    <div>
                      <p className="text-sm text-gray-300">
                        Ninu AI
                      </p>

                      <h3 className="text-xl font-bold">
                        Workflow Result
                      </h3>
                    </div>
                  </div>

                  <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-xs font-medium">
                    ✓ Completed
                  </span>
                </div>

                {resultWorkflowName && (
                  <p className="text-sm text-gray-300 mt-4">
                    Workflow:{" "}
                    <span className="text-white font-medium">
                      {
                        resultWorkflowName
                      }
                    </span>
                  </p>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      AI Response
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Ninu has finished
                      processing your
                      request.
                    </p>
                  </div>

                  <button
                    onClick={
                      copyResult
                    }
                    className="border px-4 py-2 rounded-full text-sm hover:bg-gray-50 transition"
                  >
                    📋 Copy
                  </button>
                </div>

                <div className="bg-gray-50 border rounded-2xl p-5">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-7">
                    {result}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workflows */}
        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-5">
            Your Workflows
          </h3>

          {workflows.length ===
          0 ? (
            <div className="bg-white border rounded-3xl p-8 text-gray-500">
              No workflows
              created yet.
              <br />
              Create your first
              workflow above.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {workflows.map(
                (workflow) => {
                  const executions =
                    workflow.executions ||
                    [];

                  const lastExecution =
                    executions[0];

                  const isHistoryOpen =
                    expandedHistory ===
                    workflow.id;

                  const webhookUrl =
                    getWebhookUrl(
                      workflow
                    );

                  return (
                    <div
                      key={
                        workflow.id
                      }
                      className="bg-white border rounded-3xl p-6"
                    >

                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="text-3xl">
                          {workflow.trigger ===
                          "Webhook"
                            ? "🔗"
                            : workflow.trigger ===
                              "Scheduled"
                            ? "⏰"
                            : "⚡"}
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            workflow.status ===
                            "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {
                            workflow.status
                          }
                        </span>
                      </div>

                      <h3 className="font-bold text-xl mt-4">
                        {
                          workflow.name
                        }
                      </h3>

                      <div className="mt-4 text-sm text-gray-500">

                        <p>
                          <strong>
                            Trigger:
                          </strong>{" "}
                          {
                            workflow.trigger
                          }
                        </p>

                        <p className="mt-2">
                          <strong>
                            Action:
                          </strong>{" "}
                          {
                            workflow.action
                          }
                        </p>

                        <p className="mt-2">
                          <strong>
                            Created:
                          </strong>{" "}
                          {formatDate(
                            workflow.createdAt
                          )}
                        </p>

                        {workflow.nextRunAt && (
                          <p className="mt-2">
                            <strong>
                              Next Run:
                            </strong>{" "}
                            {formatDate(
                              workflow.nextRunAt
                            )}
                          </p>
                        )}

                        {workflow.scheduleType && (
                          <p className="mt-2">
                            <strong>
                              Schedule:
                            </strong>{" "}
                            {
                              workflow.scheduleType
                            }
                          </p>
                        )}

                        {lastExecution && (
                      <>
                        <p className="mt-2">
                          <strong>
                            Last Run:
                          </strong>{" "}
                          {formatDate(
                            lastExecution.createdAt
                          )}
                        </p>

                        {/* Execution Overview */}
                        <div className="mt-4 bg-gray-50 border rounded-2xl p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-sm">
                              📊 Execution Overview
                            </p>

                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                lastExecution.status ===
                                "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {lastExecution.status ===
                              "completed"
                                ? "✓ Completed"
                                : lastExecution.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-white border rounded-xl p-3">
                              <p className="text-xs text-gray-400">
                                Executions
                              </p>

                              <p className="text-xl font-bold mt-1">
                                {executions.length}
                              </p>
                            </div>

                            <div className="bg-white border rounded-xl p-3">
                              <p className="text-xs text-gray-400">
                                Last Status
                              </p>

                              <p className="text-sm font-semibold mt-2">
                                {lastExecution.status ===
                                "completed"
                                  ? "Completed"
                                  : lastExecution.status}
                              </p>
                            </div>
                          </div>

                          {lastExecution.result && (
                            <div className="mt-3 bg-white border rounded-xl p-3">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                Last Result
                              </p>

                              <p className="text-sm text-gray-700 mt-2 line-clamp-3 whitespace-pre-wrap">
                                {lastExecution.result}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                      </div>

                      {/* Webhook Configuration */}
                      {workflow.trigger ===
                        "Webhook" &&
                        workflow.webhookEnabled &&
                        workflow.webhookToken && (
                          <div className="mt-5 bg-gray-50 border rounded-2xl p-4">

                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                🔗
                              </span>

                              <p className="font-semibold">
                                Webhook Endpoint
                              </p>
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                              Send a POST
                              request to
                              this URL to
                              trigger Ninu.
                            </p>

                            <div className="mt-3">
                              <label className="text-xs font-semibold text-gray-500">
                                Webhook URL
                              </label>

                              <div className="mt-1 flex gap-2">
                                <input
                                  readOnly
                                  value={
                                    webhookUrl
                                  }
                                  className="min-w-0 flex-1 bg-white border rounded-xl px-3 py-2 text-xs text-gray-700 outline-none"
                                />

                                <button
                                  onClick={() =>
                                    copyText(
                                      webhookUrl
                                    )
                                  }
                                  className="border bg-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-100 transition"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>

                            <div className="mt-3">
                              <label className="text-xs font-semibold text-gray-500">
                                Webhook Token
                              </label>

                              <div className="mt-1 flex gap-2">
                                <input
                                  readOnly
                                  value={
                                    workflow.webhookToken
                                  }
                                  className="min-w-0 flex-1 bg-white border rounded-xl px-3 py-2 text-xs text-gray-700 outline-none"
                                />

                                <button
                                  onClick={() =>
                                    copyText(
                                      workflow.webhookToken ||
                                        ""
                                    )
                                  }
                                  className="border bg-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-100 transition"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 bg-white border rounded-xl p-3">
                              <p className="text-xs font-semibold">
                                Example request
                              </p>

                              <pre className="mt-2 text-[11px] text-gray-600 whitespace-pre-wrap break-all">
{`POST ${webhookUrl}

Content-Type: application/json

{
  "message": "Hello Ninu"
}`}
                              </pre>
                            </div>
                          </div>
                        )}

                      {/* Instructions */}
                      {workflow.instructions && (
                        <div className="mt-4 bg-gray-50 rounded-2xl p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            AI Instructions
                          </p>

                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                            {
                              workflow.instructions
                            }
                          </p>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="mt-5 grid grid-cols-2 gap-2">

                        <button
                          onClick={() => {
                            setInputWorkflowId(
                              workflow.id
                            );

                            setWorkflowInput(
                              ""
                            );

                            setError("");
                            setResult("");
                            setResultWorkflowName(
                              ""
                            );

                            setExecutionStep(
                              "idle"
                            );

                            setExecutionMessage(
                              ""
                            );
                          }}
                          disabled={
                            runningId !==
                              null ||
                            updatingId !==
                              null ||
                            deletingId !==
                              null ||
                            workflow.status !==
                              "active"
                          }
                          className="bg-black text-white px-4 py-3 rounded-full disabled:opacity-50 hover:bg-gray-800 transition"
                        >
                          ▶ Run
                        </button>

                        <button
                          onClick={() =>
                            toggleHistory(
                              workflow.id
                            )
                          }
                          className="border px-4 py-3 rounded-full hover:bg-gray-50 transition"
                        >
                          📜 History

                          {executions.length >
                            0 && (
                            <span className="ml-1 text-xs text-gray-500">
                              (
                              {
                                executions.length
                              }
                              )
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            toggleWorkflow(
                              workflow.id
                            )
                          }
                          disabled={
                            updatingId !==
                              null ||
                            deletingId !==
                              null ||
                            runningId !==
                              null
                          }
                          className="border px-4 py-3 rounded-full disabled:opacity-50 hover:bg-gray-50 transition"
                        >
                          {updatingId ===
                          workflow.id
                            ? "..."
                            : workflow.status ===
                              "active"
                            ? "⏸ Pause"
                            : "▶ Resume"}
                        </button>

                        <button
                          onClick={() =>
                            deleteWorkflow(
                              workflow.id
                            )
                          }
                          disabled={
                            deletingId !==
                              null ||
                            updatingId !==
                              null ||
                            runningId !==
                              null
                          }
                          className="border border-red-200 text-red-600 px-4 py-3 rounded-full disabled:opacity-50 hover:bg-red-50 transition"
                        >
                          {deletingId ===
                          workflow.id
                            ? "..."
                            : "🗑️ Delete"}
                        </button>
                      </div>

                      {/* Input Panel */}
                      {inputWorkflowId ===
                        workflow.id && (
                        <div className="mt-5 bg-gray-50 border rounded-2xl p-4">

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                              🤖
                            </div>

                            <div>
                              <h4 className="font-bold">
                                Give Ninu some input
                              </h4>

                              <p className="text-sm text-gray-500 mt-1">
                                Add any
                                information
                                Ninu should
                                use while
                                executing
                                this
                                workflow.
                              </p>
                            </div>
                          </div>

                          <textarea
                            value={
                              workflowInput
                            }
                            onChange={(
                              event
                            ) =>
                              setWorkflowInput(
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Example: Analyze this week's sales and give me 3 key insights..."
                            rows={5}
                            disabled={
                              runningId !==
                              null
                            }
                            className="mt-4 w-full border rounded-xl px-4 py-3 outline-none resize-none bg-white disabled:bg-gray-100"
                          />

                          <div className="mt-3 flex gap-2">

                            <button
                              onClick={() => {
                                setInputWorkflowId(
                                  null
                                );

                                setWorkflowInput(
                                  ""
                                );
                              }}
                              disabled={
                                runningId !==
                                null
                              }
                              className="border px-5 py-2 rounded-full disabled:opacity-50 hover:bg-white transition"
                            >
                              Cancel
                            </button>

                            <button
                              onClick={() =>
                                runWorkflow(
                                  workflow.id
                                )
                              }
                              disabled={
                                runningId !==
                                  null ||
                                !workflowInput.trim()
                              }
                              className="bg-black text-white px-5 py-2 rounded-full disabled:opacity-50 hover:bg-gray-800 transition"
                            >
                              {runningId ===
                              workflow.id
                                ? "🤖 Running..."
                                : "✨ Execute"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* History */}
                      {isHistoryOpen && (
                        <div className="mt-5 border-t pt-5">

                          <h4 className="font-bold">
                            📜 Execution
                            History
                          </h4>

                          {executions.length ===
                          0 ? (
                            <div className="mt-4 bg-gray-50 rounded-2xl p-4 text-sm text-gray-500">
                              No executions
                              yet.
                              <br />
                              Run this
                              workflow to
                              create your
                              first
                              execution.
                            </div>
                          ) : (
                            <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                              {executions.map(
                                (
                                  execution
                                ) => (
                                  <div
                                    key={
                                      execution.id
                                    }
                                    className="bg-gray-50 rounded-2xl p-4"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="font-medium text-sm">
                                        {execution.status ===
                                        "completed"
                                          ? "✅ Completed"
                                          : `⚠️ ${execution.status}`}
                                      </span>

                                      <span className="text-xs text-gray-400">
                                        {formatDate(
                                          execution.createdAt
                                        )}
                                      </span>
                                    </div>

  <div className="mt-3 space-y-2">

    <div className="text-xs text-gray-500">
      <span className="font-medium text-gray-700">
        Source:
      </span>{" "}
      {execution.source || "manual"}
    </div>

    {execution.input && (
      <details>
        <summary className="cursor-pointer text-sm font-medium">
          View Input
        </summary>

        <pre className="mt-3 whitespace-pre-wrap text-xs text-gray-600 leading-5">
{execution.input}
        </pre>
      </details>
    )}

    {execution.result && (
      <details>
        <summary className="cursor-pointer text-sm font-medium">
          View Result
        </summary>

        <pre className="mt-3 whitespace-pre-wrap text-xs text-gray-600 leading-5">
{execution.result}
        </pre>
      </details>
    )}

  </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-4">
                        {workflow.status ===
                        "active"
                          ? workflow.trigger ===
                            "Webhook"
                            ? "Webhook workflow is ready to receive requests."
                            : workflow.nextRunAt
                            ? "Scheduled workflow is ready."
                            : "Workflow is ready to run."
                          : "Workflow is paused."}
                      </p>
                    </div>
                  );
                }
              )}
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
              <div className="text-3xl">
                🎯
              </div>

              <h4 className="font-bold mt-3">
                Choose a Trigger
              </h4>

              <p className="text-gray-500 mt-2">
                Decide when your
                workflow should
                start.
              </p>
            </div>

            <div>
              <div className="text-3xl">
                🤖
              </div>

              <h4 className="font-bold mt-3">
                Choose an AI Action
              </h4>

              <p className="text-gray-500 mt-2">
                Let Ninu AI perform
                the selected task
                using your
                instructions.
              </p>
            </div>

            <div>
              <div className="text-3xl">
                ⚡
              </div>

              <h4 className="font-bold mt-3">
                Run Your Workflow
              </h4>

              <p className="text-gray-500 mt-2">
                Execute your
                workflow whenever
                you need it.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
