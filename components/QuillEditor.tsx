"use client";
import { useRef, useEffect, useState } from "react";
import type Quill from "quill";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

let quillConstructor: any = null;
let quillPromise: Promise<void> | null = null;

if (typeof window !== "undefined" && !quillConstructor && !quillPromise) {
  quillPromise = import("quill")
    .then((mod) => {
      const constructor = mod.default;
      if (
        typeof constructor === "function" &&
        constructor.prototype &&
        constructor.prototype.constructor === constructor
      ) {
        quillConstructor = constructor;
      } else {
        throw new Error("Invalid Quill constructor");
      }
    })
    .catch((error) => {
      throw error;
    });
}

export default function QuillEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  readOnly = false,
}: QuillEditorProps) {
  const quillRef = useRef<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isQuillReady, setIsQuillReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (quillConstructor) {
      setIsQuillReady(true);
    } else if (quillPromise) {
      quillPromise.then(() => {
        setIsQuillReady(true);
      });
    }
  }, []);

  useEffect(() => {
    if (
      !isMounted ||
      !containerRef.current ||
      !toolbarRef.current ||
      !quillConstructor ||
      !isQuillReady ||
      isInitialized
    ) {
      return;
    }

    if (quillRef.current) {
      quillRef.current.off("text-change");
      quillRef.current = null;
    }

    const toolbarOptions = [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ];

    quillRef.current = new quillConstructor(containerRef.current, {
      theme: "snow",
      placeholder,
      readOnly,
      modules: {
        toolbar: {
          container: toolbarOptions,
          handlers: {
            image: async () => {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");
              input.click();

              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("file", file);

                try {
                  const response = await fetch("/api/upload-image", {
                    method: "POST",
                    body: formData,
                  });

                  const data = await response.json();
                  if (data.url) {
                    const range = quillRef.current?.getSelection();
                    if (range) {
                      quillRef.current?.insertEmbed(
                        range.index,
                        "image",
                        data.url
                      );
                    }
                  } else {
                    console.error("Image upload failed:", data.error);
                  }
                } catch (error) {
                  console.error("Error uploading image:", error);
                }
              };
            },
          },
        },
      },
    });

    if (value) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }

    quillRef.current.on("text-change", () => {
      const content = quillRef.current?.root.innerHTML || "";
      onChange(content);
    });

    setIsInitialized(true);

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }
      setIsInitialized(false);
    };
  }, [isMounted, isQuillReady, onChange, placeholder, readOnly]);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="bg-white text-black rounded mb-4 min-h-[200px]">
      <div ref={toolbarRef} className="quill-toolbar" />
      <div ref={containerRef} className="quill-editor" />
    </div>
  );
}
