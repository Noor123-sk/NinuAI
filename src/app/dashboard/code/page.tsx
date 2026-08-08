"use client";

import { useState } from "react";

export default function CodePage() {
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askNinuAI() {
    if (!code.trim() || loading) {
      return;
    }

    setLoading(true);
    setResponse("");
    setError("");

    try {
      const result = await fetch("/api/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(
          data.error || "Code analysis failed."
        );
      }

      setResponse(
        data.reply ||
          "Ninu Code AI could not analyze the code."
      );
    } catch (error: any) {
      console.error("Code AI Error:", error);

      setError(
        error?.message ||
          "Ninu Code AI is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyResponse() {
    if (!response) {
      return;
    }

    try {
      await navigator.clipboard.writeText(response);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  return (
    <div>
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold text-gray-900">
          💻 Ninu Code AI
        </h2>

        <p className="text-gray-500 mt-2">
          Build, debug and understand code with AI
        </p>
      </div>

      {/* Code Workspace */}
      <div className="mt-10 grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white border rounded-3xl p-6">
          <h3 className="font-bold text-xl mb-4">
            Your Code
          </h3>

          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value)
            }
            className="border rounded-xl px-4 py-2 mb-4"
          >
            <option>JavaScript</option>
            <option>Python</option>
            <option>TypeScript</option>
          </select>

          <textarea
            value={code}
            onChange={(event) =>
              setCode(event.target.value)
            }
            placeholder="Paste your code here..."
            className="w-full h-72 border rounded-2xl p-5 outline-none font-mono"
          />

          <button
            onClick={askNinuAI}
            disabled={loading || !code.trim()}
            className="mt-5 bg-black text-white px-8 py-3 rounded-full disabled:opacity-50"
          >
            {loading
              ? "🤖 Ninu is analyzing..."
              : "✨ Ask Ninu AI"}
          </button>
        </div>

        {/* AI Response */}
        <div className="bg-black text-white rounded-3xl p-6">
          <h3 className="font-bold text-xl mb-5">
            🤖 Ninu Response
          </h3>

          <div className="bg-gray-800 rounded-2xl p-5 min-h-72 overflow-y-auto">
            {loading ? (
              <p className="text-gray-300 animate-pulse">
                Ninu AI is analyzing your code...
              </p>
            ) : error ? (
              <p className="text-red-300">
                {error}
              </p>
            ) : response ? (
              <pre className="text-gray-200 whitespace-pre-wrap font-sans text-sm leading-6">
                {response}
              </pre>
            ) : (
              <p className="text-gray-300">
                Your AI coding assistant will explain,
                debug and improve your code here.
              </p>
            )}
          </div>

          <button
            onClick={copyResponse}
            disabled={!response}
            className="mt-5 border border-gray-600 px-5 py-2 rounded-full disabled:opacity-40"
          >
            📋 Copy Response
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-2xl p-5">
          🐞
          <h3 className="font-bold mt-3">
            Debug Code
          </h3>
          <p className="text-gray-500">
            Find and fix errors faster.
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          ⚡
          <h3 className="font-bold mt-3">
            Improve Code
          </h3>
          <p className="text-gray-500">
            Optimize your programs.
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          📚
          <h3 className="font-bold mt-3">
            Explain Code
          </h3>
          <p className="text-gray-500">
            Understand complex code.
          </p>
        </div>
      </div>
    </div>
  );
}