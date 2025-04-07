"use client";
import { useCategoryTree } from "@/lib/hooks/app/forums";
import Link from "next/link";

export default function ForumsPage() {
  const { data: categories, isLoading, error } = useCategoryTree();

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Forums</h1>

      {isLoading && <p className="text-gray-300">Loading...</p>}
      {error && <p className="text-red-400">Failed to load forums</p>}

      {categories?.map((cat) => (
        <div key={cat.id} className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            📁 {cat.name}
          </h2>
          {cat.subcategories.length === 0 ? (
            <p className="ml-4 text-gray-400">No subcategories yet.</p>
          ) : (
            <ul className="ml-4 space-y-1">
              {cat.subcategories.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={`/forums/subcategories/${sub.id}`}
                    className="text-blue-400 hover:underline"
                  >
                    ↳ {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
