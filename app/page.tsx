"use client";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center text-center h-[70vh]"
    >
      <h1 className="text-5xl font-extrabold mb-4">
        Hey, I&apos;m <span className="text-blue-400">Amjad</span>
      </h1>
      <p className="text-lg text-gray-300 max-w-xl">
        A creative full-stack developer building modular Next.js apps with style
        and function.
      </p>
    </motion.section>
  );
}
