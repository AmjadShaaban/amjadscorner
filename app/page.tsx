import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center max-w-4xl mx-auto mt-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Welcome to Amjad&apos;s Corner
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Hi, I’m Amjad—a developer passionate about building with TypeScript,
        Next.js, and more.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/todo"
          className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Todo App
        </Link>
        <Link
          href="/ecommerce"
          className="p-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          E-commerce
        </Link>
        <Link
          href="/forums"
          className="p-4 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Forums
        </Link>
      </div>
    </div>
  );
}
