"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../../lib/state";
import Link from "next/link";

export default function ForumsPage() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    axios.get("/api/categories").then((res) => setCategories(res.data));
    axios.get("/api/subcategories").then((res) => setSubcategories(res.data));
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Forums</h1>

      {/* Display Categories and Subcategories */}
      {categories.length === 0 ? (
        <p className="text-gray-400">No categories yet. Check back later!</p>
      ) : (
        categories.map((category) => (
          <div key={category._id} className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              {category.name}
            </h2>
            <div className="space-y-4">
              {subcategories
                .filter((sub) => sub.categoryId === category._id)
                .map((subcategory) => (
                  <Link
                    key={subcategory._id}
                    href={`/forums/subcategory/${subcategory._id}`}
                  >
                    <div className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                      <h3 className="text-lg font-semibold text-white">
                        {subcategory.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Click to view posts
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
