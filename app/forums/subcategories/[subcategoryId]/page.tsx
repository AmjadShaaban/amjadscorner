"use client";
import { useParams } from "next/navigation";
import { useSubcategoryThreads } from "@/lib/hooks/app/forums";
import Link from "next/link";

const SubcategoryPage = () => {
  const { subcategoryId } = useParams<{ subcategoryId: string }>();
  const {
    data: threads,
    isLoading,
    error,
  } = useSubcategoryThreads(subcategoryId);

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl text-white font-semibold mb-4">Threads</h1>

      {isLoading && <p className="text-gray-300">Loading...</p>}
      {error && <p className="text-red-400">Error loading threads</p>}

      {threads?.length ? (
        <ul className="space-y-3">
          {threads.map((thread) => (
            <li key={thread.id}>
              <div className="bg-gray-800 p-4 rounded shadow">
                <h2 className="text-white font-bold text-lg">{thread.title}</h2>
                <p className="text-sm text-gray-400">
                  by {thread.author.name} •{" "}
                  {new Date(thread.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <p className="text-gray-400">No threads yet.</p>
          <Link
            href={`/forums/subcategories/${subcategoryId}/threads/new`}
            className="inline-block mt-2 text-blue-400 hover:underline"
          >
            Be the first to create a thread →
          </Link>
        </>
      )}
    </div>
  );
};

export default SubcategoryPage;
