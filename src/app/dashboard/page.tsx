import Link from "next/link";

export default function Dashboard() {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold text-gray-900">
            Welcome to Ninu AI 👋
          </h2>

          <p className="text-gray-500 mt-2">
            Your all-in-one AI workspace
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-3 bg-white border rounded-2xl px-5 py-3 shadow-sm">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search AI..."
              className="outline-none w-40 text-sm"
            />
          </div>

          {/* Notification */}
          <button className="bg-white border rounded-2xl w-12 h-12 shadow-sm hover:bg-gray-100 transition">
            🔔
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 bg-white border rounded-2xl px-4 py-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
              AI
            </div>

            <div>
              <p className="font-semibold text-sm">
                AI User
              </p>

              <p className="text-xs text-gray-500">
                Creator
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Interface */}
      <div className="mt-10 bg-white rounded-3xl shadow-lg border max-w-4xl overflow-hidden">
        {/* Chat Header */}
        <div className="bg-black text-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-xl">
            🤖
          </div>

          <div>
            <h3 className="font-bold text-lg">
              Ninu AI Assistant
            </h3>

            <p className="text-sm text-gray-300">
              Online • Ready to help
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="p-6 space-y-5 min-h-[350px]">
          {/* AI */}
          <div className="bg-gray-100 p-4 rounded-2xl max-w-lg">
            Hello! I am Ninu AI. How can I help you today?
          </div>

          {/* User */}
          <div className="bg-black text-white p-4 rounded-2xl max-w-lg ml-auto">
            Help me create a marketing plan.
          </div>

          {/* AI Response */}
          <div className="bg-gray-100 p-4 rounded-2xl max-w-lg">
            I can help you create a complete marketing plan,
            strategy and growth ideas.
          </div>

          <div className="text-sm text-gray-400">
            Ninu AI is thinking...
          </div>
        </div>

        {/* Input */}
        <div className="border-t p-4 flex gap-3">
          <input
            type="text"
            placeholder="Ask Ninu anything..."
            className="flex-1 border rounded-full px-5 py-3 outline-none"
          />

          <button className="bg-black text-white px-6 rounded-full">
            Send
          </button>
        </div>
      </div>

      {/* Tool Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">

        {/* Image Generator */}
        <Link
          href="/image-generator"
          className="block bg-white p-6 rounded-3xl border hover:shadow-md transition cursor-pointer"
        >
          <div className="text-4xl">
            🎨
          </div>

          <h3 className="font-bold text-xl mt-4">
            Image Generator
          </h3>

          <p className="text-gray-500 mt-2">
            Create images with AI.
          </p>
        </Link>

        {/* Code Assistant */}
        <div className="bg-white p-6 rounded-3xl border hover:shadow-md transition cursor-pointer">
          <div className="text-4xl">
            💻
          </div>

          <h3 className="font-bold text-xl mt-4">
            Code Assistant
          </h3>

          <p className="text-gray-500 mt-2">
            Build and debug code faster.
          </p>
        </div>

        {/* Automation */}
        <div className="bg-white p-6 rounded-3xl border hover:shadow-md transition cursor-pointer">
          <div className="text-4xl">
            ⚡
          </div>

          <h3 className="font-bold text-xl mt-4">
            Automation
          </h3>

          <p className="text-gray-500 mt-2">
            Automate daily workflows.
          </p>
        </div>

      </div>
    </>
  );
}