"use client";

import { useState } from "react";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const generateImage = async () => {
    const text = prompt.trim();

    if (!text || isGenerating) return;

    setIsGenerating(true);
    setError("");
    setImageUrl("");

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate image."
        );
      }

      if (!data.imageUrl) {
        throw new Error(
          "No image was returned by the AI."
        );
      }

      setImageUrl(data.imageUrl);
    } catch (error) {
      console.error("Image Generation Error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Ninu AI could not generate the image."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Ninu AI
          </a>

          <h1 className="text-4xl font-bold mt-5">
            🎨 Image Generator
          </h1>

          <p className="text-gray-600 mt-2">
            Turn your ideas into images with Ninu AI.
          </p>
        </div>

        {/* Generator */}
        <div className="bg-white border rounded-3xl shadow-lg p-6 md:p-8">
          <label className="block font-semibold mb-3">
            Describe your image
          </label>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                generateImage();
              }
            }}
            placeholder="Example: A futuristic Mumbai skyline at sunset, cinematic lighting..."
            rows={5}
            disabled={isGenerating}
            className="w-full border rounded-2xl px-5 py-4 resize-none outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
          />

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={generateImage}
              disabled={
                !prompt.trim() ||
                isGenerating
              }
              className="bg-black text-white px-7 py-3 rounded-2xl font-medium disabled:opacity-40 hover:opacity-90 transition"
            >
              {isGenerating
                ? "Creating..."
                : "Generate Image"}
            </button>

            {prompt && !isGenerating && (
              <button
                onClick={() => {
                  setPrompt("");
                  setImageUrl("");
                  setError("");
                }}
                className="px-5 py-3 rounded-2xl border hover:bg-gray-50 transition"
              >
                Clear
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-3">
            Press Enter to generate • Shift + Enter for a new line
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            <p className="font-semibold">
              Generation failed
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>
          </div>
        )}

        {/* Result */}
        <div className="mt-8 bg-white border rounded-3xl p-6 min-h-[350px] flex items-center justify-center">

          {isGenerating ? (
            <div className="text-center">
              <div className="text-5xl animate-pulse">
                🎨
              </div>

              <p className="mt-4 font-medium">
                Ninu is creating your image...
              </p>

              <p className="text-sm text-gray-400 mt-1">
                This may take a moment.
              </p>
            </div>

          ) : imageUrl ? (
            <div className="w-full">
              <img
                src={imageUrl}
                alt={prompt}
                className="w-full max-h-[700px] object-contain rounded-2xl"
              />

              <p className="text-sm text-gray-500 mt-4">
                Prompt: {prompt}
              </p>
            </div>

          ) : (
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">
                🖼️
              </div>

              <p>
                Your generated image will appear here.
              </p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

