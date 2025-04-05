"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import RoleGuard from "@/components/auth/RoleGuard";
import { UserRole } from "@/types/roles";
import CreateCategoryForm from "@/components/admin/forums/CreateCategoryForm";
import CreateSubcategoryForm from "@/components/admin/forums/CreateSubcategoryForm";
import ForumsStructureTree from "@/components/admin/forums/ForumsStructureTree";

const ForumsAdminPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          axios.get("/api/admin/forums/categories"),
          axios.get("/api/admin/forums/categories/subcategories"),
        ]);
        setCategories(catRes.data);
        setSubcategories(subRes.data);
      } catch (err) {
        setError("Failed to load forum data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpdateCategory = (updated: any) => {
    setCategories((prev) =>
      prev.map((cat) => (cat._id === updated._id ? updated : cat))
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat._id !== id));
  };

  const handleUpdateSubcategory = (updatedSub: any) => {
    setSubcategories((prev) =>
      prev.map((sub) => (sub._id === updatedSub._id ? updatedSub : sub))
    );
  };

  const handleDeleteSubcategory = (id: string) => {
    setSubcategories((prev) => prev.filter((sub) => sub._id !== id));
  };

  return (
    <RoleGuard role={UserRole.ADMIN}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white rounded-b-xl">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            Forums Admin Dashboard
          </h1>

          <CreateCategoryForm
            onCreate={(newCat) => setCategories((prev) => [...prev, newCat])}
          />

          <CreateSubcategoryForm
            categories={categories}
            onCreate={(newSubCat) =>
              setSubcategories((prev) => [...prev, newSubCat])
            }
          />

          <ForumsStructureTree
            categories={categories}
            subcategories={subcategories}
            loading={loading}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateSubcategory={handleUpdateSubcategory}
            onDeleteSubcategory={handleDeleteSubcategory}
          />
        </div>
      </div>
    </RoleGuard>
  );
};

export default ForumsAdminPage;
