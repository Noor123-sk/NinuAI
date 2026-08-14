"use client";

import { useState } from "react";

export default function VisionPage() {
  const [image, setImage] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setError("");
    setAnalysis("");

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
          question:
            question.trim() ||
            "Analyze this image and describe what you see.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to analyze image.");
      }

      setAnalysis(data.analysis || "");
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong while analyzing the image."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          👁️ Ninu Vision AI
        </h1>

        <p className="text-gray-500 mt-2">
          Upload an image and let Ninu understand it.
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-10 bg-white border rounded-3xl shadow-sm p-8">
        <h2 className="text-xl font-bold">
          Upload an image
        </h2>

        <p className="text-gray-500 mt-2">
          Ninu can describe, explain, analyze, and answer
          questions about your image.
        </p>

        {/* Upload */}
        <label className="mt-6 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:bg-gray-100 transition">
          {image ? (
            <img
              src={image}
              alt="Uploaded preview"
              className="max-h-80 max-w-full rounded-2xl object-contain"
            />
          ) : (
            <>
              <div className="text-5xl">📤</div>

              <p className="mt-4 font-semibold">
                Click to upload an image
              </p>

              <p className="mt-1 text-sm text-gray-500">
                PNG, JPG, JPEG, WEBP
              </p>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {/* Question */}
        <div className="mt-6">
          <label className="font-semibold">
            Ask Ninu about this image
          </label>

          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            placeholder="Example: What objects are visible in this image?"
            className="mt-3 w-full min-h-28 resize-none rounded-2xl border p-4 outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={analyzeImage}
          disabled={loading}
          className="mt-6 rounded-full bg-black px-8 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "🧠 Ninu is analyzing..." : "👁️ Analyze Image"}
        </button>
      </div>

      {/* Analysis */}
      {analysis && (
        <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">
            🤖 Ninu's Analysis
          </h2>

          <div className="mt-5 whitespace-pre-wrap leading-7 text-gray-700">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
}