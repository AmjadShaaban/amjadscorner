"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

const fetchCategories = async () =>
  (await axios.get("/api/forums/categories")).data;

const fetchSubcategories = async () =>
  (await axios.get("/api/forums/subcategories")).data;

const ForumsPage = () => {
  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: errorCategories,
  } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const {
    data: subcategories = [],
    isLoading: loadingSubs,
    error: errorSubs,
  } = useQuery({ queryKey: ["subcategories"], queryFn: fetchSubcategories });

  if (loadingCategories || loadingSubs)
    return <p className="text-gray-400">Loading forums...</p>;

  if (errorCategories || errorSubs)
    return (
      <p className="text-red-500">
        Failed to load forum data. Try again later.
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Forums</h1>

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
                .filter((sub) => sub.category === category._id)
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
                        Click to view threads
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
};

export default ForumsPage;
