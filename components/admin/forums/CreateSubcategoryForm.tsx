import axios from "axios";
import { useState } from "react";

type CreateSubcategoryFormProps = {
  categories: any[];
  onCreate: (newSubcategory: any) => void;
};

const CreateSubcategoryForm = ({
  categories,
  onCreate,
}: CreateSubcategoryFormProps) => {
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) return setError("Please select a category");

    try {
      const res = await axios.post(
        `/api/admin/forums/categories/${selectedCategoryId}/subcategories`,
        { name: subcategoryName }
      );
      onCreate(res.data);
      setSubcategoryName("");
      setSelectedCategoryId("");
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create subcategory");
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-xl text-white font-semibold mb-3">
        Create Subcategory
      </h2>
      <form onSubmit={handleSubcategorySubmit} className="space-y-3">
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="w-full p-2 rounded border border-gray-300 text-black"
        >
          <option value="">Select a Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={subcategoryName}
          onChange={(e) => setSubcategoryName(e.target.value)}
          placeholder="Subcategory Name"
          className="w-full p-2 rounded border border-gray-300 text-black"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          Create Subcategory
        </button>
      </form>
    </section>
  );
};

export default CreateSubcategoryForm;
