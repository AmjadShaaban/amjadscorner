"use client";
import {
  useDeleteCategory,
  useDeleteSubcategory,
  useEditCategory,
  useEditSubcategory,
} from "@/lib/queries/admin/forums";
import { Check, Pencil, Trash, Undo2, X } from "lucide-react";
import { useState } from "react";

type ForumsStructureTreeProps = {
  categories: any[];
  subcategories: any[];
  loading: boolean;
};

export default function ForumsStructureTree({
  categories,
  subcategories,
  loading,
}: ForumsStructureTreeProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editCategoryValue, setEditCategoryValue] = useState("");
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubValue, setEditSubValue] = useState("");

  const editCategory = useEditCategory();
  const deleteCategory = useDeleteCategory();
  const editSubcategory = useEditSubcategory();
  const deleteSubcategory = useDeleteSubcategory();

  const handleEditCategory = async (cat: any) => {
    try {
      await editCategory.mutateAsync({ id: cat.id, name: editCategoryValue });
      setEditingCategoryId(null);
    } catch (err) {
      console.error("Edit category failed", err);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    try {
      await deleteCategory.mutateAsync(cat.id);
    } catch (err) {
      console.error("Delete category failed", err);
    }
  };

  const handleUndoCategory = async (cat: any) => {
    try {
      await editCategory.mutateAsync({
        id: cat.id,
        name: cat.name,
        restore: true,
      });
    } catch (err) {
      console.error("Undo category failed", err);
    }
  };

  const handleEditSub = async (sub: any) => {
    try {
      await editSubcategory.mutateAsync({
        categoryId: sub.category,
        subcategoryId: sub.id,
        name: editSubValue,
      });
      setEditingSubId(null);
    } catch (err) {
      console.error("Edit subcategory failed", err);
    }
  };

  const handleDeleteSub = async (sub: any) => {
    try {
      await deleteSubcategory.mutateAsync({
        categoryId: sub.category,
        subcategoryId: sub.id,
      });
    } catch (err) {
      console.error("Delete subcategory failed", err);
    }
  };

  const handleUndoSub = async (sub: any) => {
    try {
      await editSubcategory.mutateAsync({
        categoryId: sub.category,
        subcategoryId: sub.id,
        name: sub.name,
        restore: true,
      });
    } catch (err) {
      console.error("Undo subcategory failed", err);
    }
  };

  return (
    <section>
      <h2 className="text-xl text-white font-semibold mb-4">Forum Structure</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-400">No categories yet.</p>
      ) : (
        categories.map((cat) => (
          <div key={cat.id} className="mb-6">
            {/* Category Header */}
            {editingCategoryId === cat.id ? (
              <div className="flex gap-2 items-center mb-1">
                <input
                  className="p-1 text-sm rounded border-gray-300 text-gray-300 flex-grow"
                  value={editCategoryValue}
                  onChange={(e) => setEditCategoryValue(e.target.value)}
                />
                <button
                  onClick={() => handleEditCategory(cat)}
                  className="text-green-400"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setEditingCategoryId(null)}
                  className="text-red-400"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-1">
                <h3
                  className={`text-lg font-semibold ${
                    cat.isDeleted ? "line-through text-red-300" : "text-white"
                  }`}
                >
                  📁 {cat.name}
                  {cat.createdAt && (
                    <span className="ml-2 text-xs text-gray-400">
                      Created: {new Date(cat.createdAt).toLocaleString()}
                      {cat.createdBy && (
                        <> by {cat.createdBy.name || cat.createdBy.email}</>
                      )}
                    </span>
                  )}
                  {cat.updatedAt && (
                    <span className="ml-2 text-xs text-gray-400">
                      Updated: {new Date(cat.updatedAt).toLocaleString()}
                    </span>
                  )}
                </h3>
                <div className="flex gap-2">
                  {!cat.isDeleted ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingCategoryId(cat.id);
                          setEditCategoryValue(cat.name);
                        }}
                        className="text-blue-400"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-red-400"
                      >
                        <Trash size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleUndoCategory(cat)}
                      className="text-yellow-400"
                    >
                      <Undo2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Subcategories */}
            <ul className="ml-5 mt-2 space-y-1">
              {subcategories
                .filter((sub) => sub.category === cat.id)
                .map((sub) => (
                  <li
                    key={sub.id}
                    className={`flex justify-between items-center text-sm ${
                      sub.isDeleted
                        ? "line-through text-red-300"
                        : "text-gray-300"
                    }`}
                  >
                    {editingSubId === sub.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          className="flex-grow p-1 text-sm rounded border-gray-300 text-gray-300"
                          value={editSubValue}
                          onChange={(e) => setEditSubValue(e.target.value)}
                        />
                        <button
                          onClick={() => handleEditSub(sub)}
                          className="text-green-400"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingSubId(null)}
                          className="text-red-400"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center w-full">
                        <span>
                          ↳ {sub.name}
                          {sub.createdAt && (
                            <span className="ml-2 text-xs text-gray-400">
                              Created:{" "}
                              {new Date(sub.createdAt).toLocaleString()}
                            </span>
                          )}
                          {sub.updatedAt && (
                            <span className="ml-2 text-xs text-gray-400">
                              Updated:{" "}
                              {new Date(sub.updatedAt).toLocaleString()}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-2">
                          {!sub.isDeleted ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingSubId(sub.id);
                                  setEditSubValue(sub.name);
                                }}
                                className="text-blue-400"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteSub(sub)}
                                className="text-red-400"
                              >
                                <Trash size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleUndoSub(sub)}
                              className="text-yellow-400"
                            >
                              <Undo2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
