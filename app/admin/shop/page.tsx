"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/lib/state";

// TODO role-based system
// Hardcoded admin email (replace with your email or a role-based system)
const ADMIN_EMAIL = "test@test.com";

interface Category {
  _id: string;
  name: string;
}

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
}

export default function ShopAdminPage() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
  });
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <p className="text-white max-w-3xl mx-auto mt-8">
        Access denied. Admins only.
      </p>
    );
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/shop/categories");
        setCategories(res.data);
        if (res.data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(res.data[0]._id);
          setNewItem((prev) => ({ ...prev, WcategoryId: res.data[0]._id }));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.response?.data?.error || "Failed to load categories.");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;

    const fetchItems = async () => {
      try {
        const res = await axios.get(
          `/api/shop/items?categoryId=${selectedCategoryId}`
        );
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError(err.response?.data?.error || "Failed to load items.");
      }
    };

    fetchItems();
  }, [selectedCategoryId]);

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <p className="text-white max-w-3xl mx-auto mt-8">
        Access denied. Admins only.
      </p>
    );
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/shop/categories", {
        name: newCategoryName,
      });
      setCategories([
        ...categories,
        { _id: res.data.id, name: newCategoryName },
      ]);
      setNewCategoryName("");
      setError(null);
    } catch (err) {
      console.error("Error creating category:", err);
      setError(err.response?.data?.error || "Failed to create category.");
    }
  };

  // Handle category update
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;

    try {
      await axios.put("/api/shop/categories", {
        id: editCategory._id,
        name: editCategory.name,
      });
      setCategories(
        categories.map((cat) =>
          cat._id === editCategory._id
            ? { ...cat, name: editCategory.name }
            : cat
        )
      );
      setEditCategory(null);
      setError(null);
    } catch (err) {
      console.error("Error updating category:", err);
      setError(err.response?.data?.error || "Failed to update category.");
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id: string) => {
    try {
      await axios.delete("/api/shop/categories", { data: { id } });
      setCategories(categories.filter((cat) => cat._id !== id));
      if (selectedCategoryId === id) {
        setSelectedCategoryId(categories[0]?._id || null);
      }
      setError(null);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(err.response?.data?.error || "Failed to delete category.");
    }
  };

  // Handle item creation
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const price = parseFloat(newItem.price);
      if (isNaN(price) || price <= 0) {
        setError("Price must be a positive number.");
        return;
      }

      const res = await axios.post("/api/shop/items", {
        name: newItem.name,
        description: newItem.description,
        price,
        categoryId: newItem.categoryId,
      });

      if (newItem.categoryId === selectedCategoryId) {
        setItems([
          ...items,
          {
            _id: res.data.id,
            ...newItem,
            price,
            categoryId: newItem.categoryId,
          },
        ]);
      }
      setNewItem({
        name: "",
        description: "",
        price: "",
        categoryId: newItem.categoryId,
      });
      setError(null);
    } catch (err) {
      console.error("Error creating item:", err);
      setError(err.response?.data?.error || "Failed to create item.");
    }
  };

  // Handle item update
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    try {
      const price = parseFloat(editItem.price.toString());
      if (isNaN(price) || price <= 0) {
        setError("Price must be a positive number.");
        return;
      }

      await axios.put("/api/shop/items", {
        id: editItem._id,
        name: editItem.name,
        description: editItem.description,
        price,
        categoryId: editItem.categoryId,
      });

      setItems(
        items.map((item) =>
          item._id === editItem._id
            ? {
                ...item,
                name: editItem.name,
                description: editItem.description,
                price,
                categoryId: editItem.categoryId,
              }
            : item
        )
      );
      setEditItem(null);
      setError(null);
    } catch (err) {
      console.error("Error updating item:", err);
      setError(err.response?.data?.error || "Failed to update item.");
    }
  };

  // Handle item deletion
  const handleDeleteItem = async (id: string) => {
    try {
      await axios.delete("/api/shop/items", { data: { id } });
      setItems(items.filter((item) => item._id !== id));
      setError(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(err.response?.data?.error || "Failed to delete item.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-3xl font-bold mb-6 text-white">Shop Admin</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Categories Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Manage Categories
        </h2>

        {/* Add Category Form */}
        <form onSubmit={handleCreateCategory} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="flex-1 p-2 rounded-md border-gray-300 shadow-sm text-black"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Category
            </button>
          </div>
        </form>

        {/* Edit Category Form */}
        {editCategory && (
          <form onSubmit={handleUpdateCategory} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={editCategory.name}
                onChange={(e) =>
                  setEditCategory({ ...editCategory, name: e.target.value })
                }
                className="flex-1 p-2 rounded-md border-gray-300 shadow-sm text-black"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setEditCategory(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Categories List */}
        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-gray-400">No categories found.</p>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                  selectedCategoryId === category._id
                    ? "bg-indigo-600"
                    : "bg-gray-700"
                } hover:bg-indigo-500 transition`}
                onClick={() => {
                  setSelectedCategoryId(category._id);
                  setNewItem((prev) => ({ ...prev, categoryId: category._id }));
                }}
              >
                <span className="text-white">{category.name}</span>
                <div className="space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditCategory(category);
                    }}
                    className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category._id);
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Items Section */}
      {selectedCategoryId && (
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Manage Items
          </h2>

          {/* Add Item Form */}
          <form onSubmit={handleCreateItem} className="mb-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white">
                Name
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">
                Description
              </label>
              <textarea
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">
                Category
              </label>
              <select
                value={newItem.categoryId}
                onChange={(e) =>
                  setNewItem({ ...newItem, categoryId: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                required
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Item
            </button>
          </form>

          {/* Edit Item Form */}
          {editItem && (
            <form onSubmit={handleUpdateItem} className="mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white">
                  Name
                </label>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) =>
                    setEditItem({ ...editItem, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">
                  Description
                </label>
                <textarea
                  value={editItem.description}
                  onChange={(e) =>
                    setEditItem({ ...editItem, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editItem.price}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">
                  Category
                </label>
                <select
                  value={editItem.categoryId}
                  onChange={(e) =>
                    setEditItem({ ...editItem, categoryId: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  required
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Items List */}
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-gray-400">No items found in this category.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className="p-4 bg-gray-700 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {item.name}
                    </h3>
                    <p className="text-gray-300">{item.description}</p>
                    <p className="text-gray-400">
                      Price: ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setEditItem(item)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
