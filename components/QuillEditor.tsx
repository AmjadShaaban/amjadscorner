"use client";

import type Quill from "quill";
import { useCallback, useEffect, useRef, useState } from "react";

type QuillEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
};

let quillConstructor: typeof Quill | null = null;
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
      console.error("Error loading Quill:", error);
    });
}

const QuillEditor = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  readOnly = false,
}: QuillEditorProps) => {
  const quillRef = useRef<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isQuillReady, setIsQuillReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (quillConstructor) {
      setIsQuillReady(true);
    } else if (quillPromise) {
      quillPromise.then(() => setIsQuillReady(true));
    }
  }, []);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        console.log("Image upload not implemented yet");
        // Implement API call if needed
      } catch (error) {
        console.error("Image upload error:", error);
      }
    };
  }, []);

  const initializeEditor = useCallback(() => {
    if (!quillConstructor || !containerRef.current || !toolbarRef.current)
      return;

    const toolbarOptions = [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ];

    const editor = new quillConstructor(containerRef.current, {
      theme: "snow",
      placeholder,
      readOnly,
      modules: {
        toolbar: {
          container: toolbarOptions,
          handlers: {
            image: handleImageUpload,
          },
        },
      },
    });

    if (value) {
      editor.clipboard.dangerouslyPasteHTML(value);
    }

    editor.on("text-change", () => {
      const html = editor.root.innerHTML || "";
      onChange(html);
    });

    quillRef.current = editor;
  }, [handleImageUpload, onChange, placeholder, readOnly]);

  useEffect(() => {
    const shouldInit =
      isMounted &&
      isQuillReady &&
      !quillRef.current &&
      containerRef.current &&
      toolbarRef.current;

    if (shouldInit) {
      initializeEditor();
    }

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }
    };
  }, [isMounted, isQuillReady, initializeEditor]);

  useEffect(() => {
    if (quillRef.current) {
      const currentHTML = quillRef.current.root.innerHTML;
      if (value && currentHTML !== value) {
        quillRef.current.clipboard.dangerouslyPasteHTML(value);
      }
    }
  }, [value]);

  if (!isMounted) {
    return <div className="text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="bg-white text-black dark:bg-gray-900 dark:text-white rounded mb-4 border border-gray-300 dark:border-gray-700">
      <div ref={toolbarRef} className="quill-toolbar mb-2" />
      <div ref={containerRef} className="quill-editor min-h-[200px]" />
    </div>
  );
};

export default QuillEditor;
