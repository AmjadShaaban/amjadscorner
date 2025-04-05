"use client";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white rounded-b-xl">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Hi, I&apos;m Amjad
        </h1>
        <p className="text-xl md:text-2xl text-gray-400">
          A creative full-stack developer building modular{" "}
          <span className="text-pink-500">Next.js</span> apps with style and
          function.
        </p>

        <div className="mt-12 flex flex-col md:flex-row gap-6">
          <Link href="/todo" className="flex-1">
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition flex flex-col h-56">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-center">
                Todo App
              </h2>
              <p className="text-gray-400 flex-1 text-center">
                A task management application
              </p>
            </div>
          </Link>
          <Link href="/shop" className="flex-1">
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition flex flex-col h-56">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-center">
                Shop App
              </h2>
              <p className="text-gray-400 flex-1 text-center">
                An e-commerce platform
              </p>
            </div>
          </Link>
          <Link href="/forums" className="flex-1">
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition flex flex-col h-56">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-center">
                Forum App
              </h2>
              <p className="text-gray-400 flex-1 text-center">
                A community discussion app
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
