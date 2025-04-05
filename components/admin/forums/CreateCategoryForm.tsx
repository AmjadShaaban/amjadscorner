import { useCreateCategory } from "@/lib/queries/admin/forums";
import { useState } from "react";

const CreateCategoryForm = () => {
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createCategory = useCreateCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory.mutateAsync({ name: categoryName });
      setCategoryName("");
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create category");
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-xl text-white font-semibold mb-3">Create Category</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category Name"
          className="w-full p-2 rounded border border-gray-300 text-gray-300"
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
};

export default CreateCategoryForm;
