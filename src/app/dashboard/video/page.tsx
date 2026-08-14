"use client";

import { useState } from "react";

export default function VideoPage() {
  const [prompt, setPrompt] = useState("");
  const [videoUri, setVideoUri] = useState("");
  const [aspectRatio, setAspectRatio] =
    useState<"16:9" | "9:16">("16:9");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateVideo = async () => {
    if (!prompt.trim()) {
      setError("Please describe the video you want Ninu to create.");
      return;
    }

    setLoading(true);
    setError("");
    setVideoUri("");

    try {
      const response = await fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Ninu could not generate the video."
        );
      }

      setVideoUri(data?.video?.uri || "");

      if (!data?.video?.uri) {
        throw new Error(
          "Ninu generated the request but no video was returned."
        );
      }
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong while generating the video."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          🎬 Ninu Video AI
        </h1>

        <p className="mt-2 text-gray-500">
          Turn your ideas into cinematic videos with Ninu.
        </p>
      </div>

      {/* Generator Card */}
      <div className="mt-10 rounded-3xl border bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Create your video
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Describe the scene, style, camera movement, and mood you
          want.
        </p>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Example: A cinematic chocolate cake being decorated in a luxury bakery, warm lighting, smooth camera movement..."
          rows={7}
          className="mt-6 w-full resize-none rounded-2xl border border-gray-300 p-5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        />

        {/* Options */}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Model
            </label>

            <div className="mt-2 rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-700">
              Veo 3.1 Fast
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Aspect Ratio
            </label>

            <select
              value={aspectRatio}
              onChange={(event) =>
                setAspectRatio(
                  event.target.value as "16:9" | "9:16"
                )
              }
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Duration
            </label>

            <div className="mt-2 rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-700">
              8 seconds
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-600">
            {error}
          </div>
        )}

        {/* Generate */}
        <button
          onClick={generateVideo}
          disabled={loading}
          className="mt-6 rounded-full bg-black px-8 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "🎬 Ninu is creating your video..."
            : "🎬 Generate Video"}
        </button>
      </div>

      {/* Preview */}
      <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          🎥 Generated Video
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Your generated video will appear here.
        </p>

        {videoUri ? (
          <div className="mt-6 overflow-hidden rounded-2xl bg-black">
            <video
              src={videoUri}
              controls
              className="w-full"
            />
          </div>
        ) : (
          <div className="mt-6 flex min-h-80 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
            <div className="text-center">
              <div className="text-6xl">🎬</div>

              <p className="mt-4 font-semibold text-gray-700">
                No video generated yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Enter a prompt above to create your first video.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
