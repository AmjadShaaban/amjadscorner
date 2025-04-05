import { useState } from "react";
import axios from "axios";
import { Pencil, Trash, Check, X } from "lucide-react";

interface ForumsStructureTreeProps {
  categories: any[];
  subcategories: any[];
  loading: boolean;
  onUpdateCategory: (updated: any) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateSubcategory: (updated: any) => void;
  onDeleteSubcategory: (id: string) => void;
}

export default function ForumsStructureTree({
  categories,
  subcategories,
  loading,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateSubcategory,
  onDeleteSubcategory,
}: ForumsStructureTreeProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editCategoryValue, setEditCategoryValue] = useState("");

  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubValue, setEditSubValue] = useState("");

  const [recentlyDeleted, setRecentlyDeleted] = useState<{
    type: "cat" | "sub";
    data: any;
  } | null>(null);

  const startEditCategory = (cat: any) => {
    setEditingCategoryId(cat._id);
    setEditCategoryValue(cat.name);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditCategoryValue("");
  };

  const saveEditCategory = async (cat: any) => {
    try {
      const res = await axios.put(`/api/admin/forums/categories/${cat._id}`, {
        name: editCategoryValue,
      });
      onUpdateCategory(res.data);
      cancelEditCategory();
    } catch (err) {
      console.error("Category edit error:", err);
    }
  };

  const deleteCategory = async (cat: any) => {
    try {
      await axios.delete(`/api/admin/forums/categories/${cat._id}`);
      onDeleteCategory(cat._id);
      setRecentlyDeleted({ type: "cat", data: cat });
    } catch (err) {
      console.error("Category delete error:", err);
    }
  };

  const startEditSub = (sub: any) => {
    setEditingSubId(sub._id);
    setEditSubValue(sub.name);
  };

  const cancelEditSub = () => {
    setEditingSubId(null);
    setEditSubValue("");
  };

  const saveEditSub = async (sub: any) => {
    try {
      const res = await axios.put(
        `/api/admin/forums/categories/${sub.category}/subcategories/${sub._id}`,
        { name: editSubValue }
      );
      onUpdateSubcategory(res.data);
      cancelEditSub();
    } catch (err) {
      console.error("Subcategory edit error:", err);
    }
  };

  const deleteSub = async (sub: any) => {
    try {
      await axios.delete(
        `/api/admin/forums/categories/${sub.category}/subcategories/${sub._id}`
      );
      onDeleteSubcategory(sub._id);
      setRecentlyDeleted({ type: "sub", data: sub });
    } catch (err) {
      console.error("Subcategory delete error:", err);
    }
  };

  const handleUndo = async () => {
    if (!recentlyDeleted) return;
    try {
      if (recentlyDeleted.type === "cat") {
        const res = await axios.put(
          `/api/admin/forums/categories/${recentlyDeleted.data._id}`,
          { name: recentlyDeleted.data.name }
        );
        onUpdateCategory(res.data);
      } else {
        const res = await axios.put(
          `/api/admin/forums/categories/${recentlyDeleted.data.category}/subcategories/${recentlyDeleted.data._id}`,
          { name: recentlyDeleted.data.name }
        );
        onUpdateSubcategory(res.data);
      }
      setRecentlyDeleted(null);
    } catch (err) {
      console.error("Undo failed:", err);
    }
  };

  return (
    <section>
      <h2 className="text-xl text-white font-semibold mb-4">Forum Structure</h2>
      {recentlyDeleted && (
        <div className="mb-4 p-3 bg-yellow-100 text-black rounded flex justify-between items-center">
          <span>
            {recentlyDeleted.type === "cat"
              ? `Category "${recentlyDeleted.data.name}" deleted.`
              : `Subcategory "${recentlyDeleted.data.name}" deleted.`}
          </span>
          <button
            onClick={handleUndo}
            className="underline text-blue-700 hover:text-blue-900 ml-4"
          >
            Undo
          </button>
        </div>
      )}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-400">No categories yet.</p>
      ) : (
        categories.map((cat, idx) => (
          <div
            key={cat._id}
            className={`${idx !== categories.length - 1 ? "mb-6" : ""}`}
          >
            {editingCategoryId === cat._id ? (
              <div className="flex gap-2 items-center mb-1">
                <input
                  className="p-1 text-sm rounded text-black flex-grow"
                  value={editCategoryValue}
                  onChange={(e) => setEditCategoryValue(e.target.value)}
                />
                <button
                  onClick={() => saveEditCategory(cat)}
                  className="text-green-400"
                >
                  <Check size={18} />
                </button>
                <button onClick={cancelEditCategory} className="text-red-400">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-1">
                <h3
                  className={`text-lg font-semibold ${
                    cat.isDeleted ? "line-through text-red-400" : "text-white"
                  }`}
                >
                  📁 {cat.name}
                  {cat.isDeleted && (
                    <span className="ml-2 text-xs bg-red-600 text-white px-1 py-0.5 rounded">
                      deleted
                    </span>
                  )}
                  {!cat.isDeleted && cat.updatedAt && (
                    <span className="text-xs text-gray-400 ml-2">
                      Updated: {new Date(cat.updatedAt).toLocaleString()}
                    </span>
                  )}
                </h3>

                <div className="flex gap-2 items-center">
                  {cat.isDeleted ? (
                    <button
                      onClick={async () => {
                        try {
                          const res = await axios.put(
                            `/api/admin/forums/categories/${cat._id}?restore=true`,
                            { name: cat.name }
                          );
                          onUpdateCategory(res.data);
                        } catch (err) {
                          console.error("Undo category failed", err);
                        }
                      }}
                      className="text-blue-400 text-xs hover:underline"
                    >
                      Undo
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditCategory(cat)}
                        className="text-blue-400"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat)}
                        className="text-red-400"
                      >
                        <Trash size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            <ul className="ml-5 mt-2 space-y-1">
              {subcategories
                .filter((sub) => sub.category === cat._id)
                .map((sub) => (
                  <li
                    key={sub._id}
                    className="text-gray-300 flex items-center justify-between"
                  >
                    {editingSubId === sub._id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          className="flex-grow p-1 text-sm rounded text-black"
                          value={editSubValue}
                          onChange={(e) => setEditSubValue(e.target.value)}
                        />
                        <button
                          onClick={() => saveEditSub(sub)}
                          className="text-green-400 hover:text-green-500"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={cancelEditSub}
                          className="text-red-400 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={
                            sub.isDeleted ? "line-through text-red-400" : ""
                          }
                        >
                          ↳ {sub.name}
                          {sub.isDeleted && (
                            <span className="ml-2 text-xs bg-red-600 text-white px-1 py-0.5 rounded">
                              deleted
                            </span>
                          )}
                          {!sub.isDeleted && sub.updatedAt && (
                            <span className="text-xs text-gray-400 ml-2">
                              Updated:{" "}
                              {new Date(sub.updatedAt).toLocaleString()}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-2 items-center">
                          {sub.isDeleted ? (
                            <button
                              onClick={async () => {
                                try {
                                  const res = await axios.put(
                                    `/api/admin/forums/categories/${sub.category}/subcategories/${sub._id}?restore=true`,
                                    { name: sub.name }
                                  );
                                  onUpdateSubcategory(res.data);
                                } catch (err) {
                                  console.error("Undo subcategory failed", err);
                                }
                              }}
                              className="text-blue-400 text-xs hover:underline"
                            >
                              Undo
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditSub(sub)}
                                className="text-blue-400 hover:text-blue-500"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => deleteSub(sub)}
                                className="text-red-400 hover:text-red-500"
                              >
                                <Trash size={16} />
                              </button>
                            </>
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
