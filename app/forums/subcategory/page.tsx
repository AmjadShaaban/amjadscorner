"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../../../lib/state";
import Link from "next/link";

export default function SubcategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch subcategory details
    axios.get(`/api/forums/subcategories`).then((res) => {
      const sub = res.data.find((s) => s._id === params.id);
      setSubcategory(sub);
    });

    // Fetch posts for this subcategory
    axios
      .get(`/api/forums/posts?subcategoryId=${params.id}`)
      .then((res) => setPosts(res.data));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to create a post.");
      return;
    }

    try {
      const res = await axios.post(
        "/api/forums/posts",
        { title, content, subcategoryId: params.id },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setPosts([res.data, ...posts]);
      setTitle("");
      setContent("");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create post");
    }
  };

  if (!subcategory)
    return <p className="text-white max-w-3xl mx-auto mt-8">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6 text-white">{subcategory.name}</h1>

      {/* Create Post Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Title"
            className="w-full p-2 border rounded mb-4 text-black"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post Content"
            className="w-full p-2 border rounded h-32 text-black"
          />
          <button
            type="submit"
            className="mt-2 w-full p-2 bg-blue-500 text-white rounded"
          >
            Create Post
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      ) : (
        <p className="text-white mb-8">
          Please{" "}
          <Link href="/login" className="text-blue-400 underline">
            log in
          </Link>{" "}
          to create a post.
        </p>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-gray-400">
            No posts yet. Be the first to create one!
          </p>
        ) : (
          posts.map((post) => (
            <Link key={post._id} href={`/forums/${post._id}`}>
              <div className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                <h2 className="text-xl font-semibold text-white">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm">
                  By {post.userId?.email || "Unknown"} on{" "}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-300 mt-2 line-clamp-2">
                  {post.content}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
