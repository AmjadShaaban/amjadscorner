"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { useAuthStore } from "@/lib/state";
import { sanitizeHTML } from "@/lib/sanitize";
import QuillEditor from "@/components/QuillEditor";
import Link from "next/link";

const PostPage = ({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) => {
  const params = React.use(paramsPromise);
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!params?.id) return;
    axios
      .get(`/api/forums/posts/${params.id}`)
      .then((res) => setPost(res.data))
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to load post");
        router.push("/forums");
      });

    axios
      .get(`/api/forums/replies?postId=${params.id}`)
      .then((res) => setReplies(res.data));
  }, [params?.id, router]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to reply.");
      return;
    }
    if (!replyContent) {
      setError("Reply content is required.");
      return;
    }

    try {
      const res = await axios.post(
        "/api/forums/replies",
        { postId: params.id, content: replyContent },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setReplies([...replies, res.data]);
      setReplyContent("");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create reply");
    }
  };

  const handleQuote = (reply: any) => {
    const quotedContent = `
      <blockquote>
        <p><strong>${reply.userId?.email || "Unknown"}</strong> said:</p>
        ${reply.content}
      </blockquote>
      <p></p>
    `;
    setReplyContent(quotedContent);
  };

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
      <div className="p-4 bg-gray-700 rounded-lg mb-8">
        <div
          className="text-gray-300 prose prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }}
        />
      </div>

      <h2 className="text-2xl font-semibold text-white mb-4">Replies</h2>
      <div className="space-y-6 mb-8">
        {replies.length === 0 ? (
          <p className="text-gray-400">
            No replies yet. Be the first to reply!
          </p>
        ) : (
          replies.map((reply) => (
            <div key={reply._id} className="p-4 bg-gray-600 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400 text-sm">
                  By {reply.userId?.email || "Unknown"} on{" "}
                  {new Date(reply.createdAt).toLocaleDateString()}
                </p>
                {user && (
                  <button
                    onClick={() => handleQuote(reply)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Quote
                  </button>
                )}
              </div>
              <div
                className="text-gray-300 prose prose-invert"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(reply.content),
                }}
              />
            </div>
          ))
        )}
      </div>

      {user ? (
        <form onSubmit={handleReplySubmit}>
          <QuillEditor
            value={replyContent}
            onChange={setReplyContent}
            placeholder="Write your reply here..."
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            Post Reply
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      ) : (
        <p className="text-white">
          Please{" "}
          <Link href="/login" className="text-blue-400 underline">
            log in
          </Link>{" "}
          to reply.
        </p>
      )}
    </div>
  );
};

export default PostPage;
