export default function CodePage() {
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


          <select className="border rounded-xl px-4 py-2 mb-4">
            <option>
              JavaScript
            </option>

            <option>
              Python
            </option>

            <option>
              TypeScript
            </option>
          </select>



          <textarea
            placeholder="Paste your code here..."
            className="w-full h-72 border rounded-2xl p-5 outline-none font-mono"
          />



          <button className="mt-5 bg-black text-white px-8 py-3 rounded-full">
            ✨ Ask Ninu AI
          </button>


        </div>




        {/* AI Response */}
        <div className="bg-black text-white rounded-3xl p-6">


          <h3 className="font-bold text-xl mb-5">
            🤖 Ninu Response
          </h3>



          <div className="bg-gray-800 rounded-2xl p-5">


            <p className="text-gray-300">
              Your AI coding assistant will explain,
              debug and improve your code here.
            </p>


          </div>



          <button className="mt-5 border border-gray-600 px-5 py-2 rounded-full">
            📋 Copy Code
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