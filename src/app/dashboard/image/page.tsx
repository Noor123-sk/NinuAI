export default function ImagePage() {
  return (
    <div>

      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold text-gray-900">
          🎨 Ninu Image AI
        </h2>

        <p className="text-gray-500 mt-2">
          Create amazing images with the power of AI
        </p>
      </div>



      {/* Generator Box */}
      <div className="mt-10 bg-white border rounded-3xl shadow-sm p-8 max-w-4xl">


        <h3 className="text-xl font-bold mb-5">
          Describe your image
        </h3>


        <textarea
          placeholder="Example: A futuristic AI city at night..."
          className="w-full h-32 border rounded-2xl p-5 outline-none resize-none"
        />


        <button className="mt-5 bg-black text-white px-8 py-3 rounded-full">
          ✨ Generate Image
        </button>


      </div>



      {/* Recent Creations */}
      <div className="mt-10">


        <h3 className="text-2xl font-bold mb-5">
          Recent Creations
        </h3>



        <div className="grid md:grid-cols-3 gap-6">


          <div className="bg-white border rounded-3xl p-5">

            <div className="h-40 bg-gray-100 rounded-2xl flex items-center justify-center text-5xl">
              🖼️
            </div>


            <p className="mt-4 font-semibold">
              AI Landscape
            </p>

          </div>



          <div className="bg-white border rounded-3xl p-5">

            <div className="h-40 bg-gray-100 rounded-2xl flex items-center justify-center text-5xl">
              🌆
            </div>


            <p className="mt-4 font-semibold">
              Future City
            </p>

          </div>



          <div className="bg-white border rounded-3xl p-5">

            <div className="h-40 bg-gray-100 rounded-2xl flex with-center justify-center text-5xl">
              🤖
            </div>


            <p className="mt-4 font-semibold">
              AI Robot
            </p>

          </div>


        </div>


      </div>


    </div>
  );
}