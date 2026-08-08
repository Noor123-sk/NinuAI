export default function AutomationPage() {
  return (
    <div>


      {/* Header */}
      <div>

        <h2 className="text-4xl font-bold text-gray-900">
          ⚡ Ninu Automation AI
        </h2>

        <p className="text-gray-500 mt-2">
          Automate your daily tasks with intelligent AI workflows
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



        <button className="mt-6 bg-white text-black px-8 py-3 rounded-full">
          + Create Workflow
        </button>


      </div>




      {/* Automation Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">


        <div className="bg-white border rounded-3xl p-6">

          📧

          <h3 className="font-bold text-xl mt-4">
            Email Automation
          </h3>


          <p className="text-gray-500 mt-2">
            Automatically manage emails and replies.
          </p>


          <span className="inline-block mt-4 bg-gray-100 px-4 py-2 rounded-full text-sm">
            Active
          </span>

        </div>




        <div className="bg-white border rounded-3xl p-6">

          📊

          <h3 className="font-bold text-xl mt-4">
            Data Analysis
          </h3>


          <p className="text-gray-500 mt-2">
            Analyze reports automatically with AI.
          </p>


          <span className="inline-block mt-4 bg-gray-100 px-4 py-2 rounded-full text-sm">
            Running
          </span>

        </div>




        <div className="bg-white border rounded-3xl p-6">

          🤖

          <h3 className="font-bold text-xl mt-4">
            AI Agent
          </h3>


          <p className="text-gray-500 mt-2">
            Create smart AI assistants.
          </p>


          <span className="inline-block mt-4 bg-gray-100 px-4 py-2 rounded-full text-sm">
            Ready
          </span>

        </div>


      </div>




      {/* Activity */}
      <div className="mt-10 bg-white border rounded-3xl p-8">


        <h3 className="text-xl font-bold">
          Recent Activity
        </h3>



        <div className="mt-5 space-y-4 text-gray-600">


          <p>
            ✅ Email workflow completed
          </p>


          <p>
            ✅ Report analysis finished
          </p>


          <p>
            ✅ AI agent created successfully
          </p>


        </div>


      </div>


    </div>
  );
}