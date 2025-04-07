"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import QuillEditor from "@/components/QuillEditor";
import Link from "next/link";
import { sanitizeHTML } from "@/lib/sanitize";
import { useState } from "react";
import { usePostReply, useThreadReplies } from "@/lib/hooks/app/forums";

type Thread = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
  };
};

export default function ThreadViewPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const [editorHtml, setEditorHtml] = useState("");
  const [quoteHtml, setQuoteHtml] = useState<string | null>(null);
  const [quotedReplyId, setQuotedReplyId] = useState<string | null>(null);
  const postReply = usePostReply(threadId);
  const { data: replies, isLoading: loadingReplies } =
    useThreadReplies(threadId);

  const { data, isLoading, error } = useQuery<Thread>({
    queryKey: ["thread", threadId],
    queryFn: async () => {
      const res = await axios.get(`/api/forums/threads/${threadId}`);
      return res.data;
    },
    enabled: !!threadId,
  });

  if (isLoading) return <p className="text-gray-400">Loading thread...</p>;
  if (error || !data)
    return <p className="text-red-500">Failed to load thread.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 bg-gray-900 text-white rounded shadow">
      <h1 className="text-3xl font-bold mb-2">{data.title}</h1>

      <p className="text-sm text-gray-400 mb-4">
        Posted by{" "}
        <Link
          href={`/profile/${data.author.id}`}
          className="text-blue-400 hover:underline"
        >
          {data.author.firstName}
        </Link>{" "}
        on {new Date(data.createdAt).toLocaleString()}
      </p>
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHTML(data.content) }}
      ></div>
      <h2 className="text-xl font-semibold mt-10 mb-4">Replies</h2>
      {loadingReplies ? (
        <p className="text-gray-400">Loading replies...</p>
      ) : replies.length === 0 ? (
        <p className="text-gray-400">No replies yet.</p>
      ) : (
        <ul className="space-y-6">
          {replies.map((reply: any) => (
            <li key={reply.id} className="bg-gray-800 p-4 rounded shadow">
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(reply.content),
                }}
              />
              <p className="text-xs text-gray-400 mt-2">
                Posted by{" "}
                <Link
                  href={`/profile/${reply.author.id}`}
                  className="underline"
                >
                  {reply.author.firstName}
                </Link>{" "}
                on {new Date(reply.createdAt).toLocaleString()}
              </p>
              <button
                onClick={() => {
                  setQuoteHtml(reply.content);
                  setQuotedReplyId(reply.id);
                }}
                className="text-sm text-blue-400 hover:underline ml-4"
              >
                Quote
              </button>{" "}
            </li>
          ))}
        </ul>
      )}
      <h2 className="text-xl font-semibold mt-10 mb-2">Write a Reply</h2>
      {quoteHtml && (
        <div className="bg-yellow-100 text-black p-3 rounded mb-4">
          Quoting:
          <div
            className="mt-1 text-sm italic text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(quoteHtml) }}
          />
        </div>
      )}

      <QuillEditor value={editorHtml} onChange={setEditorHtml} />

      <button
        onClick={async () => {
          await postReply.mutateAsync({
            content:
              quoteHtml !== null
                ? `<blockquote>${quoteHtml}</blockquote>` + editorHtml
                : editorHtml,
            ...(quotedReplyId ? { quotedReplyId } : {}),
          });
          setEditorHtml("");
          setQuoteHtml(null);
          setQuotedReplyId(null);
        }}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Post Reply
      </button>
    </div>
  );
}
