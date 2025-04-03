"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../../../lib/state";
// TODO role-based system
// Hardcoded admin email (replace with your email or a role-based system)
const ADMIN_EMAIL = "test@test.com";

export default function ForumsAdminPage() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <p className="text-white max-w-3xl mx-auto mt-8">
        Access denied. Admins only.
      </p>
    );
  }

  useEffect(() => {
    axios.get("/api/forums/categories").then((res) => setCategories(res.data));
    axios
      .get("/api/forums/subcategories")
      .then((res) => setSubcategories(res.data));
  }, []);

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/forums/categories",
        { name: categoryName },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setCategories([...categories, res.data]);
      setCategoryName("");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create category");
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      setError("Please select a category");
      return;
    }
    try {
      const res = await axios.post(
        "/api/forums/subcategories",
        { categoryId: selectedCategoryId, name: subcategoryName },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setSubcategories([...subcategories, res.data]);
      setSubcategoryName("");
      setSelectedCategoryId("");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create subcategory");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>

      {/* Create Category Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Create Category
        </h2>
        <form onSubmit={handleCategorySubmit}>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            className="w-full p-2 border rounded mb-4 text-black"
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            Create Category
          </button>
        </form>
      </div>

      {/* Create Subcategory Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Create Subcategory
        </h2>
        <form onSubmit={handleSubcategorySubmit}>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-black"
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={subcategoryName}
            onChange={(e) => setSubcategoryName(e.target.value)}
            placeholder="Subcategory Name"
            className="w-full p-2 border rounded mb-4 text-black"
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            Create Subcategory
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Display Categories and Subcategories */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Forum Structure
        </h2>
        {categories.length === 0 ? (
          <p className="text-gray-400">No categories yet.</p>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="mb-6">
              <h3 className="text-lg font-semibold text-white">
                {category.name}
              </h3>
              <ul className="ml-4 mt-2 space-y-2">
                {subcategories
                  .filter((sub) => sub.categoryId === category._id)
                  .map((subcategory) => (
                    <li key={subcategory._id} className="text-gray-300">
                      - {subcategory.name}
                    </li>
                  ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
