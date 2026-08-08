export default function DocumentsPage() {
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

          <div className="text-5xl">
            📂
          </div>


          <p className="mt-4 text-gray-500">
            Drag & drop your file here
          </p>


          <p className="text-sm text-gray-400 mt-2">
            PDF, DOCX, TXT supported
          </p>


          <button className="mt-5 bg-black text-white px-8 py-3 rounded-full">
            Upload File
          </button>


        </div>


      </div>




      {/* AI Document Assistant */}
      <div className="mt-10 bg-white border rounded-3xl p-8 max-w-4xl">


        <h3 className="text-xl font-bold mb-5">
          🤖 Ask your Document
        </h3>



        <div className="bg-gray-100 rounded-2xl p-5">

          <p className="text-gray-600">
            Upload a document and ask Ninu AI anything about it.
          </p>

        </div>



        <div className="mt-5 flex gap-3">


          <input
            type="text"
            placeholder="Ask something about your document..."
            className="flex-1 border rounded-full px-5 py-3 outline-none"
          />


          <button className="bg-black text-white px-6 rounded-full">
            Ask
          </button>


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
              Business Plan.pdf
            </h4>

            <p className="text-gray-500 text-sm mt-2">
              AI Summary Ready
            </p>

          </div>




          <div className="bg-white border rounded-2xl p-5">

            📄

            <h4 className="font-bold mt-3">
              Resume.docx
            </h4>

            <p className="text-gray-500 text-sm mt-2">
              Analysis Completed
            </p>

          </div>




          <div className="bg-white border rounded-2xl p-5">

            📄

            <h4 className="font-bold mt-3">
              Research.pdf
            </h4>

            <p className="text-gray-500 text-sm mt-2">
              Summary Available
            </p>

          </div>


        </div>


      </div>


    </div>
  );
}