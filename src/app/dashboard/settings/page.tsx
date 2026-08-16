"use client";

import { useEffect, useState } from "react";

type Settings = {
  name: string;
  role: string;
  language: string;
  responseStyle: string;
  theme: string;
  imageAspectRatio: string;
  videoAspectRatio: string;
};

const defaultSettings: Settings = {
  name: "Nooran",
  role: "AI Creator",
  language: "Auto",
  responseStyle: "Balanced",
  theme: "Light",
  imageAspectRatio: "1:1",
  videoAspectRatio: "16:9",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ninu-settings");

    if (stored) {
      try {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(stored),
        });
      } catch {
        localStorage.removeItem("ninu-settings");
      }
    }
  }, []);

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem("ninu-settings", JSON.stringify(settings));
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("ninu-settings");
    setSaved(false);
  };

  return (
    <main className="max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          ⚙️ Settings
        </h1>

        <p className="mt-2 text-gray-500">
          Customize how Ninu looks and works for you.
        </p>
      </div>

      {/* Profile */}
      <section className="mt-8 rounded-3xl border bg-white p-7 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            👤 Profile
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your basic Ninu profile information.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Name
            </label>

            <input
              value={settings.name}
              onChange={(event) =>
                updateSetting("name", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Role
            </label>

            <input
              value={settings.role}
              onChange={(event) =>
                updateSetting("role", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>
      </section>

      {/* AI Preferences */}
      <section className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          🤖 AI Preferences
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Choose how Ninu should respond to you.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Response Language
            </label>

            <select
              value={settings.language}
              onChange={(event) =>
                updateSetting("language", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option>Auto</option>
              <option>English</option>
              <option>Hindi</option>
              <option>Hinglish</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Response Style
            </label>

            <select
              value={settings.responseStyle}
              onChange={(event) =>
                updateSetting(
                  "responseStyle",
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option>Balanced</option>
              <option>Concise</option>
              <option>Detailed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          🎨 Appearance
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Choose your preferred Ninu appearance.
        </p>

        <div className="mt-6 max-w-md">
          <label className="text-sm font-semibold text-gray-700">
            Theme
          </label>

          <select
            value={settings.theme}
            onChange={(event) =>
              updateSetting("theme", event.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
          >
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
      </section>

      {/* Generation */}
      <section className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          🎬 Generation Preferences
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Set your default media generation preferences.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Default Image Aspect Ratio
            </label>

            <select
              value={settings.imageAspectRatio}
              onChange={(event) =>
                updateSetting(
                  "imageAspectRatio",
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option>1:1</option>
              <option>16:9</option>
              <option>9:16</option>
              <option>4:3</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Default Video Aspect Ratio
            </label>

            <select
              value={settings.videoAspectRatio}
              onChange={(event) =>
                updateSetting(
                  "videoAspectRatio",
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option>16:9</option>
              <option>9:16</option>
            </select>
          </div>
        </div>
      </section>

      {/* Save / Reset */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          onClick={saveSettings}
          className="rounded-full bg-black px-7 py-3 font-semibold text-white transition hover:bg-gray-800"
        >
          Save Settings
        </button>

        <button
          onClick={resetSettings}
          className="rounded-full border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Reset
        </button>

        {saved && (
          <span className="text-sm font-medium text-green-600">
            ✓ Settings saved
          </span>
        )}
      </div>

      {/* About */}
      <section className="mt-8 rounded-3xl border bg-white p-7 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          ℹ️ About Ninu
        </h2>

        <div className="mt-4 text-sm leading-7 text-gray-500">
          <p>
            <span className="font-semibold text-gray-700">
              Ninu AI
            </span>
          </p>

          <p>AI Creator Workspace</p>

          <p>Version 0.1.0</p>
        </div>
      </section>
    </main>
  );
}
