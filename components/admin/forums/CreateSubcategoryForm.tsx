import { useCreateSubcategory } from "@/lib/queries/admin/forums";
import { useState } from "react";

type CreateSubcategoryFormProps = {
  categories: any[];
};

const CreateSubcategoryForm = ({ categories }: CreateSubcategoryFormProps) => {
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createSubcategory = useCreateSubcategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) return setError("Please select a category");

    try {
      await createSubcategory.mutateAsync({
        categoryId: selectedCategoryId,
        name: subcategoryName,
      });
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
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="w-full p-2 rounded border border-gray-300 text-gray-300"
        >
          <option value="">Select a Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={subcategoryName}
          onChange={(e) => setSubcategoryName(e.target.value)}
          placeholder="Subcategory Name"
          className="w-full p-2 rounded border border-gray-300 text-gray-300"
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
