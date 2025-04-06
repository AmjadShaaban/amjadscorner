"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import QuillEditor from "@/components/QuillEditor";
import { useAuthStore } from "@/lib/state";

const NewThreadPage = () => {
  const router = useRouter();
  const { id: subcategoryId } = useParams();
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return <p className="text-white">Redirecting to login...</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!title || !content) {
      setError("Title and content are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/forums/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          subcategoryId,
          createdAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      router.push(`/forums/subcategory/${subcategoryId}`);
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-white"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
            required
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-white"
          >
            Content
          </label>
          <QuillEditor
            value={content}
            onChange={setContent}
            placeholder="Write your post content here..."
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.push(`/forums/subcategory/${subcategoryId}`)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewThreadPage;
