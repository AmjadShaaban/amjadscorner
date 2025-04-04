import axios from "axios";
import { useState } from "react";

interface CreateCategoryFormProps {
  onCreate: (newCategory: any) => void;
}

export default function CreateCategoryForm({
  onCreate,
}: CreateCategoryFormProps) {
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/admin/forums/categories", {
        name: categoryName,
      });
      onCreate(res.data);
      setCategoryName("");
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create category");
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-xl text-white font-semibold mb-3">Create Category</h2>
      <form onSubmit={handleCategorySubmit} className="space-y-3">
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category Name"
          className="w-full p-2 rounded border border-gray-300 text-black"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          Create Category
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </section>
  );
}
