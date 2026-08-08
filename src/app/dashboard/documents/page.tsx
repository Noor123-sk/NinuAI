"use client";

import { useState } from "react";

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadDocument() {
    if (!file || loading) {
      return;
    }

    setLoading(true);
    setResponse("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(
          data.error || "Document analysis failed."
        );
      }

      setResponse(
        data.reply ||
          "Ninu Documents AI could not analyze the document."
      );
    } catch (error: any) {
      console.error("Document Error:", error);

      setError(
        error?.message ||
          "Ninu Documents AI is temporarily unavailable."
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
          📄 Ninu Documents AI
        </h2>

        <p className="text-gray-500 mt-2">
          Upload, analyze and understand your documents with AI
        </p>
      </div>

      {/* Upload Area */}
      <div className="mt-10 bg-white border rounded-3xl shadow-sm p-8 max-w-4xl">
        <h3 className="text-xl font-bold mb-5">
          Upload Document
        </h3>

        <div className="border-2 border-dashed rounded-3xl p-10 text-center">
          <div className="text-5xl">📂</div>

          <p className="mt-4 text-gray-500">
            Select your TXT document
          </p>

          <p className="text-sm text-gray-400 mt-2">
            TXT supported in the current version
          </p>

          <input
            id="document-upload"
            type="file"
            accept=".txt,text/plain"
            onChange={(event) => {
              const selectedFile =
                event.target.files?.[0] || null;

              setFile(selectedFile);
              setResponse("");
              setError("");
            }}
            className="hidden"
          />

          <label
            htmlFor="document-upload"
            className="inline-block mt-5 bg-gray-100 text-gray-900 px-8 py-3 rounded-full cursor-pointer hover:bg-gray-200"
          >
            Choose File
          </label>

          {file && (
            <div className="mt-4">
              <p className="font-medium text-gray-700">
                📄 {file.name}
              </p>

              <button
                onClick={uploadDocument}
                disabled={loading}
                className="mt-4 bg-black text-white px-8 py-3 rounded-full disabled:opacity-50"
              >
                {loading
                  ? "🤖 Ninu is analyzing..."
                  : "✨ Analyze Document"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Document Assistant */}
      <div className="mt-10 bg-white border rounded-3xl p-8 max-w-4xl">
        <h3 className="text-xl font-bold mb-5">
          🤖 Document Analysis
        </h3>

        <div className="bg-gray-100 rounded-2xl p-5 min-h-48 overflow-y-auto">
          {loading ? (
            <p className="text-gray-600 animate-pulse">
              Ninu AI is reading your document...
            </p>
          ) : error ? (
            <p className="text-red-600">
              {error}
            </p>
          ) : response ? (
            <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-6">
              {response}
            </pre>
          ) : (
            <p className="text-gray-600">
              Upload a TXT document and Ninu AI will
              summarize and analyze it here.
            </p>
          )}
        </div>
      </div>

      {/* Recent Documents */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-5">
          Recent Documents
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-2xl p-5">
            📄

            <h4 className="font-bold mt-3">
              TXT Documents
            </h4>

            <p className="text-gray-500 text-sm mt-2">
              Upload a document to begin analysis.
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            🤖

            <h4 className="font-bold mt-3">
              AI Summary
            </h4>

            <p className="text-gray-500 text-sm mt-2">
              Ninu summarizes your document.
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-5">
            💡

            <h4 className="font-bold mt-3">
              Key Insights
            </h4>

            <p className="text-gray-500 text-sm mt-2">
              Important information is highlighted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}