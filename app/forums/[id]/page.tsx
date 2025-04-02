"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react"; // Import React for React.use

export default function PostPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = React.use(paramsPromise); // Unwrap the params Promise
  const [post, setPost] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!params?.id) return; // Ensure params is resolved
    axios
      .get(`/api/posts/${params.id}`)
      .then((res) => setPost(res.data))
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to load post");
        router.push("/forums"); // Redirect if post not found
      });
  }, [params?.id, router]); // Use params?.id in the dependency array

  if (error)
    return <p className="text-red-500 max-w-3xl mx-auto mt-8">{error}</p>;
  if (!post)
    return <p className="text-white max-w-3xl mx-auto mt-8">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4 text-white">{post.title}</h1>
      <p className="text-gray-400 text-sm mb-4">
        By {post.userId?.email || "Unknown"} on{" "}
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
      <div className="p-4 bg-gray-700 rounded-lg">
        <p className="text-gray-300">{post.content}</p>
      </div>
      {/* Comments section will go here later */}
    </div>
  );
}
