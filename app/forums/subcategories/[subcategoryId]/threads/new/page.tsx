"use client";

import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import axios from "axios";
import QuillEditor from "@/components/QuillEditor";

export default function NewThreadPage() {
  const router = useRouter();
  const { subcategoryId } = useParams<{ subcategoryId: string }>();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      return setError("Both title and content are required.");
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        `/api/forums/subcategories/${subcategoryId}/threads`,
        {
          title,
          content,
        }
      );

      router.push(`/forums/threads/${res.data.id}`);
    } catch (err: any) {
      console.error("Thread creation failed:", err);
      setError(err.response?.data?.error || "Failed to create thread.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session?.user) {
    return (
      <p className="text-red-400">You must be logged in to create a thread.</p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Create New Thread</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <input
        type="text"
        placeholder="Thread title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 rounded text-black mb-4"
      />

      <div className="bg-white text-black mb-4 rounded">
        <QuillEditor value={content} onChange={setContent} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
      >
        {submitting ? "Posting..." : "Post Thread"}
      </button>
    </div>
  );
}
