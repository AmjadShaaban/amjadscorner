"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/lib/state";
import Link from "next/link";
import React from "react";
import { sanitizeHTML } from "@/lib/sanitize";

export default function SubcategoryPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = React.use(paramsPromise);
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);

  useEffect(() => {
    if (!params?.id) return;
    axios.get(`/api/forums/subcategories`).then((res) => {
      const sub = res.data.find((s) => s._id === params.id);
      setSubcategory(sub);
    });

    axios
      .get(`/api/forums/posts?subcategoryId=${params.id}`)
      .then((res) => setPosts(res.data));
  }, [params?.id]);

  if (!subcategory)
    return <p className="text-white max-w-3xl mx-auto mt-8">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6 text-white">{subcategory.name}</h1>

      <div className="space-y-6">
        {user ? (
          <Link href={`/forums/subcategory/${params.id}/new`}>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              New Post
            </button>
          </Link>
        ) : (
          <p className="text-white mb-8">
            Please{" "}
            <Link href="/login" className="text-blue-400 underline">
              log in
            </Link>{" "}
            to create a post.
          </p>
        )}
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
                <div
                  className="text-gray-300 mt-2 line-clamp-2 prose prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(post.content),
                  }}
                />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
